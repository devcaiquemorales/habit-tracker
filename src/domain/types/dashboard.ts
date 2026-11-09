import type { Habit } from "./habit";

export type DashboardProfile = {
  displayName: string;
  motivationPhrase: string;
  timezone: string;
  locale: "en" | "pt";
  email: string;
};

/** What the signed-in screens render: habits with derived streaks plus raw log days. */
export type DashboardJson = {
  profile: DashboardProfile;
  habits: Habit[];
  logKeysRecord: Record<string, string[]>;
};
