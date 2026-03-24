"use client";

import { Button } from "@/presentation/components/ui/button";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

/** Display order Mon–Sun; values match Date.getUTCDay() (Sun=0 … Sat=6) */
const WEEKDAY_ORDER: { label: string; value: number }[] = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

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
        aria-label="Schedule model"
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
          Fixed schedule
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
          Weekly target
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
          Flexible
        </Button>
      </div>

      {value.category === "fixed" && (
        <>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            role="tablist"
            aria-label="Fixed schedule type"
          >
            {(
              [
                { mode: "daily" as const, label: "Daily" },
                { mode: "specificDays" as const, label: "Specific days" },
                { mode: "everyOtherDay" as const, label: "Every other day" },
              ] as const
            ).map(({ mode, label }) => (
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
                {label}
              </Button>
            ))}
          </div>

          {value.mode === "specificDays" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Days</span>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Weekdays"
              >
                {WEEKDAY_ORDER.map(({ label, value: day }) => {
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
          Log any day you complete this habit. No fixed weekdays.
        </p>
      )}

      {value.category === "weeklyTarget" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Times per week
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Choose how many times you want to complete this habit each week
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Times per week"
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
