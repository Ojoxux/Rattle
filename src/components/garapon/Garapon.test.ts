// @vitest-environment happy-dom
import { act, createElement, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { Garapon, type GaraponHandle } from "./Garapon";
import { stopSpinSound } from "#/audio/drawSound";

vi.mock("#/audio/drawSound", () => ({
  playSpinSound: vi.fn(),
  stopSpinSound: vi.fn(),
  scheduleDropSound: vi.fn(() => vi.fn()),
}));

let root: Root;
let host: HTMLDivElement;
let reducedMotion = false;
let dropDuration = 0;
let cancelAnimation: ReturnType<typeof vi.fn>;
const handle = createRef<GaraponHandle>();
const onDrop = vi.fn();

beforeEach(async () => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 10),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  vi.stubGlobal("matchMedia", () => ({ matches: reducedMotion }));
  reducedMotion = false;
  dropDuration = 0;
  onDrop.mockClear();
  vi.mocked(stopSpinSound).mockClear();
  vi.spyOn(Element.prototype, "animate").mockImplementation((_frames, options) => {
    dropDuration = (options as KeyframeAnimationOptions).duration as number;
    let rejectFinished: (reason?: unknown) => void;
    let timer: ReturnType<typeof setTimeout>;
    const finished = new Promise<Animation>((resolve, reject) => {
      rejectFinished = reject;
      timer = setTimeout(() => resolve({} as Animation), dropDuration);
    });
    cancelAnimation = vi.fn(() => {
      clearTimeout(timer);
      rejectFinished(new Error("cancelled"));
    });
    return { finished, cancel: cancelAnimation } as unknown as Animation;
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root.render(createElement(Garapon, { ref: handle, onDrop })));
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function draw(roll: number) {
  vi.spyOn(Math, "random").mockReturnValue(roll);
  let done = false;
  await act(async () => {
    void handle.current!.play("D", "#F5C400").then(() => {
      done = true;
    });
  });
  return () => done;
}

describe("garapon comic timing", () => {
  it("waits one second after stopping, then fires a fast ball", async () => {
    const done = await draw(0.1);
    await advance(2400);
    expect(stopSpinSound).toHaveBeenCalledTimes(2); // reset and end of spin
    expect(onDrop).not.toHaveBeenCalled();
    await advance(990);
    expect(onDrop).not.toHaveBeenCalled();
    await advance(10);
    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(dropDuration).toBe(160);
    expect(done()).toBe(false);
    await advance(160);
    expect(done()).toBe(true);
  });

  it("drops at 200ms but waits for the full rotation before resolving", async () => {
    const done = await draw(0.3);
    await advance(190);
    expect(onDrop).not.toHaveBeenCalled();
    await advance(10);
    expect(onDrop).toHaveBeenCalledTimes(1);
    await advance(850);
    expect(done()).toBe(false);
    expect(stopSpinSound).toHaveBeenCalledTimes(1);
    await advance(1350);
    expect(done()).toBe(true);
    expect(stopSpinSound).toHaveBeenCalledTimes(2);
  });

  it("keeps normal timing for ordinary draws", async () => {
    const done = await draw(0.8);
    await advance(2390);
    expect(onDrop).not.toHaveBeenCalled();
    await advance(10);
    expect(dropDuration).toBe(850);
    await advance(850);
    expect(done()).toBe(true);
  });

  it("cancels a late pending drop on reset", async () => {
    const done = await draw(0.1);
    await advance(2600);
    await act(async () => handle.current!.reset());
    await advance(2000);
    expect(onDrop).not.toHaveBeenCalled();
    expect(done()).toBe(true);
  });

  it("cancels an early airborne ball on reset", async () => {
    const done = await draw(0.3);
    await advance(250);
    await act(async () => handle.current!.reset());
    expect(cancelAnimation).toHaveBeenCalledOnce();
    expect(done()).toBe(true);
  });

  it("uses the short normal animation for reduced motion", async () => {
    reducedMotion = true;
    const done = await draw(0.1);
    await advance(180);
    expect(dropDuration).toBe(150);
    await advance(150);
    expect(done()).toBe(true);
  });
});
