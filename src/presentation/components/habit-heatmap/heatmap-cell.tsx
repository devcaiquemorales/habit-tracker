import { Lock } from "lucide-react";

import type { CellColorClasses, CellStatus } from "@/domain/types/heatmap";
import { cn } from "@/presentation/lib/utils";

export type { CellStatus };
export type HeatmapCellSize = "default" | "comfortable" | "large";

const SIZE_CLASS: Record<HeatmapCellSize, string> = {
  default: "h-3 w-3",
  comfortable: "h-3.5 w-3.5 sm:h-4 sm:w-4",
  large: "h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 tablet:h-5 tablet:w-5",
};

/** Dot sizes that sit centered inside a padding cell — one step below the cell size. */
const PADDING_DOT_CLASS: Record<HeatmapCellSize, string> = {
  default: "h-[3px] w-[3px]",
  comfortable: "h-1 w-1",
  large: "h-[5px] w-[5px]",
};

interface HeatmapCellProps {
  status: CellStatus;
  cellColors: CellColorClasses;
  tooltip?: string;
  size?: HeatmapCellSize;
  /** Subtle emphasis for the current (latest) day in the timeline */
  isToday?: boolean;
  /** Logged day after a 1–2 day gap — softer fill + thin ring */
  isRecovery?: boolean;
  /** Selected in the detail “Update activity” strip */
  isStripSelected?: boolean;
  /** When set, cell is a button (real calendar day, not padding/future). */
  onActivate?: () => void;
  /** Accessible label when `onActivate` is set */
  selectDayLabel?: string;
}

const LOCK_CLASS: Record<HeatmapCellSize, string> = {
  default: "size-2",
  comfortable: "size-2.5",
  large: "size-2.5 sm:size-3",
};

export function HeatmapCell({
  status,
  cellColors,
  tooltip,
  size = "default",
  isToday = false,
  isRecovery = false,
  isStripSelected = false,
  onActivate,
  selectDayLabel,
}: HeatmapCellProps) {
  // Week-alignment gaps: same footprint as a real cell, drawn as a tiny dot.
  if (status === "monthPadding") {
    return (
      <div
        aria-hidden
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          SIZE_CLASS[size],
        )}
      >
        <div
          className={cn(
            "rounded-full bg-foreground/[0.10]",
            PADDING_DOT_CLASS[size],
          )}
        />
      </div>
    );
  }

  const statusClass =
    status === "completed"
        ? cellColors.done
        : status === "guarded"
          ? "bg-foreground/[0.07]"
          : status === "expectedMissed"
          ? cellColors.missed
          : status === "neutralEmpty"
            ? cellColors.emptyDay
            : cellColors.notExpected;

  const ringClass = isStripSelected
    ? "ring-2 ring-foreground ring-inset"
    : isToday
      ? "ring-1 ring-inset ring-foreground/70"
      : "";

  const sharedClass = cn(
    "relative shrink-0 rounded-[3px]",
    SIZE_CLASS[size],
    statusClass,
    status === "completed" && isRecovery && "opacity-70",
    ringClass,
    onActivate && "cursor-pointer touch-manipulation",
  );

  const guardIcon =
    status === "guarded" ? (
      <Lock
        aria-hidden
        strokeWidth={3}
        className={cn(
          "absolute inset-0 m-auto text-foreground/70",
          LOCK_CLASS[size],
        )}
      />
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
        aria-label={selectDayLabel ?? tooltip ?? undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onActivate();
        }}
      >
        {guardIcon}
      </button>
    );
  }

  return (
    <div
      className={sharedClass}
      title={tooltip}
    >
      {guardIcon}
    </div>
  );
}
