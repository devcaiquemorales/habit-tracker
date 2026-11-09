"use client";

import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Habit } from "@/domain/types/habit";
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
import { hasActionError } from "@/presentation/lib/action-error";

export function useHabitOrder(habits: Habit[]) {
  const { reorderHabits } = useDashboardMutations();
  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    habits.map((h) => h.id),
  );

  const habitIdSignature = habits.map((h) => h.id).join(",");

  useEffect(() => {
    setOrderedIds(habits.map((h) => h.id));
    // Only when the id sequence changes (add/remove/server reorder), not on every new array.
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

      const oldIndex = orderedIds.indexOf(String(active.id));
      const newIndex = orderedIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const previous = orderedIds;
      const next = arrayMove(orderedIds, oldIndex, newIndex);
      setOrderedIds(next);

      void reorderHabits(next).then((result) => {
        if (hasActionError(result)) setOrderedIds(previous);
      });
    },
    [orderedIds, reorderHabits],
  );

  return { orderedHabits, handleDragEnd };
}
