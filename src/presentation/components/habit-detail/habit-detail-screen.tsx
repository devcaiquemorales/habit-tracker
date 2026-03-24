"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

import { updateHabitAction } from "@/app/actions/habit-actions";
import type { Habit } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import { HabitDeleteConfirmDialog } from "@/presentation/components/habit-delete-confirm-dialog";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import { Button } from "@/presentation/components/ui/button";
import { useHabitLogState } from "@/presentation/hooks/use-habit-log-state";
import {
  patchDashboardHabit,
  removeHabitFromDashboard,
} from "@/presentation/lib/dashboard-swr";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

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
  heatmapData: HeatmapData;
}

export function HabitDetailScreen({
  habit: initialHabit,
  heatmapData,
}: HabitDetailScreenProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editFormResetKey, setEditFormResetKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
    persistenceError,
    logActionPending,
  } = useHabitLogState(initialHabit, heatmapData, initialHabit.id);

  /**
   * Always open detail at the top (including when opening from a deep-scrolled home list).
   * Home scroll when returning is preserved via `scroll={false}` on the back control.
   */
  useLayoutEffect(() => {
    resetViewportScrollTop();
  }, [habit.id]);

  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col pt-[env(safe-area-inset-top,0px)] pr-[calc(1rem+env(safe-area-inset-right,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))]">
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
            data={heatmapData}
            completionOverrides={completionOverrides}
            removalOverrides={removalOverrides}
            selectedDateKey={activitySelectedKey}
            onDateSelect={handleHeatmapDateSelect}
          />

          {persistenceError ? (
            <p
              className="text-sm text-red-400/90"
              role="alert"
              aria-live="polite"
            >
              {persistenceError}
            </p>
          ) : null}

          <HabitUpdateActivity
            schedule={habit.schedule}
            completedKeys={stripCompletedKeys}
            days={activityWindowDays}
            selectedKey={activitySelectedKey}
            onSelectedKeyChange={setActivitySelectedKey}
            onMarkCompleted={handleMarkPastDay}
            onRemoveEntry={handleRemovePastDay}
            logActionPending={logActionPending}
          />

          <div className="border-t border-white/10 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 w-full justify-center text-sm font-medium text-red-400/85 hover:bg-red-500/10 hover:text-red-300 sm:w-auto"
              onClick={() => {
                triggerInteractionFeedback({ haptic: false });
                setDeleteOpen(true);
              }}
            >
              Delete habit
            </Button>
          </div>
        </div>
      </main>

      <HabitFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        formResetKey={editFormResetKey}
        initialHabit={editInitialHabit}
        onSave={async (payload) => {
          const result = await updateHabitAction(habit.id, {
            name: payload.name,
            colorVariant: payload.colorVariant,
            schedule: payload.schedule,
          });
          if (result.error) {
            return result;
          }
          patchDashboardHabit(habit.id, {
            name: payload.name,
            colorVariant: payload.colorVariant,
            schedule: payload.schedule,
          });
          handleSaveEdit(payload);
          return { error: null };
        }}
      />

      <HabitDeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        habitId={habit.id}
        habitName={habit.name}
        onDeleted={() => {
          removeHabitFromDashboard(habit.id);
          router.replace("/");
        }}
      />
    </>
  );
}
