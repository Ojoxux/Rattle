import { PRIZES, type PrizeId } from "./config";

export type PrizeStock = { remaining: number; drawn: number };
export type LotteryState = Record<PrizeId, PrizeStock>;

export function createInitialState(): LotteryState {
  return Object.fromEntries(
    PRIZES.map((p) => [p.id, { remaining: p.initialCount, drawn: 0 }]),
  ) as LotteryState;
}

export function totalRemaining(state: LotteryState): number {
  return PRIZES.reduce((sum, p) => sum + state[p.id].remaining, 0);
}

export function drawPrize(state: LotteryState, random: () => number = Math.random): PrizeId | null {
  const total = totalRemaining(state);
  if (total <= 0) return null;

  let ticket = Math.floor(random() * total);
  for (const p of PRIZES) {
    const { remaining } = state[p.id];
    if (remaining <= 0) continue;
    if (ticket < remaining) return p.id;
    ticket -= remaining;
  }
  return null;
}

export function applyDraw(state: LotteryState, id: PrizeId): LotteryState {
  const stock = state[id];
  if (stock.remaining <= 0) throw new Error(`${id} has no remaining tickets`);
  return { ...state, [id]: { remaining: stock.remaining - 1, drawn: stock.drawn + 1 } };
}

export function adjustRemaining(state: LotteryState, id: PrizeId, delta: number): LotteryState {
  const stock = state[id];
  return { ...state, [id]: { ...stock, remaining: Math.max(0, stock.remaining + delta) } };
}
