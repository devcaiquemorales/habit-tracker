"use client";

import { useLayoutEffect, useMemo, useRef } from "react";

import { getUtcToday, toUtcDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { Button } from "@/presentation/components/ui/button";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { isUpdateActivitySelectable } from "@/presentation/lib/update-activity-selectable";
import { cn } from "@/presentation/lib/utils";

function formatChipLabel(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface HabitUpdateActivityProps {
  schedule: Schedule;
  completedKeys: Set<string>;
  /** UTC calendar days shown in the strip (oldest → newest). */
  days: Date[];
  selectedKey: string | null;
  onSelectedKeyChange: (key: string | null) => void;
  onMarkCompleted: (dateKey: string) => void;
  onRemoveEntry: (dateKey: string) => void;
}

export function HabitUpdateActivity({
  schedule,
  completedKeys,
  days,
  selectedKey,
  onSelectedKeyChange,
  onMarkCompleted,
  onRemoveEntry,
}: HabitUpdateActivityProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedChipRef = useRef<HTMLButtonElement>(null);

  const todayDate = getUtcToday();

  /** Single source for the action button — always tied to `selectedKey`. */
  const updateActivitySelection = useMemo(() => {
    if (selectedKey === null) {
      return {
        dateKey: null as string | null,
        isCompleted: false,
        isSelectable: false,
        buttonLabel: "Select a day",
        buttonVariant: "default" as const,
      };
    }

    const selectedDate =
      days.find((d) => toUtcDateKey(d) === selectedKey) ?? null;

    if (!selectedDate) {
      return {
        dateKey: selectedKey,
        isCompleted: false,
        isSelectable: false,
        buttonLabel: "Select a day",
        buttonVariant: "default" as const,
      };
    }

    const isSelectable = isUpdateActivitySelectable(
      schedule,
      selectedDate,
      todayDate,
      completedKeys,
    );
    const isCompleted = completedKeys.has(selectedKey);

    const buttonLabel = !isSelectable
      ? "Select a day"
      : isCompleted
        ? "Remove entry"
        : "Mark as completed";

    return {
      dateKey: selectedKey,
      isCompleted,
      isSelectable,
      buttonLabel,
      buttonVariant:
        isSelectable && isCompleted
          ? ("outline" as const)
          : ("default" as const),
    };
  }, [selectedKey, days, schedule, todayDate, completedKeys]);

  useLayoutEffect(() => {
    const chip = selectedChipRef.current;
    const scroller = scrollRef.current;
    if (!scroller) return;
    if (chip && selectedKey !== null) {
      chip.scrollIntoView({
        inline: "nearest",
        block: "nearest",
        behavior: "auto",
      });
      return;
    }
    scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
  }, [selectedKey, days]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-white/50">Update activity</p>
        <p className="text-sm leading-relaxed text-white/45">
          Log a day you completed but forgot to record.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hidden -mx-1 overflow-x-auto overscroll-x-contain pb-1"
      >
        <div className="flex w-max gap-2 px-1">
          {days.map((d) => {
            const key = toUtcDateKey(d);
            const selectable = isUpdateActivitySelectable(
              schedule,
              d,
              todayDate,
              completedKeys,
            );
            const selected = key === selectedKey;
            const done = completedKeys.has(key);
            return (
              <button
                key={key}
                ref={selected ? selectedChipRef : undefined}
                type="button"
                disabled={!selectable}
                onClick={() => {
                  if (!selectable) return;
                  triggerInteractionFeedback();
                  onSelectedKeyChange(selectedKey === key ? null : key);
                }}
                className={cn(
                  "flex min-h-11 shrink-0 flex-col items-center justify-center rounded-lg px-3 py-2 text-center transition-colors",
                  !selectable && "cursor-not-allowed opacity-35",
                  selected && selectable
                    ? "bg-white/10 text-white"
                    : selectable
                      ? "text-white/65 hover:bg-white/5 hover:text-white/80"
                      : "text-white/35",
                  !selected && selectable && "bg-transparent",
                  done && !selected && selectable && "text-emerald-400/85",
                )}
              >
                <span className="text-xs leading-snug font-medium tabular-nums">
                  {formatChipLabel(d)}
                </span>
                {done ? (
                  <span className="mt-0.5 text-[0.65rem] font-medium text-emerald-400/80">
                    Done
                  </span>
                ) : (
                  <span
                    className={cn(
                      "mt-0.5 text-[0.65rem] leading-snug",
                      selectable ? "text-white/30" : "text-white/20",
                    )}
                  >
                    {selectable ? "Tap" : "—"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        variant={updateActivitySelection.buttonVariant}
        className="min-h-11 w-full sm:w-auto"
        disabled={
          updateActivitySelection.dateKey === null ||
          !updateActivitySelection.isSelectable
        }
        onClick={() => {
          const { dateKey, isSelectable, isCompleted } =
            updateActivitySelection;
          if (!dateKey || !isSelectable) return;
          triggerInteractionFeedback({ haptic: false });
          if (isCompleted) {
            onRemoveEntry(dateKey);
          } else {
            onMarkCompleted(dateKey);
          }
        }}
      >
        {updateActivitySelection.buttonLabel}
      </Button>
    </section>
  );
}
