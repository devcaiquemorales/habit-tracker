"use client";

import { useTheme } from "next-themes";
import type { MouseEvent } from "react";
import { useSyncExternalStore } from "react";

import { SegmentedControl } from "@/presentation/components/ui/segmented-control";
import { useI18n } from "@/presentation/lib/i18n/i18n-provider";
import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";
import { revealTheme } from "@/presentation/lib/reveal-theme";

type ThemePreference = "light" | "dark" | "system";

const subscribeNoop = () => () => {};

export function ThemeSelector() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  // The stored theme is only known in the browser.
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const handleChange = (
    next: ThemePreference,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    triggerInteractionFeedback({ haptic: false });
    const rect = event.currentTarget.getBoundingClientRect();
    // `detail === 0` means keyboard activation: there is no pointer position.
    const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
    const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;
    revealTheme(() => setTheme(next), x, y);
  };

  return (
    <SegmentedControl<ThemePreference>
      aria-label={t("settings.themeAria")}
      value={hydrated ? ((theme as ThemePreference) ?? "system") : "system"}
      onChange={handleChange}
      options={[
        { value: "light", label: t("settings.themeLight") },
        { value: "dark", label: t("settings.themeDark") },
        { value: "system", label: t("settings.themeSystem") },
      ]}
    />
  );
}
