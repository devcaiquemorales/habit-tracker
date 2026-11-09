"use node";

import { sendNotification, setVapidDetails } from "web-push";

import {
  buildReminderMessage,
  computeReminderProgress,
  localPartsFor,
} from "../src/domain/lib/reminder-progress";
import { addDaysToDateKey } from "../src/domain/types/date-key";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";

export const dispatchReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{ checked: number; sent: number }> => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;
    if (!publicKey || !privateKey || !subject) {
      throw new Error("VAPID environment variables are not configured");
    }
    setVapidDetails(subject, publicKey, privateKey);

    const now = new Date();
    const reminders = await ctx.runQuery(internal.reminders.listEnabled, {});
    let sent = 0;

    for (const reminder of reminders) {
      const { localDate, localHour, localWeekday } = localPartsFor(
        reminder.timezone,
        now,
      );
      if (Number(reminder.reminderTime.slice(0, 2)) !== localHour) continue;
      if (reminder.daysOfWeek && !reminder.daysOfWeek.includes(localWeekday)) {
        continue;
      }

      const due = await ctx.runQuery(internal.reminders.dueData, {
        userId: reminder.userId,
        localDate,
        reminderTime: reminder.reminderTime,
        sinceKey: addDaysToDateKey(localDate, -7),
      });
      if (!due) continue;

      const progress = computeReminderProgress(
        due.habits,
        due.logs,
        localDate,
        localWeekday,
      );
      if (progress.expectedCount === 0 || progress.pendingNames.length === 0) {
        continue;
      }

      const payload = JSON.stringify({
        ...buildReminderMessage(progress, reminder.locale),
        url: "/",
      });
      const used: Id<"pushSubscriptions">[] = [];
      const stale: Id<"pushSubscriptions">[] = [];

      for (const sub of due.subscriptions) {
        try {
          await sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          );
          used.push(sub.id);
          sent++;
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            stale.push(sub.id);
          } else {
            console.error(`Push failed with status ${statusCode}`);
          }
        }
      }

      await ctx.runMutation(internal.reminders.recordDelivery, {
        userId: reminder.userId,
        localDate,
        reminderTime: reminder.reminderTime,
        doneCount: progress.doneCount,
        pendingCount: progress.pendingNames.length,
        usedSubscriptionIds: used,
        staleSubscriptionIds: stale,
      });
    }

    return { checked: reminders.length, sent };
  },
});
