import type { Habit } from "@/domain/types/habit";

export const MOCK_HABITS: Habit[] = [
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

export function getMockHabitById(id: string): Habit | undefined {
  return MOCK_HABITS.find((h) => h.id === id);
}
