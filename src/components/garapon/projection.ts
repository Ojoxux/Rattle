// Orthographic projection of the drum's rotation plane. Depth stays fixed
// toward the back-left instead of rotating along with the front face.
export type Point = { x: number; y: number };
export type WorldPoint = Point & { z: number };
export function project3({ x, y, z }: WorldPoint): Point {
  return { x: AXLE.x + x * 0.86 - z * 0.8, y: AXLE.y + y - x * 0.18 - z / 6 };
}
export const AXLE: Point = { x: 233, y: 177 };
export const DEPTH: Point = { x: -48, y: -10 };

export function project(angle: number, radius: number): Point {
  return project3({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: 0 });
}

export function drumGeometry(angle: number) {
  const front = Array.from({ length: 8 }, (_, index) =>
    project(angle + ((-112.5 + index * 45) * Math.PI) / 180, 116),
  );
  const back = front.map((p) => ({ x: p.x + DEPTH.x, y: p.y + DEPTH.y }));
  const sides = front.flatMap((a, index) => {
    const next = (index + 1) % 8;
    const b = front[next];
    // Only the side panels facing the viewer are visible.
    const normal = { x: b.y - a.y, y: a.x - b.x };
    if (normal.x * DEPTH.x + normal.y * DEPTH.y <= 0) return [];
    const length = Math.hypot(normal.x, normal.y);
    const light = Math.max(0, (-normal.x * 0.45 - normal.y * 0.89) / length);
    return [{ points: [a, b, back[next], back[index]], light }];
  });
  return { front, back, sides };
}

export const polygonPoints = (points: Point[]) => points.map((p) => `${p.x},${p.y}`).join(" ");
