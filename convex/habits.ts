import { ConvexError, v } from "convex/values";

import { todayKeyInTimeZone } from "../src/domain/types/date-key";
import type { Schedule } from "../src/domain/types/schedule";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { requireUserId } from "./lib/auth";
import { assertDateKey } from "./lib/date";
import { colorVariantValidator, scheduleValidator } from "./lib/validators";

const NAME_MAX = 80;
/** Matches what the dashboard query returns; a habit past it would be invisible. */
const MAX_HABITS = 200;

async function requireOwnedHabit(
  ctx: MutationCtx,
  habitId: Id<"habits">,
  userId: string,
): Promise<Doc<"habits">> {
  const habit = await ctx.db.get(habitId);
  if (!habit || habit.userId !== userId) {
    throw new ConvexError("errors.habitNotFound");
  }
  return habit;
}

function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > NAME_MAX) {
    throw new ConvexError("errors.invalidInput");
  }
  return trimmed;
}

async function userToday(ctx: MutationCtx, userId: string): Promise<string> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  return todayKeyInTimeZone(profile?.timezone ?? "UTC");
}

async function normalizeSchedule(
  ctx: MutationCtx,
  userId: string,
  schedule: Schedule,
): Promise<Schedule> {
  switch (schedule.type) {
    case "specificDays": {
      const days = [...new Set(schedule.days)].sort((a, b) => a - b);
      if (days.length === 0 || days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) {
        throw new ConvexError("errors.invalidInput");
      }
      return days.length === 7 ? { type: "daily" } : { type: "specificDays", days };
    }
    case "weeklyTarget": {
      const times = schedule.timesPerWeek;
      if (!Number.isInteger(times) || times < 1 || times > 7) {
        throw new ConvexError("errors.invalidInput");
      }
      return schedule;
    }
    case "everyOtherDay": {
      if (schedule.anchorDateKey) {
        assertDateKey(schedule.anchorDateKey);
        return schedule;
      }
      return {
        type: "everyOtherDay",
        anchorDateKey: await userToday(ctx, userId),
      };
    }
    default:
      return schedule;
  }
}

export const create = mutation({
  args: {
    name: v.string(),
    colorVariant: colorVariantValidator,
    schedule: scheduleValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const name = normalizeName(args.name);
    const schedule = await normalizeSchedule(ctx, userId, args.schedule);

    const existing = await ctx.db
      .query("habits")
      .withIndex("by_user_position", (q) => q.eq("userId", userId))
      .order("desc")
      .take(MAX_HABITS);
    if (existing.length >= MAX_HABITS) {
      throw new ConvexError("errors.invalidInput");
    }
    const last = existing[0];

    return await ctx.db.insert("habits", {
      userId,
      name,
      colorVariant: args.colorVariant,
      schedule,
      position: last ? last.position + 1 : 0,
    });
  },
});

export const update = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.string(),
    colorVariant: colorVariantValidator,
    schedule: scheduleValidator,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    await requireOwnedHabit(ctx, args.habitId, userId);
    await ctx.db.patch(args.habitId, {
      name: normalizeName(args.name),
      colorVariant: args.colorVariant,
      schedule: await normalizeSchedule(ctx, userId, args.schedule),
    });
  },
});

export const reorder = mutation({
  args: { orderedIds: v.array(v.id("habits")) },
  handler: async (ctx, { orderedIds }) => {
    const userId = await requireUserId(ctx);
    if (orderedIds.length > 200) throw new ConvexError("errors.invalidInput");
    await Promise.all(
      orderedIds.map((id) => requireOwnedHabit(ctx, id, userId)),
    );
    await Promise.all(
      orderedIds.map((id, position) => ctx.db.patch(id, { position })),
    );
  },
});

export const remove = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, { habitId }) => {
    const userId = await requireUserId(ctx);
    await requireOwnedHabit(ctx, habitId, userId);

    const logs = await ctx.db
      .query("habitLogs")
      .withIndex("by_habit_date", (q) => q.eq("habitId", habitId))
      .collect();
    await Promise.all(logs.map((log) => ctx.db.delete(log._id)));
    await ctx.db.delete(habitId);
  },
});
