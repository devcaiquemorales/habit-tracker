"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type { Habit } from "@/domain/types/habit";
import { cn } from "@/presentation/lib/utils";

import { HabitCardWithHeatmap } from "./habit-card-with-heatmap";

type SortableHabitCardProps = {
  habit: Habit;
  completedKeys: string[];
  isReordering: boolean;
};

export function SortableHabitCard({
  habit,
  completedKeys,
  isReordering,
}: SortableHabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id, disabled: !isReordering });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      }}
      className={cn(
        "flex items-stretch gap-2 transition-opacity",
        isDragging && "opacity-0",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        tabIndex={isReordering ? 0 : -1}
        aria-label="Drag to reorder"
        className={cn(
          "flex shrink-0 touch-none select-none items-center justify-center rounded-xl px-1 transition-all duration-200",
          "focus:outline-none",
          isReordering
            ? "w-8 cursor-grab text-white/30 hover:text-white/70 active:cursor-grabbing"
            : "w-0 overflow-hidden text-transparent",
        )}
      >
        <GripVertical size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <HabitCardWithHeatmap habit={habit} completedKeys={completedKeys} />
      </div>
    </div>
  );
}
