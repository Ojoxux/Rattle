import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { PrizeId } from "#/lottery/config";
import { garaponAssets, type LayerAsset } from "./assets";
import { CANVAS_SIZE, LAYOUT, TIMING } from "./layout";

export type GaraponHandle = {
  play: (prizeId: PrizeId, color: string) => Promise<void>;
  reset: () => void;
};

function Layer({ asset, className }: { asset: LayerAsset; className?: string }) {
  if (typeof asset === "string") {
    return (
      <img className={`garapon-layer ${className ?? ""}`} src={asset} alt="" draggable={false} />
    );
  }
  const Art = asset;
  return (
    <div className={`garapon-layer ${className ?? ""}`}>
      <Art />
    </div>
  );
}

function Ball({ prizeId, color }: { prizeId: PrizeId; color: string }) {
  const asset = garaponAssets.ball;
  if (typeof asset === "function") {
    const Art = asset;
    return <Art color={color} />;
  }
  const r = LAYOUT.ballRadius;
  return <image href={asset[prizeId]} x={-r} y={-r} width={r * 2} height={r * 2} />;
}

const rotorStyle = {
  transformOrigin: `${(LAYOUT.drumCenter.cx / CANVAS_SIZE) * 100}% ${(LAYOUT.drumCenter.cy / CANVAS_SIZE) * 100}%`,
};

const pos = (p: { x: number; y: number }, scale = 1) =>
  `translate(${p.x}px, ${p.y}px) scale(${scale})`;

export const Garapon = forwardRef<GaraponHandle>(function Garapon(_, ref) {
  const drumRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<SVGGElement>(null);
  const ballAnimation = useRef<Animation | null>(null);
  const [ball, setBall] = useState<{ prizeId: PrizeId; color: string } | null>(null);

  useImperativeHandle(ref, () => ({
    async play(prizeId, color) {
      ballAnimation.current?.cancel();
      setBall({ prizeId, color });

      const spin: Keyframe[] = [
        { transform: "rotate(0deg)" },
        { transform: `rotate(${360 * TIMING.spinTurns}deg)` },
      ];
      const spinOptions: KeyframeAnimationOptions = {
        duration: TIMING.spinMs,
        easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
      };
      await Promise.all([
        drumRef.current?.animate(spin, spinOptions).finished,
        handleRef.current?.animate(spin, spinOptions).finished,
      ]);

      const { exit, chute, rest } = LAYOUT.ballPath;
      const drop = ballRef.current?.animate(
        [
          { transform: pos(exit, 0.4), opacity: 0, easing: "ease-out" },
          { transform: pos(exit, 1), opacity: 1, offset: 0.15, easing: "ease-in" },
          { transform: pos(chute), offset: 0.5, easing: "ease-in" },
          { transform: pos(rest), offset: 0.72, easing: "ease-out" },
          { transform: pos({ x: rest.x + 3, y: rest.y - 8 }), offset: 0.86, easing: "ease-in" },
          { transform: pos({ x: rest.x + 4, y: rest.y }), opacity: 1 },
        ],
        { duration: TIMING.dropMs, fill: "forwards" },
      );
      ballAnimation.current = drop ?? null;
      await drop?.finished;
    },
    reset() {
      ballAnimation.current?.cancel();
      ballAnimation.current = null;
      setBall(null);
    },
  }));

  return (
    <div className="garapon">
      <Layer asset={garaponAssets.frame} />
      <div ref={drumRef} className="garapon-rotor" style={rotorStyle}>
        <Layer asset={garaponAssets.drum} />
      </div>
      <div ref={handleRef} className="garapon-rotor" style={rotorStyle}>
        <Layer asset={garaponAssets.handle} />
      </div>
      <svg
        className="garapon-layer"
        viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
        aria-hidden="true"
      >
        <g ref={ballRef} style={{ opacity: 0 }}>
          {ball && <Ball prizeId={ball.prizeId} color={ball.color} />}
        </g>
      </svg>
    </div>
  );
});
