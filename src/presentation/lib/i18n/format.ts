import type { AppLocale } from "@/lib/app-locale";
import { intlLocaleForAppLocale } from "@/lib/app-locale";

import { getMessages } from "./messages";

/** Home header: weekday, day, long month (no year). */
export function formatHomeHeaderDate(date: Date, locale: AppLocale): string {
  const tag = intlLocaleForAppLocale(locale);
  return new Intl.DateTimeFormat(tag, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** Activity strip chips: short weekday + day number, UTC calendar. */
export function formatActivityChipDate(date: Date, locale: AppLocale): string {
  const tag = intlLocaleForAppLocale(locale);
  return new Intl.DateTimeFormat(tag, {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Long calendar date in UTC for aria labels (heatmap day selection). */
export function formatUtcDateKeyLong(dateKey: string, locale: AppLocale): string {
  const parts = dateKey.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return dateKey;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const tag = intlLocaleForAppLocale(locale);
  return new Intl.DateTimeFormat(tag, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

/** Heatmap month column header (short month, optional year when year changes). */
export function formatHeatmapMonthLabel(
  year: number,
  monthIndex0: number,
  locale: AppLocale,
  includeYear: boolean,
): string {
  const tag = intlLocaleForAppLocale(locale);
  const d = new Date(Date.UTC(year, monthIndex0, 1));
  const monthPart = new Intl.DateTimeFormat(tag, { month: "short" }).format(d);
  if (!includeYear) return monthPart;
  const y = new Intl.DateTimeFormat(tag, { year: "numeric" }).format(d);
  return `${monthPart} ${y}`;
}

const WEEKDAY_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

export function shortWeekdayForUtcDay(
  weekday0Sunday: number,
  locale: AppLocale,
): string {
  const m = getMessages(locale).scheduleDays;
  const key = WEEKDAY_KEYS[weekday0Sunday];
  if (!key) return "";
  return m[key];
}

/** Selector order Mon–Sun → indices 1..6,0 */
const SELECTOR_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export function weekdayLabelsForSelector(locale: AppLocale): {
  weekday: number;
  label: string;
}[] {
  const m = getMessages(locale).scheduleDays;
  return SELECTOR_ORDER.map((weekday) => ({
    weekday,
    label: m[WEEKDAY_KEYS[weekday]],
  }));
}
