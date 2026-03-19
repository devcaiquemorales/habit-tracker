import { ChevronRightIcon, Flame } from "lucide-react";

interface HabitCardHeaderProps {
  name: string;
  indicatorClass: string;
  streak?: number;
  streakClass?: string;
}

export function HabitCardHeader({
  name,
  indicatorClass,
  streak,
  streakClass,
}: HabitCardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${indicatorClass}`} />
        <span className="text-sm font-medium text-white/90">{name}</span>
        {streak !== undefined && streak > 0 && (
          <span
            className={`flex items-center gap-1.5 text-sm ${streakClass ?? "text-white/60"}`}
          >
            <Flame className="h-4 w-4 shrink-0" aria-hidden />
            <span>{streak}</span>
          </span>
        )}
      </div>
      <span
        className="-mr-2 flex min-h-[44px] min-w-[44px] items-center justify-center text-white/40"
        aria-hidden
      >
        <ChevronRightIcon className="h-4 w-4" />
      </span>
    </div>
  );
}
