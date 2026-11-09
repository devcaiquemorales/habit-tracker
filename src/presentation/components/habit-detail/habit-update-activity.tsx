"use client";

import { Lock } from "lucide-react";
import { useLayoutEffect, useMemo, useRef } from "react";

import { getLocalToday, toLocalDateKey } from "@/domain/types/date-key";
import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import { COLOR_VARIANTS } from "@/presentation/components/habit-heatmap/color-variants";
import { Button } from "@/presentation/components/ui/button";
import {
  formatActivityChipParts,
  formatUtcDateKeyLong,
} from "@/presentation/lib/i18n/format";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { isUpdateActivitySelectable } from "@/presentation/lib/update-activity-selectable";
import { cn } from "@/presentation/lib/utils";

interface HabitUpdateActivityProps {
  colorVariant: ColorVariant;
  schedule: Schedule;
  completedKeys: Set<string>;
  guardedKeys: ReadonlySet<string>;
  /** UTC calendar days shown in the strip (oldest → newest). */
  days: Date[];
  selectedKey: string | null;
  onSelectedKeyChange: (key: string | null) => void;
  onMarkCompleted: (dateKey: string) => void | Promise<void>;
  onRemoveEntry: (dateKey: string) => void | Promise<void>;
  /** Which log mutation is in flight, if any. */
  logActionPending?: "mark" | "remove" | null;
}

export function HabitUpdateActivity({
  colorVariant,
  schedule,
  completedKeys,
  guardedKeys,
  days,
  selectedKey,
  onSelectedKeyChange,
  onMarkCompleted,
  onRemoveEntry,
  logActionPending = null,
}: HabitUpdateActivityProps) {
  const { t, locale } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedChipRef = useRef<HTMLButtonElement>(null);

  const todayDate = getLocalToday();

  /** Single source for the action button — always tied to `selectedKey`. */
  const updateActivitySelection = useMemo(() => {
    if (selectedKey === null) {
      return {
        dateKey: null as string | null,
        isCompleted: false,
        isSelectable: false,
        buttonLabel: t("updateActivity.selectDay"),
        buttonVariant: "default" as const,
      };
    }

    const selectedDate =
      days.find((d) => toLocalDateKey(d) === selectedKey) ?? null;

    if (!selectedDate) {
      return {
        dateKey: selectedKey,
        isCompleted: false,
        isSelectable: false,
        buttonLabel: t("updateActivity.selectDay"),
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
      ? t("updateActivity.selectDay")
      : isCompleted
        ? t("common.removeEntry")
        : t("updateActivity.markCompleted");

    return {
      dateKey: selectedKey,
      isCompleted,
      isSelectable,
      buttonLabel,
      buttonVariant:
        isSelectable && isCompleted
          ? ("secondary" as const)
          : ("default" as const),
    };
  }, [selectedKey, days, schedule, todayDate, completedKeys, t]);

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

  const logBusy = logActionPending !== null;

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-[1.25rem] bg-sidebar p-3 transition-opacity duration-150",
        logBusy && "opacity-90",
      )}
      aria-busy={logBusy || undefined}
    >
      <div
        ref={scrollRef}
        className="scrollbar-hidden overflow-x-auto overscroll-x-contain"
      >
        <div className="flex gap-0.5">
          {days.map((d) => {
            const key = toLocalDateKey(d);
            const selectable = isUpdateActivitySelectable(
              schedule,
              d,
              todayDate,
              completedKeys,
            );
            const selected = key === selectedKey;
            const done = completedKeys.has(key);
            const guarded = guardedKeys.has(key);
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
                aria-pressed={selected}
                aria-label={
                  done
                    ? `${formatUtcDateKeyLong(key, locale)}, ${t("common.done")}`
                    : guarded
                      ? `${formatUtcDateKeyLong(key, locale)}, ${t("heatmap.guarded")}`
                      : formatUtcDateKeyLong(key, locale)
                }
                className={cn(
                  "flex min-w-11 flex-1 flex-col items-center gap-1.5 rounded-xl py-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  !selectable && "cursor-not-allowed opacity-35",
                  selected && selectable
                    ? "bg-foreground/8"
                    : selectable && "hover:bg-foreground/5",
                )}
              >
                <span className="text-[11px] leading-none text-muted-foreground">
                  {formatActivityChipParts(d, locale).weekday}
                </span>
                <span
                  className={cn(
                    "relative flex size-8 items-center justify-center rounded-full text-sm font-medium tabular-nums",
                    done
                      ? cn(COLOR_VARIANTS[colorVariant].doneClass, "text-white")
                      : guarded
                        ? "bg-foreground/12 text-foreground"
                        : "text-foreground",
                  )}
                >
                  {formatActivityChipParts(d, locale).day}
                  {guarded ? (
                    <Lock
                      aria-hidden
                      strokeWidth={3}
                      className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-sidebar p-0.5 text-foreground/80"
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        variant={updateActivitySelection.buttonVariant}
        className="h-11 w-full rounded-full md:h-9"
        loading={logBusy}
        loadingText={
          logActionPending === "remove"
            ? t("common.removing")
            : logActionPending === "mark"
              ? t("common.saving")
              : undefined
        }
        disabled={
          updateActivitySelection.dateKey === null ||
          !updateActivitySelection.isSelectable
        }
        onClick={() => {
          const { dateKey, isSelectable, isCompleted } =
            updateActivitySelection;
          if (!dateKey || !isSelectable || logBusy) return;
          triggerInteractionFeedback({ haptic: false });
          if (isCompleted) {
            void onRemoveEntry(dateKey);
          } else {
            void onMarkCompleted(dateKey);
          }
        }}
      >
        {updateActivitySelection.buttonLabel}
      </Button>
    </section>
  );
}
