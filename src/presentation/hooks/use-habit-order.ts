"use client";

import { type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { Habit } from "@/domain/types/habit";

const STORAGE_KEY = "habit-order-v1";

function readStoredIds(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    return null;
  }
}

function writeStoredIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function useHabitOrder(habits: Habit[]) {
  const [orderedIds, setOrderedIds] = useState<string[]>(() => {
    const stored = readStoredIds();
    return stored ?? habits.map((h) => h.id);
  });

  // Stable signature — only changes when the actual set of IDs changes,
  // not on every render when SWR returns a new array reference.
  const habitIdSignature = habits.map((h) => h.id).join(",");

  // Keep order in sync when habits are added or removed from server
  useEffect(() => {
    const serverIdList = habitIdSignature ? habitIdSignature.split(",") : [];
    const serverIds = new Set(serverIdList);
    setOrderedIds((prev) => {
      const kept = prev.filter((id) => serverIds.has(id));
      const newIds = serverIdList.filter((id) => !kept.includes(id));
      const merged = [...kept, ...newIds];
      writeStoredIds(merged);
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitIdSignature]);

  const orderedHabits = useMemo(() => {
    const map = new Map(habits.map((h) => [h.id, h]));
    return orderedIds.map((id) => map.get(id)).filter(Boolean) as Habit[];
  }, [habits, orderedIds]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setOrderedIds((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      writeStoredIds(next);
      return next;
    });
  }, []);

  return { orderedHabits, handleDragEnd };
}
