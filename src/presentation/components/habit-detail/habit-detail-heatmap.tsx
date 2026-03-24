"use client";

import type { ColorVariant } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { isWeeklyTargetSchedule } from "@/domain/types/schedule";
import { HabitHeatmap } from "@/presentation/components/habit-heatmap";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

interface HabitDetailHeatmapProps {
  schedule: Schedule;
  colorVariant: ColorVariant;
  data: HeatmapData;
  completionOverrides?: Set<string>;
  removalOverrides?: Set<string>;
  onDateSelect?: (dateKey: string) => void;
  selectedDateKey?: string | null;
}

export function HabitDetailHeatmap({
  schedule,
  colorVariant,
  data,
  completionOverrides,
  removalOverrides,
  onDateSelect,
  selectedDateKey,
}: HabitDetailHeatmapProps) {
  const { t } = useI18n();
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-white/50">
          {t("habitDetail.activity")}
        </p>
        {isWeeklyTargetSchedule(schedule) ? (
          <p className="text-[10px] leading-snug text-white/30">
            {t("habitDetail.flexibleScheduleGoal", {
              n: schedule.timesPerWeek,
            })}
          </p>
        ) : null}
      </div>
      <div className="min-w-0">
        <HabitHeatmap
          data={data}
          schedule={schedule}
          colorVariant={colorVariant}
          density="large"
          completionOverrides={completionOverrides}
          removalOverrides={removalOverrides}
          onDateSelect={onDateSelect}
          selectedDateKey={selectedDateKey}
        />
      </div>
    </section>
  );
}
