"use client";

import { streakUnitForSchedule } from "@/domain/lib/compute-streak";
import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import { STATUS_ACCENT_TEXT } from "@/presentation/components/habit-heatmap/color-variants";
import { StreakBadge } from "@/presentation/components/streak-badge";
import type { TodayStatusKind } from "@/presentation/lib/habit-today-status";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

export type { TodayStatusKind };

interface HabitDetailInfoProps {
  colorVariant: ColorVariant;
  streak: number;
  schedule?: Schedule;
  scheduleLabel: string;
  todayStatusLabel: string;
  todayStatusKind: TodayStatusKind;
}

function getStatusColorClass(
  kind: TodayStatusKind,
  colorVariant: ColorVariant,
): string {
  if (kind === "completed") {
    return STATUS_ACCENT_TEXT[colorVariant];
  }
  if (kind === "not_completed") {
    return "text-white/70";
  }
  return "text-white/45";
}

export function HabitDetailInfo({
  colorVariant,
  streak,
  schedule,
  scheduleLabel,
  todayStatusLabel,
  todayStatusKind,
}: HabitDetailInfoProps) {
  const { t } = useI18n();
  const statusClass = getStatusColorClass(todayStatusKind, colorVariant);
  const unit = schedule ? streakUnitForSchedule(schedule) : "days";

  return (
    <section className="flex flex-col gap-2.5">
      <p
        className={cn("text-sm leading-snug font-medium", statusClass)}
        aria-live="polite"
      >
        {todayStatusLabel}
      </p>

      {streak > 0 && unit !== "none" ? (
        <p
          className={cn(
            "inline-flex items-center gap-2 text-sm leading-snug font-medium text-white/60",
          )}
        >
          <StreakBadge
            streak={streak}
            unit={unit as "days" | "weeks"}
            aria-label={
              unit === "weeks"
                ? t("detailInfo.weeksStreak", { n: streak })
                : t("detailInfo.daysStreak", { n: streak })
            }
          />
        </p>
      ) : (
        <p className="text-sm leading-snug font-medium text-white/45">
          {t("detailInfo.noStreakYet")}
        </p>
      )}

      <p className="text-xs leading-snug font-normal text-white/45">
        {scheduleLabel}
      </p>
    </section>
  );
}
