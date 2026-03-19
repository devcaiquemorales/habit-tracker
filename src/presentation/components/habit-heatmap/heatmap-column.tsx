import { toUtcDateKey } from "@/presentation/lib/date-key";

import { HeatmapCell, type HeatmapCellSize } from "./heatmap-cell";
import type { HeatmapDayCell } from "./mock-data";
import type { Schedule } from "./schedule-types";
import { isDayExpected, isWeeklyTargetSchedule } from "./schedule-types";

interface HeatmapColumnProps {
  week: HeatmapDayCell[];
  schedule: Schedule;
  doneClass: string;
  missedClass: string;
  disabledClass: string;
  emptyDayClass: string;
  cellSize?: HeatmapCellSize;
  today: Date;
  todayHighlightKey: string;
  forceCompletedKeys?: Set<string>;
  forceIncompleteKeys?: Set<string>;
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
  doneClass,
  missedClass,
  disabledClass,
  emptyDayClass,
  cellSize = "default",
  today,
  todayHighlightKey,
  forceCompletedKeys,
  forceIncompleteKeys,
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
              status="notExpected"
              doneClass={doneClass}
              missedClass={missedClass}
              disabledClass={disabledClass}
              emptyDayClass={emptyDayClass}
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
              doneClass={doneClass}
              missedClass={missedClass}
              disabledClass={disabledClass}
              emptyDayClass={emptyDayClass}
              tooltip="Future"
              size={cellSize}
              isToday={false}
            />
          );
        }

        const forcedComplete = forceCompletedKeys?.has(dateKey) ?? false;
        const forcedIncomplete = forceIncompleteKeys?.has(dateKey) ?? false;
        const effectiveDone = forcedComplete
          ? 1
          : forcedIncomplete
            ? 0
            : cell.done;

        if (weekly) {
          const status = effectiveDone > 0 ? "completed" : "neutralEmpty";
          return (
            <HeatmapCell
              key={dayIndex}
              status={status}
              doneClass={doneClass}
              missedClass={missedClass}
              disabledClass={disabledClass}
              emptyDayClass={emptyDayClass}
              tooltip={status === "completed" ? "Completed" : "Not logged"}
              size={cellSize}
              isToday={dateKey === todayHighlightKey}
            />
          );
        }

        const isExpected = isDayExpected(schedule, cell.date);
        const status = forcedComplete
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
            doneClass={doneClass}
            missedClass={missedClass}
            disabledClass={disabledClass}
            emptyDayClass={emptyDayClass}
            tooltip={getCellTooltip(status)}
            size={cellSize}
            isToday={dateKey === todayHighlightKey}
          />
        );
      })}
    </div>
  );
}
