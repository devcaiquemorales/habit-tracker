"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { cn } from "@/presentation/lib/utils";

export const AddHabitFAB = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(function AddHabitFAB({ className, onClick, ...props }, ref) {
  const { t } = useI18n();
  const label = t("addHabitFab.aria");
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "fixed z-40 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[transform,filter] duration-150 ease-out hover:scale-105 hover:brightness-110 active:scale-[0.97]",
        /* Mobile: base margin + safe area (gesture bar / curved corners). */
        "right-[calc(1.25rem+env(safe-area-inset-right,0px))] bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))]",
        /* Desktop / tablet: larger float, still respects safe area (e.g. iPad). */
        "md:right-[calc(2rem+env(safe-area-inset-right,0px))] md:bottom-[calc(2rem+env(safe-area-inset-bottom,0px))] md:h-14 md:w-14",
        className,
      )}
      aria-label={label}
      title={label}
      {...props}
      onClick={(e) => {
        triggerInteractionFeedback();
        onClick?.(e);
      }}
    >
      <Plus className="h-6 w-6" aria-hidden />
    </button>
  );
});
