import { v } from "convex/values";

import { query } from "./_generated/server";
import { authComponent } from "./auth";
import { assertDateKey } from "./lib/date";

/** Upper bound for one screen: 400 days across 50 habits. */
const MAX_LOG_ROWS = 20_000;
const MAX_HABITS = 200;

/** Everything the signed-in screens render, as one live subscription. */
export const get = query({
  args: { sinceKey: v.string() },
  handler: async (ctx, { sinceKey }) => {
    assertDateKey(sinceKey);
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    const userId = user._id;

    const [profile, habits, logs] = await Promise.all([
      ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("habits")
        .withIndex("by_user_position", (q) => q.eq("userId", userId))
        .take(MAX_HABITS),
      ctx.db
        .query("habitLogs")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", userId).gte("logDate", sinceKey),
        )
        // Newest first, so reaching the cap drops the oldest days, never today.
        .order("desc")
        .take(MAX_LOG_ROWS),
    ]);

    const logKeysRecord: Record<string, string[]> = {};
    for (const log of logs) {
      (logKeysRecord[log.habitId] ??= []).push(log.logDate);
    }

    return {
      profile: {
        displayName:
          profile?.displayName.trim() ||
          user.name.trim() ||
          user.email.split("@")[0],
        motivationPhrase: profile?.motivationPhrase?.trim() ?? "",
        timezone: profile?.timezone ?? "UTC",
        locale: profile?.locale ?? "pt",
        email: user.email,
      },
      habits: habits
        .filter((habit) => habit.archivedAt === undefined)
        .map((habit) => ({
          id: habit._id as string,
          name: habit.name,
          colorVariant: habit.colorVariant,
          schedule: habit.schedule,
          position: habit.position,
        })),
      logKeysRecord,
    };
  },
});
