"use client";

import { useEffect } from "react";
import useSWR, { mutate } from "swr";

import { CreateHabitDialog } from "@/presentation/components/create-habit-dialog";
import { HomeHeader } from "@/presentation/components/home-header";
import {
  DASHBOARD_SWR_KEY,
  fetchDashboardJson,
} from "@/presentation/lib/dashboard-swr";

import { HabitCardWithHeatmap } from "./habit-card-with-heatmap";

export function HomeDashboardClient() {
  const { data, error, isLoading } = useSWR(
    DASHBOARD_SWR_KEY,
    fetchDashboardJson,
    {
      revalidateOnMount: false,
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    },
  );

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      void mutate(DASHBOARD_SWR_KEY, undefined, { revalidate: true });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(schedule, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(schedule, 0);
    }

    return () => {
      if (idleId !== undefined && typeof window !== "undefined") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const profile = data?.profile;
  const habits = data?.habits ?? [];
  const logKeysRecord = data?.logKeysRecord ?? {};

  const showEmptyState = !isLoading && habits.length === 0 && !error;
  const showSkeleton = isLoading && !data;

  return (
    <>
      <main className="flex flex-col pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        <div
          className="mx-auto flex w-full flex-col gap-6 pb-6 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] md:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] md:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] lg:max-w-4xl lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] xl:pl-[calc(2.5rem+env(safe-area-inset-left,0px))] xl:pr-[calc(2.5rem+env(safe-area-inset-right,0px))]"
        >
          {profile ? (
            <HomeHeader
              userName={profile.displayName}
              initialMotivationPhrase={profile.motivationPhrase}
            />
          ) : showSkeleton ? (
            <div className="flex flex-col gap-2" aria-hidden>
              <div className="h-8 w-48 max-w-full animate-pulse rounded-md bg-white/10" />
              <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-white/5" />
            </div>
          ) : (
            <HomeHeader />
          )}

          <div className="flex flex-col gap-4">
            {error ? (
              <p className="text-base leading-relaxed text-red-400/90">
                Could not load your habits. Pull to refresh or try again.
              </p>
            ) : showSkeleton ? (
              <div className="flex flex-col gap-4" aria-hidden>
                <div className="h-40 w-full animate-pulse rounded-xl bg-white/5" />
                <div className="h-40 w-full animate-pulse rounded-xl bg-white/5" />
              </div>
            ) : showEmptyState ? (
              <p className="text-base leading-relaxed text-white/45">
                No habits yet. Tap the button below to add your first one and
                start your heatmap.
              </p>
            ) : (
              habits.map((habit) => (
                <HabitCardWithHeatmap
                  key={habit.id}
                  habit={habit}
                  completedKeys={logKeysRecord[habit.id] ?? []}
                />
              ))
            )}
          </div>
        </div>
      </main>
      <CreateHabitDialog />
    </>
  );
}
