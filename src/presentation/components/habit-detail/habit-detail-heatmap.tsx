"use client";

import type { ColorVariant } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { HabitHeatmap } from "@/presentation/components/habit-heatmap";

interface HabitDetailHeatmapProps {
  schedule: Schedule;
  colorVariant: ColorVariant;
  data: HeatmapData;
  onDateSelect?: (dateKey: string) => void;
  selectedDateKey?: string | null;
}

export function HabitDetailHeatmap({
  schedule,
  colorVariant,
  data,
  onDateSelect,
  selectedDateKey,
}: HabitDetailHeatmapProps) {
  return (
    <section className="min-w-0 rounded-[1.25rem] bg-sidebar p-4">
      <HabitHeatmap
        data={data}
        schedule={schedule}
        colorVariant={colorVariant}
        density="large"
        onDateSelect={onDateSelect}
        selectedDateKey={selectedDateKey}
      />
    </section>
  );
}
