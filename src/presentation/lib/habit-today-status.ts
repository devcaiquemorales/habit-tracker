import { getUtcWeekStartSunday, toUtcDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { isDayExpected } from "@/domain/types/schedule";

export type TodayStatusKind = "completed" | "not_completed" | "not_scheduled";

function countUtcWeekCompletions(
  weekStartUtc: Date,
  completedKeys: Set<string>,
): number {
  let n = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStartUtc);
    d.setUTCDate(weekStartUtc.getUTCDate() + i);
    if (completedKeys.has(toUtcDateKey(d))) {
      n += 1;
    }
  }
  return n;
}

export function getTodayStatusPresentation(
  schedule: Schedule,
  completedToday: boolean,
  /** UTC calendar day for “today” (heatmap / logging alignment). */
  referenceDate: Date,
  /** Keys merged from data + user edits (may omit today if only `completedToday` is set). */
  mergedCompletedKeys: Set<string>,
): { label: string; kind: TodayStatusKind } {
  const todayKey = toUtcDateKey(referenceDate);

  if (schedule.type === "weeklyTarget") {
    const target = Math.min(7, Math.max(1, schedule.timesPerWeek));
    const weekStart = getUtcWeekStartSunday(referenceDate);
    const effective = new Set(mergedCompletedKeys);
    if (completedToday) {
      effective.add(todayKey);
    }
    const count = countUtcWeekCompletions(weekStart, effective);
    if (count >= target) {
      return { label: "Weekly goal completed", kind: "completed" };
    }
    if (count === 0) {
      return {
        label: "This week is still in progress",
        kind: "not_completed",
      };
    }
    return {
      label: `${count} of ${target} completed this week`,
      kind: "not_completed",
    };
  }

  if (!isDayExpected(schedule, referenceDate)) {
    return { label: "Not scheduled today", kind: "not_scheduled" };
  }
  if (completedToday) {
    return { label: "Completed today", kind: "completed" };
  }
  return { label: "Not completed today", kind: "not_completed" };
}
