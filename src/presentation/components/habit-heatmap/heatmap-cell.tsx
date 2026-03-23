import type { CellColorClasses, CellStatus } from "@/domain/types/heatmap";
import { cn } from "@/presentation/lib/utils";

export type { CellStatus };
export type HeatmapCellSize = "default" | "comfortable" | "large";

const SIZE_CLASS: Record<HeatmapCellSize, string> = {
  default: "h-3 w-3",
  comfortable: "h-3.5 w-3.5 sm:h-4 sm:w-4",
  large: "h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5",
};

/** Tiny month boundary annotation (1st / last day); scales slightly with cell size */
const BOUNDARY_MARKER_TEXT: Record<HeatmapCellSize, string> = {
  default: "text-[5px]",
  comfortable: "text-[5px] sm:text-[5.5px]",
  large: "text-[5.5px] sm:text-[6px]",
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
  /** First/last calendar day of month — tiny top-left label, non-interactive */
  monthBoundaryLabel?: string;
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
  monthBoundaryLabel,
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
    "relative shrink-0 rounded-[2px]",
    SIZE_CLASS[size],
    statusClass,
    isToday && "ring-1 ring-white/25 ring-inset",
    isStripSelected && "ring-2 ring-white/70 ring-inset",
    onActivate && "cursor-pointer touch-manipulation",
  );

  const boundaryMarker =
    monthBoundaryLabel !== undefined && monthBoundaryLabel !== "" ? (
      <span
        className={cn(
          "pointer-events-none absolute top-px left-px z-[1] leading-none font-medium tabular-nums tracking-tight select-none",
          BOUNDARY_MARKER_TEXT[size],
          /** High-contrast on saturated cubes: light fill + tight dark halo (no heavy badge) */
          "text-white/95 [text-shadow:0_0_1px_rgb(0_0_0/_0.95),0_0.5px_1.5px_rgb(0_0_0/_0.75)]",
        )}
        aria-hidden
      >
        {monthBoundaryLabel}
      </span>
    ) : null;

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
      >
        {boundaryMarker}
      </button>
    );
  }

  return (
    <div
      className={sharedClass}
      title={tooltip}
      aria-hidden={status === "monthPadding" ? true : undefined}
    >
      {boundaryMarker}
    </div>
  );
}
