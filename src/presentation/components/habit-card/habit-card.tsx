"use client";

import Link from "next/link";

import {
  HabitHeatmap,
  type HeatmapData,
} from "@/presentation/components/habit-heatmap";
import {
  COLOR_VARIANTS,
  type ColorVariant,
} from "@/presentation/components/habit-heatmap/color-variants";
import type { Schedule } from "@/presentation/components/habit-heatmap/schedule-types";
import { formatScheduleLabel } from "@/presentation/components/habit-heatmap/schedule-types";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

import { HabitCardHeader } from "./habit-card-header";

interface HabitCardProps {
  habitId: string;
  name: string;
  schedule: Schedule;
  streak?: number;
  colorVariant?: ColorVariant;
  data?: HeatmapData;
}

function getStreakLevel(streak: number): "low" | "medium" | "high" {
  if (streak <= 2) return "low";
  if (streak <= 6) return "medium";
  return "high";
}

export function HabitCard({
  habitId,
  name,
  schedule,
  streak,
  colorVariant = "green",
  data,
}: HabitCardProps) {
  const { indicatorClass, streakClasses } = COLOR_VARIANTS[colorVariant];
  const streakClass =
    streak !== undefined && streak > 0
      ? streakClasses[getStreakLevel(streak)]
      : undefined;

  return (
    <Link
      href={`/habits/${habitId}`}
      onClick={() => triggerInteractionFeedback({ sound: "tap", haptic: true })}
      className="flex w-full flex-col gap-3 rounded-xl bg-white/5 p-4 pt-0 transition-[transform,opacity,background-color] duration-150 ease-out outline-none hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
    >
      <HabitCardHeader
        name={name}
        indicatorClass={indicatorClass}
        streak={streak}
        streakClass={streakClass}
      />
      <p className="text-xs text-white/30">
        Schedule: {formatScheduleLabel(schedule)}
      </p>
      <HabitHeatmap
        data={data}
        schedule={schedule}
        colorVariant={colorVariant}
      />
    </Link>
  );
}
