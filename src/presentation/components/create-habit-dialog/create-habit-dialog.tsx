"use client";

import { useState } from "react";

import { AddHabitFAB } from "@/presentation/components/add-habit-fab";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import { useDashboardMutations } from "@/presentation/hooks/use-dashboard-mutations";
import { cn } from "@/presentation/lib/utils";

type CreateHabitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideAddButton?: boolean;
};

export function CreateHabitDialog({
  open,
  onOpenChange,
  hideAddButton,
}: CreateHabitDialogProps) {
  const { createHabit } = useDashboardMutations();
  const [formResetKey, setFormResetKey] = useState(0);

  const handleOpenChange = (next: boolean) => {
    if (next) setFormResetKey((k) => k + 1);
    onOpenChange(next);
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
            hideAddButton && "pointer-events-none scale-0 opacity-0",
          )}
        />
      }
      // The form closes itself on success and shows the message on failure.
      onSave={createHabit}
    />
  );
}
