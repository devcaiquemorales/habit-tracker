/**
 * Time-aware greetings for the home header: one line per local time period only.
 */

import type { AppLocale } from "@/lib/app-locale";
import { getMessages } from "@/presentation/lib/i18n/messages";

export type GreetingPeriod = "morning" | "afternoon" | "evening";

/** Local wall clock: morning 05:00–11:59, afternoon 12:00–17:59, evening 18:00–04:59 */
export function getLocalGreetingPeriod(at: Date): GreetingPeriod {
  const h = at.getHours();
  if (h >= 5 && h <= 11) return "morning";
  if (h >= 12 && h <= 17) return "afternoon";
  return "evening";
}

/**
 * Returns the greeting for the current local time period and display name.
 * Same on server and client for a given `at`, name, and locale (stable, no storage).
 */
export function getTimeAwareGreeting(
  displayName: string,
  at: Date,
  locale: AppLocale,
): string {
  const g = getMessages(locale).greeting;
  const period = getLocalGreetingPeriod(at);
  const name = displayName.trim() || g.nameFallback;
  const template =
    period === "morning"
      ? g.morning
      : period === "afternoon"
        ? g.afternoon
        : g.evening;
  return template.replace(/\{name\}/g, name);
}
