"use client";

import { useMemo } from "react";

import { SegmentedControl } from "@/presentation/components/ui/segmented-control";
import { weekdayLabelsForSelector } from "@/presentation/lib/i18n/format";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

export type FixedScheduleMode = "daily" | "specificDays" | "everyOtherDay";

export type CreateScheduleValue =
  | {
      category: "fixed";
      mode: FixedScheduleMode;
      days: number[];
      /** Preserved everyOtherDay cycle anchor when editing an existing habit. */
      anchorDateKey?: string;
    }
  | {
      category: "weeklyTarget";
      timesPerWeek: number;
    }
  | { category: "flexible" };

interface ScheduleSelectorProps {
  value: CreateScheduleValue;
  onChange: (value: CreateScheduleValue) => void;
}

const TIMES_PER_WEEK = [1, 2, 3, 4, 5, 6, 7] as const;

export function ScheduleSelector({ value, onChange }: ScheduleSelectorProps) {
  const { t, locale } = useI18n();
  const weekdayOrder = useMemo(
    () => weekdayLabelsForSelector(locale),
    [locale],
  );

  const setCategory = (category: "fixed" | "weeklyTarget" | "flexible") => {
    if (category === "fixed") {
      onChange({
        category: "fixed",
        mode: "daily",
        days: [],
      });
    } else if (category === "weeklyTarget") {
      onChange({
        category: "weeklyTarget",
        timesPerWeek: 4,
      });
    } else {
      onChange({ category: "flexible" });
    }
  };

  const setFixedMode = (mode: FixedScheduleMode) => {
    if (value.category !== "fixed") return;
    onChange({
      category: "fixed",
      mode,
      days: mode === "specificDays" ? value.days : [],
    });
  };

  const toggleDay = (day: number) => {
    if (value.category !== "fixed") return;
    const has = value.days.includes(day);
    const days = has
      ? value.days.filter((d) => d !== day)
      : [...value.days, day];
    onChange({ category: "fixed", mode: "specificDays", days });
  };

  const displayCategory =
    value.category === "fixed"
      ? "fixed"
      : value.category === "weeklyTarget"
        ? "weeklyTarget"
        : "flexible";

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl
        aria-label={t("schedule.scheduleModelAria")}
        value={displayCategory}
        onChange={(next) => {
          triggerInteractionFeedback({ haptic: false });
          setCategory(next);
        }}
        options={[
          { value: "fixed", label: t("schedule.fixed") },
          { value: "weeklyTarget", label: t("schedule.weeklyTarget") },
          { value: "flexible", label: t("schedule.flexible") },
        ]}
      />

      {value.category === "fixed" && (
        <>
          <SegmentedControl
            aria-label={t("schedule.fixedTypeAria")}
            value={value.mode}
            onChange={(mode) => {
              triggerInteractionFeedback({ haptic: false });
              setFixedMode(mode);
            }}
            options={[
              { value: "daily", label: t("schedule.daily") },
              { value: "specificDays", label: t("schedule.specificDays") },
              { value: "everyOtherDay", label: t("schedule.everyOtherDay") },
            ]}
          />

          {value.mode === "specificDays" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">
                {t("schedule.days")}
              </span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={t("schedule.weekdaysAria")}
              >
                {weekdayOrder.map(({ label, weekday: day }) => {
                  const on = value.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        triggerInteractionFeedback();
                        toggleDay(day);
                      }}
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full border text-sm transition-colors md:size-9",
                        on
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {value.category === "flexible" && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("schedule.flexibleHelp")}
        </p>
      )}

      {value.category === "weeklyTarget" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t("schedule.timesPerWeekHeading")}
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("schedule.timesPerWeekHelp")}
          </p>
          <SegmentedControl
            aria-label={t("schedule.timesPerWeekAria")}
            value={String(value.timesPerWeek)}
            onChange={(next) => {
              triggerInteractionFeedback();
              onChange({
                category: "weeklyTarget",
                timesPerWeek: Number(next),
              });
            }}
            options={TIMES_PER_WEEK.map((n) => ({
              value: String(n),
              label: String(n),
            }))}
          />
        </div>
      )}
    </div>
  );
}
