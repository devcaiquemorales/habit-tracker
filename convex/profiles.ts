import { ConvexError, v } from "convex/values";

import {
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_MOTIVATION_PHRASE_MAX,
} from "../src/domain/constants/profile-limits";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, mutation } from "./_generated/server";
import { requireUserId } from "./lib/auth";

async function findProfile(
  ctx: MutationCtx,
  userId: string,
): Promise<Doc<"profiles"> | null> {
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

/** Runs right after Better Auth creates the user: consumes the invite and seeds the profile. */
export const onUserCreated = internalMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    displayName: v.string(),
    motivationPhrase: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();
    if (invite) await ctx.db.patch(invite._id, { usedAt: Date.now() });

    if (await findProfile(ctx, args.userId)) return;
    await ctx.db.insert("profiles", {
      userId: args.userId,
      displayName: args.displayName.trim().slice(0, PROFILE_DISPLAY_NAME_MAX),
      motivationPhrase: args.motivationPhrase
        ?.trim()
        .slice(0, PROFILE_MOTIVATION_PHRASE_MAX),
      timezone: "UTC",
      locale: "pt",
    });
  },
});

export const updateCustomization = mutation({
  args: { displayName: v.string(), motivationPhrase: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const displayName = args.displayName.trim();
    const motivationPhrase = args.motivationPhrase
      .trim()
      .slice(0, PROFILE_MOTIVATION_PHRASE_MAX);

    if (!displayName) throw new ConvexError("errors.enterDisplayName");
    if (displayName.length > PROFILE_DISPLAY_NAME_MAX) {
      throw new ConvexError("errors.invalidInput");
    }
    if (!motivationPhrase) throw new ConvexError("errors.enterReason");

    const profile = await findProfile(ctx, userId);
    if (profile) {
      await ctx.db.patch(profile._id, { displayName, motivationPhrase });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        displayName,
        motivationPhrase,
        timezone: "UTC",
        locale: "pt",
      });
    }
  },
});

/** Stores the device's time zone and language, which the reminders rely on. */
export const syncDevice = mutation({
  args: {
    timezone: v.string(),
    locale: v.union(v.literal("en"), v.literal("pt")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: args.timezone });
    } catch {
      throw new ConvexError("errors.invalidInput");
    }

    const profile = await findProfile(ctx, userId);
    if (profile) {
      await ctx.db.patch(profile._id, {
        timezone: args.timezone,
        locale: args.locale,
      });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        displayName: "",
        timezone: args.timezone,
        locale: args.locale,
      });
    }
  },
});
