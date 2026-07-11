"use client";

import { ChevronRightIcon } from "lucide-react";

import {
  countLogsInCalendarMonth,
  streakUnitForSchedule,
} from "@/domain/lib/compute-streak";
import { getLocalToday, toLocalDateKey } from "@/domain/types/date-key";
import type { Schedule } from "@/domain/types/schedule";
import { StreakBadge } from "@/presentation/components/streak-badge";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

interface HabitCardHeaderProps {
  name: string;
  indicatorClass: string;
  streak?: number;
  schedule?: Schedule;
  completedKeys?: string[];
}

export function HabitCardHeader({
  name,
  indicatorClass,
  streak,
  schedule,
  completedKeys = [],
}: HabitCardHeaderProps) {
  const { t } = useI18n();
  const unit = schedule ? streakUnitForSchedule(schedule) : "days";
  const monthCount =
    schedule && schedule.type === "flexible" && completedKeys.length > 0
      ? countLogsInCalendarMonth(
          new Set(completedKeys),
          toLocalDateKey(getLocalToday()),
        )
      : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${indicatorClass}`} />
        <span className="text-sm font-medium text-white/90">{name}</span>
        {schedule && schedule.type === "flexible" ? (
          monthCount > 0 ? (
            <span className="inline-flex items-center text-xs text-white/40">
              {t("streak.monthCount", { n: monthCount })}
            </span>
          ) : null
        ) : streak !== undefined && streak > 0 ? (
          <StreakBadge streak={streak} unit={unit as "days" | "weeks"} />
        ) : null}
      </div>
      <span
        className="-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center text-white/40"
        aria-hidden
      >
        <ChevronRightIcon className="h-4 w-4" />
      </span>
    </div>
  );
}
