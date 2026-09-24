import { PRIZES } from "./config";
import { createInitialState, type LotteryState } from "./draw";

const STORAGE_KEY = "garapon-lottery/v1";

function isValidCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function loadState(): LotteryState {
  const initial = createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<LotteryState>;
    for (const p of PRIZES) {
      const stock = parsed[p.id];
      if (stock && isValidCount(stock.remaining) && isValidCount(stock.drawn)) {
        initial[p.id] = { remaining: stock.remaining, drawn: stock.drawn };
      }
    }
    return initial;
  } catch {
    return initial;
  }
}

export function saveState(state: LotteryState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
