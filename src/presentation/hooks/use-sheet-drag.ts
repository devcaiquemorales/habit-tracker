"use client";

import { type RefObject, useEffect, useRef } from "react";

const DIRECTION_LOCK_PX = 6;
const DISMISS_FRACTION = 0.28;
const DISMISS_VELOCITY_PX_PER_MS = 0.5;
const NOT_DRAGGABLE = "input,textarea,select,button,a,label";

type Options = {
  surfaceRef: RefObject<HTMLElement | null>;
  overlayRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
};

/**
 * Lets a bottom sheet follow the finger and close when pulled down. Writes styles
 * directly so a drag never re-renders React.
 */
export function useSheetDrag({ surfaceRef, overlayRef, onDismiss }: Options) {
  // Kept in a ref so a live data update mid-drag cannot restart the gesture.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    let start: { x: number; y: number; time: number } | null = null;
    let dragging = false;
    let offset = 0;

    const applyOffset = (next: number) => {
      offset = Math.max(0, next);
      surface.style.transform = `translate3d(0, ${offset}px, 0)`;
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(
          1 - Math.min(1, offset / surface.offsetHeight),
        );
      }
    };

    const begin = (target: EventTarget | null, x: number, y: number) => {
      if (!(target instanceof Element) || target.closest(NOT_DRAGGABLE)) return;
      // A scrolled list keeps the gesture until it is back at the top.
      const scroller = target.closest("[data-sheet-scroll]");
      if (scroller && scroller.scrollTop > 0) return;
      start = { x, y, time: performance.now() };
      dragging = false;
      delete surface.dataset.settling;
    };

    /** Returns true while this gesture is moving the sheet. */
    const move = (x: number, y: number): boolean => {
      if (!start) return false;
      const dy = y - start.y;
      if (!dragging) {
        if (Math.hypot(x - start.x, dy) < DIRECTION_LOCK_PX) return false;
        if (dy <= 0 || Math.abs(x - start.x) > dy) {
          start = null;
          return false;
        }
        dragging = true;
      }
      applyOffset(dy);
      return true;
    };

    const end = () => {
      if (!start || !dragging) {
        start = null;
        return;
      }
      const velocity = offset / (performance.now() - start.time);
      start = null;
      dragging = false;

      if (
        offset > surface.offsetHeight * DISMISS_FRACTION ||
        velocity > DISMISS_VELOCITY_PX_PER_MS
      ) {
        dismissRef.current();
        return;
      }

      surface.dataset.settling = "true";
      surface.style.transform = "";
      if (overlayRef.current) overlayRef.current.style.opacity = "";
      offset = 0;
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (event.touches.length === 1 && touch) {
        begin(event.target, touch.clientX, touch.clientY);
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch && move(touch.clientX, touch.clientY)) event.preventDefault();
    };
    const onMouseMove = (event: MouseEvent) => {
      move(event.clientX, event.clientY);
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      end();
    };
    const onMouseDown = (event: MouseEvent) => {
      begin(event.target, event.clientX, event.clientY);
      if (!start) return;
      event.preventDefault();
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    surface.addEventListener("touchstart", onTouchStart, { passive: true });
    // Non-passive: preventDefault keeps the page from scrolling under the drag.
    surface.addEventListener("touchmove", onTouchMove, { passive: false });
    surface.addEventListener("touchend", end);
    surface.addEventListener("touchcancel", end);
    surface.addEventListener("mousedown", onMouseDown);

    return () => {
      surface.removeEventListener("touchstart", onTouchStart);
      surface.removeEventListener("touchmove", onTouchMove);
      surface.removeEventListener("touchend", end);
      surface.removeEventListener("touchcancel", end);
      surface.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [surfaceRef, overlayRef]);
}
