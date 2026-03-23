import type {
  CellColorClasses,
  HeatmapMonthData,
} from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { buildMonthBoundaryLabelByDateKey } from "@/presentation/lib/heatmap-month-boundaries";

import type { HeatmapCellSize } from "./heatmap-cell";
import { HeatmapColumn } from "./heatmap-column";

interface HeatmapMonthBlockProps {
  month: HeatmapMonthData;
  schedule: Schedule;
  cellColors: CellColorClasses;
  cellSize: HeatmapCellSize;
  weekColumnGapClass: string;
  todayHighlightKey: string;
  today: Date;
  completionOverrides?: Set<string>;
  removalOverrides?: Set<string>;
  onDateSelect?: (dateKey: string) => void;
  selectedDateKey?: string | null;
}

export function HeatmapMonthBlock({
  month,
  schedule,
  cellColors,
  cellSize,
  weekColumnGapClass,
  todayHighlightKey,
  today,
  completionOverrides,
  removalOverrides,
  onDateSelect,
  selectedDateKey,
}: HeatmapMonthBlockProps) {
  const boundaryLabelByDateKey = buildMonthBoundaryLabelByDateKey(month);

  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex min-h-4 min-w-0 items-end justify-start">
        <span className="text-[10px] leading-none font-semibold tracking-wide text-white/55">
          {month.label}
        </span>
      </div>
      <div className={`flex flex-row items-end ${weekColumnGapClass}`}>
        {month.weeks.map((week, weekIndex) => (
          <HeatmapColumn
            key={`${month.id}-w${weekIndex}`}
            week={week}
            schedule={schedule}
            cellColors={cellColors}
            cellSize={cellSize}
            today={today}
            todayHighlightKey={todayHighlightKey}
            completionOverrides={completionOverrides}
            removalOverrides={removalOverrides}
            onDateSelect={onDateSelect}
            selectedDateKey={selectedDateKey}
            boundaryLabelByDateKey={boundaryLabelByDateKey}
          />
        ))}
      </div>
    </div>
  );
}
