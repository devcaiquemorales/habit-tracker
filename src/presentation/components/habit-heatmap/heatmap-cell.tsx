import { cn } from "@/presentation/lib/utils";

export type CellStatus =
  | "notExpected"
  | "expectedMissed"
  | "completed"
  | "neutralEmpty";

export type HeatmapCellSize = "default" | "comfortable" | "large";

const SIZE_CLASS: Record<HeatmapCellSize, string> = {
  default: "h-3 w-3",
  comfortable: "h-3.5 w-3.5 sm:h-4 sm:w-4",
  large: "h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5",
};

interface HeatmapCellProps {
  status: CellStatus;
  doneClass: string;
  missedClass: string;
  disabledClass: string;
  emptyDayClass: string;
  tooltip?: string;
  size?: HeatmapCellSize;
  /** Subtle emphasis for the current (latest) day in the timeline */
  isToday?: boolean;
}

export function HeatmapCell({
  status,
  doneClass,
  missedClass,
  disabledClass,
  emptyDayClass,
  tooltip,
  size = "default",
  isToday = false,
}: HeatmapCellProps) {
  const statusClass =
    status === "completed"
      ? doneClass
      : status === "expectedMissed"
        ? missedClass
        : status === "neutralEmpty"
          ? emptyDayClass
          : disabledClass;

  return (
    <div
      className={cn(
        "shrink-0 rounded-[2px]",
        SIZE_CLASS[size],
        statusClass,
        isToday && "ring-1 ring-white/25 ring-inset",
      )}
      title={tooltip}
    />
  );
}
