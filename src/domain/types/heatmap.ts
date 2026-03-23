export type CellStatus =
  | "notExpected"
  | "expectedMissed"
  | "completed"
  | "neutralEmpty"
  /** Week grid placeholder: no calendar date for this month */
  | "monthPadding";

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

/** Tailwind class bundles passed through the heatmap column hierarchy. */
export interface CellColorClasses {
  done: string;
  missed: string;
  notExpected: string;
  emptyDay: string;
  monthPadding: string;
}
