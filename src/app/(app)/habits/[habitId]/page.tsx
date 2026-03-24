import { notFound } from "next/navigation";

import { getServerAppLocale } from "@/lib/get-server-app-locale";
import { HabitDetailScreen } from "@/presentation/components/habit-detail/habit-detail-screen";
import { buildHeatmapDataFromCompletedKeys } from "@/presentation/lib/build-heatmap-data";

import { loadHabitDetail } from "../../lib/load-dashboard-habits";

interface HabitDetailPageProps {
  params: Promise<{ habitId: string }>;
}

export default async function HabitDetailPage({
  params,
}: HabitDetailPageProps) {
  const { habitId } = await params;
  const { habit, completedKeys } = await loadHabitDetail(habitId);
  const locale = await getServerAppLocale();

  if (!habit) {
    notFound();
  }

  const heatmapData = buildHeatmapDataFromCompletedKeys(
    completedKeys,
    new Date(),
    locale,
  );

  return <HabitDetailScreen habit={habit} heatmapData={heatmapData} />;
}
