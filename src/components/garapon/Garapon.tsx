import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { playSpinSound, scheduleDropSound, stopSpinSound } from "#/audio/drawSound";
import type { PrizeId } from "#/lottery/config";
import { garaponAssets } from "./assets";
import { CANVAS_SIZE, LAYOUT, TIMING } from "./layout";
import { Mechanism } from "./Mechanism";
import { MachineBase, Stand, Tray } from "./Frame";

export type GaraponHandle = {
  play: (prizeId: PrizeId, color: string) => Promise<void>;
  reset: () => void;
};

function Ball({ prizeId, color }: { prizeId: PrizeId; color: string }) {
  const asset = garaponAssets.ball;
  if (typeof asset === "function") {
    const Art = asset;
    return <Art color={color} prizeId={prizeId} />;
  }
  const r = LAYOUT.ballRadius;
  return <image href={asset[prizeId]} x={-r} y={-r} width={r * 2} height={r * 2} />;
}

const pos = (p: { x: number; y: number }, scale = 1) =>
  `translate(${p.x}px, ${p.y}px) scale(${scale})`;

const styles = stylex.create({
  garapon: {
    position: "relative",
    height: "100%",
    aspectRatio: "1",
    maxWidth: "100%",
  },
  layer: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
});

export const Garapon = forwardRef<GaraponHandle, { onDrop?: () => void }>(function Garapon(
  { onDrop },
  ref,
) {
  const [angle, setAngle] = useState(0);
  const spinFrame = useRef<number | null>(null);
  const finishSpin = useRef<(() => void) | null>(null);
  const ballRef = useRef<SVGGElement>(null);
  const animations = useRef<Animation[]>([]);
  const run = useRef(0);
  const cancelDropSound = useRef<(() => void) | null>(null);
  const [ball, setBall] = useState<{ prizeId: PrizeId; color: string } | null>(null);

  const cancel = () => {
    run.current += 1;
    if (spinFrame.current !== null) cancelAnimationFrame(spinFrame.current);
    spinFrame.current = null;
    finishSpin.current?.();
    finishSpin.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
    stopSpinSound();
    cancelDropSound.current?.();
    cancelDropSound.current = null;
  };

  useEffect(() => cancel, []);

  useImperativeHandle(ref, () => ({
    async play(prizeId, color) {
      cancel();
      const currentRun = run.current;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setBall({ prizeId, color });
      playSpinSound();

      // Select once per draw: normal 50%, late 25%, early 25%.
      const roll = Math.random();
      const variant = reducedMotion
        ? "normal"
        : roll < 0.25
          ? "late"
          : roll < 0.5
            ? "early"
            : "normal";
      const spinMs = reducedMotion ? 180 : TIMING.spinMs;
      const dropAt = variant === "early" ? 200 : spinMs + (variant === "late" ? 1000 : 0);
      const dropMs = reducedMotion ? 150 : variant === "late" ? 160 : TIMING.dropMs;
      let dropFinished: Promise<unknown> | undefined;
      const startDrop = () => {
        onDrop?.();
        if (!reducedMotion) cancelDropSound.current = scheduleDropSound(dropMs * TIMING.landOffset);

        const { exit, chute, rest } = LAYOUT.ballPath;
        const drop = ballRef.current?.animate(
          reducedMotion
            ? [
                { transform: pos(rest), opacity: 0 },
                { transform: pos(rest), opacity: 1 },
              ]
            : [
                { transform: pos(exit, 0.4), opacity: 0, easing: "ease-out" },
                { transform: pos(exit, 1), opacity: 1, offset: 0.15, easing: "ease-in" },
                { transform: pos(chute), offset: 0.5, easing: "ease-in" },
                { transform: pos(rest), offset: TIMING.landOffset, easing: "ease-out" },
                {
                  transform: pos({ x: rest.x + 3, y: rest.y - 13 }),
                  offset: 0.86,
                  easing: "ease-in",
                },
                { transform: pos({ x: rest.x + 4, y: rest.y }), opacity: 1 },
              ],
          { duration: dropMs, fill: "forwards" },
        );
        if (drop) animations.current.push(drop);
        dropFinished = drop?.finished.catch(() => {});
      };

      await new Promise<void>((resolve) => {
        finishSpin.current = resolve;
        const started = performance.now();
        let dropped = false;
        let stopped = false;
        const tick = (now: number) => {
          const elapsed = now - started;
          const progress = Math.min(1, elapsed / spinMs);
          if (!stopped) {
            const eased = progress * progress * (3 - 2 * progress);
            setAngle(reducedMotion || progress === 1 ? 0 : eased * Math.PI * 2 * TIMING.spinTurns);
            if (progress === 1) {
              stopped = true;
              stopSpinSound();
            }
          }
          if (!dropped && elapsed >= dropAt) {
            dropped = true;
            startDrop();
          }
          if (!stopped || !dropped) {
            spinFrame.current = requestAnimationFrame(tick);
          } else {
            spinFrame.current = null;
            finishSpin.current = null;
            resolve();
          }
        };
        spinFrame.current = requestAnimationFrame(tick);
      });
      if (currentRun !== run.current) return;
      // Early balls wait for the drum; late balls wait for their landing.
      await dropFinished;
    },
    reset() {
      cancel();
      setAngle(0);
      setBall(null);
    },
  }));

  return (
    <div {...stylex.props(styles.garapon)} role="img" aria-label="木製のガラポン抽選器">
      <svg
        {...stylex.props(styles.layer)}
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        aria-hidden="true"
      >
        <MachineBase />
        <Stand rear />
        <Tray />
        <Mechanism part="drum" angle={angle} />
        <Stand />
        <Mechanism part="handle" angle={angle} />
        <g ref={ballRef} style={{ opacity: 0 }}>
          {ball && <Ball prizeId={ball.prizeId} color={ball.color} />}
        </g>
        <Tray front />
      </svg>
    </div>
  );
});
