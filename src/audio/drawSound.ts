let spinAudio: HTMLAudioElement | undefined;
let dropAudio: HTMLAudioElement | undefined;

function getSpinAudio() {
  spinAudio ??= new Audio("/audio/garapon-spin.mp3");
  return spinAudio;
}

function getDropAudio() {
  dropAudio ??= new Audio("/audio/garapon-drop.mp3");
  return dropAudio;
}

// Call on mount so both files are already decoded before the first draw click,
// otherwise the fetch/decode delay pushes them out of sync with the animation.
export function preloadDrawSound() {
  try {
    getSpinAudio().load();
    getDropAudio().load();
  } catch {
    // The visual spin must still work if audio is unavailable.
  }
}

// Call directly from the draw button's click handler so mobile browsers allow playback.
export function playSpinSound() {
  try {
    const el = getSpinAudio();
    el.currentTime = 0;
    void el.play().catch(() => {});
  } catch {
    // The visual spin must still work if audio is unavailable.
  }
}

export function stopSpinSound() {
  try {
    getSpinAudio().pause();
  } catch {
    // Nothing to stop.
  }
}

// The clip's thud peaks ~120ms in, so start it that much early to land exactly on impact.
const DROP_ATTACK_LEAD_MS = 120;

export function scheduleDropSound(delayMs: number) {
  window.setTimeout(
    () => {
      try {
        const el = getDropAudio();
        el.currentTime = 0;
        void el.play().catch(() => {});
      } catch {
        // The visual drop must still work if audio is unavailable.
      }
    },
    Math.max(0, delayMs - DROP_ATTACK_LEAD_MS),
  );
}
