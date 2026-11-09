"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent } from "react";

import { useRouteTransitionFeedback } from "@/app/route-transition-shell";
import type { ColorVariant } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { HabitHeatmap } from "@/presentation/components/habit-heatmap";
import { COLOR_VARIANTS } from "@/presentation/components/habit-heatmap/color-variants";
import { useHorizontalPanNavigationSuppression } from "@/presentation/hooks/use-horizontal-pan-navigation-suppression";
import { formatScheduleLabel } from "@/presentation/lib/i18n/format-schedule";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

import { HabitCardHeader } from "./habit-card-header";

interface HabitCardProps {
  habitId: string;
  name: string;
  schedule: Schedule;
  streak?: number;
  colorVariant?: ColorVariant;
  data: HeatmapData;
  completedKeys?: string[];
}

export function HabitCard({
  habitId,
  name,
  schedule,
  streak,
  colorVariant = "green",
  data,
  completedKeys = [],
}: HabitCardProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const beginRouteTransitionFeedback = useRouteTransitionFeedback();
  const { panPointerProps, shouldSuppressNavigation } =
    useHorizontalPanNavigationSuppression();

  const href = `/habits/${habitId}`;

  const { indicatorClass } = COLOR_VARIANTS[colorVariant];

  const openDetail = () => {
    beginRouteTransitionFeedback();
    triggerInteractionFeedback();
    router.push(href, { scroll: true });
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
      {...panPointerProps}
      className={cn(
        "flex w-full flex-col gap-3 rounded-[1.25rem] bg-sidebar p-4 pt-0 transition-colors hover:bg-sidebar-accent",
      )}
    >
      <Link
        href={href}
        prefetch
        scroll
        onClick={(e) => {
          if (shouldSuppressNavigation()) {
            e.preventDefault();
            return;
          }
          beginRouteTransitionFeedback();
          triggerInteractionFeedback();
        }}
        className="flex touch-manipulation flex-col gap-3 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <HabitCardHeader
          name={name}
          indicatorClass={indicatorClass}
          streak={streak}
          schedule={schedule}
          completedKeys={completedKeys}
        />
        <p className="text-xs text-muted-foreground/70">
          {t("common.schedulePrefix")} {formatScheduleLabel(schedule, locale)}
        </p>
      </Link>
      <div
        role="link"
        tabIndex={0}
        aria-label={t("habitCard.openHabit", { name })}
        className="cursor-pointer touch-manipulation rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
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
