/**
 * Time-aware greetings for the home header: one line per local time period only.
 */

export type GreetingPeriod = "morning" | "afternoon" | "evening";

/** Local wall clock: morning 05:00–11:59, afternoon 12:00–17:59, evening 18:00–04:59 */
export function getLocalGreetingPeriod(at: Date): GreetingPeriod {
  const h = at.getHours();
  if (h >= 5 && h <= 11) return "morning";
  if (h >= 12 && h <= 17) return "afternoon";
  return "evening";
}

const GREETING_BY_PERIOD: Record<GreetingPeriod, string> = {
  morning: "Good morning, {name}",
  afternoon: "Good afternoon, {name}",
  evening: "Good evening, {name}",
};

function formatGreeting(template: string, displayName: string): string {
  const name = displayName.trim() || "—";
  return template.replace(/\{name\}/g, name);
}

/**
 * Returns the greeting for the current local time period and display name.
 * Same on server and client for a given `at` and name (stable, no storage).
 */
export function getTimeAwareGreeting(displayName: string, at: Date): string {
  const period = getLocalGreetingPeriod(at);
  return formatGreeting(GREETING_BY_PERIOD[period], displayName);
}
