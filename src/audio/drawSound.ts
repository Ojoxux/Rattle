let audio: HTMLAudioElement | undefined;

function getAudio() {
  audio ??= new Audio("/audio/garapon-spin.mp3");
  return audio;
}

// Call on mount so the file is already decoded before the first draw click,
// otherwise the fetch/decode delay pushes the drop sound out of sync with the animation.
export function preloadDrawSound() {
  try {
    getAudio().load();
  } catch {
    // The visual spin must still work if audio is unavailable.
  }
}

// Call directly from the draw button's click handler so mobile browsers allow playback.
export function playDrawSound() {
  try {
    const el = getAudio();
    el.currentTime = 0;
    void el.play().catch(() => {});
  } catch {
    // The visual spin must still work if audio is unavailable.
  }
}
