import { useState, type CSSProperties } from "react";
import * as stylex from "@stylexjs/stylex";
import { PRIZES } from "#/lottery/config";

const confettiFall = stylex.keyframes({
  to: {
    transform: "translate(var(--drift), 105vh) rotate(var(--spin))",
  },
});

const styles = stylex.create({
  confetti: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  piece: {
    position: "absolute",
    top: -20,
    borderRadius: 2,
    animationName: confettiFall,
    animationTimingFunction: "cubic-bezier(0.3, 0.4, 0.6, 1)",
    animationFillMode: "forwards",
    animationIterationCount: 2,
  },
});

export function Confetti({ count = 90 }: { count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.2 + Math.random() * 1.6,
      drift: (Math.random() - 0.5) * 160,
      spin: (Math.random() - 0.5) * 1440,
      width: 8 + Math.random() * 6,
      color: PRIZES[i % PRIZES.length].color,
    })),
  );

  return (
    <div {...stylex.props(styles.confetti)} aria-hidden="true">
      {pieces.map((p, i) => {
        const pieceProps = stylex.props(styles.piece);
        return (
          <span
            key={i}
            {...pieceProps}
            style={
              {
                ...pieceProps.style,
                left: `${p.left}%`,
                width: p.width,
                height: p.width * 0.45,
                background: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                "--drift": `${p.drift}px`,
                "--spin": `${p.spin}deg`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
