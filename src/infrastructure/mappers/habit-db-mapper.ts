import { getLocalToday, toLocalDateKey } from "@/domain/types/date-key";
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
  fixedDays: number[] | null,
  anchorDate: string,
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
      return { type: "everyOtherDay", anchorDateKey: anchorDate };
    case "specific_days": {
      const sorted = fixedDays
        ? [...new Set(fixedDays)]
            .filter((d) => d >= 0 && d <= 6)
            .sort((a, b) => a - b)
        : [];
      if (sorted.length === 0) return { type: "daily" };
      if (sorted.length === 7) return { type: "daily" };
      return { type: "specificDays", days: sorted };
    }
    case "daily":
    default:
      return { type: "daily" };
  }
}

export type DbSchedulePayload = {
  schedule_type: string;
  weekly_target: number | null;
  fixed_days: number[] | null;
  anchor_date?: string;
};

/**
 * Maps domain schedule to DB columns. anchor_date is set for everyOtherDay;
 * undefined for other types (so callers can omit and keep DB default/current).
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
        anchor_date: schedule.anchorDateKey ?? toLocalDateKey(getLocalToday()),
      };
    case "daily":
      return {
        schedule_type: "daily",
        weekly_target: null,
        fixed_days: null,
      };
    case "specificDays":
      const sorted = [...schedule.days]
        .filter((d) => d >= 0 && d <= 6)
        .sort((a, b) => a - b);
      return {
        schedule_type: "specific_days",
        weekly_target: null,
        fixed_days: sorted.length > 0 ? sorted : null,
      };
  }
}
