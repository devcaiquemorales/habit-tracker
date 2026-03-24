"use client";

import { toUtcDateKey } from "@/domain/types/date-key";
import type { CellColorClasses } from "@/domain/types/heatmap";
import type { HeatmapData } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { useScrollToFarRight } from "@/presentation/hooks/use-scroll-to-far-right";

import { COLOR_VARIANTS, type ColorVariant } from "./color-variants";
import { HeatmapMonthBlock } from "./heatmap-month-block";

interface HabitHeatmapProps {
  data: HeatmapData;
  schedule: Schedule;
  colorVariant?: ColorVariant;
  density?: "default" | "comfortable" | "large";
  completionOverrides?: Set<string>;
  removalOverrides?: Set<string>;
  onDateSelect?: (dateKey: string) => void;
  selectedDateKey?: string | null;
}

export function HabitHeatmap({
  data,
  schedule,
  colorVariant = "green",
  density = "default",
  completionOverrides,
  removalOverrides,
  onDateSelect,
  selectedDateKey,
}: HabitHeatmapProps) {
  const scrollRef = useScrollToFarRight<HTMLDivElement>();

  const cellSize =
    density === "large"
      ? "large"
      : density === "comfortable"
        ? "comfortable"
        : "default";
  const { months, today } = data;
  const todayHighlightKey = toUtcDateKey(today);
  const {
    doneClass,
    missedClass,
    notExpectedClass,
    emptyDayClass,
    monthPaddingClass,
  } = COLOR_VARIANTS[colorVariant];

  const cellColors: CellColorClasses = {
    done: doneClass,
    missed: missedClass,
    notExpected: notExpectedClass,
    emptyDay: emptyDayClass,
    monthPadding: monthPaddingClass,
  };

  const weekColumnGap =
    density === "large" ? "gap-[3px] sm:gap-1" : "gap-[2px]";

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden overflow-x-auto overscroll-x-contain [touch-action:pan-x_pan-y]"
    >
      <div className="flex w-max flex-row items-end gap-2 sm:gap-2.5">
        {months.map((month) => (
          <HeatmapMonthBlock
            key={month.id}
            month={month}
            schedule={schedule}
            cellColors={cellColors}
            cellSize={cellSize}
            weekColumnGapClass={weekColumnGap}
            todayHighlightKey={todayHighlightKey}
            today={today}
            completionOverrides={completionOverrides}
            removalOverrides={removalOverrides}
            onDateSelect={onDateSelect}
            selectedDateKey={selectedDateKey}
          />
        ))}
      </div>
    </div>
  );
}
