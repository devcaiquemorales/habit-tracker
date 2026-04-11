import { toLocalDateKey } from "@/domain/types/date-key";
import type { CellColorClasses, HeatmapDayCell } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { isDayExpected, isWeeklyTargetSchedule } from "@/domain/types/schedule";
import type { AppLocale } from "@/lib/app-locale";
import { formatUtcDateKeyLong } from "@/presentation/lib/i18n/format";
import type { TranslateFn } from "@/presentation/lib/i18n/messages";

import { HeatmapCell, type HeatmapCellSize } from "./heatmap-cell";

const EMPTY_BOUNDARY_LABELS = new Map<string, string>();

interface HeatmapColumnProps {
  week: HeatmapDayCell[];
  schedule: Schedule;
  cellColors: CellColorClasses;
  cellSize?: HeatmapCellSize;
  today: Date;
  todayHighlightKey: string;
  completionOverrides?: Set<string>;
  removalOverrides?: Set<string>;
  /** When set, past/today cells (not padding, not future) call this with their UTC date key. */
  onDateSelect?: (dateKey: string) => void;
  /** Highlights the cell that matches the Update activity selection. */
  selectedDateKey?: string | null;
  /** Month start/end tiny labels keyed by UTC `YYYY-MM-DD` */
  boundaryLabelByDateKey?: ReadonlyMap<string, string>;
  translate: TranslateFn;
  locale: AppLocale;
}

function tooltipForStatus(
  status: "notExpected" | "expectedMissed" | "completed" | "neutralEmpty",
  t: TranslateFn,
): string {
  switch (status) {
    case "completed":
      return t("heatmap.completed");
    case "expectedMissed":
      return t("heatmap.missedExpected");
    case "neutralEmpty":
      return t("heatmap.notLogged");
    case "notExpected":
      return t("heatmap.notScheduled");
    default:
      return "";
  }
}

export function HeatmapColumn({
  week,
  schedule,
  cellColors,
  cellSize = "default",
  today,
  todayHighlightKey,
  completionOverrides,
  removalOverrides,
  onDateSelect,
  selectedDateKey,
  boundaryLabelByDateKey = EMPTY_BOUNDARY_LABELS,
  translate,
  locale,
}: HeatmapColumnProps) {
  const tt = today.getTime();
  const weekly = isWeeklyTargetSchedule(schedule);

  return (
    <div className="flex flex-col gap-[2px]">
      {week.map((cell, dayIndex) => {
        if (cell.date === null) {
          // Renders as a tiny dot — see HeatmapCell's monthPadding branch.
          return (
            <HeatmapCell
              key={dayIndex}
              status="monthPadding"
              cellColors={cellColors}
              size={cellSize}
              isToday={false}
            />
          );
        }

        const dateKey = toLocalDateKey(cell.date);
        const cellTimeMs = cell.date.getTime();
        const monthBoundaryLabel = boundaryLabelByDateKey.get(dateKey);

        if (cellTimeMs > tt) {
          return (
            <HeatmapCell
              key={dayIndex}
              status="notExpected"
              cellColors={cellColors}
              tooltip={translate("heatmap.future")}
              size={cellSize}
              isToday={false}
              monthBoundaryLabel={monthBoundaryLabel}
            />
          );
        }

        const forcedComplete = completionOverrides?.has(dateKey) ?? false;
        const forcedIncomplete = removalOverrides?.has(dateKey) ?? false;
        /** Explicit removal must win over forced completion (e.g. clear “today” or mock data). */
        const effectiveDone = forcedIncomplete
          ? 0
          : forcedComplete
            ? 1
            : cell.done;

        const onActivate =
          onDateSelect !== undefined
            ? () => {
                onDateSelect(dateKey);
              }
            : undefined;
        const isStripSelected = selectedDateKey === dateKey;
        const selectDayLabel = translate("heatmap.selectDayAria", {
          date: formatUtcDateKeyLong(dateKey, locale),
        });

        /** Logs-only schedules: cell color follows habit_logs, not fixed weekdays. */
        const logDrivenHeatmap = weekly || schedule.type === "flexible";

        if (logDrivenHeatmap) {
          const status = effectiveDone > 0 ? "completed" : "neutralEmpty";
          return (
            <HeatmapCell
              key={dayIndex}
              status={status}
              cellColors={cellColors}
              tooltip={
                status === "completed"
                  ? translate("heatmap.completed")
                  : translate("heatmap.notLogged")
              }
              size={cellSize}
              isToday={dateKey === todayHighlightKey}
              isStripSelected={isStripSelected}
              onActivate={onActivate}
              selectDayLabel={selectDayLabel}
              monthBoundaryLabel={monthBoundaryLabel}
            />
          );
        }

        const isExpected = isDayExpected(schedule, cell.date);
        const status = forcedIncomplete
          ? isExpected
            ? "expectedMissed"
            : "notExpected"
          : forcedComplete
            ? "completed"
            : isExpected
              ? effectiveDone > 0
                ? "completed"
                : "expectedMissed"
              : "notExpected";

        return (
          <HeatmapCell
            key={dayIndex}
            status={status}
            cellColors={cellColors}
            tooltip={tooltipForStatus(status, translate)}
            size={cellSize}
            isToday={dateKey === todayHighlightKey}
            isStripSelected={isStripSelected}
            onActivate={onActivate}
            selectDayLabel={selectDayLabel}
            monthBoundaryLabel={monthBoundaryLabel}
          />
        );
      })}
    </div>
  );
}
