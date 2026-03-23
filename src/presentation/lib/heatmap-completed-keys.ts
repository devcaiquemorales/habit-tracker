import { toUtcDateKey } from "@/domain/types/date-key";
import type { HeatmapData } from "@/domain/types/heatmap";

export function getCompletedKeysFromHeatmapData(
  data: HeatmapData,
): Set<string> {
  const keys = new Set<string>();
  for (const month of data.months) {
    for (const week of month.weeks) {
      for (const cell of week) {
        if (cell.date !== null && cell.done > 0) {
          keys.add(toUtcDateKey(cell.date));
        }
      }
    }
  }
  return keys;
}
