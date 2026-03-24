"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { logHabitDayAction, unlogHabitDayAction } from "@/app/actions/habit-log-actions";
import { getUtcToday, toUtcDateKey } from "@/domain/types/date-key";
import type { Habit } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import { formatScheduleLabel, isTodayScheduled } from "@/domain/types/schedule";
import type { HabitFormPayload } from "@/presentation/components/habit-form-dialog";
import { patchDashboardAfterLogMutation } from "@/presentation/lib/dashboard-swr";
import { getTodayStatusPresentation } from "@/presentation/lib/habit-today-status";
import { getCompletedKeysFromHeatmapData } from "@/presentation/lib/heatmap-completed-keys";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import {
  ACTIVITY_STRIP_DAY_COUNT,
  computeUpdateActivityDayWindow,
} from "@/presentation/lib/update-activity-day-window";
import { getDefaultActivitySelectedKey } from "@/presentation/lib/update-activity-selectable";

export function useHabitLogState(
  initialHabit: Habit,
  heatmapData: HeatmapData,
  habitId: string,
) {
  const [habit, setHabit] = useState(initialHabit);
  const [completedToday, setCompletedToday] = useState(
    initialHabit.completedToday,
  );
  const [extraPastCompleted, setExtraPastCompleted] = useState<Set<string>>(
    () => new Set(),
  );
  const [removalOverrides, setRemovalOverrides] = useState<Set<string>>(
    () => new Set(),
  );
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [logActionPending, setLogActionPending] = useState<
    "mark" | "remove" | null
  >(null);

  useEffect(() => {
    setHabit((prev) => ({
      ...prev,
      streak: initialHabit.streak,
      completedToday: initialHabit.completedToday,
    }));
  }, [initialHabit.id, initialHabit.streak, initialHabit.completedToday]);

  const [today] = useState(() => getUtcToday());
  const todayKey = useMemo(() => toUtcDateKey(today), [today]);

  const [activitySelectedKey, setActivitySelectedKey] = useState<string | null>(
    () => {
      const w = computeUpdateActivityDayWindow(
        null,
        today,
        ACTIVITY_STRIP_DAY_COUNT,
      );
      const merged = new Set(getCompletedKeysFromHeatmapData(heatmapData));
      const tk = toUtcDateKey(today);
      if (
        initialHabit.completedToday &&
        isTodayScheduled(initialHabit.schedule, today)
      ) {
        merged.add(tk);
      }
      return getDefaultActivitySelectedKey(
        w,
        initialHabit.schedule,
        today,
        merged,
      );
    },
  );

  const baseCompletedKeys = useMemo(
    () => getCompletedKeysFromHeatmapData(heatmapData),
    [heatmapData],
  );

  const defaultActivityWindow = computeUpdateActivityDayWindow(
    null,
    today,
    ACTIVITY_STRIP_DAY_COUNT,
  );
  const activityWindowDays =
    activitySelectedKey === null
      ? defaultActivityWindow
      : defaultActivityWindow.some(
            (d) => toUtcDateKey(d) === activitySelectedKey,
          )
        ? defaultActivityWindow
        : computeUpdateActivityDayWindow(
            activitySelectedKey,
            today,
            ACTIVITY_STRIP_DAY_COUNT,
          );

  const todayScheduled = useMemo(
    () => isTodayScheduled(habit.schedule, today),
    [habit.schedule, today],
  );

  const completionOverrides = useMemo(() => {
    const s = new Set(extraPastCompleted);
    if (completedToday && todayScheduled) {
      s.add(todayKey);
    }
    return s;
  }, [extraPastCompleted, completedToday, todayScheduled, todayKey]);

  /** Same completion truth as the heatmap strip: base data + edits + “completed today” when applicable. */
  const stripCompletedKeys = useMemo(() => {
    const merged = new Set<string>();
    baseCompletedKeys.forEach((k) => {
      if (!removalOverrides.has(k)) merged.add(k);
    });
    extraPastCompleted.forEach((k) => merged.add(k));
    if (completedToday && todayScheduled && !removalOverrides.has(todayKey)) {
      merged.add(todayKey);
    }
    return merged;
  }, [
    baseCompletedKeys,
    extraPastCompleted,
    removalOverrides,
    completedToday,
    todayScheduled,
    todayKey,
  ]);

  const { label: todayLabel, kind: todayStatusKind } =
    getTodayStatusPresentation(
      habit.schedule,
      completedToday,
      today,
      stripCompletedKeys,
    );

  const handleMarkPastDay = useCallback(
    async (dateKey: string) => {
      setPersistenceError(null);
      setLogActionPending("mark");
      try {
        const { error } = await logHabitDayAction(habitId, dateKey);
        if (error) {
          setPersistenceError(error);
          return;
        }
        setRemovalOverrides((prev) => {
          const next = new Set(prev);
          next.delete(dateKey);
          return next;
        });
        setExtraPastCompleted((prev) => new Set([...prev, dateKey]));
        if (dateKey === todayKey) {
          setCompletedToday(true);
        }
        patchDashboardAfterLogMutation(habitId, dateKey, "add");
      } finally {
        setLogActionPending(null);
      }
    },
    [habitId, todayKey],
  );

  const handleRemovePastDay = useCallback(
    async (dateKey: string) => {
      setPersistenceError(null);
      setLogActionPending("remove");
      try {
        const { error } = await unlogHabitDayAction(habitId, dateKey);
        if (error) {
          setPersistenceError(error);
          return;
        }
        setExtraPastCompleted((prev) => {
          const next = new Set(prev);
          next.delete(dateKey);
          return next;
        });
        if (dateKey === todayKey) {
          setCompletedToday(false);
        }
        if (baseCompletedKeys.has(dateKey) || dateKey === todayKey) {
          setRemovalOverrides((r) => new Set([...r, dateKey]));
        }
        patchDashboardAfterLogMutation(habitId, dateKey, "remove");
      } finally {
        setLogActionPending(null);
      }
    },
    [habitId, baseCompletedKeys, todayKey],
  );

  const handleSaveEdit = useCallback((payload: HabitFormPayload) => {
    setHabit((prev) => ({
      ...prev,
      name: payload.name,
      colorVariant: payload.colorVariant,
      schedule: payload.schedule,
    }));
  }, []);

  const scheduleLabel = formatScheduleLabel(habit.schedule);

  const editInitialHabit = useMemo(
    () => ({
      name: habit.name,
      colorVariant: habit.colorVariant,
      schedule: habit.schedule,
    }),
    [habit.name, habit.colorVariant, habit.schedule],
  );

  const handleHeatmapDateSelect = useCallback((dateKey: string) => {
    triggerInteractionFeedback();
    setActivitySelectedKey(dateKey);
  }, []);

  return {
    habit,
    completedToday,
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
  };
}
