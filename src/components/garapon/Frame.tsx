import { useId } from "react";
import { project3, polygonPoints, type WorldPoint } from "./projection";

function points(vertices: WorldPoint[]) {
  return polygonPoints(vertices.map(project3));
}

const standOutline = [
  [-16, -7],
  [-60, 140],
  [60, 140],
  [16, -7],
];
const standHole = [
  [0, 40],
  [27, 117],
  [-27, 117],
];
const pathAt = (vertices: number[][], z: number) =>
  vertices.map(([x, y], i) => `${i ? "L" : "M"}${points([{ x, y, z }])}`).join(" ") + "Z";

export function Stand({ rear = false }: { rear?: boolean }) {
  const id = useId();
  const z = rear ? 75 : -12;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#777a7e" />
          <stop offset="1" stopColor="#34373b" />
        </linearGradient>
      </defs>
      <path
        d={pathAt(standOutline, z + 9) + pathAt(standHole, z + 9)}
        fill="#34373b"
        fillRule="evenodd"
      />
      {standOutline.map(([x, y], index) => {
        const [nx, ny] = standOutline[(index + 1) % standOutline.length];
        return (
          <polygon
            key={index}
            points={points([
              { x, y, z },
              { x: nx, y: ny, z },
              { x: nx, y: ny, z: z + 9 },
              { x, y, z: z + 9 },
            ])}
            fill="#66696c"
          />
        );
      })}
      <path
        d={pathAt(standOutline, z) + pathAt(standHole, z)}
        fill={`url(#${id})`}
        fillRule="evenodd"
        stroke="#85888b"
        strokeWidth=".7"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function MachineBase() {
  const id = useId();
  const a = { x: -175, y: 140, z: -24 };
  const b = { x: 112, y: 140, z: -24 };
  const c = { x: 112, y: 140, z: 90 };
  const d = { x: -175, y: 140, z: 90 };
  const bottom = (v: WorldPoint) => ({ ...v, y: v.y + 15 });
  const footprint = points([a, b, c, d].map(bottom));
  const softShadow = `${id}-soft-shadow`;
  const contactShadow = `${id}-contact-shadow`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#56595e" />
          <stop offset="1" stopColor="#35383d" />
        </linearGradient>
        <filter id={softShadow} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={contactShadow} x="-5%" y="-15%" width="110%" height="130%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>
      {/* Both shadows follow the base's actual bottom face in the same projection. */}
      <polygon
        points={footprint}
        transform="translate(1 2)"
        fill="#222a35"
        opacity=".12"
        filter={`url(#${softShadow})`}
      />
      <polygon
        points={footprint}
        fill="#222a35"
        stroke="#222a35"
        strokeWidth="1.5"
        opacity=".18"
        filter={`url(#${contactShadow})`}
      />
      <polygon points={points([a, b, bottom(b), bottom(a)])} fill={`url(#${id})`} />
      <polygon points={points([a, d, bottom(d), bottom(a)])} fill="#383b40" />
      <polygon
        points={points([a, b, c, d])}
        fill="#606368"
        stroke="#787b80"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </g>
  );
}

const tray = {
  a: { x: -164, y: 118, z: -1 },
  b: { x: -65, y: 118, z: -1 },
  c: { x: -65, y: 118, z: 62 },
  d: { x: -164, y: 118, z: 62 },
};
const floor = (p: WorldPoint) => ({ ...p, y: 137 });

export function Tray({ front = false }: { front?: boolean }) {
  const { a, b, c, d } = tray;
  return front ? (
    <g>
      <polygon
        points={points([a, b, floor(b), floor(a)])}
        fill="#d1d3d5"
        stroke="#f6f7f8"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <polygon
        points={points([a, d, floor(d), floor(a)])}
        fill="#afb2b6"
        stroke="#eceef0"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </g>
  ) : (
    <g>
      <polygon points={points([floor(a), floor(b), floor(c), floor(d)])} fill="#b2b5b9" />
      <polygon
        points={points([d, c, floor(c), floor(d)])}
        fill="#8b8e92"
        stroke="#f6f7f8"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <polygon
        points={points([b, c, floor(c), floor(b)])}
        fill="#9b9ea2"
        stroke="#f6f7f8"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </g>
  );
}
