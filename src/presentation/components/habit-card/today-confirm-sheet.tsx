"use client";

import { Lock } from "lucide-react";

import {
  computeGuardedDateKeys,
  computeStreak,
  streakUnitForSchedule,
} from "@/domain/lib/compute-streak";
import { addDaysToDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { BottomSheetContent } from "@/presentation/components/ui/bottom-sheet";
import { Button } from "@/presentation/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { cn } from "@/presentation/lib/utils";

const WEEK_OFFSETS = [6, 5, 4, 3, 2, 1, 0];

interface TodayConfirmSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  indicatorClass: string;
  doneClass: string;
  schedule: Schedule;
  completedKeys: readonly string[];
  todayKey: string;
  onConfirm: () => void;
}

export function TodayConfirmSheet({
  open,
  onOpenChange,
  name,
  indicatorClass,
  doneClass,
  schedule,
  completedKeys,
  todayKey,
  onConfirm,
}: TodayConfirmSheetProps) {
  const { t } = useI18n();
  const completed = new Set(completedKeys);
  const guarded = computeGuardedDateKeys(completed, schedule, todayKey);
  const isDone = completed.has(todayKey);

  const unit = streakUnitForSchedule(schedule);
  const nextStreak = computeStreak(
    new Set([...completed, todayKey]),
    schedule,
    todayKey,
  ).count;
  const streakKey = unit === "weeks" ? "detailInfo.weeks" : "detailInfo.days";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent compact onDismiss={() => onOpenChange(false)}>
        <div className="mx-auto w-full max-w-xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={cn("size-2 shrink-0 rounded-full", indicatorClass)}
              />
              <span className="min-w-0 truncate">{name}</span>
            </DialogTitle>
            <DialogDescription className="text-[15px]">
              {t(
                isDone
                  ? "habitCard.confirmRemoveToday"
                  : "habitCard.confirmMarkToday",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex gap-1" aria-hidden>
              {WEEK_OFFSETS.map((offset) => {
                const key = addDaysToDateKey(todayKey, -offset);
                return (
                  <span
                    key={key}
                    className={cn(
                      "relative size-6 rounded-[5px]",
                      completed.has(key) ? doneClass : "bg-foreground/[0.07]",
                      offset === 0 && "ring-1 ring-foreground/70 ring-inset",
                    )}
                  >
                    {guarded.has(key) ? (
                      <Lock
                        strokeWidth={3}
                        className="absolute inset-0 m-auto size-3 text-foreground/70"
                      />
                    ) : null}
                  </span>
                );
              })}
            </div>
            {!isDone && unit !== "none" && nextStreak > 0 ? (
              <p className="text-right text-sm text-muted-foreground tabular-nums">
                {t(nextStreak === 1 ? `${streakKey}One` : `${streakKey}Many`, {
                  n: nextStreak,
                })}
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-11 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="h-11 rounded-full"
              onClick={onConfirm}
            >
              {t(isDone ? "common.removeEntry" : "updateActivity.markCompleted")}
            </Button>
          </div>
        </div>
      </BottomSheetContent>
    </Dialog>
  );
}
