"use client";

import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import type { DashboardJson } from "@/app/(app)/lib/dashboard-json";
import { reorderHabitsAction } from "@/app/actions/habit-actions";
import type { Habit } from "@/domain/types/habit";
import type { LocalizedActionResult } from "@/presentation/lib/action-error";
import {
  readDashboardCache,
  writeDashboardCache,
} from "@/presentation/lib/dashboard-cache";

function reorderFailed(result: LocalizedActionResult): boolean {
  return Boolean(result.errorKey) || Boolean(result.error);
}

function dashboardJsonWithHabitOrder(
  cached: DashboardJson,
  orderedIds: string[],
): DashboardJson | null {
  const byId = new Map(cached.habits.map((h) => [h.id, h]));
  const habits = orderedIds
    .map((id) => byId.get(id))
    .filter((h): h is Habit => h !== undefined);
  if (habits.length !== cached.habits.length) return null;
  return { ...cached, habits };
}

function writeCachedHabitOrder(orderedIds: string[]): void {
  const cached = readDashboardCache();
  if (!cached) return;
  const next = dashboardJsonWithHabitOrder(cached, orderedIds);
  if (next) writeDashboardCache(next);
}

export function useHabitOrder(habits: Habit[]) {
  const [, startTransition] = useTransition();
  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    habits.map((h) => h.id),
  );

  const habitIdSignature = habits.map((h) => h.id).join(",");

  useEffect(() => {
    setOrderedIds(habits.map((h) => h.id));
    // Only when the id sequence changes (add/remove/server reorder), not when SWR replaces the array reference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitIdSignature]);

  const orderedHabits = useMemo(() => {
    const map = new Map(habits.map((h) => [h.id, h]));
    return orderedIds.map((id) => map.get(id)).filter(Boolean) as Habit[];
  }, [habits, orderedIds]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      let previousOrder: string[] | null = null;
      let newOrderedIds: string[] | null = null;

      setOrderedIds((prev) => {
        const oldIndex = prev.indexOf(String(active.id));
        const newIndex = prev.indexOf(String(over.id));
        if (oldIndex === -1 || newIndex === -1) return prev;

        previousOrder = prev;
        newOrderedIds = arrayMove(prev, oldIndex, newIndex);
        return newOrderedIds;
      });

      if (previousOrder === null || newOrderedIds === null) return;

      const revertTo = previousOrder;
      const nextIds = newOrderedIds;

      writeCachedHabitOrder(nextIds);

      startTransition(() => {
        void reorderHabitsAction(nextIds)
          .then((result) => {
            if (reorderFailed(result)) {
              setOrderedIds(revertTo);
              writeCachedHabitOrder(revertTo);
            }
          })
          .catch(() => {
            setOrderedIds(revertTo);
            writeCachedHabitOrder(revertTo);
          });
      });
    },
    [startTransition],
  );

  return { orderedHabits, handleDragEnd };
}
