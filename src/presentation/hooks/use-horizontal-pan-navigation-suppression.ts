"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
} from "react";

const MOVE_THRESHOLD_PX = 10;
/** After a horizontal pan, ignore navigation clicks briefly (ghost taps). */
const SUPPRESS_NAVIGATION_MS = 500;

/**
 * Detects horizontal drag intent on a heatmap (or similar) region so parent
 * navigation / press feedback does not fire after the user scrolls sideways.
 */
export function useHorizontalPanNavigationSuppression() {
  const phaseRef = useRef<"idle" | "tracking">("idle");
  const originRef = useRef({ x: 0, y: 0 });
  const sawHorizontalPanRef = useRef(false);
  const suppressUntilRef = useRef(0);

  const panPointerProps = useMemo(
    () => ({
      onPointerDownCapture: (e: ReactPointerEvent<HTMLElement>) => {
        if (!e.isPrimary) return;
        phaseRef.current = "tracking";
        originRef.current = { x: e.clientX, y: e.clientY };
        sawHorizontalPanRef.current = false;
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
        if (Math.abs(dx) > Math.abs(dy)) {
          sawHorizontalPanRef.current = true;
        }
        phaseRef.current = "idle";
      },
      onPointerUpCapture: () => {
        if (sawHorizontalPanRef.current) {
          suppressUntilRef.current = Date.now() + SUPPRESS_NAVIGATION_MS;
        }
        phaseRef.current = "idle";
        sawHorizontalPanRef.current = false;
      },
      onPointerCancelCapture: () => {
        phaseRef.current = "idle";
        sawHorizontalPanRef.current = false;
      },
    }),
    [],
  );

  const shouldSuppressNavigation = () => Date.now() < suppressUntilRef.current;

  return { panPointerProps, shouldSuppressNavigation };
}
