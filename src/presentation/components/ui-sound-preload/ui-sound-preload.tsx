"use client";

import { useEffect } from "react";

import { preloadUiSounds } from "@/presentation/lib/ui-sound";

/** Warm-loads tap + success clips once on mount (no playback). */
export function UiSoundPreload() {
  useEffect(() => {
    preloadUiSounds();
  }, []);
  return null;
}
