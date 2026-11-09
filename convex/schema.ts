import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { colorVariantValidator, scheduleValidator } from "./lib/validators";

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    displayName: v.string(),
    motivationPhrase: v.optional(v.string()),
    /** IANA name; every "user local day" on the server derives from it. */
    timezone: v.string(),
    locale: v.union(v.literal("en"), v.literal("pt")),
  }).index("by_user", ["userId"]),

  habits: defineTable({
    userId: v.string(),
    name: v.string(),
    colorVariant: colorVariantValidator,
    schedule: scheduleValidator,
    position: v.number(),
    archivedAt: v.optional(v.number()),
  }).index("by_user_position", ["userId", "position"]),

  /** One row per habit per done day. `logDate` is YYYY-MM-DD in the user's own time zone. */
  habitLogs: defineTable({
    userId: v.string(),
    habitId: v.id("habits"),
    logDate: v.string(),
  })
    .index("by_habit_date", ["habitId", "logDate"])
    .index("by_user_date", ["userId", "logDate"]),

  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    userAgent: v.optional(v.string()),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_endpoint", ["endpoint"])
    .index("by_user", ["userId"]),

  reminders: defineTable({
    userId: v.string(),
    /** Local time of day, always on the hour ("HH:00"). */
    reminderTime: v.string(),
    enabled: v.boolean(),
    /** 0–6 (Sun–Sat); absent means every day. */
    daysOfWeek: v.optional(v.array(v.number())),
  })
    .index("by_user_time", ["userId", "reminderTime"])
    .index("by_enabled", ["enabled"]),

  reminderDeliveries: defineTable({
    userId: v.string(),
    localDate: v.string(),
    reminderTime: v.string(),
    doneCount: v.number(),
    pendingCount: v.number(),
  }).index("by_user_date_time", ["userId", "localDate", "reminderTime"]),

  invites: defineTable({
    email: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  authAttempts: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_window", ["windowStart"]),
});
