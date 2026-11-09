"use client";

import { useSyncExternalStore } from "react";

const SEEN_KEY = "hold-to-mark-seen";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isVisible(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === null;
  } catch {
    return false;
  }
}

/** Retires the hint once the gesture has been used. */
export function dismissHoldHint(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Without storage the hint simply stays.
  }
  listeners.forEach((listener) => listener());
}

export function useHoldHintVisible(): boolean {
  return useSyncExternalStore(subscribe, isVisible, () => false);
}
