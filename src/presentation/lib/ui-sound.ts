const TAP_SOUND_SRC = "/sound/ui-tap-button.mp3";
const SUCCESS_SOUND_SRC = "/sound/ui-accept.mp3";
/** Normalized volume for subtle UI feedback (0–1). */
const TAP_VOLUME = 0.28;
/** Slightly more present than tap, still short. */
const SUCCESS_VOLUME = 0.42;

let sharedAudio: HTMLAudioElement | null = null;
let successAudio: HTMLAudioElement | null = null;

function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudio) {
    sharedAudio = new Audio(TAP_SOUND_SRC);
    sharedAudio.preload = "auto";
    sharedAudio.volume = TAP_VOLUME;
  }
  return sharedAudio;
}

function getSuccessAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!successAudio) {
    successAudio = new Audio(SUCCESS_SOUND_SRC);
    successAudio.preload = "auto";
    successAudio.volume = SUCCESS_VOLUME;
  }
  return successAudio;
}

/** Ensures UI clips are decoded early (call once from a client root). */
export function preloadUiTapSound(): void {
  const audio = getSharedAudio();
  if (audio) void audio.load();
}

export function preloadUiSuccessSound(): void {
  const audio = getSuccessAudio();
  if (audio) void audio.load();
}

/** Preload tap + success for instant playback. */
export function preloadUiSounds(): void {
  preloadUiTapSound();
  preloadUiSuccessSound();
}

/**
 * Plays the shared UI tap sound. Safe to call from click handlers only (client).
 * No-ops on SSR. Ignores play() errors (autoplay policies, missing file).
 */
export function playClickSound(): void {
  const audio = getSharedAudio();
  if (!audio) return;
  try {
    audio.currentTime = 0;
    void audio.play();
  } catch {
    // ignore
  }
}

/**
 * Positive feedback (e.g. habit created). Single shared instance; no loop.
 * Do not combine with `playClickSound()` on the same interaction.
 */
export function playSuccessSound(): void {
  const audio = getSuccessAudio();
  if (!audio) return;
  try {
    audio.currentTime = 0;
    void audio.play();
  } catch {
    // ignore
  }
}
