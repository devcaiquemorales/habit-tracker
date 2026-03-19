import { useLayoutEffect, useRef } from "react";

/**
 * After layout on mount, scrolls the element to the far right (newest content).
 * Runs once only so later re-renders (e.g. selection) do not reset scroll.
 */
export function useScrollToFarRight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, []);
  return ref;
}
