import type { Habit } from "@/domain/types/habit";
import {
  getHomeProfile,
  type HomeProfileResolved,
  listHabitsWithLogsForUser,
} from "@/infrastructure/repositories";
import { createServerSupabaseClient } from "@/infrastructure/supabase/server";

export type DashboardPayload = {
  profile: HomeProfileResolved;
  habits: Habit[];
  logKeysByHabitId: Map<string, Set<string>>;
};

const emptyDashboard = (): DashboardPayload => ({
  profile: { displayName: "there", motivationPhrase: "" },
  habits: [],
  logKeysByHabitId: new Map(),
});

/**
 * Loads dashboard data (cookies / Supabase SSR). Safe to call from Route Handlers
 * and RSC; not wrapped in React `cache()`.
 */
export async function getDashboardPayload(): Promise<DashboardPayload> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyDashboard();
  }

  const profile = await getHomeProfile(supabase, user);
  const { habits, logKeysByHabitId } = await listHabitsWithLogsForUser(
    supabase,
    user.id,
  );

  return { profile, habits, logKeysByHabitId };
}
