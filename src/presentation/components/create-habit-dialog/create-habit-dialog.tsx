"use client";

import { useState } from "react";

import { AddHabitFAB } from "@/presentation/components/add-habit-fab";
import { HabitFormDialog } from "@/presentation/components/habit-form-dialog";

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);

  return (
    <HabitFormDialog
      mode="create"
      open={open}
      onOpenChange={setOpen}
      trigger={<AddHabitFAB />}
    />
  );
}
