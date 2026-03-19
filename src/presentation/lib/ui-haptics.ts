/** Short pulse for tap feedback; ignored on unsupported platforms / desktop browsers. */
const HAPTIC_MS = 10;

export function playUiHaptic(): void {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  ) {
    return;
  }
  try {
    navigator.vibrate(HAPTIC_MS);
  } catch {
    // ignore
  }
}
