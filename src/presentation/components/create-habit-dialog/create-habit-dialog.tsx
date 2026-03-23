"use client";

import { useState } from "react";

import { AddHabitFAB } from "@/presentation/components/add-habit-fab";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";

export function CreateHabitDialog() {
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
      trigger={<AddHabitFAB />}
    />
  );
}
