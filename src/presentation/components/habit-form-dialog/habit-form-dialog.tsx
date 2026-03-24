"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import { ColorSelector } from "@/presentation/components/create-habit-dialog/color-selector";
import {
  type CreateScheduleValue,
  ScheduleSelector,
} from "@/presentation/components/create-habit-dialog/schedule-selector";
import { Button } from "@/presentation/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  buildScheduleFromForm,
  scheduleToFormValue,
} from "@/presentation/lib/habit-schedule-form";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

export interface HabitFormPayload {
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
}

function canSubmit(name: string, schedule: CreateScheduleValue): boolean {
  const trimmed = name.trim();
  if (!trimmed) return false;
  if (schedule.category === "flexible") return true;
  if (schedule.category === "weeklyTarget") {
    return schedule.timesPerWeek >= 1 && schedule.timesPerWeek <= 7;
  }
  if (
    schedule.category === "fixed" &&
    schedule.mode === "specificDays" &&
    schedule.days.length === 0
  ) {
    return false;
  }
  return true;
}

function defaultScheduleFormValue(): CreateScheduleValue {
  return { category: "fixed", mode: "daily", days: [] };
}

function habitFormFingerprint(
  mode: "create" | "edit",
  initialHabit?: HabitFormDialogProps["initialHabit"],
): string {
  if (mode === "create") return "create";
  if (!initialHabit) return "edit-empty";
  return JSON.stringify({
    name: initialHabit.name,
    colorVariant: initialHabit.colorVariant,
    schedule: initialHabit.schedule,
  });
}

export interface HabitFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Increment when opening the dialog so the form remounts with correct defaults
   * (programmatic `open` does not go through `onOpenChange(true)`).
   */
  formResetKey: number;
  trigger?: ReactNode;
  /** When mode is `edit`, used to pre-fill when the dialog opens */
  initialHabit?: {
    name: string;
    colorVariant: ColorVariant;
    schedule: Schedule;
  };
  /** Persist habit; return `{ error: null }` on success or an error message. */
  onSave?: (
    payload: HabitFormPayload,
  ) => Promise<{ error: string | null }> | { error: string | null };
}

interface HabitFormDialogFieldsProps {
  mode: "create" | "edit";
  initialHabit?: HabitFormDialogProps["initialHabit"];
  onSave?: HabitFormDialogProps["onSave"];
  onRequestClose: () => void;
}

function HabitFormDialogFields({
  mode,
  initialHabit,
  onSave,
  onRequestClose,
}: HabitFormDialogFieldsProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [name, setName] = useState(() =>
    mode === "edit" && initialHabit ? initialHabit.name : "",
  );
  const [color, setColor] = useState<ColorVariant>(
    () => initialHabit?.colorVariant ?? "green",
  );
  const [schedule, setSchedule] = useState<CreateScheduleValue>(() =>
    mode === "edit" && initialHabit
      ? scheduleToFormValue(initialHabit.schedule)
      : defaultScheduleFormValue(),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit(name, schedule) || saving) return;
    const payload: HabitFormPayload = {
      name: name.trim(),
      colorVariant: color,
      schedule: buildScheduleFromForm(schedule),
    };
    if (onSave) {
      setSaving(true);
      setSaveError(null);
      try {
        const result = await Promise.resolve(onSave(payload));
        if (result.error) {
          setSaveError(result.error);
          return;
        }
      } finally {
        setSaving(false);
      }
    }
    triggerInteractionFeedback({ haptic: false });
    onRequestClose();
  };

  const submitEnabled = canSubmit(name, schedule) && !saving;

  const title = mode === "create" ? "New habit" : "Edit habit";
  const description =
    mode === "create"
      ? "Start building consistency"
      : "Update name, color, and schedule";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="shrink-0 space-y-1 px-5 pt-6 pr-14 pb-4 sm:px-6 sm:pr-16">
        <DialogTitle className="text-xl font-semibold tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {description}
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 pb-6 sm:px-6">
        <div className="space-y-2">
          <Label htmlFor="habit-name">Name</Label>
          <Input
            id="habit-name"
            name="name"
            placeholder="e.g. Gym, Study, Cardio"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            autoFocus={mode === "create"}
            className="min-h-11 text-base sm:min-h-10 sm:text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground">Color</Label>
          <ColorSelector value={color} onChange={setColor} />
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground">Schedule</Label>
          <ScheduleSelector value={schedule} onChange={setSchedule} />
        </div>

        {saveError ? (
          <p
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {saveError}
          </p>
        ) : null}
      </div>

      <div
        className="flex shrink-0 flex-col gap-3 border-t border-border/40 bg-background px-5 py-4 sm:flex-row sm:justify-end sm:px-6"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            className="min-h-11 w-full transition-transform duration-150 ease-out active:scale-[0.98] sm:min-h-9 sm:w-auto"
            onClick={() => triggerInteractionFeedback({ haptic: false })}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          loading={saving}
          loadingText={mode === "create" ? "Creating..." : "Saving..."}
          disabled={!submitEnabled}
          className="min-h-11 min-w-[10.5rem] w-full transition-transform duration-150 ease-out enabled:active:scale-[0.98] sm:min-h-9 sm:w-auto"
        >
          {mode === "create" ? "Create habit" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function HabitFormDialog({
  mode,
  open,
  onOpenChange,
  formResetKey,
  trigger,
  initialHabit,
  onSave,
}: HabitFormDialogProps) {
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const formKey = `${formResetKey}-${mode}-${habitFormFingerprint(mode, initialHabit)}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        showCloseButton
        closeButtonClassName="top-[calc(env(safe-area-inset-top,0px)+0.5rem)] right-[calc(env(safe-area-inset-right,0px)+0.5rem)]"
        className={cn(
          "flex max-h-dvh flex-col gap-0 overflow-hidden border-0 p-0 shadow-xl",
          "inset-0! h-dvh! max-w-none! w-full! translate-x-0! translate-y-0! rounded-none sm:inset-auto! sm:top-1/2! sm:left-1/2! sm:h-auto! sm:max-h-[min(90dvh,640px)]! sm:w-full! sm:max-w-md! sm:-translate-x-1/2! sm:-translate-y-1/2! sm:rounded-xl! sm:border! sm:p-0!",
        )}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: "env(safe-area-inset-left, 0px)",
          paddingRight: "env(safe-area-inset-right, 0px)",
        }}
      >
        <HabitFormDialogFields
          key={formKey}
          mode={mode}
          initialHabit={initialHabit}
          onSave={onSave}
          onRequestClose={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
