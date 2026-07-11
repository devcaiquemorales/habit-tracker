"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import { Check, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";

import { CreateHabitDialog } from "@/presentation/components/create-habit-dialog";
import { HomeHeader } from "@/presentation/components/home-header";
import { sharedVariants } from "@/presentation/components/motion";
import { StreakMilestoneToast } from "@/presentation/components/streak-milestone-toast";
import { useHabitOrder } from "@/presentation/hooks/use-habit-order";
import { useStreakMomentumToast } from "@/presentation/hooks/use-streak-momentum-toast";
import {
  readDashboardCache,
  writeDashboardCache,
} from "@/presentation/lib/dashboard-cache";
import {
  DASHBOARD_SWR_KEY,
  fetchDashboardJson,
} from "@/presentation/lib/dashboard-swr";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

import { HabitCardWithHeatmap } from "./habit-card-with-heatmap";
import { SortableHabitCard } from "./sortable-habit-card";

/**
 * Session-level flag: the card entrance stagger runs once per app session.
 * Re-mounts from route navigation render instantly (no re-animation), which
 * keeps back-navigation snappy.
 */
let hasStaggeredThisSession = false;

export function HomeDashboardClient() {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();
  const [staggerOnMount] = useState(() => !hasStaggeredThisSession);

  /**
   * Do not read localStorage during the first render: SSR and the client must
   * agree on markup. After hydration, seed SWR from cache for instant data.
   */
  useEffect(() => {
    const cached = readDashboardCache();
    if (cached) {
      void mutate(DASHBOARD_SWR_KEY, cached, { revalidate: true });
    }
  }, []);

  const { data, error, isLoading } = useSWR(
    DASHBOARD_SWR_KEY,
    fetchDashboardJson,
    {
      // Let SWR decide when to revalidate on mount; dedupingInterval (60 s)
      // prevents a redundant fetch when navigating back quickly from a detail page.
      revalidateOnMount: true,
      revalidateOnFocus: true,
      focusThrottleInterval: 30_000,
      keepPreviousData: true,
      dedupingInterval: 60_000,
      // Persist every fresh response so the next cold start is also instant.
      onSuccess: writeDashboardCache,
    },
  );

  const profile = data?.profile;
  const habits = data?.habits ?? [];
  const logKeysRecord = data?.logKeysRecord ?? {};

  const showEmptyState = !isLoading && habits.length === 0 && !error;
  const showSkeleton = isLoading && !data;

  // Once real data has rendered, later dashboard mounts skip the entrance.
  useEffect(() => {
    if (data) {
      hasStaggeredThisSession = true;
    }
  }, [data]);

  const shouldAnimateStagger = staggerOnMount && !prefersReducedMotion;

  const { orderedHabits, handleDragEnd } = useHabitOrder(habits);
  const { toast: streakToast, dismissToast } = useStreakMomentumToast(data);
  const [isReordering, setIsReordering] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    triggerInteractionFeedback();
  };

  const handleDragEndWithReset = (
    event: Parameters<typeof handleDragEnd>[0],
  ) => {
    handleDragEnd(event);
    setActiveId(null);
  };

  const activeHabit = activeId
    ? orderedHabits.find((h) => h.id === activeId)
    : null;

  return (
    <>
      <main className="flex flex-col pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex w-full flex-col gap-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] pb-6 pl-[calc(1rem+env(safe-area-inset-left,0px))] md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] lg:max-w-4xl lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] xl:pr-[calc(2.5rem+env(safe-area-inset-right,0px))] xl:pl-[calc(2.5rem+env(safe-area-inset-left,0px))]">
          {/* Header dims in reorder mode to pull visual focus onto the cards */}
          <div
            className={cn(
              "transition-opacity duration-300",
              isReordering && "pointer-events-none opacity-30",
            )}
          >
            {profile ? (
              <HomeHeader
                userName={profile.displayName}
                initialMotivationPhrase={profile.motivationPhrase}
              />
            ) : showSkeleton ? (
              <div className="flex flex-col gap-2" aria-hidden>
                <div className="h-8 w-48 max-w-full rounded-md bg-white/10 skeleton-shimmer" />
                <div className="h-4 w-full max-w-md rounded-md bg-white/5 skeleton-shimmer" />
              </div>
            ) : (
              <HomeHeader />
            )}
          </div>

          <div className="flex flex-col gap-4">
            {error ? (
              <p className="text-base leading-relaxed text-red-400/90">
                {t("home.loadError")}
              </p>
            ) : showSkeleton ? (
              <div className="flex flex-col gap-4" aria-hidden>
                <div className="h-40 w-full rounded-xl bg-white/5 skeleton-shimmer" />
                <div className="h-40 w-full rounded-xl bg-white/5 skeleton-shimmer" />
              </div>
            ) : showEmptyState ? (
              <div className="flex max-w-md flex-col gap-2 pt-1">
                <h2 className="text-base font-semibold tracking-tight text-white/90">
                  {t("home.emptyTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-white/45">
                  {t("home.emptyBody")}
                </p>
              </div>
            ) : (
              <>
                {orderedHabits.length > 1 && (
                  <div className="flex flex-col gap-1.5 -mb-1">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => setIsReordering((v) => !v)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                          isReordering
                            ? "bg-white/10 text-white/90 ring-1 ring-white/10"
                            : "text-white/35 hover:text-white/60",
                        )}
                      >
                        {isReordering ? (
                          <>
                            <Check size={12} />
                            {t("home.reorderDone")}
                          </>
                        ) : (
                          <>
                            <GripVertical size={12} />
                            {t("home.reorder")}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hint fades in when reorder mode is active */}
                    <p
                      className={cn(
                        "text-right text-[11px] leading-none transition-[opacity] duration-300",
                        isReordering ? "text-white/30 opacity-100" : "opacity-0",
                      )}
                      aria-hidden={!isReordering}
                    >
                      {t("home.reorderHint")}
                    </p>
                  </div>
                )}

                <LazyMotion features={domAnimation}>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEndWithReset}
                  >
                    <SortableContext
                      items={orderedHabits.map((h) => h.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <m.div
                        className="flex flex-col gap-4"
                        variants={sharedVariants.staggerContainer}
                        initial={shouldAnimateStagger ? "initial" : false}
                        animate={shouldAnimateStagger ? "animate" : false}
                      >
                        {orderedHabits.map((habit, index) => (
                          <m.div
                            key={habit.id}
                            variants={
                              shouldAnimateStagger
                                ? sharedVariants.listItem
                                : {}
                            }
                            transition={
                              shouldAnimateStagger
                                ? {
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 24,
                                  }
                                : {}
                            }
                          >
                            <SortableHabitCard
                              habit={habit}
                              completedKeys={logKeysRecord[habit.id] ?? []}
                              isReordering={isReordering}
                              index={index}
                            />
                          </m.div>
                        ))}
                      </m.div>
                    </SortableContext>

                    <DragOverlay dropAnimation={null}>
                      {activeHabit ? (
                        <div className="rotate-[0.8deg] scale-[1.02] cursor-grabbing shadow-2xl shadow-black/50 ring-1 ring-white/10 rounded-xl">
                          <HabitCardWithHeatmap
                            habit={activeHabit}
                            completedKeys={logKeysRecord[activeHabit.id] ?? []}
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </LazyMotion>
              </>
            )}
          </div>
        </div>
      </main>
      <CreateHabitDialog isReordering={isReordering} />
      {streakToast ? (
        <StreakMilestoneToast
          payload={streakToast}
          onDismiss={dismissToast}
        />
      ) : null}
    </>
  );
}
