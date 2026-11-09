import { HomeDashboardClient } from "@/presentation/components/home-dashboard-client";

/**
 * Sync shell: dashboard data comes from the live Convex subscription, so returning from habit
 * detail does not block on a full RSC data fetch.
 */
export default function HomePage() {
  return <HomeDashboardClient />;
}
