let audio: HTMLAudioElement | undefined;

// Call directly from the draw button's click handler so mobile browsers allow playback.
export function playDrawSound() {
  try {
    audio ??= new Audio("/audio/garapon-spin.mp3");
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch {
    // The visual spin must still work if audio is unavailable.
  }
}
