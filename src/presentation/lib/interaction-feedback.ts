import { playUiHaptic } from "./ui-haptics";
import { playClickSound, playSuccessSound } from "./ui-sound";

/** Short vibration for taps; fails silently when unsupported */
export function triggerHaptic(): void {
  playUiHaptic();
}

/** Standard UI tap / navigation feedback (shared Audio instance). */
export function playTapSound(): void {
  playClickSound();
}

export { playSuccessSound };

export type InteractionSound = "tap" | "success" | "none";

export interface TriggerInteractionFeedbackOptions {
  /** Default `none` — avoid sound on rapid chip toggles etc. */
  sound?: InteractionSound;
  /** Default `true` */
  haptic?: boolean;
}

/**
 * Central entry for haptic + optional sound. Never plays tap and success together;
 * call once per intentional user action.
 *
 * When composing with the shared `Button` component, pass `haptic: false` here —
 * the button already triggers vibration on press.
 */
export function triggerInteractionFeedback(
  options: TriggerInteractionFeedbackOptions = {},
): void {
  const { sound = "none", haptic = true } = options;
  if (haptic) {
    triggerHaptic();
  }
  if (sound === "tap") {
    playTapSound();
  } else if (sound === "success") {
    playSuccessSound();
  }
}
