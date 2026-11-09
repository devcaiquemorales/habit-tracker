"use client";

import { NotificationSettings } from "@/presentation/components/notification-settings";
import { useDashboard } from "@/presentation/lib/dashboard-context";

import { CustomizationScreen } from "./customization-screen";

export function SettingsScreen() {
  const { data } = useDashboard();
  return (
    <CustomizationScreen
      initialDisplayName={data?.profile.displayName ?? ""}
      initialMotivationPhrase={data?.profile.motivationPhrase ?? ""}
      userEmail={data?.profile.email}
    >
      <NotificationSettings />
    </CustomizationScreen>
  );
}
