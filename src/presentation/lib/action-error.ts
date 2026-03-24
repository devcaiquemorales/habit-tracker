import type { TranslateFn } from "@/presentation/lib/i18n/messages";

export type LocalizedActionResult = {
  error: string | null;
  /** When set, UI should show `t(errorKey, errorParams)` instead of `error`. */
  errorKey?: string;
  errorParams?: Record<string, string | number>;
};

export function formatActionError(
  result: LocalizedActionResult,
  t: TranslateFn,
): string | null {
  if (result.errorKey) {
    return t(result.errorKey, result.errorParams);
  }
  if (result.error) {
    return result.error;
  }
  return null;
}
