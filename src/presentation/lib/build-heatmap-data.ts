import { toUtcDateKey } from "@/domain/types/date-key";
import type {
  HeatmapData,
  HeatmapDayCell,
  HeatmapMonthData,
} from "@/domain/types/heatmap";
import type { AppLocale } from "@/lib/app-locale";
import { formatHeatmapMonthLabel } from "@/presentation/lib/i18n/format";

function utcMidnight(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function startOfUtcMonth(d: Date): Date {
  return utcMidnight(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

function addUtcMonths(monthStart: Date, delta: number): Date {
  const y = monthStart.getUTCFullYear();
  const m = monthStart.getUTCMonth() + delta;
  const ny = y + Math.floor(m / 12);
  const nm = ((m % 12) + 12) % 12;
  return utcMidnight(ny, nm, 1);
}

function lastUtcDayOfMonth(year: number, month: number): Date {
  return utcMidnight(year, month + 1, 0);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatMonthLabel(
  year: number,
  month: number,
  prevYear: number | undefined,
  locale: AppLocale,
): { label: string; prevYearForNext: number } {
  const includeYear = prevYear !== undefined && year !== prevYear;
  const label = formatHeatmapMonthLabel(year, month, locale, includeYear);
  return { label, prevYearForNext: year };
}

function buildWeekGridForUtcMonth(
  year: number,
  month: number,
  today: Date,
  completedKeys: ReadonlySet<string>,
): HeatmapDayCell[][] {
  const first = utcMidnight(year, month, 1);
  const lastDay = lastUtcDayOfMonth(year, month).getUTCDate();
  const tt = today.getTime();
  const leadingPad = first.getUTCDay();
  const cells: HeatmapDayCell[] = [];

  for (let i = 0; i < leadingPad; i += 1) {
    cells.push({ date: null, done: 0 });
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const cellDate = utcMidnight(year, month, day);
    const t = cellDate.getTime();
    const key = toUtcDateKey(cellDate);
    const done = t > tt ? 0 : completedKeys.has(key) ? 1 : 0;
    cells.push({
      date: new Date(cellDate.getTime()),
      done,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, done: 0, trailing: true });
  }

  const weeks: HeatmapDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

/** Exactly 12 calendar months ending in the current month (UTC), oldest → newest */
export function buildHeatmapDataFromCompletedKeys(
  completedKeys: ReadonlySet<string>,
  now: Date = new Date(),
  locale: AppLocale = "en",
): HeatmapData {
  const today = utcMidnight(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  const currentMonthStart = startOfUtcMonth(today);
  const rangeStart = addUtcMonths(currentMonthStart, -11);
  const rangeEnd = lastUtcDayOfMonth(
    today.getUTCFullYear(),
    today.getUTCMonth(),
  );

  const months: HeatmapMonthData[] = [];
  let cursor = new Date(rangeStart.getTime());
  let prevYear: number | undefined;

  for (let i = 0; i < 12; i += 1) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth();
    const { label, prevYearForNext } = formatMonthLabel(y, m, prevYear, locale);
    prevYear = prevYearForNext;

    months.push({
      id: `${y}-${pad2(m + 1)}`,
      label,
      weeks: buildWeekGridForUtcMonth(y, m, today, completedKeys),
    });

    cursor = addUtcMonths(cursor, 1);
  }

  return {
    months,
    rangeStart: new Date(rangeStart.getTime()),
    rangeEnd: new Date(rangeEnd.getTime()),
    today: new Date(today.getTime()),
  };
}
