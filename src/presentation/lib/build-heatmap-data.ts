import { toLocalDateKey } from "@/domain/types/date-key";
import type {
  HeatmapData,
  HeatmapDayCell,
  HeatmapMonthData,
} from "@/domain/types/heatmap";
import type { AppLocale } from "@/lib/app-locale";
import { formatHeatmapMonthLabel } from "@/presentation/lib/i18n/format";

function localMidnight(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

function startOfLocalMonth(d: Date): Date {
  return localMidnight(d.getFullYear(), d.getMonth(), 1);
}

function addLocalMonths(monthStart: Date, delta: number): Date {
  const y = monthStart.getFullYear();
  const m = monthStart.getMonth() + delta;
  const ny = y + Math.floor(m / 12);
  const nm = ((m % 12) + 12) % 12;
  return localMidnight(ny, nm, 1);
}

function lastLocalDayOfMonth(year: number, month: number): Date {
  return localMidnight(year, month + 1, 0);
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

function buildWeekGridForLocalMonth(
  year: number,
  month: number,
  today: Date,
  completedKeys: ReadonlySet<string>,
): HeatmapDayCell[][] {
  const first = localMidnight(year, month, 1);
  const lastDay = lastLocalDayOfMonth(year, month).getDate();
  const tt = today.getTime();
  const leadingPad = first.getDay(); // local weekday (Sun=0 … Sat=6)
  const cells: HeatmapDayCell[] = [];

  for (let i = 0; i < leadingPad; i += 1) {
    cells.push({ date: null, done: 0 });
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const cellDate = localMidnight(year, month, day);
    const t = cellDate.getTime();
    const key = toLocalDateKey(cellDate);
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

/** Exactly 12 calendar months ending in the current month (local timezone), oldest → newest */
export function buildHeatmapDataFromCompletedKeys(
  completedKeys: ReadonlySet<string>,
  now: Date = new Date(),
  locale: AppLocale = "en",
): HeatmapData {
  const today = localMidnight(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const currentMonthStart = startOfLocalMonth(today);
  const rangeStart = addLocalMonths(currentMonthStart, -11);
  const rangeEnd = lastLocalDayOfMonth(
    today.getFullYear(),
    today.getMonth(),
  );

  const months: HeatmapMonthData[] = [];
  let cursor = new Date(rangeStart.getTime());
  let prevYear: number | undefined;

  for (let i = 0; i < 12; i += 1) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const { label, prevYearForNext } = formatMonthLabel(y, m, prevYear, locale);
    prevYear = prevYearForNext;

    months.push({
      id: `${y}-${pad2(m + 1)}`,
      label,
      weeks: buildWeekGridForLocalMonth(y, m, today, completedKeys),
    });

    cursor = addLocalMonths(cursor, 1);
  }

  return {
    months,
    rangeStart: new Date(rangeStart.getTime()),
    rangeEnd: new Date(rangeEnd.getTime()),
    today: new Date(today.getTime()),
  };
}
