import { toLocalDateKey } from "@/domain/types/date-key";

/**
 * Consecutive calendar days (local timezone) with a log, allowing "today" to
 * be skipped if not yet logged — streak stays alive until yesterday's key is gone.
 */
export function computeHabitStreak(
  completedDateKeys: ReadonlySet<string>,
  today: Date,
): number {
  const todayKey = toLocalDateKey(today);
  // Work with local midnight so setDate / getDate give local calendar days.
  const cursor = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  if (!completedDateKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  const minTime = today.getTime() - 400 * 86400000;

  while (cursor.getTime() >= minTime) {
    const key = toLocalDateKey(cursor);
    if (completedDateKeys.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
