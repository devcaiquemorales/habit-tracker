import type { ColorVariant } from "@/presentation/components/habit-heatmap/color-variants";
import type { Schedule } from "@/presentation/components/habit-heatmap/schedule-types";

export interface MockHabit {
  id: string;
  name: string;
  colorVariant: ColorVariant;
  schedule: Schedule;
  streak: number;
  /** Mock only — whether the habit is marked done for the current calendar day */
  completedToday: boolean;
}

export const MOCK_HABITS: MockHabit[] = [
  {
    id: "gym",
    name: "Gym",
    colorVariant: "green",
    schedule: { type: "weeklyTarget", timesPerWeek: 4 },
    streak: 5,
    completedToday: true,
  },
  {
    id: "study",
    name: "Study",
    colorVariant: "blue",
    schedule: { type: "everyOtherDay" },
    streak: 3,
    completedToday: false,
  },
  {
    id: "cardio",
    name: "Cardio",
    colorVariant: "amber",
    schedule: { type: "daily" },
    streak: 12,
    completedToday: true,
  },
  {
    id: "meditation",
    name: "Meditation",
    colorVariant: "purple",
    schedule: { type: "flexible" },
    streak: 7,
    completedToday: false,
  },
];

export function getMockHabitById(id: string): MockHabit | undefined {
  return MOCK_HABITS.find((h) => h.id === id);
}
