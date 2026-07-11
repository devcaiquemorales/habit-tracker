"use client";

import { useState } from "react";

import { createHabitAction } from "@/app/actions/habit-actions";
import { AddHabitFAB } from "@/presentation/components/add-habit-fab";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";
import {
  addTempHabitToDashboard,
  removeTempHabitFromDashboard,
} from "@/presentation/lib/dashboard-optimistic";
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
        // Close dialog immediately for optimistic UX
        handleOpenChange(false);

        // Add temp habit optimistically
        const tempId = addTempHabitToDashboard(
          payload.name,
          payload.colorVariant,
          payload.schedule,
        );

        try {
          const result = await createHabitAction({
            name: payload.name,
            colorVariant: payload.colorVariant,
            schedule: payload.schedule,
          });

          if (result.error || result.errorKey) {
            // Remove temp habit on error
            removeTempHabitFromDashboard(tempId);
            revalidateDashboardCache({ immediate: true });
            return result;
          }

          // Refetch dashboard to replace temp habit with real one
          revalidateDashboardCache({ immediate: true });
          return { error: null };
        } catch {
          // Rollback on exception
          removeTempHabitFromDashboard(tempId);
          revalidateDashboardCache({ immediate: true });
          return { error: "Failed to create habit", errorKey: "errors.createHabitFailed" };
        }
      }}
    />
  );
}
