import { playUiHaptic } from "./ui-haptics";

export interface TriggerInteractionFeedbackOptions {
  /**
   * When `false`, skips vibration (e.g. `Button` already triggers haptic on press).
   * @default true
   */
  haptic?: boolean;
}

/** Central entry for tactile feedback only. */
export function triggerInteractionFeedback(
  options: TriggerInteractionFeedbackOptions = {},
): void {
  const { haptic = true } = options;
  if (haptic) {
    playUiHaptic();
  }
}
