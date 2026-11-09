"use client";

import { useState } from "react";

import { AddHabitFAB } from "@/presentation/components/add-habit-fab";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
import { cn } from "@/presentation/lib/utils";

type CreateHabitDialogProps = {
  /** When true, hides the FAB so the reorder UI has full focus. */
  isReordering?: boolean;
};

export function CreateHabitDialog({ isReordering }: CreateHabitDialogProps) {
  const { createHabit } = useDashboardMutations();
  const [open, setOpen] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  const handleOpenChange = (next: boolean) => {
    if (next) setFormResetKey((k) => k + 1);
    setOpen(next);
  };

  return (
    <HabitFormDialog
      mode="create"
      open={open}
      onOpenChange={handleOpenChange}
      formResetKey={formResetKey}
      trigger={
        <AddHabitFAB
          className={cn(
            "transition-[transform,opacity] duration-200",
            isReordering && "pointer-events-none scale-0 opacity-0",
          )}
        />
      }
      onSave={(payload) => {
        // Closes at once: the new card appears optimistically on the dashboard.
        handleOpenChange(false);
        return createHabit(payload);
      }}
    />
  );
}
