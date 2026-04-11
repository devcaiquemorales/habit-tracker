import { localDateFromDateKey } from "@/domain/types/date-key";

export const ACTIVITY_STRIP_DAY_COUNT = 7;

/** Oldest → newest (local calendar days). */
export function computeUpdateActivityDayWindow(
  selectedKey: string | null,
  today: Date,
  count: number,
): Date[] {
  const tt = today.getTime();
  const start =
    selectedKey !== null ? localDateFromDateKey(selectedKey) : today;
  if (!start) return [];

  const anchor = new Date(Math.min(start.getTime(), tt));
  // Clamp to local midnight
  anchor.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    days.push(d);
  }
  return days;
}
