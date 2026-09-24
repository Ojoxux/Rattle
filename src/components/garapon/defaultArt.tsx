import { LAYOUT } from "./layout";

const { cx, cy } = LAYOUT.drumCenter;

function octagon(r: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function spokes(inner: number, outer: number) {
  return Array.from({ length: 8 }, (_, i) => {
    const a = ((22.5 + i * 45) * Math.PI) / 180;
    return (
      <line
        key={i}
        x1={cx + inner * Math.cos(a)}
        y1={cy + inner * Math.sin(a)}
        x2={cx + outer * Math.cos(a)}
        y2={cy + outer * Math.sin(a)}
      />
    );
  });
}

export function DefaultFrame() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <ellipse cx="210" cy="362" rx="170" ry="7" fill="#000" opacity="0.06" />
      <g stroke="#8A94A0" strokeWidth="12" strokeLinecap="round">
        <line x1={cx} y1={cy} x2="120" y2="342" />
        <line x1={cx} y1={cy} x2="280" y2="342" />
      </g>
      <line
        x1="250"
        y1="254"
        x2="298"
        y2="300"
        stroke="#8A94A0"
        strokeWidth="26"
        strokeLinecap="round"
      />
      <line
        x1="250"
        y1="254"
        x2="298"
        y2="300"
        stroke="#C7CDD4"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <rect x="44" y="340" width="340" height="18" rx="9" fill="#4B5563" />
      <rect
        x="282"
        y="312"
        width="96"
        height="30"
        rx="12"
        fill="#FFFFFF"
        stroke="#C7CDD4"
        strokeWidth="3"
      />
      <rect x="292" y="318" width="76" height="12" rx="6" fill="#E6EAEE" />
    </svg>
  );
}

export function DefaultDrum() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <polygon points={octagon(LAYOUT.drumRadius)} fill="#D9C6A7" />
      <polygon points={octagon(LAYOUT.drumRadius - 10)} fill="#E9DDC9" />
      <polygon points={octagon(LAYOUT.drumRadius - 34)} fill="#F5EFE4" />
      <g stroke="#D9C6A7" strokeWidth="4">
        {spokes(LAYOUT.drumRadius - 34, LAYOUT.drumRadius - 10)}
      </g>
      <circle cx={cx} cy={cy} r="22" fill="#E9DDC9" />
    </svg>
  );
}

export function DefaultHandle() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <rect x={cx - 6} y={cy - 7} width="82" height="14" rx="7" fill="#5B6573" />
      <circle cx={cx + 76} cy={cy} r="14" fill="#374151" />
      <circle cx={cx} cy={cy} r="11" fill="#374151" />
    </svg>
  );
}

export function DefaultBall({ color }: { color: string }) {
  const r = LAYOUT.ballRadius;
  return (
    <g>
      <circle r={r} fill={color} stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
      <ellipse
        cx={-r * 0.32}
        cy={-r * 0.38}
        rx={r * 0.32}
        ry={r * 0.22}
        fill="#fff"
        opacity="0.55"
      />
    </g>
  );
}
