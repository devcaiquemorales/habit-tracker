import { HabitDetailRoute } from "@/presentation/components/habit-detail/habit-detail-route";

interface HabitDetailPageProps {
  params: Promise<{ habitId: string }>;
}

export default async function HabitDetailPage({
  params,
}: HabitDetailPageProps) {
  const { habitId } = await params;
  return <HabitDetailRoute habitId={habitId} />;
}
