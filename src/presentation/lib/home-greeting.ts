import { computeReminderProgress } from "@/domain/lib/reminder-progress";
import {
  addDaysToDateKey,
  localDateFromDateKey,
} from "@/domain/types/date-key";
import type { Habit } from "@/domain/types/habit";

const FRESH = ["fresh1", "fresh2", "fresh3", "fresh4", "fresh5", "fresh6"];
const ALL_DONE = ["allDone1", "allDone2", "allDone3"];
const COMEBACK = ["comeback1", "comeback2"];
const PROGRESS = ["progress1", "progress2"];
const STREAK = ["streak1", "streak2"];

const COMEBACK_AFTER_DAYS = 3;
const STREAK_WORTH_MENTIONING = 7;
const LATE_HOUR = 21;
/** Longer habit names would turn the headline into a paragraph. */
const NAME_FITS_HEADLINE = 24;

export type GreetingInput = {
  displayName: string;
  /** Absent while there is no data to base the message on. */
  habits?: readonly Habit[];
  logKeysRecord: Readonly<Record<string, readonly string[]>>;
  todayKey: string;
  hour: number;
};

export type Greeting = {
  key: string;
  vars?: Record<string, string | number>;
};

/** Same pick all day for the same person, so the line does not change between visits. */
function pickFor(pool: readonly string[], seed: string): string {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return pool[hash % pool.length]!;
}

/** Chooses a line from what is actually happening with this person's habits. */
export function pickHomeGreeting({
  displayName,
  habits,
  logKeysRecord,
  todayKey,
  hour,
}: GreetingInput): Greeting {
  if (!habits) return { key: "greeting.neutral" };

  const name = displayName.trim().split(/\s+/)[0] ?? "";
  const pick = (
    pool: readonly string[],
    vars?: Greeting["vars"],
  ): Greeting => ({
    key: `greeting.${pickFor(pool, `${todayKey}:${name}`)}`,
    vars: { name, ...vars },
  });

  if (habits.length === 0) return pick(["welcome"]);

  const logs = habits.flatMap((habit) =>
    (logKeysRecord[habit.id] ?? []).map((logDate) => ({
      habitId: habit.id,
      logDate,
    })),
  );
  const weekday = localDateFromDateKey(todayKey)?.getDay() ?? 0;
  const { expectedCount, doneCount, pendingNames } = computeReminderProgress(
    habits,
    logs,
    todayKey,
    weekday,
  );

  if (expectedCount > 0 && pendingNames.length === 0) return pick(ALL_DONE);

  const lastLog = logs.reduce(
    (latest, log) => (log.logDate > latest.logDate ? log : latest),
    { habitId: "", logDate: "" },
  ).logDate;
  if (
    lastLog !== "" &&
    lastLog <= addDaysToDateKey(todayKey, -COMEBACK_AFTER_DAYS)
  ) {
    return pick(COMEBACK);
  }

  if (doneCount > 0) {
    const [onlyLeft] = pendingNames;
    if (
      pendingNames.length === 1 &&
      onlyLeft &&
      onlyLeft.length <= NAME_FITS_HEADLINE
    ) {
      return pick(["oneLeft"], { habit: onlyLeft });
    }
    return pick(PROGRESS, { done: doneCount, total: expectedCount });
  }

  if (expectedCount === 0) return pick(["rest"]);

  const best = habits
    .filter(
      (habit) =>
        habit.schedule.type !== "weeklyTarget" &&
        habit.schedule.type !== "flexible" &&
        habit.name.length <= NAME_FITS_HEADLINE,
    )
    .reduce<Habit | null>(
      (top, habit) => (!top || habit.streak > top.streak ? habit : top),
      null,
    );
  if (best && best.streak >= STREAK_WORTH_MENTIONING) {
    return pick(STREAK, { habit: best.name, n: best.streak });
  }

  if (hour >= LATE_HOUR) return pick(["late"]);

  return pick(FRESH);
}
