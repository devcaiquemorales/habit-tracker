import type { HeatmapData } from "@/presentation/components/habit-heatmap/mock-data";

import { toUtcDateKey } from "./date-key";

/** Collects UTC `YYYY-MM-DD` keys where the mock marks done, only on/before `today`. */
export function getCompletedKeysFromHeatmapData(
  data: HeatmapData,
): Set<string> {
  const { months, rangeStart, rangeEnd, today } = data;
  const set = new Set<string>();
  const rs = rangeStart.getTime();
  const re = rangeEnd.getTime();
  const tt = today.getTime();

  for (const block of months) {
    for (const week of block.weeks) {
      for (const cell of week) {
        if (!cell.date || cell.done <= 0) continue;
        const t = cell.date.getTime();
        if (t < rs || t > re || t > tt) continue;
        set.add(toUtcDateKey(cell.date));
      }
    }
  }

  return set;
}
