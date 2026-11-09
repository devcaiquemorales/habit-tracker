"use client";

import type { MouseEvent } from "react";

import { cn } from "@/presentation/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T, event: MouseEvent<HTMLButtonElement>) => void;
  "aria-label": string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((option) => option.value === value);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "relative flex h-11 w-full rounded-lg bg-muted p-0.5 md:h-9",
        className,
      )}
    >
      {activeIndex >= 0 ? (
        <span
          aria-hidden
          className="absolute inset-y-0.5 left-0.5 rounded-md bg-background shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
          style={{
            width: `calc((100% - 0.25rem) / ${options.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={(event) => onChange(option.value, event)}
            className={cn(
              "relative min-w-0 flex-1 rounded-md px-1 text-[13px] leading-tight font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm",
              selected
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
