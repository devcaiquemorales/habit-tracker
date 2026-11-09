import type { TranslateFn } from "@/presentation/lib/i18n/messages";

const ERROR_KEY_BY_CODE: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "authErrors.invalidCredentials",
  EMAIL_NOT_VERIFIED: "authErrors.emailNotConfirmed",
  USER_ALREADY_EXISTS: "authErrors.userAlreadyRegistered",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "authErrors.userAlreadyRegistered",
  INVITE_REQUIRED: "authErrors.inviteRequired",
  TOO_MANY_ATTEMPTS: "authErrors.tooManyAttempts",
};

/** Maps Better Auth error codes to localized copy. */
export function formatAuthErrorMessage(
  error: { code?: string; message?: string },
  t: TranslateFn,
): string {
  const key = error.code ? ERROR_KEY_BY_CODE[error.code] : undefined;
  if (key) return t(key);
  return error.message || t("common.error");
}
