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

  /** Always open detail at the top; home scroll is preserved via `scroll={false}` on back. */
  useLayoutEffect(() => {
    resetViewportScrollTop();
  }, [habit.id]);

  return (
    <>
      <main
        className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pb-20 md:px-6 lg:px-8"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
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
