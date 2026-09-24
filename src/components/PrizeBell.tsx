import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { PrizeId } from "#/lottery/config";
import { bellCycles, playPrizeBell, unlockPrizeBell } from "#/audio/prizeBell";

const swing = stylex.keyframes({
  "0%": { transform: "rotate(0deg)" },
  "25%": { transform: "rotate(-18deg)" },
  "75%": { transform: "rotate(18deg)" },
  "100%": { transform: "rotate(0deg)" },
});
const styles = stylex.create({
  button: {
    position: "absolute",
    left: "calc(50% + clamp(85px, 24vw, 140px))",
    top: -20,
    transform: "translate(-50%, -50%) rotate(20deg)",
    width: {
      default: "clamp(160px, calc(100vw - 160px), 220px)",
      "@media (max-height: 600px)": 160,
    },
    aspectRatio: "1",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    borderRadius: 16,
    outlineOffset: 4,
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    transformOrigin: "50% 16%",
    animationName: swing,
    animationDuration: ".6s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: 2,
  },
  top: { animationIterationCount: 4 },
});

export function PrizeBell({ prizeId }: { prizeId: PrizeId }) {
  const [replay, setReplay] = useState(0);
  const cycles = bellCycles(prizeId);
  useEffect(() => playPrizeBell(prizeId), [prizeId, replay]);
  if (!cycles) return null;
  return (
    <button
      {...stylex.props(styles.button)}
      type="button"
      aria-label="鐘をもう一度鳴らす"
      title="鐘をもう一度鳴らす"
      onClick={async () => {
        await unlockPrizeBell();
        setReplay((value) => value + 1);
      }}
    >
      <img
        key={replay}
        {...stylex.props(styles.image, prizeId === "A" && styles.top)}
        src="/images/prize-bell-flat.png"
        alt=""
        draggable={false}
        width="220"
        height="220"
      />
    </button>
  );
}
