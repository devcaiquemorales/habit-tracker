"use client";

import type { OptimisticLocalStore } from "convex/browser";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useMemo } from "react";

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import type { ColorVariant } from "@/domain/types/habit";
import type { Schedule } from "@/domain/types/schedule";
import { toActionResult } from "@/presentation/lib/convex-result";

type RawDashboard = NonNullable<FunctionReturnType<typeof api.dashboard.get>>;

export type HabitInput = {
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
};

function patchDashboard(
  store: OptimisticLocalStore,
  patch: (current: RawDashboard) => RawDashboard,
): void {
  for (const { args, value } of store.getAllQueries(api.dashboard.get)) {
    if (value) store.setQuery(api.dashboard.get, args, patch(value));
  }
}

function withLogKeys(
  current: RawDashboard,
  habitId: string,
  update: (keys: string[]) => string[],
): RawDashboard {
  return {
    ...current,
    logKeysRecord: {
      ...current.logKeysRecord,
      [habitId]: update(current.logKeysRecord[habitId] ?? []),
    },
  };
}

/** Every dashboard write, applied to the UI at once and rolled back by Convex on failure. */
export function useDashboardMutations() {
  const mark = useMutation(api.logs.mark);
  const unmark = useMutation(api.logs.unmark);
  const create = useMutation(api.habits.create);
  const update = useMutation(api.habits.update);
  const remove = useMutation(api.habits.remove);
  const reorder = useMutation(api.habits.reorder);
  const customize = useMutation(api.profiles.updateCustomization);

  return useMemo(() => {
    const markOptimistic = mark.withOptimisticUpdate((store, args) =>
      patchDashboard(store, (current) =>
        withLogKeys(current, args.habitId, (keys) =>
          keys.includes(args.logDate) ? keys : [...keys, args.logDate],
        ),
      ),
    );
    const unmarkOptimistic = unmark.withOptimisticUpdate((store, args) =>
      patchDashboard(store, (current) =>
        withLogKeys(current, args.habitId, (keys) =>
          keys.filter((key) => key !== args.logDate),
        ),
      ),
    );
    const createOptimistic = create.withOptimisticUpdate((store, args) =>
      patchDashboard(store, (current) => ({
        ...current,
        habits: [
          ...current.habits,
          {
            id: `temp-${crypto.randomUUID()}`,
            name: args.name,
            colorVariant: args.colorVariant,
            schedule: args.schedule,
            position: current.habits.length,
          },
        ],
      })),
    );
    const updateOptimistic = update.withOptimisticUpdate((store, args) =>
      patchDashboard(store, (current) => ({
        ...current,
        habits: current.habits.map((habit) =>
          habit.id === args.habitId
            ? {
                ...habit,
                name: args.name,
                colorVariant: args.colorVariant,
                schedule: args.schedule,
              }
            : habit,
        ),
      })),
    );
    const removeOptimistic = remove.withOptimisticUpdate((store, args) =>
      patchDashboard(store, (current) => ({
        ...current,
        habits: current.habits.filter((habit) => habit.id !== args.habitId),
      })),
    );
    const reorderOptimistic = reorder.withOptimisticUpdate((store, args) =>
      patchDashboard(store, (current) => {
        const byId = new Map(current.habits.map((habit) => [habit.id, habit]));
        const habits = args.orderedIds.flatMap((id) => byId.get(id) ?? []);
        return habits.length === current.habits.length
          ? { ...current, habits }
          : current;
      }),
    );
    const customizeOptimistic = customize.withOptimisticUpdate((store, args) =>
      patchDashboard(store, (current) => ({
        ...current,
        profile: {
          ...current.profile,
          displayName: args.displayName,
          motivationPhrase: args.motivationPhrase,
        },
      })),
    );

    return {
      markDay: (habitId: string, logDate: string) =>
        toActionResult(
          markOptimistic({ habitId: habitId as Id<"habits">, logDate }),
        ),
      unmarkDay: (habitId: string, logDate: string) =>
        toActionResult(
          unmarkOptimistic({ habitId: habitId as Id<"habits">, logDate }),
        ),
      createHabit: (input: HabitInput) =>
        toActionResult(createOptimistic(input)),
      updateHabit: (habitId: string, input: HabitInput) =>
        toActionResult(
          updateOptimistic({ habitId: habitId as Id<"habits">, ...input }),
        ),
      deleteHabit: (habitId: string) =>
        toActionResult(removeOptimistic({ habitId: habitId as Id<"habits"> })),
      reorderHabits: (orderedIds: string[]) =>
        toActionResult(
          reorderOptimistic({ orderedIds: orderedIds as Id<"habits">[] }),
        ),
      updateProfile: (displayName: string, motivationPhrase: string) =>
        toActionResult(customizeOptimistic({ displayName, motivationPhrase })),
    };
  }, [mark, unmark, create, update, remove, reorder, customize]);
}
