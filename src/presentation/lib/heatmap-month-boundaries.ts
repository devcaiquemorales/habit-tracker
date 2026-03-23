import { toUtcDateKey } from "@/domain/types/date-key";
import type { HeatmapMonthData } from "@/domain/types/heatmap";

/**
 * Maps UTC date keys to a tiny label for month orientation: "1" on the first
 * calendar day, or "28"–"31" on the last calendar day of that month.
 */
export function buildMonthBoundaryLabelByDateKey(
  month: HeatmapMonthData,
): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const week of month.weeks) {
    for (const cell of week) {
      if (cell.date === null) continue;
      const d = cell.date;
      const key = toUtcDateKey(d);
      if (d.getUTCDate() === 1) {
        map.set(key, "1");
      }
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const lastDayNum = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      if (d.getUTCDate() === lastDayNum) {
        map.set(key, String(lastDayNum));
      }
    }
  }
  return map;
}
