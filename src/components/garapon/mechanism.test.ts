import { describe, expect, it } from "vite-plus/test";
import { AXLE, DEPTH, drumGeometry, project } from "./projection";

describe("projected garapon rotation", () => {
  it("keeps the axle stationary and the depth pointing back-left at every angle", () => {
    for (let step = 0; step < 32; step++) {
      const angle = (step * Math.PI) / 16;
      expect(project(angle, 0)).toEqual(AXLE);
      const { front, back, sides } = drumGeometry(angle);
      front.forEach((point, index) => {
        expect(back[index].x - point.x).toBeCloseTo(DEPTH.x);
        expect(back[index].y - point.y).toBeCloseTo(DEPTH.y);
      });
      expect(sides.length).toBeGreaterThan(0);
      expect(sides.length).toBeLessThanOrEqual(4);
    }
  });

  it("returns to the same geometry after a complete turn", () => {
    const start = drumGeometry(0).front;
    const end = drumGeometry(Math.PI * 2).front;
    start.forEach((point, index) => {
      expect(end[index].x).toBeCloseTo(point.x);
      expect(end[index].y).toBeCloseTo(point.y);
    });
  });
});
