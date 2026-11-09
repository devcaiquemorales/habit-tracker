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

import { BrandMark } from "@/presentation/components/brand";
import { CreateHabitDialog } from "@/presentation/components/create-habit-dialog";
import { HomeHeader } from "@/presentation/components/home-header";
import { sharedVariants } from "@/presentation/components/motion";
import { StreakMilestoneToast } from "@/presentation/components/streak-milestone-toast";
import { useHabitOrder } from "@/presentation/hooks/use-habit-order";
import { useStreakMomentumToast } from "@/presentation/hooks/use-streak-momentum-toast";
import { useDashboard } from "@/presentation/lib/dashboard-context";
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

  const { data, isLive, error } = useDashboard();

  const profile = data?.profile;
  const habits = data?.habits ?? [];
  const logKeysRecord = data?.logKeysRecord ?? {};

  const showEmptyState = isLive && habits.length === 0;
  const showSkeleton = !data && !error;

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
        <div className="mx-auto flex w-full flex-col gap-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] pb-6 pl-[calc(1rem+env(safe-area-inset-left,0px))] md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] tablet:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] tablet:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] lg:max-w-4xl tablet:max-w-4xl lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] xl:pr-[calc(2.5rem+env(safe-area-inset-right,0px))] xl:pl-[calc(2.5rem+env(safe-area-inset-left,0px))]">
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
                <div className="h-8 w-48 max-w-full animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-muted" />
              </div>
            ) : (
              <HomeHeader />
            )}
          </div>

          <div className="flex flex-col gap-4">
            {error ? (
              <p className="text-base leading-relaxed text-destructive">
                {t("home.loadError")}
              </p>
            ) : showSkeleton ? (
              <div className="flex flex-col gap-4" aria-hidden>
                <div className="h-40 w-full animate-pulse rounded-[1.25rem] bg-muted" />
                <div className="h-40 w-full animate-pulse rounded-[1.25rem] bg-muted" />
              </div>
            ) : showEmptyState ? (
              <div className="mx-auto flex max-w-md flex-col items-center gap-2 pt-10 text-center">
                <BrandMark className="mb-2 size-10 text-foreground" />
                <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground">
                  {t("home.emptyTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
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
                          "flex h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors active:translate-y-px md:h-8",
                          isReordering
                            ? "bg-foreground/8 text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {isReordering ? (
                          <>
                            <Check className="size-4" aria-hidden />
                            {t("home.reorderDone")}
                          </>
                        ) : (
                          <>
                            <GripVertical className="size-4" aria-hidden />
                            {t("home.reorder")}
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hint fades in when reorder mode is active */}
                    <p
                      className={cn(
                        "text-right text-[11px] leading-none transition-[opacity] duration-300",
                        isReordering ? "text-muted-foreground/70 opacity-100" : "opacity-0",
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
                        <div className="rotate-[0.8deg] scale-[1.02] cursor-grabbing rounded-[1.25rem] shadow-lg ring-1 ring-foreground/10">
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
