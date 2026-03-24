import { HomeDashboardClient } from "@/presentation/components/home-dashboard-client";

/**
 * Sync shell: dashboard data loads client-side via SWR so returning from habit
 * detail does not block on a full RSC data fetch.
 */
export default function HomePage() {
  return <HomeDashboardClient />;
}
