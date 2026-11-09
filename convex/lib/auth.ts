import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

export async function currentUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  const user = await authComponent.safeGetAuthUser(ctx);
  return user?._id ?? null;
}

export async function requireUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const userId = await currentUserId(ctx);
  if (!userId) throw new ConvexError("errors.notSignedIn");
  return userId;
}
