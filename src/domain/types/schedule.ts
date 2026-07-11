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
  | { type: "everyOtherDay"; anchorDateKey?: string }
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

      // If anchorDateKey is present and parsable, use anchored logic
      if (schedule.anchorDateKey) {
        const anchorMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(schedule.anchorDateKey);
        if (anchorMatch) {
          const anchorY = Number(anchorMatch[1]);
          const anchorM = Number(anchorMatch[2]);
          const anchorD = Number(anchorMatch[3]);
          const anchorIndex = Math.floor(
            Date.UTC(anchorY, anchorM - 1, anchorD) / 86400000,
          );
          return dayIndex >= anchorIndex && (dayIndex - anchorIndex) % 2 === 0;
        }
      }

      // Fallback: legacy parity behavior if no anchor or unparsable
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

