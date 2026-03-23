import type { CellColorClasses, CellStatus } from "@/domain/types/heatmap";
import { cn } from "@/presentation/lib/utils";

export type { CellStatus };
export type HeatmapCellSize = "default" | "comfortable" | "large";

const SIZE_CLASS: Record<HeatmapCellSize, string> = {
  default: "h-3 w-3",
  comfortable: "h-3.5 w-3.5 sm:h-4 sm:w-4",
  large: "h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5",
};

interface HeatmapCellProps {
  status: CellStatus;
  cellColors: CellColorClasses;
  tooltip?: string;
  size?: HeatmapCellSize;
  /** Subtle emphasis for the current (latest) day in the timeline */
  isToday?: boolean;
  /** Selected in the detail “Update activity” strip */
  isStripSelected?: boolean;
  /** When set, cell is a button (real calendar day, not padding/future). */
  onActivate?: () => void;
  /** Accessible label when `onActivate` is set */
  selectDayLabel?: string;
}

export function HeatmapCell({
  status,
  cellColors,
  tooltip,
  size = "default",
  isToday = false,
  isStripSelected = false,
  onActivate,
  selectDayLabel,
}: HeatmapCellProps) {
  const statusClass =
    status === "monthPadding"
      ? cellColors.monthPadding
      : status === "completed"
        ? cellColors.done
        : status === "expectedMissed"
          ? cellColors.missed
          : status === "neutralEmpty"
            ? cellColors.emptyDay
            : cellColors.notExpected;

  const sharedClass = cn(
    "shrink-0 rounded-[2px]",
    SIZE_CLASS[size],
    statusClass,
    isToday && "ring-1 ring-white/25 ring-inset",
    isStripSelected && "ring-2 ring-white/70 ring-inset",
    onActivate && "cursor-pointer touch-manipulation",
  );

  if (onActivate) {
    return (
      <button
        type="button"
        className={cn(
          sharedClass,
          "border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
        )}
        title={tooltip}
        aria-label={selectDayLabel ?? tooltip ?? "Select day"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onActivate();
        }}
      />
    );
  }

  return (
    <div
      className={sharedClass}
      title={tooltip}
      aria-hidden={status === "monthPadding" ? true : undefined}
    />
  );
}
