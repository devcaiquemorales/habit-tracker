"use client";

import { useMemo } from "react";

import { Button } from "@/presentation/components/ui/button";
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
      <div
        className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
        role="tablist"
        aria-label={t("schedule.scheduleModelAria")}
      >
        <Button
          type="button"
          role="tab"
          aria-selected={displayCategory === "fixed"}
          variant={displayCategory === "fixed" ? "default" : "outline"}
          size="sm"
          className={cn(
            "min-h-10 justify-center sm:min-h-8",
            displayCategory === "fixed" && "shadow-none",
          )}
          onClick={() => {
            triggerInteractionFeedback({ haptic: false });
            setCategory("fixed");
          }}
        >
          {t("schedule.fixed")}
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={displayCategory === "weeklyTarget"}
          variant={displayCategory === "weeklyTarget" ? "default" : "outline"}
          size="sm"
          className={cn(
            "min-h-10 justify-center sm:min-h-8",
            displayCategory === "weeklyTarget" && "shadow-none",
          )}
          onClick={() => {
            triggerInteractionFeedback({ haptic: false });
            setCategory("weeklyTarget");
          }}
        >
          {t("schedule.weeklyTarget")}
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={displayCategory === "flexible"}
          variant={displayCategory === "flexible" ? "default" : "outline"}
          size="sm"
          className={cn(
            "min-h-10 justify-center sm:min-h-8",
            displayCategory === "flexible" && "shadow-none",
          )}
          onClick={() => {
            triggerInteractionFeedback({ haptic: false });
            setCategory("flexible");
          }}
        >
          {t("schedule.flexible")}
        </Button>
      </div>

      {value.category === "fixed" && (
        <>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            role="tablist"
            aria-label={t("schedule.fixedTypeAria")}
          >
            {(
              [
                { mode: "daily" as const, labelKey: "schedule.daily" as const },
                {
                  mode: "specificDays" as const,
                  labelKey: "schedule.specificDays" as const,
                },
                {
                  mode: "everyOtherDay" as const,
                  labelKey: "schedule.everyOtherDay" as const,
                },
              ] as const
            ).map(({ mode, labelKey }) => (
              <Button
                key={mode}
                type="button"
                role="tab"
                aria-selected={value.mode === mode}
                variant={value.mode === mode ? "default" : "outline"}
                size="sm"
                className={cn(
                  "min-h-10 justify-center sm:min-h-8",
                  value.mode === mode && "shadow-none",
                )}
                onClick={() => {
                  triggerInteractionFeedback({ haptic: false });
                  setFixedMode(mode);
                }}
              >
                {t(labelKey)}
              </Button>
            ))}
          </div>

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
                        "flex min-h-11 min-w-11 items-center justify-center rounded-lg text-xs font-medium transition-colors sm:min-h-9 sm:min-w-9",
                        on
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted",
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
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label={t("schedule.timesPerWeekAria")}
          >
            {TIMES_PER_WEEK.map((n) => {
              const selected = value.timesPerWeek === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    triggerInteractionFeedback();
                    onChange({
                      category: "weeklyTarget",
                      timesPerWeek: n,
                    });
                  }}
                  className={cn(
                    "flex min-h-11 min-w-11 items-center justify-center rounded-lg text-sm font-semibold tabular-nums transition-colors sm:min-h-9 sm:min-w-9",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
