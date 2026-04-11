"use client";

import { useState } from "react";

import { createHabitAction } from "@/app/actions/habit-actions";
import { AddHabitFAB } from "@/presentation/components/add-habit-fab";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import { revalidateDashboardCache } from "@/presentation/lib/dashboard-swr";
import { cn } from "@/presentation/lib/utils";

type CreateHabitDialogProps = {
  /** When true, hides the FAB so the reorder UI has full focus. */
  isReordering?: boolean;
};

export function CreateHabitDialog({ isReordering }: CreateHabitDialogProps) {
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
      onSave={async (payload) => {
        const result = await createHabitAction({
          name: payload.name,
          colorVariant: payload.colorVariant,
          schedule: payload.schedule,
        });
        if (!result.error) {
          revalidateDashboardCache();
        }
        return result;
      }}
    />
  );
}
