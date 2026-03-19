import { Flame } from "lucide-react";

import {
  COLOR_VARIANTS,
  type ColorVariant,
  STATUS_ACCENT_TEXT,
} from "@/presentation/components/habit-heatmap/color-variants";
import type { TodayStatusKind } from "@/presentation/lib/habit-today-status";
import { cn } from "@/presentation/lib/utils";

export type { TodayStatusKind };

interface HabitDetailInfoProps {
  colorVariant: ColorVariant;
  streak: number;
  scheduleLabel: string;
  todayStatusLabel: string;
  todayStatusKind: TodayStatusKind;
}

function getStreakLevel(streak: number): "low" | "medium" | "high" {
  if (streak <= 2) return "low";
  if (streak <= 6) return "medium";
  return "high";
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
  scheduleLabel,
  todayStatusLabel,
  todayStatusKind,
}: HabitDetailInfoProps) {
  const { streakClasses } = COLOR_VARIANTS[colorVariant];
  const streakClass =
    streak > 0 ? streakClasses[getStreakLevel(streak)] : "text-white/45";
  const statusClass = getStatusColorClass(todayStatusKind, colorVariant);

  return (
    <section className="flex flex-col gap-2.5">
      <p
        className={cn("text-sm leading-snug font-medium", statusClass)}
        aria-live="polite"
      >
        {todayStatusLabel}
      </p>

      {streak > 0 ? (
        <p
          className={cn(
            "inline-flex items-center gap-2 text-sm leading-snug font-medium",
            streakClass,
          )}
        >
          <Flame className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          <span>{streak} days</span>
        </p>
      ) : (
        <p className="text-sm leading-snug font-medium text-white/45">
          No streak yet
        </p>
      )}

      <p className="text-xs leading-snug font-normal text-white/45">
        {scheduleLabel}
      </p>
    </section>
  );
}
