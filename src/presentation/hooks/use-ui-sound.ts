"use client";

import { useMemo } from "react";

import { playUiHaptic } from "@/presentation/lib/ui-haptics";
import { playClickSound } from "@/presentation/lib/ui-sound";

export function useUISound(): {
  playClickSound: typeof playClickSound;
  playUiHaptic: typeof playUiHaptic;
} {
  return useMemo(() => ({ playClickSound, playUiHaptic }), []);
}
