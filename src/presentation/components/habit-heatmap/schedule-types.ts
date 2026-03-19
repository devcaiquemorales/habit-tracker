import { toUtcDateKey } from "@/presentation/lib/date-key";

export type ScheduleType =
  | "daily"
  | "specificDays"
  | "everyOtherDay"
  | "flexible"
  | "weeklyTarget";

export interface Schedule {
  type: ScheduleType;
  days?: number[];
  /** Used when `type === "weeklyTarget"` (1–7). */
  timesPerWeek?: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function isWeeklyTargetSchedule(schedule: Schedule): boolean {
  return schedule.type === "weeklyTarget";
}

export function isDayExpected(schedule: Schedule, date: Date): boolean {
  switch (schedule.type) {
    case "daily":
      return true;
    case "specificDays":
      return schedule.days?.includes(date.getUTCDay()) ?? false;
    case "everyOtherDay": {
      const msPerDay = 86400000;
      const dayIndex = Math.floor(date.getTime() / msPerDay);
      return dayIndex % 2 === 0;
    }
    case "weeklyTarget":
      return true;
    case "flexible":
      return false;
    default:
      return false;
  }
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

export function formatScheduleLabel(schedule: Schedule): string {
  switch (schedule.type) {
    case "daily":
      return "Every day";
    case "specificDays":
      return (
        schedule.days
          ?.slice()
          .sort((a, b) => a - b)
          .map((d) => DAY_NAMES[d])
          .join(", ") ?? "—"
      );
    case "everyOtherDay":
      return "Every other day";
    case "flexible":
      return "Flexible";
    case "weeklyTarget": {
      const n = schedule.timesPerWeek ?? 1;
      const unit = n === 1 ? "time" : "times";
      return `${n} ${unit} per week`;
    }
    default:
      return "—";
  }
}
