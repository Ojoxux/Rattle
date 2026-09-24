import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
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
  const [ball, setBall] = useState<{ prizeId: PrizeId; color: string } | null>(null);

  const cancel = () => {
    run.current += 1;
    if (spinFrame.current !== null) cancelAnimationFrame(spinFrame.current);
    spinFrame.current = null;
    finishSpin.current?.();
    finishSpin.current = null;
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
  };

  useEffect(() => cancel, []);

  useImperativeHandle(ref, () => ({
    async play(prizeId, color) {
      cancel();
      const currentRun = run.current;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setBall({ prizeId, color });

      await new Promise<void>((resolve) => {
        finishSpin.current = resolve;
        const started = performance.now();
        const duration = reducedMotion ? 180 : TIMING.spinMs;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - started) / duration);
          // Ease angular speed up and down, retaining one fixed 3D projection.
          const eased = progress * progress * (3 - 2 * progress);
          setAngle(reducedMotion || progress === 1 ? 0 : eased * Math.PI * 2 * TIMING.spinTurns);
          if (progress < 1) {
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
      onDrop?.();

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
              { transform: pos(rest), offset: 0.72, easing: "ease-out" },
              {
                transform: pos({ x: rest.x + 3, y: rest.y - 13 }),
                offset: 0.86,
                easing: "ease-in",
              },
              { transform: pos({ x: rest.x + 4, y: rest.y }), opacity: 1 },
            ],
        { duration: reducedMotion ? 150 : TIMING.dropMs, fill: "forwards" },
      );
      if (drop) animations.current.push(drop);
      await drop?.finished.catch(() => {});
    },
    reset() {
      cancel();
      setAngle(0);
      setBall(null);
    },
  }));

  return (
    <div className="garapon" role="img" aria-label="木製のガラポン抽選器">
      <svg
        className="garapon-layer"
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
