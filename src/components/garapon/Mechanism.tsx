import { useId } from "react";
import { DEPTH, drumGeometry, polygonPoints, project, project3 } from "./projection";
import { PrizeBall } from "./generatedArt";

export function Mechanism({ angle, part }: { angle: number; part: "drum" | "handle" }) {
  const id = useId();
  const wood = `${id}-wood`;
  const metal = `${id}-metal`;
  const { front, back, sides } = drumGeometry(angle);
  const hub = project3({ x: 0, y: 0, z: -24 });
  const crankPoint = (offset: number, radius: number) =>
    project3({
      x: Math.cos(angle + offset) * radius,
      y: Math.sin(angle + offset) * radius,
      z: -24,
    });
  const elbow = crankPoint(0.55, 80);
  const tip = crankPoint(0.4, 113);
  const opening = project(angle + 2.86, 103);

  return (
    <g>
      <defs>
        <linearGradient id={wood} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f0bc79" />
          <stop offset=".5" stopColor="#dda054" />
          <stop offset="1" stopColor="#c8883c" />
        </linearGradient>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#eee" />
          <stop offset=".45" stopColor="#999" />
          <stop offset="1" stopColor="#626262" />
        </linearGradient>
      </defs>
      {part === "drum" ? (
        <>
          <polygon points={polygonPoints(back)} fill="#a66c31" />
          {sides.map((side, index) => (
            <polygon
              key={index}
              points={polygonPoints(side.points)}
              fill={`hsl(33 70% ${42 + side.light * 30}%)`}
              stroke={`hsl(34 75% ${49 + side.light * 29}%)`}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
          <polygon
            points={polygonPoints(front)}
            fill={`url(#${wood})`}
            stroke="#f6cb91"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* The discharge opening follows the drum around the axle. */}
          <ellipse
            cx={opening.x + DEPTH.x * 0.76}
            cy={opening.y + DEPTH.y * 0.76}
            rx="4.3"
            ry="7"
            fill="#50391f"
            opacity={Math.cos(angle + 2.86) < -0.82 ? 1 : 0}
          />
        </>
      ) : (
        <>
          {/* The projected crank changes shape; its highlight does not rotate. */}
          <path
            d={`M${hub.x} ${hub.y}L${elbow.x} ${elbow.y}L${tip.x} ${tip.y}`}
            fill="none"
            stroke="#353637"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={`M${hub.x} ${hub.y - 2}L${elbow.x} ${elbow.y - 2}L${tip.x} ${tip.y - 2}`}
            fill="none"
            stroke="#626364"
            strokeWidth="7"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <ellipse cx={hub.x - 3} cy={hub.y} rx="15" ry="18" fill="#3d3e3f" />
          <ellipse
            cx={hub.x}
            cy={hub.y}
            rx="13"
            ry="16"
            fill={`url(#${metal})`}
            stroke="#ddd"
            strokeWidth="1"
          />
          <ellipse cx={hub.x + 1} cy={hub.y} rx="6" ry="7" fill="#505152" />
          <svg x={tip.x - 18} y={tip.y - 18} width="36" height="36" viewBox="0 0 30 30">
            <PrizeBall prizeId="A" />
          </svg>
        </>
      )}
    </g>
  );
}
