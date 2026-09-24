import type { PrizeId } from "#/lottery/config";

let cheerAudio: HTMLAudioElement | undefined;
let systemAudio: HTMLAudioElement | undefined;

function audioFor(prizeId: PrizeId) {
  if (prizeId === "A") {
    cheerAudio ??= new Audio("/audio/cheer-applause.mp3");
    return cheerAudio;
  }
  systemAudio ??= new Audio("/audio/button-system.mp3");
  return systemAudio;
}

export async function unlockResultSound() {
  for (const prizeId of ["A", "B"] as const) {
    try {
      const el = audioFor(prizeId);
      el.muted = true;
      await el.play();
      el.pause();
      el.currentTime = 0;
      el.muted = false;
    } catch {
      // The visual celebration must still work if audio is unavailable.
    }
  }
}

export function playResultSound(prizeId: PrizeId): () => void {
  const el = audioFor(prizeId);
  el.currentTime = 0;
  void el.play().catch(() => {});
  return () => el.pause();
}
