import { toLocalDateKey } from "@/domain/types/date-key";
import type { CellColorClasses, HeatmapDayCell } from "@/domain/types/heatmap";
import type { Schedule } from "@/domain/types/schedule";
import { isDayExpected, isWeeklyTargetSchedule } from "@/domain/types/schedule";
import type { AppLocale } from "@/lib/app-locale";
import { formatUtcDateKeyLong } from "@/presentation/lib/i18n/format";
import type { TranslateFn } from "@/presentation/lib/i18n/messages";

import { HeatmapCell, type HeatmapCellSize } from "./heatmap-cell";

interface HeatmapColumnProps {
  week: HeatmapDayCell[];
  schedule: Schedule;
  cellColors: CellColorClasses;
  cellSize?: HeatmapCellSize;
  today: Date;
  todayHighlightKey: string;
  /** When set, past/today cells (not padding, not future) call this with their local `YYYY-MM-DD` key. */
  onDateSelect?: (dateKey: string) => void;
  /** Highlights the cell that matches the Update activity selection. */
  selectedDateKey?: string | null;
  /** Month start/end tiny labels keyed by local `YYYY-MM-DD` */
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
  onDateSelect,
  selectedDateKey,
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

        if (cellTimeMs > tt) {
          return (
            <HeatmapCell
              key={dayIndex}
              status="notExpected"
              cellColors={cellColors}
              tooltip={translate("heatmap.future")}
              size={cellSize}
              isToday={false}
            />
          );
        }

        const effectiveDone = cell.done;

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
              isRecovery={Boolean(
                cell.recovery && effectiveDone > 0 && status === "completed",
              )}
              isStripSelected={isStripSelected}
              onActivate={onActivate}
              selectDayLabel={selectDayLabel}
            />
          );
        }

        const isToday = dateKey === todayHighlightKey;
        const status =
          effectiveDone > 0
            ? "completed"
            : !isDayExpected(schedule, cell.date)
              ? "notExpected"
              : isToday
                ? "neutralEmpty" // Not missed until the day is over.
                : "expectedMissed";

        return (
          <HeatmapCell
            key={dayIndex}
            status={status}
            cellColors={cellColors}
            tooltip={tooltipForStatus(status, translate)}
            size={cellSize}
            isToday={dateKey === todayHighlightKey}
            isRecovery={Boolean(
              cell.recovery && effectiveDone > 0 && status === "completed",
            )}
            isStripSelected={isStripSelected}
            onActivate={onActivate}
            selectDayLabel={selectDayLabel}
          />
        );
      })}
    </div>
  );
}
