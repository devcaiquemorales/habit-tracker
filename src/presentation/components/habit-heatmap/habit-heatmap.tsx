"use client";

import { useScrollToFarRight } from "@/presentation/hooks/use-scroll-to-far-right";
import { toUtcDateKey } from "@/presentation/lib/date-key";

import { COLOR_VARIANTS, type ColorVariant } from "./color-variants";
import { HeatmapMonthBlock } from "./heatmap-month-block";
import { type HeatmapData, MOCK_HEATMAP_DATA } from "./mock-data";
import type { Schedule } from "./schedule-types";

interface HabitHeatmapProps {
  data?: HeatmapData;
  schedule: Schedule;
  colorVariant?: ColorVariant;
  density?: "default" | "comfortable" | "large";
  forceCompletedKeys?: Set<string>;
  forceIncompleteKeys?: Set<string>;
}

export function HabitHeatmap({
  data = MOCK_HEATMAP_DATA,
  schedule,
  colorVariant = "green",
  density = "default",
  forceCompletedKeys,
  forceIncompleteKeys,
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
  const { doneClass, missedClass, notExpectedClass, emptyDayClass } =
    COLOR_VARIANTS[colorVariant];

  const weekColumnGap =
    density === "large" ? "gap-[3px] sm:gap-1" : "gap-[2px]";

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden overflow-x-auto overscroll-x-contain"
    >
      <div className="flex w-max flex-row items-end gap-2 sm:gap-2.5">
        {months.map((month) => (
          <HeatmapMonthBlock
            key={month.id}
            month={month}
            schedule={schedule}
            doneClass={doneClass}
            missedClass={missedClass}
            disabledClass={notExpectedClass}
            emptyDayClass={emptyDayClass}
            cellSize={cellSize}
            weekColumnGapClass={weekColumnGap}
            todayHighlightKey={todayHighlightKey}
            today={today}
            forceCompletedKeys={forceCompletedKeys}
            forceIncompleteKeys={forceIncompleteKeys}
          />
        ))}
      </div>
    </div>
  );
}
