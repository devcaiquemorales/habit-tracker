import {
  HabitHeatmap,
  type HeatmapData,
} from "@/presentation/components/habit-heatmap";
import type { ColorVariant } from "@/presentation/components/habit-heatmap/color-variants";
import type { Schedule } from "@/presentation/components/habit-heatmap/schedule-types";
import { isWeeklyTargetSchedule } from "@/presentation/components/habit-heatmap/schedule-types";

interface HabitDetailHeatmapProps {
  schedule: Schedule;
  colorVariant: ColorVariant;
  data?: HeatmapData;
  forceCompletedKeys?: Set<string>;
  forceIncompleteKeys?: Set<string>;
}

export function HabitDetailHeatmap({
  schedule,
  colorVariant,
  data,
  forceCompletedKeys,
  forceIncompleteKeys,
}: HabitDetailHeatmapProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-white/50">Activity</p>
        {isWeeklyTargetSchedule(schedule) ? (
          <p className="text-[10px] leading-snug text-white/30">
            Flexible schedule · Goal: {schedule.timesPerWeek ?? 1} times this
            week
          </p>
        ) : null}
      </div>
      <div className="min-w-0">
        <HabitHeatmap
          data={data}
          schedule={schedule}
          colorVariant={colorVariant}
          density="large"
          forceCompletedKeys={forceCompletedKeys}
          forceIncompleteKeys={forceIncompleteKeys}
        />
      </div>
    </section>
  );
}
