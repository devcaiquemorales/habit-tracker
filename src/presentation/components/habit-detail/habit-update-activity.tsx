"use client";

import { useLayoutEffect, useMemo, useRef } from "react";

import { getLocalToday, toLocalDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { Button } from "@/presentation/components/ui/button";
import { formatActivityChipDate } from "@/presentation/lib/i18n/format";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { isUpdateActivitySelectable } from "@/presentation/lib/update-activity-selectable";
import { cn } from "@/presentation/lib/utils";

interface HabitUpdateActivityProps {
  schedule: Schedule;
  completedKeys: Set<string>;
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
  schedule,
  completedKeys,
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
          ? ("outline" as const)
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
        "flex flex-col gap-4 transition-opacity duration-150",
        logBusy && "opacity-90",
      )}
      aria-busy={logBusy || undefined}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-white/50">
          {t("updateActivity.sectionTitle")}
        </p>
        <p className="text-sm leading-relaxed text-white/45">
          {t("updateActivity.subtitle")}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hidden -mx-1 overflow-x-auto overscroll-x-contain pb-1"
      >
        <div className="flex w-max gap-2 px-1">
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
                  {formatActivityChipDate(d, locale)}
                </span>
                {done ? (
                  <span className="mt-0.5 text-[0.65rem] font-medium text-emerald-400/80">
                    {t("common.done")}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "mt-0.5 text-[0.65rem] leading-snug",
                      selectable ? "text-white/30" : "text-white/20",
                    )}
                  >
                    {selectable ? t("common.tap") : t("common.dash")}
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
        className="min-h-11 w-full min-w-44 sm:w-auto"
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
