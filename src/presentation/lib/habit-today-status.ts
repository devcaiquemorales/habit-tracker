import { getLocalWeekStartSunday, toLocalDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { isDayExpected } from "@/domain/types/schedule";
import type { TranslateFn } from "@/presentation/lib/i18n/messages";

export type TodayStatusKind = "completed" | "not_completed" | "not_scheduled";

function countLocalWeekCompletions(
  weekStart: Date,
  completedKeys: Set<string>,
): number {
  let n = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    if (completedKeys.has(toLocalDateKey(d))) {
      n += 1;
    }
  }
  return n;
}

export function getTodayStatusPresentation(
  schedule: Schedule,
  completedToday: boolean,
  /** Local calendar day for "today" (heatmap / logging alignment). */
  referenceDate: Date,
  /** Keys merged from data + user edits (may omit today if only `completedToday` is set). */
  mergedCompletedKeys: Set<string>,
  t: TranslateFn,
): { label: string; kind: TodayStatusKind } {
  const todayKey = toLocalDateKey(referenceDate);

  if (schedule.type === "weeklyTarget") {
    const target = Math.min(7, Math.max(1, schedule.timesPerWeek));
    const weekStart = getLocalWeekStartSunday(referenceDate);
    const effective = new Set(mergedCompletedKeys);
    if (completedToday) {
      effective.add(todayKey);
    }
    const count = countLocalWeekCompletions(weekStart, effective);
    if (count >= target) {
      return { label: t("status.weeklyGoalComplete"), kind: "completed" };
    }
    if (count === 0) {
      return {
        label: t("status.weekInProgress"),
        kind: "not_completed",
      };
    }
    return {
      label: t("status.weekProgress", { count, target }),
      kind: "not_completed",
    };
  }

  if (!isDayExpected(schedule, referenceDate)) {
    return { label: t("status.notScheduledToday"), kind: "not_scheduled" };
  }
  if (completedToday) {
    return { label: t("status.completedToday"), kind: "completed" };
  }
  return { label: t("status.notCompletedToday"), kind: "not_completed" };
}
