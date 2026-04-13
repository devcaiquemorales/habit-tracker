import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";

const COLOR_VARIANTS: ColorVariant[] = [
  "green",
  "blue",
  "amber",
  "purple",
  "red",
];

export function parseColorVariant(value: string): ColorVariant {
  return COLOR_VARIANTS.includes(value as ColorVariant)
    ? (value as ColorVariant)
    : "green";
}

export function scheduleFromDb(
  scheduleType: string,
  weeklyTarget: number | null,
  fixedDayValues: number[],
): Schedule {
  switch (scheduleType) {
    case "weekly_target":
      return {
        type: "weeklyTarget",
        timesPerWeek: Math.min(7, Math.max(1, weeklyTarget ?? 1)),
      };
    case "flexible":
      return { type: "flexible" };
    case "every_other_day":
      return { type: "everyOtherDay" };
    case "fixed_days": {
      const sorted = [...new Set(fixedDayValues)]
        .filter((d) => d >= 0 && d <= 6)
        .sort((a, b) => a - b);
      if (sorted.length === 7) return { type: "daily" };
      return { type: "specificDays", days: sorted };
    }
    default:
      return { type: "daily" };
  }
}

export type DbSchedulePayload = {
  schedule_type: string;
  weekly_target: number | null;
  fixed_days: number[] | null;
};

/**
 * Maps domain schedule to DB columns. `fixed_days` is the list to upsert into `habit_fixed_days`
 * (null when the schedule does not use that table).
 */
export function scheduleToDbPayload(schedule: Schedule): DbSchedulePayload {
  switch (schedule.type) {
    case "weeklyTarget":
      return {
        schedule_type: "weekly_target",
        weekly_target: Math.min(7, Math.max(1, schedule.timesPerWeek)),
        fixed_days: null,
      };
    case "flexible":
      return {
        schedule_type: "flexible",
        weekly_target: null,
        fixed_days: null,
      };
    case "everyOtherDay":
      return {
        schedule_type: "every_other_day",
        weekly_target: null,
        fixed_days: null,
      };
    case "daily":
      return {
        schedule_type: "fixed_days",
        weekly_target: null,
        fixed_days: [0, 1, 2, 3, 4, 5, 6],
      };
    case "specificDays":
      return {
        schedule_type: "fixed_days",
        weekly_target: null,
        fixed_days: [...schedule.days].sort((a, b) => a - b),
      };
  }
}
