import { utcDateFromDateKey } from "@/domain/types/date-key";

export const ACTIVITY_STRIP_DAY_COUNT = 7;

/** Oldest → newest (UTC calendar days). */
export function computeUpdateActivityDayWindow(
  selectedKey: string | null,
  today: Date,
  count: number,
): Date[] {
  const tt = today.getTime();
  const start = selectedKey !== null ? utcDateFromDateKey(selectedKey) : today;
  if (!start) return [];

  const anchor = new Date(Math.min(start.getTime(), tt));
  anchor.setUTCHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(anchor);
    d.setUTCDate(anchor.getUTCDate() - i);
    days.push(d);
  }
  return days;
}
