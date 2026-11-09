import { v } from "convex/values";

export const colorVariantValidator = v.union(
  v.literal("green"),
  v.literal("blue"),
  v.literal("amber"),
  v.literal("purple"),
  v.literal("red"),
);

export const scheduleValidator = v.union(
  v.object({ type: v.literal("daily") }),
  v.object({ type: v.literal("specificDays"), days: v.array(v.number()) }),
  v.object({
    type: v.literal("everyOtherDay"),
    anchorDateKey: v.optional(v.string()),
  }),
  v.object({ type: v.literal("flexible") }),
  v.object({ type: v.literal("weeklyTarget"), timesPerWeek: v.number() }),
);
