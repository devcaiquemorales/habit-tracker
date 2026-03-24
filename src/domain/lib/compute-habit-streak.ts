import { toUtcDateKey } from "@/domain/types/date-key";

/**
 * Consecutive UTC days with a log, allowing "today" to be skipped if not yet logged
 * (matches dashboard mock behavior where streak can be > 0 without completing today).
 */
export function computeHabitStreak(
  completedDateKeys: ReadonlySet<string>,
  today: Date,
): number {
  const todayKey = toUtcDateKey(today);
  const cursor = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  if (!completedDateKeys.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  const minTime = today.getTime() - 400 * 86400000;

  while (cursor.getTime() >= minTime) {
    const key = toUtcDateKey(cursor);
    if (completedDateKeys.has(key)) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
