"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useState } from "react";

import { computeGuardedDateKeys } from "@/domain/lib/compute-streak";
import { getLocalToday, localDateFromDateKey } from "@/domain/types/date-key";
import type { Habit } from "@/domain/types/habit";
import { HabitDeleteConfirmDialog } from "@/presentation/components/habit-delete-confirm-dialog";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import { Button } from "@/presentation/components/ui/button";
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
import { useHabitLogState } from "@/presentation/hooks/use-habit-log-state";
import { buildHeatmapDataFromCompletedKeys } from "@/presentation/lib/build-heatmap-data";
import { useDashboard } from "@/presentation/lib/dashboard-context";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

import { HabitDetailHeader } from "./habit-detail-header";
import { HabitDetailHeatmap } from "./habit-detail-heatmap";
import { HabitDetailInfo } from "./habit-detail-info";
import { HabitUpdateActivity } from "./habit-update-activity";

/** 24px between major blocks */
const SECTION_GAP = "gap-6";

function sortedKeysSignature(keys: readonly string[]): string {
  if (keys.length === 0) return "";
  return [...keys].sort().join(",");
}

function resetViewportScrollTop(): void {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

interface HabitDetailScreenProps {
  habit: Habit;
  /** Log date keys from the dashboard; the heatmap is built in local time. */
  completedKeys: string[];
}

export function HabitDetailScreen({
  habit,
  completedKeys,
}: HabitDetailScreenProps) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { updateHabit } = useDashboardMutations();
  const [editOpen, setEditOpen] = useState(false);
  const [editFormResetKey, setEditFormResetKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { todayKey } = useDashboard();
  const today = useMemo(
    () => localDateFromDateKey(todayKey) ?? getLocalToday(),
    [todayKey],
  );

  const keysSig = useMemo(
    () => sortedKeysSignature(completedKeys),
    [completedKeys],
  );

  const guardedKeys = useMemo(
    () =>
      computeGuardedDateKeys(
        new Set(keysSig === "" ? [] : keysSig.split(",")),
        habit.schedule,
        todayKey,
      ),
    [keysSig, habit.schedule, todayKey],
  );

  const heatmapData = useMemo(() => {
    const keys = keysSig === "" ? [] : keysSig.split(",");
    return buildHeatmapDataFromCompletedKeys(
      new Set(keys),
      habit.schedule,
      today,
      locale,
    );
  }, [keysSig, locale, habit.schedule, today]);

  const {
    activitySelectedKey,
    setActivitySelectedKey,
    activityWindowDays,
    stripCompletedKeys,
    todayLabel,
    todayStatusKind,
    scheduleLabel,
    editInitialHabit,
    handleMarkPastDay,
    handleRemovePastDay,
    handleHeatmapDateSelect,
    persistenceError,
    logActionPending,
  } = useHabitLogState(habit, heatmapData, today);

  /**
   * Always open detail at the top (including when opening from a deep-scrolled home list).
   * Home scroll when returning is preserved via `scroll={false}` on the back control.
   */
  useLayoutEffect(() => {
    resetViewportScrollTop();
  }, [habit.id]);

  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col pr-[calc(1rem+env(safe-area-inset-right,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] tablet:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] tablet:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))]">
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
            schedule={habit.schedule}
            completedKeys={stripCompletedKeys}
            scheduleLabel={scheduleLabel}
            todayStatusLabel={todayLabel}
            todayStatusKind={todayStatusKind}
          />

          <HabitDetailHeatmap
            schedule={habit.schedule}
            colorVariant={habit.colorVariant}
            data={heatmapData}
            selectedDateKey={activitySelectedKey}
            onDateSelect={handleHeatmapDateSelect}
          />

          {persistenceError ? (
            <p
              className="text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              {persistenceError}
            </p>
          ) : null}

          <HabitUpdateActivity
            guardedKeys={guardedKeys}
            colorVariant={habit.colorVariant}
            schedule={habit.schedule}
            completedKeys={stripCompletedKeys}
            days={activityWindowDays}
            selectedKey={activitySelectedKey}
            onSelectedKeyChange={setActivitySelectedKey}
            onMarkCompleted={handleMarkPastDay}
            onRemoveEntry={handleRemovePastDay}
            logActionPending={logActionPending}
          />

          <div>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-center rounded-full text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto md:h-9"
              onClick={() => {
                triggerInteractionFeedback({ haptic: false });
                setDeleteOpen(true);
              }}
            >
              {t("habitDetail.deleteHabit")}
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
        onSave={(payload) => updateHabit(habit.id, payload)}
      />

      <HabitDeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        habitId={habit.id}
        habitName={habit.name}
        onDeleted={() => router.replace("/")}
      />
    </>
  );
}
