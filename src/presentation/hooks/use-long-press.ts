"use client";

import {
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

const HOLD_MS = 450;
const MOVE_TOLERANCE_PX = 10;
/** Long enough to swallow the click the browser fires when the finger lifts. */
const SUPPRESS_CLICK_MS = 400;

/**
 * Fires after a steady hold and cancels the click that would follow it.
 * Sets `data-holding` directly so a press never re-renders the card.
 */
export function useLongPress(onLongPress: () => void) {
  const callback = useRef(onLongPress);
  useEffect(() => {
    callback.current = onLongPress;
  }, [onLongPress]);

  const press = useRef({
    timer: undefined as number | undefined,
    originX: 0,
    originY: 0,
    fired: false,
    suppressClickUntil: 0,
    element: null as HTMLElement | null,
  });

  return useMemo(() => {
    const cancel = () => {
      const state = press.current;
      window.clearTimeout(state.timer);
      state.timer = undefined;
      if (state.element) delete state.element.dataset.holding;
    };

    const release = () => {
      cancel();
      const state = press.current;
      if (state.fired) state.suppressClickUntil = Date.now() + SUPPRESS_CLICK_MS;
      state.fired = false;
    };

    return {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (!event.isPrimary || event.button !== 0) return;
        const state = press.current;
        state.element = event.currentTarget;
        state.originX = event.clientX;
        state.originY = event.clientY;
        state.fired = false;
        state.element.dataset.holding = "true";
        state.timer = window.setTimeout(() => {
          state.fired = true;
          cancel();
          callback.current();
        }, HOLD_MS);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const state = press.current;
        if (state.timer === undefined) return;
        const moved = Math.hypot(
          event.clientX - state.originX,
          event.clientY - state.originY,
        );
        if (moved > MOVE_TOLERANCE_PX) cancel();
      },
      onPointerUp: release,
      onPointerCancel: release,
      onPointerLeave: release,
      onContextMenu: (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
      },
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (Date.now() < press.current.suppressClickUntil) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
    };
  }, []);
}
