import { addDaysToDateKey, localDateFromDateKey } from "../types/date-key";
import type { Schedule } from "../types/schedule";
import { isDayExpected } from "../types/schedule";

const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function localPartsFor(
  timeZone: string,
  date: Date,
): { localDate: string; localHour: number; localWeekday: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      weekday: "short",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return {
    localDate: `${parts.year}-${parts.month}-${parts.day}`,
    localHour: Number(parts.hour),
    localWeekday: WEEKDAYS[parts.weekday] ?? 0,
  };
}

export type ReminderProgress = {
  expectedCount: number;
  doneCount: number;
  pendingNames: string[];
};

export function computeReminderProgress(
  habits: readonly { id: string; name: string; schedule: Schedule }[],
  logs: readonly { habitId: string; logDate: string }[],
  localDate: string,
  localWeekday: number,
): ReminderProgress {
  const day = localDateFromDateKey(localDate);
  if (!day) return { expectedCount: 0, doneCount: 0, pendingNames: [] };

  const weekStart = addDaysToDateKey(localDate, -localWeekday);
  const expected = habits.filter((habit) => isDayExpected(habit.schedule, day));
  const pendingNames: string[] = [];

  for (const habit of expected) {
    const own = logs.filter((log) => log.habitId === habit.id);
    const done =
      habit.schedule.type === "weeklyTarget"
        ? own.filter((log) => log.logDate >= weekStart).length >=
          habit.schedule.timesPerWeek
        : own.some((log) => log.logDate === localDate);
    if (!done) pendingNames.push(habit.name);
  }

  return {
    expectedCount: expected.length,
    doneCount: expected.length - pendingNames.length,
    pendingNames,
  };
}

export function buildReminderMessage(
  progress: ReminderProgress,
  locale: "en" | "pt",
): { title: string; body: string } {
  const { doneCount, expectedCount, pendingNames } = progress;
  const names = pendingNames.join(", ");
  const body =
    locale === "pt"
      ? `${doneCount} de ${expectedCount} feitos. Faltam: ${names}`
      : `${doneCount} of ${expectedCount} done. Remaining: ${names}`;

  return {
    title: locale === "pt" ? "Seus hábitos de hoje" : "Today's habits",
    body: body.length > 120 ? `${body.slice(0, 117)}…` : body,
  };
}
