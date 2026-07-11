import { toLocalDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { isDayExpected } from "@/domain/types/schedule";

function parseLocalDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function previousDayKey(key: string): string {
  const d = parseLocalDateKey(key);
  d.setDate(d.getDate() - 1);
  return toLocalDateKey(d);
}

/**
 * Recovery days: a log that follows exactly 1–2 **expected** but unlogged days,
 * with the prior log immediately before that gap (consecutive pair in sorted completions).
 * Not applicable to flexible / weeklyTarget (no per-day expectation).
 */
export function detectRecoveryDays(
  completedDateKeys: string[],
  schedule: Schedule,
): Set<string> {
  if (schedule.type === "flexible" || schedule.type === "weeklyTarget") {
    return new Set();
  }

  const keySet = new Set(completedDateKeys);
  const sorted = [...completedDateKeys].sort();
  const recovery = new Set<string>();

  for (let i = 1; i < sorted.length; i += 1) {
    const pKey = sorted[i - 1];
    const cKey = sorted[i];

    let missCount = 0;
    let dKey = previousDayKey(cKey);
    while (dKey > pKey) {
      if (
        isDayExpected(schedule, parseLocalDateKey(dKey)) &&
        !keySet.has(dKey)
      ) {
        missCount += 1;
      }
      dKey = previousDayKey(dKey);
    }

    if (missCount === 1 || missCount === 2) {
      recovery.add(cKey);
    }
  }

  return recovery;
}

/**
 * If `dayKey` is a logged recovery day for this schedule, returns how many expected days
 * were missed in the gap (1 or 2). Otherwise null.
 */
export function recoveryMissedDayCountBefore(
  completedDateKeys: readonly string[],
  dayKey: string,
  schedule: Schedule,
): 1 | 2 | null {
  if (schedule.type === "flexible" || schedule.type === "weeklyTarget") {
    return null;
  }

  const keySet = new Set(completedDateKeys);
  if (!keySet.has(dayKey)) return null;

  const sorted = [...completedDateKeys].sort();
  const idx = sorted.indexOf(dayKey);
  if (idx <= 0) return null;

  const pKey = sorted[idx - 1];

  let missCount = 0;
  let dKey = previousDayKey(dayKey);
  while (dKey > pKey) {
    if (
      isDayExpected(schedule, parseLocalDateKey(dKey)) &&
      !keySet.has(dKey)
    ) {
      missCount += 1;
    }
    dKey = previousDayKey(dKey);
  }

  if (missCount === 1) return 1;
  if (missCount === 2) return 2;
  return null;
}
