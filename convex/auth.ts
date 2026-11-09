import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";

import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import {
  localeFromRequest,
  resetPasswordEmail,
  sendEmail,
  verificationEmail,
} from "./lib/email";

const siteUrl = process.env.SITE_URL!;

/** Paths limited per email: Convex does not see the caller's real IP. */
const RATE_LIMITED_PATHS = new Set([
  "/sign-in/email",
  "/sign-up/email",
  "/request-password-reset",
  "/send-verification-email",
]);

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, token }, request) => {
        // The token stays in the URL fragment, out of server logs.
        const url = `${siteUrl}/update-password#token=${encodeURIComponent(token)}`;
        try {
          await sendEmail(
            user.email,
            resetPasswordEmail(url, localeFromRequest(request)),
          );
        } catch (error) {
          // Swallowed so the response does not reveal which emails have accounts.
          console.error("Password reset email failed", error);
        }
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }, request) => {
        try {
          await sendEmail(
            user.email,
            verificationEmail(url, localeFromRequest(request)),
          );
        } catch (error) {
          console.error("Verification email failed", error);
        }
      },
    },
    // Better Auth limits per IP and Convex has none, so everyone would share one
    // counter. `storage` keeps the rateLimit table in the component schema.
    rateLimit: { enabled: false, storage: "database" },
    hooks: {
      before: createAuthMiddleware(async (hookCtx) => {
        if (!RATE_LIMITED_PATHS.has(hookCtx.path)) return;
        const email = String(hookCtx.body?.email ?? "").trim().toLowerCase();
        const actionCtx = requireActionCtx(ctx);

        const allowed = await actionCtx.runMutation(internal.rateLimit.hit, {
          key: `${hookCtx.path}:${email}`,
        });
        if (!allowed) {
          throw new APIError("TOO_MANY_REQUESTS", {
            code: "TOO_MANY_ATTEMPTS",
            message: "Too many attempts",
          });
        }

        if (hookCtx.path === "/sign-up/email") {
          const invited = await actionCtx.runQuery(internal.invites.isValid, {
            email,
          });
          if (!invited) {
            throw new APIError("FORBIDDEN", {
              code: "INVITE_REQUIRED",
              message: "Invite required",
            });
          }
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user, hookCtx) => {
            const phrase = hookCtx?.body?.motivationPhrase;
            await requireActionCtx(ctx).runMutation(
              internal.profiles.onUserCreated,
              {
                userId: user.id,
                email: user.email,
                displayName: user.name,
                motivationPhrase:
                  typeof phrase === "string" ? phrase : undefined,
              },
            );
          },
        },
      },
    },
    plugins: [convex({ authConfig })],
  });
