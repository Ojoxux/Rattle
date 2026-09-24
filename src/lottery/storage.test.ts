// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { createInitialState, type LotteryState } from "./draw";
import { loadState, saveState } from "./storage";

const STORAGE_KEY = "garapon-lottery/v1";

beforeEach(() => {
  window.localStorage.clear();
});

describe("loadState", () => {
  it("returns the initial state when nothing is stored", () => {
    expect(loadState()).toEqual(createInitialState());
  });

  it("round-trips a saved state", () => {
    const state: LotteryState = {
      A: { remaining: 1, drawn: 1 },
      B: { remaining: 4, drawn: 1 },
      C: { remaining: 12, drawn: 0 },
      D: { remaining: 20, drawn: 11 },
    };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it("falls back to the initial state when the stored JSON is corrupt", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadState()).toEqual(createInitialState());
  });

  it("fills in missing prizes with their initial values", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ A: { remaining: 0, drawn: 2 } }),
    );
    const state = loadState();
    expect(state.A).toEqual({ remaining: 0, drawn: 2 });
    expect(state.B).toEqual({ remaining: 5, drawn: 0 });
    expect(state.C).toEqual({ remaining: 12, drawn: 0 });
    expect(state.D).toEqual({ remaining: 31, drawn: 0 });
  });

  it("falls back to the initial value for a prize with an invalid stored count", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        A: { remaining: -1, drawn: 0 },
        B: { remaining: 1.5, drawn: 0 },
        C: { remaining: "12", drawn: 0 },
      }),
    );
    const state = loadState();
    expect(state.A).toEqual({ remaining: 2, drawn: 0 });
    expect(state.B).toEqual({ remaining: 5, drawn: 0 });
    expect(state.C).toEqual({ remaining: 12, drawn: 0 });
  });
});

describe("saveState", () => {
  it("persists the state as JSON under the storage key", () => {
    const state = createInitialState();
    saveState(state);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual(state);
  });
});
