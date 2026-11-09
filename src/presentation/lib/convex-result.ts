import { ConvexError } from "convex/values";

import type { LocalizedActionResult } from "@/presentation/lib/action-error";

/** Runs a Convex mutation and turns a failure into the result shape the UI shows. */
export async function toActionResult(
  call: Promise<unknown>,
): Promise<LocalizedActionResult> {
  try {
    await call;
    return { error: null };
  } catch (error) {
    // `error.message` reads "Server Error" on the client; the key lives in `data`.
    const errorKey =
      error instanceof ConvexError && typeof error.data === "string"
        ? error.data
        : "common.error";
    return { error: null, errorKey };
  }
}
