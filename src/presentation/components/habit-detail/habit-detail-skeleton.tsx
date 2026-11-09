"use client";

import { useI18n } from "@/presentation/lib/i18n/i18n-provider";

export function HabitDetailSkeleton() {
  const { t } = useI18n();
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-background pt-[env(safe-area-inset-top,0px)] pr-[calc(1rem+env(safe-area-inset-right,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] text-foreground"
      aria-busy="true"
      aria-label={t("loadingScreens.habit")}
    >
      <div className="flex items-center gap-3 pt-2">
        <div className="size-10 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="h-7 max-w-48 flex-1 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col gap-6">
        <div className="h-24 animate-pulse rounded-[1.25rem] bg-muted" />
        <div className="h-28 animate-pulse rounded-[1.25rem] bg-muted" />
        <div className="h-24 animate-pulse rounded-[1.25rem] bg-muted" />
      </div>
    </main>
  );
}
