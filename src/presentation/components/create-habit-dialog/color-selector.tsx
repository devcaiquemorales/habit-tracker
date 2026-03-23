"use client";

import type { ColorVariant } from "@/presentation/components/habit-heatmap/color-variants";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

const OPTIONS: { id: ColorVariant; swatch: string; label: string }[] = [
  { id: "green", swatch: "bg-emerald-500", label: "Green" },
  { id: "blue", swatch: "bg-blue-500", label: "Blue" },
  { id: "amber", swatch: "bg-amber-500", label: "Amber" },
  { id: "purple", swatch: "bg-purple-500", label: "Purple" },
];

interface ColorSelectorProps {
  value: ColorVariant;
  onChange: (value: ColorVariant) => void;
}

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
  return (
    <div
      className="flex flex-wrap gap-3"
      role="radiogroup"
      aria-label="Habit color"
    >
      {OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.label}
            onClick={() => {
              triggerInteractionFeedback();
              onChange(opt.id);
            }}
            className={cn(
              "size-9 shrink-0 rounded-full transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              opt.swatch,
              selected
                ? "ring-2 ring-white/70 ring-offset-2 ring-offset-background"
                : "ring-1 ring-white/15 hover:ring-white/30",
            )}
          />
        );
      })}
    </div>
  );
}
