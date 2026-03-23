/**
 * Time-aware greetings for the home header. Deterministic per local calendar day,
 * period, and display name — no render-time randomness.
 */

export type GreetingPeriod = "morning" | "afternoon" | "evening";

/** Local wall clock: morning 05:00–11:59, afternoon 12:00–17:59, evening 18:00–04:59 */
export function getLocalGreetingPeriod(at: Date): GreetingPeriod {
  const h = at.getHours();
  if (h >= 5 && h <= 11) return "morning";
  if (h >= 12 && h <= 17) return "afternoon";
  return "evening";
}

const MORNING_MESSAGES = [
  "Good morning, {name}",
  "Morning, {name}",
  "Ready to start, {name}?",
] as const;

const AFTERNOON_MESSAGES = [
  "Good afternoon, {name}",
  "Hope your day is going well, {name}",
  "Keep it going, {name}",
] as const;

const EVENING_MESSAGES = [
  "Good evening, {name}",
  "Hope today went well, {name}",
  "Still time for one more, {name}",
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Stable integer for (local calendar day + period). */
function dayPeriodSeed(at: Date, period: GreetingPeriod): number {
  const y = at.getFullYear();
  const mo = at.getMonth();
  const d = at.getDate();
  const p = period === "morning" ? 0 : period === "afternoon" ? 1 : 2;
  return y * 10_000 + mo * 100 + d * 10 + p;
}

function pickStableIndex(seed: number, length: number): number {
  if (length <= 0) return 0;
  const mixed = Math.imul(seed, 1_102_515_245) ^ (seed >>> 16);
  return ((mixed % length) + length) % length;
}

function formatGreeting(template: string, name: string): string {
  return template.replace(/\{name\}/g, name.trim() || "—");
}

export function getTimeAwareGreeting(displayName: string, at: Date): string {
  const name = displayName.trim() || "—";
  const period = getLocalGreetingPeriod(at);
  const variants =
    period === "morning"
      ? MORNING_MESSAGES
      : period === "afternoon"
        ? AFTERNOON_MESSAGES
        : EVENING_MESSAGES;

  const seed = dayPeriodSeed(at, period) + hashString(name);
  const index = pickStableIndex(seed, variants.length);
  return formatGreeting(variants[index]!, name);
}
