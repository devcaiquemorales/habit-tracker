import type { Schedule } from "@/domain/types/schedule";
import type { AppLocale } from "@/lib/app-locale";

import { getMessages } from "./messages";

const WEEKDAY_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

export function formatScheduleLabel(schedule: Schedule, locale: AppLocale): string {
  const m = getMessages(locale).scheduleLabels;
  const days = getMessages(locale).scheduleDays;
  const dash = getMessages(locale).common.dash;

  switch (schedule.type) {
    case "daily":
      return m.everyDay;
    case "specificDays":
      if (schedule.days.length === 0) return dash;
      return schedule.days
        .slice()
        .sort((a, b) => a - b)
        .map((d) => days[WEEKDAY_KEYS[d]])
        .join(", ");
    case "everyOtherDay":
      return m.everyOtherDay;
    case "flexible":
      return m.flexible;
    case "weeklyTarget": {
      const n = schedule.timesPerWeek;
      return n === 1 ? m.timesPerWeekOne : m.timesPerWeek.replace("{n}", String(n));
    }
  }
}
