import { notFound } from "next/navigation";

import { HabitDetailScreen } from "@/presentation/components/habit-detail/habit-detail-screen";

import { loadHabitDetail } from "../../lib/load-dashboard-habits";

interface HabitDetailPageProps {
  params: Promise<{ habitId: string }>;
}

export default async function HabitDetailPage({
  params,
}: HabitDetailPageProps) {
  const { habitId } = await params;
  const { habit, completedKeys } = await loadHabitDetail(habitId);

  if (!habit) {
    notFound();
  }

  const initialCompletedKeys = Array.from(completedKeys);

  return (
    <HabitDetailScreen habit={habit} initialCompletedKeys={initialCompletedKeys} />
  );
}
