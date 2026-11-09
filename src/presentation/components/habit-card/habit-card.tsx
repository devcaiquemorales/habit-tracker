"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useState } from "react";

import { useRouteTransitionFeedback } from "@/app/route-transition-shell";
import type { ColorVariant } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { HabitHeatmap } from "@/presentation/components/habit-heatmap";
import { COLOR_VARIANTS } from "@/presentation/components/habit-heatmap/color-variants";
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
import { dismissHoldHint } from "@/presentation/hooks/use-hold-hint";
import { useHorizontalPanNavigationSuppression } from "@/presentation/hooks/use-horizontal-pan-navigation-suppression";
import { useLongPress } from "@/presentation/hooks/use-long-press";
import { formatActionError } from "@/presentation/lib/action-error";
import { useDashboard } from "@/presentation/lib/dashboard-context";
import { formatScheduleLabel } from "@/presentation/lib/i18n/format-schedule";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

import { HabitCardHeader } from "./habit-card-header";
import { TodayConfirmSheet } from "./today-confirm-sheet";

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

  const { todayKey } = useDashboard();
  const { markDay, unmarkDay } = useDashboardMutations();
  const [markError, setMarkError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const longPressProps = useLongPress(() => {
    if (habitId.startsWith("temp-") || !todayKey) return;
    triggerInteractionFeedback();
    dismissHoldHint();
    setConfirmOpen(true);
  });

  const confirmToday = async () => {
    setConfirmOpen(false);
    setMarkError(null);
    const result = await (completedKeys.includes(todayKey)
      ? unmarkDay(habitId, todayKey)
      : markDay(habitId, todayKey));
    setMarkError(formatActionError(result, t));
  };

  const href = `/habits/${habitId}`;

  const { indicatorClass, doneClass } = COLOR_VARIANTS[colorVariant];

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
    <>
      <div
        {...panPointerProps}
        {...longPressProps}
        className={cn(
          "flex w-full flex-col gap-4 rounded-[1.25rem] bg-sidebar p-4 transition-[background-color,transform] duration-150 select-none [-webkit-touch-callout:none] hover:bg-sidebar-accent motion-reduce:transition-colors",
          "data-holding:scale-[0.98] data-holding:duration-[450ms] motion-reduce:data-holding:scale-100",
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
          className="flex min-h-11 touch-manipulation flex-col justify-center gap-0.5 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <HabitCardHeader
            name={name}
            indicatorClass={indicatorClass}
            streak={streak}
            schedule={schedule}
            completedKeys={completedKeys}
          />
          <p className="pl-4 text-[13px] text-muted-foreground">
            {formatScheduleLabel(schedule, locale)}
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
        {markError ? (
          <p className="text-sm text-destructive" role="alert">
            {markError}
          </p>
        ) : null}
      </div>
      {/* Outside the card: portal events bubble through React and would start a press. */}
      <TodayConfirmSheet
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        name={name}
        indicatorClass={indicatorClass}
        doneClass={doneClass}
        schedule={schedule}
        completedKeys={completedKeys}
        todayKey={todayKey}
        onConfirm={() => void confirmToday()}
      />
    </>
  );
}
