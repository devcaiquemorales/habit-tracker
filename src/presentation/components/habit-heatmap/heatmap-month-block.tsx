import type { HeatmapCellSize } from "./heatmap-cell";
import { HeatmapColumn } from "./heatmap-column";
import type { HeatmapMonthData } from "./mock-data";
import type { Schedule } from "./schedule-types";

interface HeatmapMonthBlockProps {
  month: HeatmapMonthData;
  schedule: Schedule;
  doneClass: string;
  missedClass: string;
  disabledClass: string;
  emptyDayClass: string;
  cellSize: HeatmapCellSize;
  weekColumnGapClass: string;
  todayHighlightKey: string;
  today: Date;
  forceCompletedKeys?: Set<string>;
  forceIncompleteKeys?: Set<string>;
}

export function HeatmapMonthBlock({
  month,
  schedule,
  doneClass,
  missedClass,
  disabledClass,
  emptyDayClass,
  cellSize,
  weekColumnGapClass,
  todayHighlightKey,
  today,
  forceCompletedKeys,
  forceIncompleteKeys,
}: HeatmapMonthBlockProps) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      <div className="flex h-4 min-w-0 items-end justify-start">
        <span className="text-[10px] leading-none font-medium tracking-wide text-white/40">
          {month.label}
        </span>
      </div>
      <div className={`flex flex-row items-end ${weekColumnGapClass}`}>
        {month.weeks.map((week, weekIndex) => (
          <HeatmapColumn
            key={`${month.id}-w${weekIndex}`}
            week={week}
            schedule={schedule}
            doneClass={doneClass}
            missedClass={missedClass}
            disabledClass={disabledClass}
            emptyDayClass={emptyDayClass}
            cellSize={cellSize}
            today={today}
            todayHighlightKey={todayHighlightKey}
            forceCompletedKeys={forceCompletedKeys}
            forceIncompleteKeys={forceIncompleteKeys}
          />
        ))}
      </div>
    </div>
  );
}
