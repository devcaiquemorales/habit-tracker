"use client";

import {
  countLogsInCalendarMonth,
  streakUnitForSchedule,
} from "@/domain/lib/compute-streak";
import { getLocalToday, toLocalDateKey } from "@/domain/types/date-key";
import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import { STATUS_ACCENT_TEXT } from "@/presentation/components/habit-heatmap/color-variants";
import type { TodayStatusKind } from "@/presentation/lib/habit-today-status";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

export type { TodayStatusKind };

interface HabitDetailInfoProps {
  colorVariant: ColorVariant;
  streak: number;
  schedule: Schedule;
  completedKeys: ReadonlySet<string>;
  scheduleLabel: string;
  todayStatusLabel: string;
  todayStatusKind: TodayStatusKind;
}

function getStatusColorClass(
  kind: TodayStatusKind,
  colorVariant: ColorVariant,
): string {
  if (kind === "completed") return STATUS_ACCENT_TEXT[colorVariant];
  if (kind === "not_completed") return "text-foreground/80";
  return "text-muted-foreground";
}

export function HabitDetailInfo({
  colorVariant,
  streak,
  schedule,
  completedKeys,
  scheduleLabel,
  todayStatusLabel,
  todayStatusKind,
}: HabitDetailInfoProps) {
  const { t } = useI18n();
  const unit = streakUnitForSchedule(schedule);

  let headline = t("detailInfo.noStreakYet");
  if (unit === "none") {
    const monthCount = countLogsInCalendarMonth(
      completedKeys,
      toLocalDateKey(getLocalToday()),
    );
    if (monthCount > 0) headline = t("streak.monthCount", { n: monthCount });
  } else if (streak > 0) {
    const key = unit === "weeks" ? "detailInfo.weeks" : "detailInfo.days";
    headline = t(streak === 1 ? `${key}One` : `${key}Many`, { n: streak });
  }

  return (
    <section className="flex flex-col gap-1">
      <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {headline}
      </p>
      <p
        className={cn(
          "text-sm font-medium",
          getStatusColorClass(todayStatusKind, colorVariant),
        )}
        aria-live="polite"
      >
        {todayStatusLabel}
      </p>
      <p className="text-sm text-muted-foreground">{scheduleLabel}</p>
    </section>
  );
}
