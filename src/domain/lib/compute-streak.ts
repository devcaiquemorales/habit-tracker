import type { Schedule } from "@/domain/types/schedule";

export type StreakUnit = "days" | "weeks" | "none";

export interface StreakResult {
  count: number;
  unit: StreakUnit;
}

/**
 * Determine the streak unit (days/weeks/none) for a given schedule type.
 */
export function streakUnitForSchedule(schedule: Schedule): StreakUnit {
  switch (schedule.type) {
    case "daily":
    case "specificDays":
    case "everyOtherDay":
      return "days";
    case "weeklyTarget":
      return "weeks";
    case "flexible":
      return "none";
  }
}

/**
 * Parse a date key "YYYY-MM-DD" to epoch day (days since Unix epoch).
 * Returns null if the key is invalid or the parsed date doesn't round-trip.
 */
function parseKey(key: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const epochDay = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  // Validate round-trip
  const date = new Date(epochDay * 86400000);
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return epochDay;
}

/**
 * Convert an epoch day to a date key "YYYY-MM-DD".
 */
function keyOf(epochDay: number): string {
  const date = new Date(epochDay * 86400000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get the weekday (0 = Sunday) of an epoch day.
 */
function weekdayOf(epochDay: number): number {
  return new Date(epochDay * 86400000).getUTCDay();
}

/**
 * Check if a day is expected according to the schedule.
 * Uses epoch day for DST-proof computation.
 */
function isDayExpectedForStreak(
  schedule: Schedule,
  epochDay: number,
): boolean {
  switch (schedule.type) {
    case "daily":
      return true;
    case "specificDays":
      return schedule.days.includes(weekdayOf(epochDay));
    case "everyOtherDay": {
      if (schedule.anchorDateKey) {
        const anchorEpochDay = parseKey(schedule.anchorDateKey);
        if (anchorEpochDay !== null) {
          return epochDay >= anchorEpochDay && (epochDay - anchorEpochDay) % 2 === 0;
        }
      }
      // Fallback: legacy parity behavior
      return epochDay % 2 === 0;
    }
    case "weeklyTarget":
      return true;
    case "flexible":
      return false;
  }
}

/**
 * Compute a streak for daily, specificDays, or everyOtherDay schedules.
 */
function computeStreakDays(
  completedDateKeys: ReadonlySet<string>,
  schedule: Schedule,
  todayEpochDay: number,
): StreakResult {
  // Handle empty specificDays
  if (schedule.type === "specificDays" && schedule.days.length === 0) {
    return { count: 0, unit: "days" };
  }

  let count = 0;
  let cursor = todayEpochDay;

  // Grace period: if today is expected but not logged, don't break the streak
  if (isDayExpectedForStreak(schedule, cursor) && !completedDateKeys.has(keyOf(cursor))) {
    cursor--;
  }

  // Max 400 iterations to avoid infinite loops
  for (let i = 0; i < 400; i++) {
    // Stop before anchor if everyOtherDay with anchor
    if (schedule.type === "everyOtherDay" && schedule.anchorDateKey) {
      const anchorEpochDay = parseKey(schedule.anchorDateKey);
      if (anchorEpochDay !== null && cursor < anchorEpochDay) {
        break;
      }
    }

    if (isDayExpectedForStreak(schedule, cursor)) {
      if (completedDateKeys.has(keyOf(cursor))) {
        count++;
      } else {
        break;
      }
    }

    cursor--;
  }

  return { count, unit: "days" };
}

/**
 * Compute a streak for weeklyTarget schedules.
 */
function computeStreakWeeks(
  completedDateKeys: ReadonlySet<string>,
  schedule: Extract<Schedule, { type: "weeklyTarget" }>,
  todayEpochDay: number,
): StreakResult {
  const target = Math.min(7, Math.max(1, schedule.timesPerWeek));

  // Compute the current week's Sunday
  const todayWeekday = weekdayOf(todayEpochDay);
  const weekStartEpochDay = todayEpochDay - todayWeekday;

  /**
   * Count logs in a week (7 consecutive days starting at weekStart).
   */
  function countWeek(weekStart: number): number {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const day = weekStart + i;
      if (completedDateKeys.has(keyOf(day))) {
        count++;
      }
    }
    return count;
  }

  let count = 0;
  let cursor = weekStartEpochDay;

  // Check current week
  const currentWeekCount = countWeek(cursor);
  if (currentWeekCount >= target) {
    count++;
  } else {
    // Current incomplete week doesn't break the streak; continue to previous weeks
  }
  cursor -= 7;

  // Max 60 iterations to avoid infinite loops
  for (let i = 0; i < 60; i++) {
    const weekCount = countWeek(cursor);
    if (weekCount >= target) {
      count++;
    } else {
      break;
    }
    cursor -= 7;
  }

  return { count, unit: "weeks" };
}

/**
 * Compute a streak given completed date keys, schedule, and today's date key.
 */
export function computeStreak(
  completedDateKeys: ReadonlySet<string>,
  schedule: Schedule,
  todayKey: string,
): StreakResult {
  const todayEpochDay = parseKey(todayKey);

  // If todayKey is unparsable, return 0 with the appropriate unit
  if (todayEpochDay === null) {
    return { count: 0, unit: streakUnitForSchedule(schedule) };
  }

  if (schedule.type === "flexible") {
    return { count: 0, unit: "none" };
  }

  if (schedule.type === "weeklyTarget") {
    return computeStreakWeeks(completedDateKeys, schedule, todayEpochDay);
  }

  // daily, specificDays, or everyOtherDay
  return computeStreakDays(completedDateKeys, schedule, todayEpochDay);
}

/**
 * Count the number of logs in the same calendar month as todayKey.
 */
export function countLogsInCalendarMonth(
  completedDateKeys: ReadonlySet<string>,
  todayKey: string,
): number {
  const match = /^(\d{4})-(\d{2})/.exec(todayKey);
  if (!match) return 0;
  const monthPrefix = `${match[1]}-${match[2]}`;
  let count = 0;
  for (const key of completedDateKeys) {
    if (key.startsWith(monthPrefix)) {
      count++;
    }
  }
  return count;
}
