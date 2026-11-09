import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import {
  APP_LOCALE_HEADER,
  LOCALE_COOKIE_MAX_AGE_SEC,
  LOCALE_COOKIE_NAME,
  parseAppLocaleCookie,
  resolveAppLocaleFromRequest,
} from "@/lib/app-locale";

function isPublicPath(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname === "/update-password" ||
    pathname === "/_offline" ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/pwa-icons")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cookie presence is only a fast path; `(app)/layout.tsx` validates the session.
  if (!isPublicPath(pathname) && !getSessionCookie(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const locale = resolveAppLocaleFromRequest(
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    request.headers.get("accept-language"),
  );

  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set(APP_LOCALE_HEADER, locale);

  const response = NextResponse.next({ request: { headers: forwardHeaders } });

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
