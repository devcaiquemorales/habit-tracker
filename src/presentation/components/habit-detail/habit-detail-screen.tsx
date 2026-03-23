"use client";

import { useLayoutEffect, useState } from "react";

import type { Habit } from "@/domain/types/habit";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import { MOCK_HEATMAP_DATA } from "@/presentation/data/mock-heatmap";
import { useHabitLogState } from "@/presentation/hooks/use-habit-log-state";

import { HabitDetailHeader } from "./habit-detail-header";
import { HabitDetailHeatmap } from "./habit-detail-heatmap";
import { HabitDetailInfo } from "./habit-detail-info";
import { HabitUpdateActivity } from "./habit-update-activity";

/** 24px between major blocks */
const SECTION_GAP = "gap-6";

function resetViewportScrollTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

interface HabitDetailScreenProps {
  habit: Habit;
}

export function HabitDetailScreen({
  habit: initialHabit,
}: HabitDetailScreenProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editFormResetKey, setEditFormResetKey] = useState(0);

  const {
    habit,
    activitySelectedKey,
    setActivitySelectedKey,
    activityWindowDays,
    completionOverrides,
    removalOverrides,
    stripCompletedKeys,
    todayLabel,
    todayStatusKind,
    scheduleLabel,
    editInitialHabit,
    handleMarkPastDay,
    handleRemovePastDay,
    handleSaveEdit,
    handleHeatmapDateSelect,
  } = useHabitLogState(initialHabit, MOCK_HEATMAP_DATA);

  /**
   * Always open detail at the top (including when opening from a deep-scrolled home list).
   * Home scroll when returning is preserved via `scroll={false}` on the back control.
   */
  useLayoutEffect(() => {
    resetViewportScrollTop();
  }, [habit.id]);

  return (
    <>
      <main
        className="mx-auto flex min-h-dvh max-w-3xl flex-col pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pt-[env(safe-area-inset-top,0px)] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))]"
      >
        <HabitDetailHeader
          habitName={habit.name}
          onEdit={() => {
            setEditFormResetKey((k) => k + 1);
            setEditOpen(true);
          }}
        />

        <div
          className={`mx-auto flex w-full max-w-3xl flex-col ${SECTION_GAP} pt-6`}
        >
          <HabitDetailInfo
            colorVariant={habit.colorVariant}
            streak={habit.streak}
            scheduleLabel={scheduleLabel}
            todayStatusLabel={todayLabel}
            todayStatusKind={todayStatusKind}
          />

          <HabitDetailHeatmap
            schedule={habit.schedule}
            colorVariant={habit.colorVariant}
            data={MOCK_HEATMAP_DATA}
            completionOverrides={completionOverrides}
            removalOverrides={removalOverrides}
            selectedDateKey={activitySelectedKey}
            onDateSelect={handleHeatmapDateSelect}
          />

          <HabitUpdateActivity
            schedule={habit.schedule}
            completedKeys={stripCompletedKeys}
            days={activityWindowDays}
            selectedKey={activitySelectedKey}
            onSelectedKeyChange={setActivitySelectedKey}
            onMarkCompleted={handleMarkPastDay}
            onRemoveEntry={handleRemovePastDay}
          />
        </div>
      </main>

      <HabitFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        formResetKey={editFormResetKey}
        initialHabit={editInitialHabit}
        onSave={handleSaveEdit}
      />
    </>
  );
}
