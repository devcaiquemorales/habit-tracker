import { notFound } from "next/navigation";

import { HabitDetailScreen } from "@/presentation/components/habit-detail/habit-detail-screen";
import { getMockHabitById } from "@/presentation/data/mock-habits";

interface HabitDetailPageProps {
  params: Promise<{ habitId: string }>;
}

export default async function HabitDetailPage({
  params,
}: HabitDetailPageProps) {
  const { habitId } = await params;
  const habit = getMockHabitById(habitId);

  if (!habit) {
    notFound();
  }

  return <HabitDetailScreen habit={habit} />;
}
