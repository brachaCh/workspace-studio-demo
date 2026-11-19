import { describe, expect, it } from "vitest";
import {
  DESIGN_BOX_H,
  DESIGN_BOX_W,
  DESIGN_CANVAS_PAD,
  DESIGN_GAP_X,
  mergeDesignPositions,
  placeWithoutOverlap,
  resolveLayoutOverlaps,
} from "@/lib/design-layout";

describe("design layout overlap", () => {
  it("places overlapping box beside an existing one", () => {
    const layout = {
      a: { x: DESIGN_CANVAS_PAD, y: DESIGN_CANVAS_PAD },
    };
    const placed = placeWithoutOverlap(
      "b",
      { x: DESIGN_CANVAS_PAD + 20, y: DESIGN_CANVAS_PAD + 10 },
      layout,
    );

    const a = layout.a!;
    const overlaps = !(
      a.x + DESIGN_BOX_W <= placed.x ||
      placed.x + DESIGN_BOX_W <= a.x ||
      a.y + DESIGN_BOX_H <= placed.y ||
      placed.y + DESIGN_BOX_H <= a.y
    );
    expect(overlaps).toBe(false);
    expect(placed.x === a.x || placed.y === a.y).toBe(true);
  });

  it("resolves saved overlapping positions on merge", () => {
    const merged = mergeDesignPositions(["a", "b"], {
      a: { x: DESIGN_CANVAS_PAD, y: DESIGN_CANVAS_PAD },
      b: { x: DESIGN_CANVAS_PAD + 10, y: DESIGN_CANVAS_PAD + 10 },
    });

    const a = merged.a!;
    const b = merged.b!;
    const overlaps = !(
      a.x + DESIGN_BOX_W <= b.x ||
      b.x + DESIGN_BOX_W <= a.x ||
      a.y + DESIGN_BOX_H <= b.y ||
      b.y + DESIGN_BOX_H <= a.y
    );
    expect(overlaps).toBe(false);
  });

  it("resolveLayoutOverlaps keeps all items separated", () => {
    const resolved = resolveLayoutOverlaps(
      ["a", "b", "c"],
      {
        a: { x: 48, y: 48 },
        b: { x: 50, y: 50 },
        c: { x: 52, y: 52 },
      },
    );

    const positions = Object.values(resolved);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i]!;
        const b = positions[j]!;
        const overlaps = !(
          a.x + DESIGN_BOX_W <= b.x ||
          b.x + DESIGN_BOX_W <= a.x ||
          a.y + DESIGN_BOX_H <= b.y ||
          b.y + DESIGN_BOX_H <= a.y
        );
        expect(overlaps).toBe(false);
      }
    }
  });
});
