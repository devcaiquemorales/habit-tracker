import { ConvexError, v } from "convex/values";

import { todayKeyInTimeZone } from "../src/domain/types/date-key";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { assertDateKey } from "./lib/date";

async function requireOwnership(
  ctx: MutationCtx,
  habitId: Id<"habits">,
  userId: string,
): Promise<void> {
  const habit = await ctx.db.get(habitId);
  if (!habit || habit.userId !== userId) {
    throw new ConvexError("errors.habitNotFound");
  }
}

async function findLog(ctx: MutationCtx, habitId: Id<"habits">, logDate: string) {
  return await ctx.db
    .query("habitLogs")
    .withIndex("by_habit_date", (q) =>
      q.eq("habitId", habitId).eq("logDate", logDate),
    )
    .unique();
}

/** Idempotent: marking a day twice keeps a single row. */
export const mark = mutation({
  args: { habitId: v.id("habits"), logDate: v.string() },
  handler: async (ctx, { habitId, logDate }) => {
    const userId = await requireUserId(ctx);
    assertDateKey(logDate);
    await requireOwnership(ctx, habitId, userId);

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (logDate > todayKeyInTimeZone(profile?.timezone ?? "UTC")) {
      throw new ConvexError("errors.invalidDate");
    }

    if (await findLog(ctx, habitId, logDate)) return;
    await ctx.db.insert("habitLogs", { userId, habitId, logDate });
  },
});

export const unmark = mutation({
  args: { habitId: v.id("habits"), logDate: v.string() },
  handler: async (ctx, { habitId, logDate }) => {
    const userId = await requireUserId(ctx);
    assertDateKey(logDate);
    await requireOwnership(ctx, habitId, userId);

    const existing = await findLog(ctx, habitId, logDate);
    if (existing) await ctx.db.delete(existing._id);
  },
});
