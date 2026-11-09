"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

const FORWARD_CLASS = "page-route-forward";
const BACK_CLASS = "page-route-back";
const TAP_RESPONSE_CLASS = "page-route-tap-response";
/** Match the `page-route-*` duration in global.css + buffer before removing class */
const ENTER_CLEAR_MS = 280 + 20;

function routeDepth(pathname: string): number {
  return pathname.split("/").filter(Boolean).length > 0 ? 1 : 0;
}

type RouteTransitionFeedbackContextValue = {
  beginRouteTransitionFeedback: () => void;
};

const RouteTransitionFeedbackContext =
  createContext<RouteTransitionFeedbackContextValue | null>(null);

/**
 * Call synchronously on habit-card tap (before `router.push` / Link navigation)
 * so motion starts immediately instead of waiting for the next route to load.
 */
export function useRouteTransitionFeedback(): () => void {
  const ctx = useContext(RouteTransitionFeedbackContext);
  return ctx?.beginRouteTransitionFeedback ?? (() => {});
}

/**
 * Applies a short full-page enter animation after client navigations, and
 * exposes immediate tap feedback so the UI responds before RSC work finishes.
 */
export function RouteTransitionShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const beginRouteTransitionFeedback = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.classList.add(TAP_RESPONSE_CLASS);
  }, []);

  const contextValue = useMemo(
    () => ({ beginRouteTransitionFeedback }),
    [beginRouteTransitionFeedback],
  );

  useLayoutEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current === pathname) {
      return;
    }
    const enterClass =
      routeDepth(pathname) < routeDepth(prevPathRef.current)
        ? BACK_CLASS
        : FORWARD_CLASS;
    prevPathRef.current = pathname;

    const el = wrapperRef.current;
    if (!el) return;

    el.classList.remove(TAP_RESPONSE_CLASS, FORWARD_CLASS, BACK_CLASS);
    el.classList.add(enterClass);
    const timeoutId = window.setTimeout(() => {
      el.classList.remove(enterClass);
    }, ENTER_CLEAR_MS);

    return () => {
      window.clearTimeout(timeoutId);
      el.classList.remove(enterClass);
    };
  }, [pathname]);

  return (
    <RouteTransitionFeedbackContext.Provider value={contextValue}>
      <div
        ref={wrapperRef}
        className="min-h-dvh w-full overflow-x-clip"
        data-route={pathname}
      >
        {children}
      </div>
    </RouteTransitionFeedbackContext.Provider>
  );
}
