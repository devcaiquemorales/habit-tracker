"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { triggerInteractionFeedback } from "@/presentation/lib/interaction-feedback";

/** Wide enough to reach the touch before iOS starts its own edge gesture. */
const EDGE_PX = 22;
const DIRECTION_LOCK_PX = 8;
const COMMIT_FRACTION = 0.35;
const COMMIT_VELOCITY_PX_PER_MS = 0.5;
const SLIDE_MS = 240;
const SLIDE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const NOT_SWIPEABLE = "input,textarea,select,button,a,label";

type Gesture = {
  startX: number;
  startY: number;
  lastY: number;
  startTime: number;
  mode: "pending" | "swiping" | "scrolling" | "ignored";
  canSwipeBack: boolean;
};

function pageContent(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-route] > main");
}

/**
 * Replaces the installed iOS app's edge swipe with one that follows the finger.
 * iOS has no API for this: claiming the touch at the screen edge is what stops the
 * system gesture and its default animation.
 */
export function EdgeSwipeBack() {
  const pathname = usePathname();
  const router = useRouter();
  const canGoBack = pathname !== "/";

  useEffect(() => {
    const installedOnTouch =
      window.matchMedia("(display-mode: standalone)").matches &&
      window.matchMedia("(pointer: coarse)").matches;
    if (!installedOnTouch) return;

    let gesture: Gesture | null = null;
    const reducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (event.touches.length !== 1 || !touch) return;

      const fromLeft = touch.clientX <= EDGE_PX;
      if (!fromLeft && touch.clientX < window.innerWidth - EDGE_PX) return;
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(NOT_SWIPEABLE)) return;
      if (document.querySelector('[role="dialog"]')) return;

      event.preventDefault();
      gesture = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastY: touch.clientY,
        startTime: performance.now(),
        mode: "pending",
        canSwipeBack: fromLeft && canGoBack,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!gesture || !touch) return;
      const dx = touch.clientX - gesture.startX;
      const dy = touch.clientY - gesture.startY;

      if (gesture.mode === "pending") {
        if (Math.hypot(dx, dy) < DIRECTION_LOCK_PX) return;
        if (Math.abs(dy) > Math.abs(dx)) gesture.mode = "scrolling";
        else gesture.mode = dx > 0 && gesture.canSwipeBack ? "swiping" : "ignored";
      }

      if (gesture.mode === "scrolling") {
        // Claiming the touch also cancelled native scroll for this finger.
        window.scrollBy(0, gesture.lastY - touch.clientY);
        gesture.lastY = touch.clientY;
      } else if (gesture.mode === "swiping") {
        const page = pageContent();
        if (page) {
          page.style.transition = "none";
          page.style.transform = `translate3d(${Math.max(0, dx)}px, 0, 0)`;
          page.style.boxShadow = "-12px 0 28px rgb(0 0 0 / 0.28)";
        }
      }
      event.preventDefault();
    };

    const settle = (page: HTMLElement, onDone: () => void) => {
      if (reducedMotion()) {
        onDone();
        return;
      }
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        onDone();
      };
      page.addEventListener("transitionend", finish, { once: true });
      window.setTimeout(finish, SLIDE_MS + 60);
    };

    const onTouchEnd = (event: TouchEvent) => {
      const current = gesture;
      gesture = null;
      if (!current || current.mode !== "swiping") return;
      const page = pageContent();
      const touch = event.changedTouches[0];
      if (!page || !touch) return;

      const dx = touch.clientX - current.startX;
      const velocity = dx / (performance.now() - current.startTime);
      const commit =
        dx > window.innerWidth * COMMIT_FRACTION ||
        velocity > COMMIT_VELOCITY_PX_PER_MS;

      page.style.transition = `transform ${SLIDE_MS}ms ${SLIDE_EASE}`;
      if (commit) {
        triggerInteractionFeedback();
        page.style.transform = "translate3d(100%, 0, 0)";
        settle(page, () => router.push("/", { scroll: false }));
        return;
      }

      page.style.transform = "translate3d(0, 0, 0)";
      settle(page, () => {
        page.style.transition = "";
        page.style.transform = "";
        page.style.boxShadow = "";
      });
    };

    // Non-passive: only a cancelable touchstart can claim the gesture from iOS.
    const options = { passive: false, capture: true };
    document.addEventListener("touchstart", onTouchStart, options);
    document.addEventListener("touchmove", onTouchMove, options);
    document.addEventListener("touchend", onTouchEnd, true);
    document.addEventListener("touchcancel", onTouchEnd, true);

    return () => {
      document.removeEventListener("touchstart", onTouchStart, options);
      document.removeEventListener("touchmove", onTouchMove, options);
      document.removeEventListener("touchend", onTouchEnd, true);
      document.removeEventListener("touchcancel", onTouchEnd, true);
    };
  }, [canGoBack, router]);

  return null;
}
