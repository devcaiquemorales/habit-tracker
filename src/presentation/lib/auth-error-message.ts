import type { TranslateFn } from "@/presentation/lib/i18n/messages";

/** Map common Supabase Auth errors to localized copy. */
export function formatAuthErrorMessage(
  raw: string,
  t: TranslateFn,
): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return t("authErrors.invalidCredentials");
  }
  if (m.includes("email not confirmed")) {
    return t("authErrors.emailNotConfirmed");
  }
  if (m.includes("user already registered")) {
    return t("authErrors.userAlreadyRegistered");
  }
  if (m.includes("password")) {
    return raw;
  }
  return raw;
}
