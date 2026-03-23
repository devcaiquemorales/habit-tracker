"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";

import type { ColorVariant } from "@/domain/types/habit";
import { getStreakLevel } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { formatScheduleLabel } from "@/domain/types/schedule";
import { HabitHeatmap } from "@/presentation/components/habit-heatmap";
import { COLOR_VARIANTS } from "@/presentation/components/habit-heatmap/color-variants";
import { useHorizontalPanNavigationSuppression } from "@/presentation/hooks/use-horizontal-pan-navigation-suppression";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

import { HabitCardHeader } from "./habit-card-header";

interface HabitCardProps {
  habitId: string;
  name: string;
  schedule: Schedule;
  streak?: number;
  colorVariant?: ColorVariant;
  data?: HeatmapData;
}

export function HabitCard({
  habitId,
  name,
  schedule,
  streak,
  colorVariant = "green",
  data,
}: HabitCardProps) {
  const router = useRouter();
  const { panPointerProps, shouldSuppressNavigation } =
    useHorizontalPanNavigationSuppression();

  const { indicatorClass, streakClasses } = COLOR_VARIANTS[colorVariant];
  const streakClass =
    streak !== undefined && streak > 0
      ? streakClasses[getStreakLevel(streak)]
      : undefined;

  const href = `/habits/${habitId}`;

  const openDetail = () => {
    triggerInteractionFeedback();
    router.push(href);
  };

  const onHeatmapRegionClick = () => {
    if (shouldSuppressNavigation()) return;
    openDetail();
  };

  const onHeatmapRegionKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (shouldSuppressNavigation()) return;
    openDetail();
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl bg-white/5 p-4 pt-0 transition-[background-color] duration-150 ease-out",
        "hover:bg-white/[0.07]",
      )}
    >
      <Link
        href={href}
        onClick={() => triggerInteractionFeedback()}
        className="flex flex-col gap-3 rounded-lg outline-none transition-[transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
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
      </Link>
      <div
        {...panPointerProps}
        role="link"
        tabIndex={0}
        aria-label={`Open ${name}`}
        className="cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={onHeatmapRegionClick}
        onKeyDown={onHeatmapRegionKeyDown}
      >
        <HabitHeatmap
          data={data}
          schedule={schedule}
          colorVariant={colorVariant}
        />
      </div>
    </div>
  );
}
