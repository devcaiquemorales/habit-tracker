import { toLocalDateKey } from "./date-key";

export type ScheduleType =
  | "daily"
  | "specificDays"
  | "everyOtherDay"
  | "flexible"
  | "weeklyTarget";

export type Schedule =
  | { type: "daily" }
  | { type: "specificDays"; days: number[] }
  | { type: "everyOtherDay" }
  | { type: "flexible" }
  | { type: "weeklyTarget"; timesPerWeek: number };

export function isWeeklyTargetSchedule(
  schedule: Schedule,
): schedule is Extract<Schedule, { type: "weeklyTarget" }> {
  return schedule.type === "weeklyTarget";
}

export function isDayExpected(schedule: Schedule, date: Date): boolean {
  switch (schedule.type) {
    case "daily":
      return true;
    case "specificDays":
      return schedule.days.includes(date.getDay());
    case "everyOtherDay": {
      // Use local date components to build a stable UTC-based day index.
      // Two users on the same LOCAL calendar day always get the same result.
      const dayIndex = Math.floor(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
      );
      return dayIndex % 2 === 0;
    }
    case "weeklyTarget":
      return true;
    case "flexible":
      return false;
  }
}

/** True when the habit is considered “on” for this calendar day (logging / UI). */
export function isTodayScheduled(schedule: Schedule, date: Date): boolean {
  return (
    schedule.type === "weeklyTarget" ||
    schedule.type === "flexible" ||
    isDayExpected(schedule, date)
  );
}

/** Past day is allowed for manual logging (fixed schedules: only expected days or already logged). */
export function isPastDayLoggable(
  schedule: Schedule,
  date: Date,
  completedKeys: Set<string>,
): boolean {
  const key = toLocalDateKey(date);
  if (completedKeys.has(key)) return true;
  if (schedule.type === "weeklyTarget" || schedule.type === "flexible") {
    return true;
  }
  return isDayExpected(schedule, date);
}

