"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Habit } from "@/domain/types/habit";
import { cn } from "@/presentation/lib/utils";

import { HabitCardWithHeatmap } from "./habit-card-with-heatmap";

type SortableHabitCardProps = {
  habit: Habit;
  completedKeys: string[];
  isReordering: boolean;
  /** Used to stagger the wiggle phase so cards don't oscillate in lock-step. */
  index: number;
};

export function SortableHabitCard({
  habit,
  completedKeys,
  isReordering,
  index,
}: SortableHabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id, disabled: !isReordering });

  // Stagger wiggle phase across cards — mirrors how iOS staggers icon shake
  const wiggleDelay = `${(index % 4) * 55}ms`;

  return (
    // Outer div: owns the dnd-kit positional transform + drag event listeners.
    // Must be a separate layer from the wiggle so the two transforms don't fight.
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? undefined,
      }}
      {...(isReordering ? { ...attributes, ...listeners } : {})}
      className={cn(
        isDragging && "opacity-0",
        isReordering &&
          "cursor-grab touch-none select-none active:cursor-grabbing",
      )}
    >
      {/* Inner div: visual wiggle animation only. Pointer events are disabled
          while reordering so links inside the card don't fire accidentally. */}
      <div
        style={
          isReordering && !isDragging
            ? { animationDelay: wiggleDelay }
            : undefined
        }
        className={cn(
          isReordering &&
            !isDragging &&
            "motion-safe:[animation:ios-wiggle_0.17s_ease-in-out_infinite_alternate]",
          isReordering && "pointer-events-none",
        )}
      >
        <HabitCardWithHeatmap habit={habit} completedKeys={completedKeys} />
      </div>
    </div>
  );
}
