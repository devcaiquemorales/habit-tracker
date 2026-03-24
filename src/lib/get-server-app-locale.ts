import { cookies, headers } from "next/headers";

import {
  APP_LOCALE_HEADER,
  type AppLocale,
  LOCALE_COOKIE_NAME,
  normalizeAppLocale,
  parseAppLocaleCookie,
} from "@/lib/app-locale";

export async function getServerAppLocale(): Promise<AppLocale> {
  const h = await headers();
  const fromHeader = h.get(APP_LOCALE_HEADER);
  if (fromHeader === "en" || fromHeader === "pt") {
    return fromHeader;
  }
  const c = await cookies();
  const fromCookie = parseAppLocaleCookie(c.get(LOCALE_COOKIE_NAME)?.value);
  return fromCookie ?? normalizeAppLocale(undefined);
}
