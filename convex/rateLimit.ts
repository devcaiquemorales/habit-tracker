import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

/** Counts one attempt and returns whether it is still within the limit. */
export const hit = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const now = Date.now();
    const row = await ctx.db
      .query("authAttempts")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (!row || now - row.windowStart >= WINDOW_MS) {
      if (row) {
        await ctx.db.patch(row._id, { windowStart: now, count: 1 });
      } else {
        await ctx.db.insert("authAttempts", { key, windowStart: now, count: 1 });
      }
      return true;
    }

    if (row.count >= MAX_ATTEMPTS) return false;
    await ctx.db.patch(row._id, { count: row.count + 1 });
    return true;
  },
});

export const prune = internalMutation({
  args: {},
  handler: async (ctx) => {
    const expired = await ctx.db
      .query("authAttempts")
      .withIndex("by_window", (q) => q.lt("windowStart", Date.now() - WINDOW_MS))
      .take(1000);
    await Promise.all(expired.map((row) => ctx.db.delete(row._id)));
  },
});
