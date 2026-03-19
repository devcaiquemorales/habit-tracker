"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { ColorSelector } from "@/presentation/components/create-habit-dialog/color-selector";
import {
  type CreateScheduleValue,
  ScheduleSelector,
} from "@/presentation/components/create-habit-dialog/schedule-selector";
import type { ColorVariant } from "@/presentation/components/habit-heatmap/color-variants";
import type { Schedule } from "@/presentation/components/habit-heatmap/schedule-types";
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

export interface HabitFormDialogProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  /** When mode is `edit`, used to pre-fill when the dialog opens */
  initialHabit?: {
    name: string;
    colorVariant: ColorVariant;
    schedule: Schedule;
  };
  /** Called after validation on successful submit, before close and success sound */
  onSave?: (payload: HabitFormPayload) => void;
}

export function HabitFormDialog({
  mode,
  open,
  onOpenChange,
  trigger,
  initialHabit,
  onSave,
}: HabitFormDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<ColorVariant>("green");
  const [schedule, setSchedule] = useState<CreateScheduleValue>({
    category: "fixed",
    mode: "daily",
    days: [],
  });

  const resetCreateDefaults = useCallback(() => {
    setName("");
    setColor("green");
    setSchedule({ category: "fixed", mode: "daily", days: [] });
  }, []);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next && mode === "create") {
      resetCreateDefaults();
    }
  };

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      resetCreateDefaults();
      return;
    }
    if (mode === "edit" && initialHabit) {
      setName(initialHabit.name);
      setColor(initialHabit.colorVariant);
      setSchedule(scheduleToFormValue(initialHabit.schedule));
    }
  }, [open, mode, initialHabit, resetCreateDefaults]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit(name, schedule)) return;
    const payload: HabitFormPayload = {
      name: name.trim(),
      colorVariant: color,
      schedule: buildScheduleFromForm(schedule),
    };
    onSave?.(payload);
    triggerInteractionFeedback({ sound: "success", haptic: false });
    handleOpenChange(false);
  };

  const submitEnabled = canSubmit(name, schedule);

  const title = mode === "create" ? "New habit" : "Edit habit";
  const description =
    mode === "create"
      ? "Start building consistency"
      : "Update name, color, and schedule";
  const primaryLabel = mode === "create" ? "Create habit" : "Save changes";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        showCloseButton
        className={cn(
          "flex max-h-[100dvh] flex-col gap-0 overflow-hidden border-0 p-0 shadow-xl",
          "!inset-x-0 !inset-y-0 !top-0 !left-0 !h-[100dvh] !max-h-[100dvh] !w-full !max-w-full !translate-x-0 !translate-y-0 rounded-none sm:!inset-auto sm:!top-1/2 sm:!left-1/2 sm:!h-auto sm:!max-h-[min(90dvh,640px)] sm:!w-full sm:!max-w-md sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:rounded-xl sm:border sm:p-0",
        )}
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
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
                className="min-h-11 w-full transition-transform duration-150 ease-out active:scale-[0.98] sm:min-h-9 sm:w-auto"
                onClick={() =>
                  triggerInteractionFeedback({ sound: "tap", haptic: false })
                }
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!submitEnabled}
              className="min-h-11 w-full transition-transform duration-150 ease-out enabled:active:scale-[0.98] sm:min-h-9 sm:w-auto"
            >
              {primaryLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
