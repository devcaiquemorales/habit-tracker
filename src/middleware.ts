import { type NextRequest } from "next/server";

import { updateSession } from "@/infrastructure/supabase/middleware";
import {
  APP_LOCALE_HEADER,
  LOCALE_COOKIE_MAX_AGE_SEC,
  LOCALE_COOKIE_NAME,
  parseAppLocaleCookie,
  resolveAppLocaleFromRequest,
} from "@/lib/app-locale";

export async function middleware(request: NextRequest) {
  const locale = resolveAppLocaleFromRequest(
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    request.headers.get("accept-language"),
  );

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set(APP_LOCALE_HEADER, locale);

  const response = await updateSession(request, { forwardHeaders });

  if (!parseAppLocaleCookie(request.cookies.get(LOCALE_COOKIE_NAME)?.value)) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE_SEC,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
