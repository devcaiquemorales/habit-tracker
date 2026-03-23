"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/presentation/components/ui/button";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

interface HabitDetailHeaderProps {
  habitName: string;
  onEdit: () => void;
}

export function HabitDetailHeader({
  habitName,
  onEdit,
}: HabitDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-20 -mx-4 bg-background/85 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/70 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto grid max-w-3xl grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
        <Link
          href="/"
          scroll={false}
          onClick={() => triggerInteractionFeedback()}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-white/75 transition-[transform,colors] duration-150 ease-out hover:text-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.96]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="min-w-0 truncate text-center text-lg leading-snug font-semibold tracking-tight text-white">
          {habitName}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 shrink-0 text-white/75 transition-transform duration-150 ease-out hover:bg-white/10 hover:text-white active:scale-[0.96]"
          aria-label="Edit habit"
          onClick={() => {
            triggerInteractionFeedback({ haptic: false });
            onEdit();
          }}
        >
          <Pencil className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </header>
  );
}
