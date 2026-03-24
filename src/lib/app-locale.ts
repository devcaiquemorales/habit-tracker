export type AppLocale = "en" | "pt";

export const LOCALE_COOKIE_NAME = "app-locale";
export const LOCALE_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365;
export const APP_LOCALE_HEADER = "x-app-locale";

/** BCP 47 tag for `Intl` and `<html lang>`. */
export function intlLocaleForAppLocale(locale: AppLocale): string {
  return locale === "pt" ? "pt-BR" : "en-US";
}

/**
 * Central rule: `pt*` → Portuguese, everything else → English.
 */
export function appLocaleFromLanguageTag(tag: string | null | undefined): AppLocale {
  if (!tag || typeof tag !== "string") return "en";
  const base = tag.trim().split(/[-_]/)[0]?.toLowerCase();
  if (base === "pt") return "pt";
  return "en";
}

export function appLocaleFromAcceptLanguage(
  header: string | null | undefined,
): AppLocale {
  if (!header) return "en";
  const parts = header.split(",");
  for (const part of parts) {
    const tag = part.split(";")[0]?.trim();
    if (tag) return appLocaleFromLanguageTag(tag);
  }
  return "en";
}

export function parseAppLocaleCookie(
  value: string | null | undefined,
): AppLocale | null {
  if (value === "en" || value === "pt") return value;
  return null;
}

export function normalizeAppLocale(value: unknown): AppLocale {
  if (value === "pt" || value === "en") return value;
  return "en";
}

/**
 * Cookie wins when valid; otherwise Accept-Language (for first visit before cookie exists).
 */
export function resolveAppLocaleFromRequest(
  cookieValue: string | undefined,
  acceptLanguage: string | null | undefined,
): AppLocale {
  const fromCookie = parseAppLocaleCookie(cookieValue);
  if (fromCookie) return fromCookie;
  return appLocaleFromAcceptLanguage(acceptLanguage);
}
