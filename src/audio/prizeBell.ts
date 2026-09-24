import type { PrizeId } from "#/lottery/config";

let audio: HTMLAudioElement | undefined;

export function bellCycles(prizeId: PrizeId) {
  return prizeId === "A" ? 4 : prizeId === "B" ? 2 : 0;
}

// Call from the draw/replay click so mobile browsers allow the later result sound.
export async function unlockPrizeBell() {
  try {
    audio ??= new Audio("/audio/winning-bell.mp3");
    audio.muted = true;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
  } catch {
    // The visual celebration must still work if audio is unavailable.
  }
}

export function playPrizeBell(prizeId: PrizeId): () => void {
  const bell = audio;
  if (!bell || bellCycles(prizeId) === 0) return () => {};
  bell.currentTime = 0;
  void bell.play().catch(() => {});
  return () => bell.pause();
}
