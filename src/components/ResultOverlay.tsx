import type { CSSProperties } from "react";
import * as stylex from "@stylexjs/stylex";
import { getPrize, type PrizeId } from "#/lottery/config";
import { colors } from "#/tokens.stylex";
import { button } from "#/styles/ui.stylex";
import { Confetti } from "./Confetti";
import { PrizeBall } from "./garapon/generatedArt";

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
});

const riseIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(16px)" },
});

const pop = stylex.keyframes({
  from: { transform: "scale(0.3)" },
});

const ripple = stylex.keyframes({
  from: { opacity: 0.6, transform: "scale(1)" },
  to: { opacity: 0, transform: "scale(2.2)" },
});

const styles = stylex.create({
  result: {
    position: "fixed",
    inset: 0,
    zIndex: 20,
    display: "grid",
    placeItems: "center",
    background: "rgba(244, 245, 247, 0.94)",
    animationName: fadeIn,
    animationDuration: "0.25s",
    animationTimingFunction: "ease-out",
    overflow: "hidden",
  },
  body: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    animationName: riseIn,
    animationDuration: "0.4s",
    animationTimingFunction: "cubic-bezier(0.2, 0.8, 0.3, 1)",
  },
  ball: {
    position: "relative",
    width: 120,
    height: 120,
    marginBottom: 28,
  },
  ripple: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: "var(--prize)",
    opacity: 0,
    animationName: ripple,
    animationDuration: "1.4s",
    animationTimingFunction: "ease-out",
    animationDelay: "0.2s",
  },
  rippleLate: {
    animationDelay: "0.5s",
  },
  ballArt: {
    position: "absolute",
    inset: 0,
    animationName: pop,
    animationDuration: "0.5s",
    animationTimingFunction: "cubic-bezier(0.3, 1.6, 0.5, 1)",
  },
  name: {
    margin: 0,
    fontSize: {
      default: "7rem",
      "@media (max-height: 720px)": "5rem",
    },
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: "0.02em",
  },
  message: {
    margin: "20px 0 48px",
    fontSize: "1.75rem",
    fontWeight: 600,
    color: colors.textSoft,
  },
});

export function ResultOverlay({ prizeId, onClose }: { prizeId: PrizeId; onClose: () => void }) {
  const prize = getPrize(prizeId);
  const isTop = prizeId === "A";

  return (
    <div
      {...stylex.props(styles.result)}
      role="dialog"
      aria-modal="true"
      aria-label={`${prize.name}の結果`}
    >
      {isTop && <Confetti />}
      <div {...stylex.props(styles.body)} style={{ "--prize": prize.color } as CSSProperties}>
        <div {...stylex.props(styles.ball)}>
          <span {...stylex.props(styles.ripple)} />
          <span {...stylex.props(styles.ripple, styles.rippleLate)} />
          <span {...stylex.props(styles.ballArt)}>
            <PrizeBall prizeId={prizeId} />
          </span>
        </div>
        <p {...stylex.props(styles.name)}>{prize.name}</p>
        <p {...stylex.props(styles.message)}>おめでとうございます！</p>
        <button
          type="button"
          {...stylex.props(button.base, button.primary, button.result)}
          onClick={onClose}
        >
          もう一度引く
        </button>
      </div>
    </div>
  );
}
