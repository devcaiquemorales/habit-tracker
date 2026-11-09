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
    schedule?.type === "flexible" && completedKeys.length > 0
      ? countLogsInCalendarMonth(
          new Set(completedKeys),
          toLocalDateKey(getLocalToday()),
        )
      : 0;

  return (
    <div className="flex items-center gap-2">
      <span className={`size-2 shrink-0 rounded-full ${indicatorClass}`} />
      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">
        {name}
      </span>
      {schedule?.type === "flexible" ? (
        monthCount > 0 ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {t("streak.monthCount", { n: monthCount })}
          </span>
        ) : null
      ) : streak !== undefined && streak > 0 ? (
        <StreakBadge streak={streak} unit={unit as "days" | "weeks"} />
      ) : null}
      <ChevronRightIcon
        className="size-4 shrink-0 text-muted-foreground/70"
        aria-hidden
      />
    </div>
  );
}
