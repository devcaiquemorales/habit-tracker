"use client";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";

import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import type { HabitFormPayload } from "@/presentation/components/habit-form-dialog";
import { MOCK_HEATMAP_DATA } from "@/presentation/components/habit-heatmap";
import {
  formatScheduleLabel,
  isDayExpected,
} from "@/presentation/components/habit-heatmap/schedule-types";
import type { MockHabit } from "@/presentation/data/mock-habits";
import { getUtcToday, toUtcDateKey } from "@/presentation/lib/date-key";
import { getTodayStatusPresentation } from "@/presentation/lib/habit-today-status";
import { getCompletedKeysFromHeatmapData } from "@/presentation/lib/heatmap-completed-keys";

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
  habit: MockHabit;
}

export function HabitDetailScreen({
  habit: initialHabit,
}: HabitDetailScreenProps) {
  const [habit, setHabit] = useState(initialHabit);

  /** Always open detail at the top; home scroll is preserved via `scroll={false}` on back. */
  useLayoutEffect(() => {
    resetViewportScrollTop();
  }, [habit.id]);
  const [todayDone] = useState(initialHabit.completedToday);
  const [extraPastCompleted, setExtraPastCompleted] = useState<Set<string>>(
    () => new Set(),
  );
  const [userRemovedKeys, setUserRemovedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [editOpen, setEditOpen] = useState(false);

  const baseCompletedKeys = useMemo(
    () => getCompletedKeysFromHeatmapData(MOCK_HEATMAP_DATA),
    [],
  );

  const today = useMemo(() => getUtcToday(), []);

  const todayKey = toUtcDateKey(today);
  const todayScheduled =
    habit.schedule.type === "weeklyTarget" ||
    habit.schedule.type === "flexible" ||
    isDayExpected(habit.schedule, today);

  const forceCompletedKeys = useMemo(() => {
    const s = new Set(extraPastCompleted);
    if (todayDone && todayScheduled) {
      s.add(todayKey);
    }
    return s;
  }, [extraPastCompleted, todayDone, todayScheduled, todayKey]);

  const pastActivityCompletedKeys = useMemo(() => {
    const merged = new Set<string>();
    baseCompletedKeys.forEach((k) => {
      if (!userRemovedKeys.has(k)) merged.add(k);
    });
    extraPastCompleted.forEach((k) => merged.add(k));
    return merged;
  }, [baseCompletedKeys, extraPastCompleted, userRemovedKeys]);

  const { label: todayLabel, kind: todayStatusKind } =
    getTodayStatusPresentation(
      habit.schedule,
      todayDone,
      today,
      pastActivityCompletedKeys,
    );

  const handleMarkPastDay = useCallback((dateKey: string) => {
    setUserRemovedKeys((prev) => {
      const next = new Set(prev);
      next.delete(dateKey);
      return next;
    });
    setExtraPastCompleted((prev) => new Set([...prev, dateKey]));
  }, []);

  const handleRemovePastDay = useCallback(
    (dateKey: string) => {
      setExtraPastCompleted((prev) => {
        const next = new Set(prev);
        next.delete(dateKey);
        return next;
      });
      if (baseCompletedKeys.has(dateKey)) {
        setUserRemovedKeys((r) => new Set([...r, dateKey]));
      }
    },
    [baseCompletedKeys],
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

  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pt-0 pb-20 md:px-6 lg:px-8">
        <HabitDetailHeader
          habitName={habit.name}
          onEdit={() => setEditOpen(true)}
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
            forceCompletedKeys={forceCompletedKeys}
            forceIncompleteKeys={userRemovedKeys}
          />

          <HabitUpdateActivity
            schedule={habit.schedule}
            completedKeys={pastActivityCompletedKeys}
            onMarkCompleted={handleMarkPastDay}
            onRemoveEntry={handleRemovePastDay}
          />
        </div>
      </main>

      <HabitFormDialog
        mode="edit"
        open={editOpen}
        onOpenChange={setEditOpen}
        initialHabit={editInitialHabit}
        onSave={handleSaveEdit}
      />
    </>
  );
}
