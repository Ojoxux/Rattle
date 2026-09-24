import { describe, expect, it } from "vite-plus/test";
import { applyDraw, createInitialState, drawPrize, type LotteryState } from "./draw";

function state(a: number, b: number, c: number, d: number): LotteryState {
  return {
    A: { remaining: a, drawn: 0 },
    B: { remaining: b, drawn: 0 },
    C: { remaining: c, drawn: 0 },
    D: { remaining: d, drawn: 0 },
  };
}

describe("drawPrize", () => {
  it("maps each ticket in the pool to its prize", () => {
    const s = state(2, 5, 12, 31);
    const total = 50;
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    for (let i = 0; i < total; i++) counts[drawPrize(s, () => i / total)!]++;
    expect(counts).toEqual({ A: 2, B: 5, C: 12, D: 31 });
  });

  it("never picks a prize with 0 remaining", () => {
    const s = state(0, 3, 0, 1);
    for (let i = 0; i < 100; i++) {
      expect(["B", "D"]).toContain(drawPrize(s, () => i / 100));
    }
  });

  it("returns null when everything is gone", () => {
    expect(drawPrize(state(0, 0, 0, 0))).toBeNull();
  });

  it("drains the whole pool exactly", () => {
    let s = createInitialState();
    for (let i = 0; i < 50; i++) s = applyDraw(s, drawPrize(s)!);
    expect(drawPrize(s)).toBeNull();
    expect(s.A).toEqual({ remaining: 0, drawn: 2 });
    expect(s.D).toEqual({ remaining: 0, drawn: 31 });
  });
});
