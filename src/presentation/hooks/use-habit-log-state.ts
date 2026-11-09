"use client";

import { useCallback, useMemo, useState } from "react";

import { toLocalDateKey } from "@/domain/types/date-key";
import type { Habit } from "@/domain/types/habit";
import type { HeatmapData } from "@/domain/types/heatmap";
import { isTodayScheduled } from "@/domain/types/schedule";
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
import {
  formatActionError,
  type LocalizedActionResult,
} from "@/presentation/lib/action-error";
import { getTodayStatusPresentation } from "@/presentation/lib/habit-today-status";
import { getCompletedKeysFromHeatmapData } from "@/presentation/lib/heatmap-completed-keys";
import { formatScheduleLabel } from "@/presentation/lib/i18n/format-schedule";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import {
  ACTIVITY_STRIP_DAY_COUNT,
  computeUpdateActivityDayWindow,
} from "@/presentation/lib/update-activity-day-window";
import { getDefaultActivitySelectedKey } from "@/presentation/lib/update-activity-selectable";

/** Detail-screen state. Completion comes from the live dashboard, which updates optimistically. */
export function useHabitLogState(
  habit: Habit,
  heatmapData: HeatmapData,
  today: Date,
) {
  const { t, locale } = useI18n();
  const { markDay, unmarkDay } = useDashboardMutations();
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [logActionPending, setLogActionPending] = useState<
    "mark" | "remove" | null
  >(null);

  const todayKey = useMemo(() => toLocalDateKey(today), [today]);

  const stripCompletedKeys = useMemo(
    () => getCompletedKeysFromHeatmapData(heatmapData),
    [heatmapData],
  );

  const [activitySelectedKey, setActivitySelectedKey] = useState<string | null>(
    () =>
      getDefaultActivitySelectedKey(
        computeUpdateActivityDayWindow(null, today, ACTIVITY_STRIP_DAY_COUNT),
        habit.schedule,
        today,
        stripCompletedKeys,
      ),
  );

  const defaultActivityWindow = computeUpdateActivityDayWindow(
    null,
    today,
    ACTIVITY_STRIP_DAY_COUNT,
  );
  const activityWindowDays =
    activitySelectedKey === null ||
    defaultActivityWindow.some((d) => toLocalDateKey(d) === activitySelectedKey)
      ? defaultActivityWindow
      : computeUpdateActivityDayWindow(
          activitySelectedKey,
          today,
          ACTIVITY_STRIP_DAY_COUNT,
        );

  const completedToday =
    stripCompletedKeys.has(todayKey) && isTodayScheduled(habit.schedule, today);

  const { label: todayLabel, kind: todayStatusKind } = useMemo(
    () =>
      getTodayStatusPresentation(
        habit.schedule,
        completedToday,
        today,
        stripCompletedKeys,
        t,
      ),
    [habit.schedule, completedToday, today, stripCompletedKeys, t],
  );

  const runLogAction = useCallback(
    async (
      pending: "mark" | "remove",
      call: () => Promise<LocalizedActionResult>,
    ) => {
      setPersistenceError(null);
      setLogActionPending(pending);
      const message = formatActionError(await call(), t);
      if (message) setPersistenceError(message);
      setLogActionPending(null);
    },
    [t],
  );

  const handleMarkPastDay = useCallback(
    (dateKey: string) =>
      runLogAction("mark", () => markDay(habit.id, dateKey)),
    [runLogAction, markDay, habit.id],
  );

  const handleRemovePastDay = useCallback(
    (dateKey: string) =>
      runLogAction("remove", () => unmarkDay(habit.id, dateKey)),
    [runLogAction, unmarkDay, habit.id],
  );

  const scheduleLabel = useMemo(
    () => formatScheduleLabel(habit.schedule, locale),
    [habit.schedule, locale],
  );

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
  };
}
