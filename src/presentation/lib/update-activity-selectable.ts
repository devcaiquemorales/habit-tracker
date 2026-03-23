import { toUtcDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { isPastDayLoggable } from "@/domain/types/schedule";

/** Past days follow schedule rules; today is always tappable for logging. */
export function isUpdateActivitySelectable(
  schedule: Schedule,
  date: Date,
  today: Date,
  completedKeys: Set<string>,
): boolean {
  if (toUtcDateKey(date) === toUtcDateKey(today)) return true;
  return isPastDayLoggable(schedule, date, completedKeys);
}

export function getDefaultActivitySelectedKey(
  days: Date[],
  schedule: Schedule,
  today: Date,
  completedKeys: Set<string>,
): string | null {
  for (let i = days.length - 1; i >= 0; i -= 1) {
    const d = days[i]!;
    const key = toUtcDateKey(d);
    if (isUpdateActivitySelectable(schedule, d, today, completedKeys)) {
      return key;
    }
  }
  return null;
}
