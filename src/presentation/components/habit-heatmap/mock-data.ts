export interface HeatmapDayCell {
  /** `null` = leading/trailing padding so the month aligns to Sun–Sat weeks */
  date: Date | null;
  /**
   * Mock completion (0/1) when `date` is set and `date <= today`;
   * otherwise `0` (ignored for padding/future).
   */
  done: number;
}

export interface HeatmapMonthData {
  /** Stable id e.g. `2025-04` */
  id: string;
  /** Abbreviated month label; year appended when calendar year changes vs previous month */
  label: string;
  /** Week columns (Sun→Sat); each row has exactly 7 cells */
  weeks: HeatmapDayCell[][];
}

export interface HeatmapData {
  months: HeatmapMonthData[];
  /** First day of the 12-month window (UTC), 1st of month */
  rangeStart: Date;
  /** Last day of the **current** calendar month (UTC), inclusive */
  rangeEnd: Date;
  /** UTC midnight “today” when generated */
  today: Date;
}

function mockDoneBitFromUtcDate(d: Date): number {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  let n = y * 1664525 + (m + 1) * 1013904223 + day * 97;
  n ^= n << 13;
  n ^= n >>> 17;
  n ^= n << 5;
  return (n >>> 0) & 1;
}

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

const EN_MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatMonthLabel(
  year: number,
  month: number,
  prevYear: number | undefined,
): { label: string; prevYearForNext: number } {
  const short = EN_MONTH_SHORT[month];
  const label =
    prevYear !== undefined && year !== prevYear ? `${short} ${year}` : short;
  return { label, prevYearForNext: year };
}

function buildWeekGridForUtcMonth(
  year: number,
  month: number,
  today: Date,
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
    cells.push({
      date: new Date(cellDate.getTime()),
      done: t > tt ? 0 : mockDoneBitFromUtcDate(cellDate),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, done: 0 });
  }

  const weeks: HeatmapDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
}

/** Exactly 12 calendar months ending in the current month (UTC), oldest → newest */
function generateHeatmapData(): HeatmapData {
  const now = new Date();
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
    const { label, prevYearForNext } = formatMonthLabel(y, m, prevYear);
    prevYear = prevYearForNext;

    months.push({
      id: `${y}-${pad2(m + 1)}`,
      label,
      weeks: buildWeekGridForUtcMonth(y, m, today),
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

export const MOCK_HEATMAP_DATA: HeatmapData = generateHeatmapData();
