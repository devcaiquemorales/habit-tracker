import { toUtcDateKey } from "@/domain/types/date-key";
import type { CellColorClasses, HeatmapDayCell } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { isDayExpected, isWeeklyTargetSchedule } from "@/domain/types/schedule";

import { HeatmapCell, type HeatmapCellSize } from "./heatmap-cell";

interface HeatmapColumnProps {
  week: HeatmapDayCell[];
  schedule: Schedule;
  cellColors: CellColorClasses;
  cellSize?: HeatmapCellSize;
  today: Date;
  todayHighlightKey: string;
  completionOverrides?: Set<string>;
  removalOverrides?: Set<string>;
  /** When set, past/today cells (not padding, not future) call this with their UTC date key. */
  onDateSelect?: (dateKey: string) => void;
  /** Highlights the cell that matches the Update activity selection. */
  selectedDateKey?: string | null;
}

function getCellTooltip(
  status: "notExpected" | "expectedMissed" | "completed" | "neutralEmpty",
): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "expectedMissed":
      return "Missed (expected)";
    case "neutralEmpty":
      return "Not logged";
    case "notExpected":
      return "Not scheduled";
    default:
      return "";
  }
}

export function HeatmapColumn({
  week,
  schedule,
  cellColors,
  cellSize = "default",
  today,
  todayHighlightKey,
  completionOverrides,
  removalOverrides,
  onDateSelect,
  selectedDateKey,
}: HeatmapColumnProps) {
  const tt = today.getTime();
  const weekly = isWeeklyTargetSchedule(schedule);

  return (
    <div className="flex flex-col gap-[2px]">
      {week.map((cell, dayIndex) => {
        if (cell.date === null) {
          return (
            <HeatmapCell
              key={dayIndex}
              status="monthPadding"
              cellColors={cellColors}
              size={cellSize}
              isToday={false}
            />
          );
        }

        const dateKey = toUtcDateKey(cell.date);
        const t = cell.date.getTime();

        if (t > tt) {
          return (
            <HeatmapCell
              key={dayIndex}
              status="notExpected"
              cellColors={cellColors}
              tooltip="Future"
              size={cellSize}
              isToday={false}
            />
          );
        }

        const forcedComplete = completionOverrides?.has(dateKey) ?? false;
        const forcedIncomplete = removalOverrides?.has(dateKey) ?? false;
        /** Explicit removal must win over forced completion (e.g. clear “today” or mock data). */
        const effectiveDone = forcedIncomplete
          ? 0
          : forcedComplete
            ? 1
            : cell.done;

        const onActivate =
          onDateSelect !== undefined
            ? () => {
                onDateSelect(dateKey);
              }
            : undefined;
        const isStripSelected = selectedDateKey === dateKey;
        const selectDayLabel = `Select day ${dateKey}`;

        if (weekly) {
          const status = effectiveDone > 0 ? "completed" : "neutralEmpty";
          return (
            <HeatmapCell
              key={dayIndex}
              status={status}
              cellColors={cellColors}
              tooltip={status === "completed" ? "Completed" : "Not logged"}
              size={cellSize}
              isToday={dateKey === todayHighlightKey}
              isStripSelected={isStripSelected}
              onActivate={onActivate}
              selectDayLabel={selectDayLabel}
            />
          );
        }

        const isExpected = isDayExpected(schedule, cell.date);
        const status = forcedIncomplete
          ? isExpected
            ? "expectedMissed"
            : "notExpected"
          : forcedComplete
            ? "completed"
            : isExpected
              ? effectiveDone > 0
                ? "completed"
                : "expectedMissed"
              : "notExpected";

        return (
          <HeatmapCell
            key={dayIndex}
            status={status}
            cellColors={cellColors}
            tooltip={getCellTooltip(status)}
            size={cellSize}
            isToday={dateKey === todayHighlightKey}
            isStripSelected={isStripSelected}
            onActivate={onActivate}
            selectDayLabel={selectDayLabel}
          />
        );
      })}
    </div>
  );
}
