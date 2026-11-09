import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { inviteEmail, sendEmail } from "./lib/email";

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const localeValidator = v.union(v.literal("en"), v.literal("pt"));

/**
 * Owner-only: there is no public way to invite.
 * Run with `npx convex run invites:create '{"email":"person@example.com"}'`.
 */
export const create = internalMutation({
  args: { email: v.string(), locale: v.optional(localeValidator) },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!email.includes("@")) throw new ConvexError("errors.invalidInput");

    const expiresAt = Date.now() + INVITE_TTL_MS;
    const existing = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing?.usedAt) throw new ConvexError("invite_already_used");
    if (existing) {
      await ctx.db.patch(existing._id, { expiresAt });
    } else {
      await ctx.db.insert("invites", { email, expiresAt });
    }

    await ctx.scheduler.runAfter(0, internal.invites.sendInviteEmail, {
      email,
      locale: args.locale ?? "pt",
    });
    return { email, expiresAt };
  },
});

export const isValid = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(args.email)))
      .unique();
    return !!invite && !invite.usedAt && invite.expiresAt > Date.now();
  },
});

export const sendInviteEmail = internalAction({
  args: { email: v.string(), locale: localeValidator },
  handler: async (_ctx, { email, locale }) => {
    const url = `${process.env.SITE_URL}/signup?email=${encodeURIComponent(email)}`;
    await sendEmail(email, inviteEmail(url, locale));
  },
});
