"use client";

import { useMemo, useState } from "react";

import { Button } from "@/presentation/components/ui/button";
import type { Schedule } from "@/presentation/components/habit-heatmap/schedule-types";
import { isPastDayLoggable } from "@/presentation/components/habit-heatmap/schedule-types";
import { useScrollToFarRight } from "@/presentation/hooks/use-scroll-to-far-right";
import { getUtcToday, toUtcDateKey } from "@/presentation/lib/date-key";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

/** Oldest → newest (left → right); rightmost = most recent past day. */
function getPastUtcCalendarDays(count: number): Date[] {
  const out: Date[] = [];
  const today = getUtcToday();
  for (let i = count; i >= 1; i -= 1) {
    const d = new Date(today.getTime());
    d.setUTCDate(today.getUTCDate() - i);
    out.push(d);
  }
  return out;
}

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
  onMarkCompleted: (dateKey: string) => void;
  onRemoveEntry: (dateKey: string) => void;
}

export function HabitUpdateActivity({
  schedule,
  completedKeys,
  onMarkCompleted,
  onRemoveEntry,
}: HabitUpdateActivityProps) {
  const scrollRef = useScrollToFarRight<HTMLDivElement>();
  const days = useMemo(() => getPastUtcCalendarDays(14), []);
  const [selectedKey, setSelectedKey] = useState<string | null>(() => {
    for (let i = days.length - 1; i >= 0; i -= 1) {
      const d = days[i]!;
      const key = toUtcDateKey(d);
      if (isPastDayLoggable(schedule, d, completedKeys)) {
        return key;
      }
    }
    return null;
  });

  const selectedCompleted =
    selectedKey !== null && completedKeys.has(selectedKey);

  const selectedSelectable =
    selectedKey !== null &&
    days.some((d) => {
      const k = toUtcDateKey(d);
      if (k !== selectedKey) return false;
      return isPastDayLoggable(schedule, d, completedKeys);
    });

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
        className={cn(
          "scrollbar-hidden -mx-1 overflow-x-auto overscroll-x-contain pb-1",
        )}
      >
        <div className="flex w-max gap-2 px-1">
          {days.map((d) => {
            const key = toUtcDateKey(d);
            const selectable = isPastDayLoggable(schedule, d, completedKeys);
            const selected = key === selectedKey;
            const done = completedKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                disabled={!selectable}
                onClick={() => {
                  if (!selectable) return;
                  triggerInteractionFeedback({ sound: "none", haptic: true });
                  setSelectedKey((prev) => (prev === key ? null : key));
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
        variant={selectedCompleted ? "outline" : "default"}
        className="min-h-11 w-full sm:w-auto"
        disabled={selectedKey === null || !selectedSelectable}
        onClick={() => {
          if (!selectedKey || !selectedSelectable) return;
          triggerInteractionFeedback({ sound: "success", haptic: false });
          if (selectedCompleted) {
            onRemoveEntry(selectedKey);
          } else {
            onMarkCompleted(selectedKey);
          }
        }}
      >
        {selectedKey === null
          ? "Select a day"
          : !selectedSelectable
            ? "Select a day"
            : selectedCompleted
              ? "Remove entry"
              : "Mark as completed"}
      </Button>
    </section>
  );
}
