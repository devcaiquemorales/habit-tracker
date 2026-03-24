import { toUtcDateKey } from "./date-key";

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
      return schedule.days.includes(date.getUTCDay());
    case "everyOtherDay": {
      const msPerDay = 86400000;
      const dayIndex = Math.floor(date.getTime() / msPerDay);
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
  const key = toUtcDateKey(date);
  if (completedKeys.has(key)) return true;
  if (schedule.type === "weeklyTarget" || schedule.type === "flexible") {
    return true;
  }
  return isDayExpected(schedule, date);
}

