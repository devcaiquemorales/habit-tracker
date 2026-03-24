"use client";

import { type PointerEvent as ReactPointerEvent, useMemo, useRef } from "react";

const MOVE_THRESHOLD_PX = 10;
/** After a horizontal pan, ignore navigation clicks briefly (ghost taps). */
const SUPPRESS_NAVIGATION_MS = 500;

/**
 * Detects scroll intent on a habit card (vertical page scroll or horizontal
 * heatmap pan) so navigation / taps do not fire after a drag gesture.
 */
export function useHorizontalPanNavigationSuppression() {
  const phaseRef = useRef<"idle" | "tracking">("idle");
  const originRef = useRef({ x: 0, y: 0 });
  const sawScrollIntentRef = useRef(false);
  const suppressUntilRef = useRef(0);

  const panPointerProps = useMemo(
    () => ({
      onPointerDownCapture: (e: ReactPointerEvent<HTMLElement>) => {
        if (!e.isPrimary) return;
        phaseRef.current = "tracking";
        originRef.current = { x: e.clientX, y: e.clientY };
        sawScrollIntentRef.current = false;
      },
      onPointerMoveCapture: (e: ReactPointerEvent<HTMLElement>) => {
        if (phaseRef.current !== "tracking") return;
        const dx = e.clientX - originRef.current.x;
        const dy = e.clientY - originRef.current.y;
        if (
          Math.abs(dx) < MOVE_THRESHOLD_PX &&
          Math.abs(dy) < MOVE_THRESHOLD_PX
        ) {
          return;
        }
        /** Any clear drag (horizontal heatmap or vertical page scroll) suppresses tap navigation */
        sawScrollIntentRef.current = true;
        phaseRef.current = "idle";
      },
      onPointerUpCapture: () => {
        if (sawScrollIntentRef.current) {
          suppressUntilRef.current = Date.now() + SUPPRESS_NAVIGATION_MS;
        }
        phaseRef.current = "idle";
        sawScrollIntentRef.current = false;
      },
      onPointerCancelCapture: () => {
        phaseRef.current = "idle";
        sawScrollIntentRef.current = false;
      },
    }),
    [],
  );

  const shouldSuppressNavigation = () => Date.now() < suppressUntilRef.current;

  return { panPointerProps, shouldSuppressNavigation };
}
