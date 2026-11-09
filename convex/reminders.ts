import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { currentUserId, requireUserId } from "./lib/auth";

async function requireOwnedReminder(
  ctx: MutationCtx,
  reminderId: Id<"reminders">,
  userId: string,
) {
  const reminder = await ctx.db.get(reminderId);
  if (!reminder || reminder.userId !== userId) {
    throw new ConvexError("errors.deleteReminderFailed");
  }
  return reminder;
}

/** "HH:mm" snapped down to the hour; reminders only exist on whole hours. */
function normalizeReminderTime(time: string): string {
  const match = /^([01]\d|2[0-3]):[0-5]\d$/.exec(time);
  if (!match) throw new ConvexError("errors.invalidReminderTime");
  return `${match[1]}:00`;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);
    if (!userId) return [];
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_user_time", (q) => q.eq("userId", userId))
      .take(24);
    return reminders.map((reminder) => ({
      id: reminder._id as string,
      reminderTime: reminder.reminderTime,
      enabled: reminder.enabled,
    }));
  },
});

export const upsert = mutation({
  args: { reminderTime: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const reminderTime = normalizeReminderTime(args.reminderTime);
    const existing = await ctx.db
      .query("reminders")
      .withIndex("by_user_time", (q) =>
        q.eq("userId", userId).eq("reminderTime", reminderTime),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { enabled: args.enabled });
    } else {
      await ctx.db.insert("reminders", {
        userId,
        reminderTime,
        enabled: args.enabled,
      });
    }
  },
});

export const setEnabled = mutation({
  args: { reminderId: v.id("reminders"), enabled: v.boolean() },
  handler: async (ctx, { reminderId, enabled }) => {
    const userId = await requireUserId(ctx);
    await requireOwnedReminder(ctx, reminderId, userId);
    await ctx.db.patch(reminderId, { enabled });
  },
});

export const remove = mutation({
  args: { reminderId: v.id("reminders") },
  handler: async (ctx, { reminderId }) => {
    const userId = await requireUserId(ctx);
    await requireOwnedReminder(ctx, reminderId, userId);
    await ctx.db.delete(reminderId);
  },
});

export const saveSubscription = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();

    if (existing) {
      // A browser endpoint belongs to whoever is signed in on it now.
      await ctx.db.patch(existing._id, { ...args, userId });
    } else {
      await ctx.db.insert("pushSubscriptions", { ...args, userId });
    }
  },
});

export const deleteSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, { endpoint }) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();
    if (existing && existing.userId === userId) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const listEnabled = internalQuery({
  args: {},
  handler: async (ctx) => {
    const reminders = await ctx.db
      .query("reminders")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .take(5000);

    return await Promise.all(
      reminders.map(async (reminder) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", reminder.userId))
          .unique();
        return {
          userId: reminder.userId,
          reminderTime: reminder.reminderTime,
          daysOfWeek: reminder.daysOfWeek,
          timezone: profile?.timezone ?? "UTC",
          locale: profile?.locale ?? "pt",
        };
      }),
    );
  },
});

/** Returns null when this reminder already went out for that local day. */
export const dueData = internalQuery({
  args: {
    userId: v.string(),
    localDate: v.string(),
    reminderTime: v.string(),
    sinceKey: v.string(),
  },
  handler: async (ctx, { userId, localDate, reminderTime, sinceKey }) => {
    const delivered = await ctx.db
      .query("reminderDeliveries")
      .withIndex("by_user_date_time", (q) =>
        q
          .eq("userId", userId)
          .eq("localDate", localDate)
          .eq("reminderTime", reminderTime),
      )
      .unique();
    if (delivered) return null;

    const [habits, logs, subscriptions] = await Promise.all([
      ctx.db
        .query("habits")
        .withIndex("by_user_position", (q) => q.eq("userId", userId))
        .take(200),
      ctx.db
        .query("habitLogs")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).gte("logDate", sinceKey),
        )
        .take(2000),
      ctx.db
        .query("pushSubscriptions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .take(20),
    ]);

    return {
      habits: habits
        .filter((habit) => habit.archivedAt === undefined)
        .map((habit) => ({
          id: habit._id as string,
          name: habit.name,
          schedule: habit.schedule,
        })),
      logs: logs.map((log) => ({
        habitId: log.habitId as string,
        logDate: log.logDate,
      })),
      subscriptions: subscriptions.map((sub) => ({
        id: sub._id,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
      })),
    };
  },
});

export const recordDelivery = internalMutation({
  args: {
    userId: v.string(),
    localDate: v.string(),
    reminderTime: v.string(),
    doneCount: v.number(),
    pendingCount: v.number(),
    usedSubscriptionIds: v.array(v.id("pushSubscriptions")),
    staleSubscriptionIds: v.array(v.id("pushSubscriptions")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await Promise.all([
      ...args.usedSubscriptionIds.map((id) =>
        ctx.db.patch(id, { lastUsedAt: now }),
      ),
      ...args.staleSubscriptionIds.map((id) => ctx.db.delete(id)),
    ]);

    const delivered = await ctx.db
      .query("reminderDeliveries")
      .withIndex("by_user_date_time", (q) =>
        q
          .eq("userId", args.userId)
          .eq("localDate", args.localDate)
          .eq("reminderTime", args.reminderTime),
      )
      .unique();
    if (delivered) return;

    await ctx.db.insert("reminderDeliveries", {
      userId: args.userId,
      localDate: args.localDate,
      reminderTime: args.reminderTime,
      doneCount: args.doneCount,
      pendingCount: args.pendingCount,
    });
  },
});
