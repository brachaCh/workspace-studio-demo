export type DesignBoxPos = { x: number; y: number };
export type DesignLayout = Record<string, DesignBoxPos>;

export const DESIGN_BOX_W = 168;
export const DESIGN_BOX_H = 76;
export const DESIGN_CANVAS_PAD = 48;
export const DESIGN_GAP_X = 72;
export const DESIGN_GAP_Y = 56;
export const DESIGN_GRID = 10;

export function snapDesignCoord(value: number): number {
  return Math.round(value / DESIGN_GRID) * DESIGN_GRID;
}

function boxesOverlap(a: DesignBoxPos, b: DesignBoxPos): boolean {
  return !(
    a.x + DESIGN_BOX_W <= b.x ||
    b.x + DESIGN_BOX_W <= a.x ||
    a.y + DESIGN_BOX_H <= b.y ||
    b.y + DESIGN_BOX_H <= a.y
  );
}

function overlapsAny(
  id: string,
  pos: DesignBoxPos,
  layout: DesignLayout,
): boolean {
  for (const [otherId, otherPos] of Object.entries(layout)) {
    if (otherId === id) continue;
    if (boxesOverlap(pos, otherPos)) return true;
  }
  return false;
}

function distance(a: DesignBoxPos, b: DesignBoxPos): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/** Snap and move beside other boxes — never allow overlap. */
export function placeWithoutOverlap(
  id: string,
  proposed: DesignBoxPos,
  layout: DesignLayout,
): DesignBoxPos {
  const snapped: DesignBoxPos = {
    x: snapDesignCoord(Math.max(0, proposed.x)),
    y: snapDesignCoord(Math.max(0, proposed.y)),
  };

  if (!overlapsAny(id, snapped, layout)) return snapped;

  const candidates: DesignBoxPos[] = [snapped];

  for (const [otherId, otherPos] of Object.entries(layout)) {
    if (otherId === id) continue;
    candidates.push(
      { x: snapDesignCoord(otherPos.x + DESIGN_BOX_W + DESIGN_GAP_X), y: otherPos.y },
      { x: snapDesignCoord(otherPos.x - DESIGN_BOX_W - DESIGN_GAP_X), y: otherPos.y },
      { x: otherPos.x, y: snapDesignCoord(otherPos.y + DESIGN_BOX_H + DESIGN_GAP_Y) },
      { x: otherPos.x, y: snapDesignCoord(otherPos.y - DESIGN_BOX_H - DESIGN_GAP_Y) },
    );
  }

  let best: DesignBoxPos | null = null;
  let bestDist = Infinity;

  for (const candidate of candidates) {
    const pos = {
      x: Math.max(0, candidate.x),
      y: Math.max(0, candidate.y),
    };
    if (overlapsAny(id, pos, layout)) continue;
    const dist = distance(pos, snapped);
    if (dist < bestDist) {
      bestDist = dist;
      best = pos;
    }
  }

  if (best) return best;
  return findNextFreeSlot(id, layout, snapped);
}

function findNextFreeSlot(
  id: string,
  layout: DesignLayout,
  near: DesignBoxPos,
): DesignBoxPos {
  const maxCols = 8;
  let best: DesignBoxPos | null = null;
  let bestDist = Infinity;

  for (let row = 0; row < 24; row++) {
    for (let col = 0; col < maxCols; col++) {
      const pos = {
        x: DESIGN_CANVAS_PAD + col * (DESIGN_BOX_W + DESIGN_GAP_X),
        y: DESIGN_CANVAS_PAD + row * (DESIGN_BOX_H + DESIGN_GAP_Y),
      };
      if (overlapsAny(id, pos, layout)) continue;
      const dist = distance(pos, near);
      if (dist < bestDist) {
        bestDist = dist;
        best = pos;
      }
    }
  }

  return (
    best ?? {
      x: snapDesignCoord(Math.max(0, near.x)),
      y: snapDesignCoord(Math.max(0, near.y)),
    }
  );
}

/** Fix overlapping saved positions — each box sits beside others, not on top. */
export function resolveLayoutOverlaps(itemIds: string[], layout: DesignLayout): DesignLayout {
  const defaults = initialDesignPositions(itemIds);
  const resolved: DesignLayout = {};

  for (const id of itemIds) {
    const proposed = layout[id] ?? defaults[id] ?? { x: DESIGN_CANVAS_PAD, y: DESIGN_CANVAS_PAD };
    resolved[id] = placeWithoutOverlap(id, proposed, resolved);
  }

  return resolved;
}

export function initialDesignPositions(
  itemIds: string[],
): DesignLayout {
  const cols = Math.max(2, Math.ceil(Math.sqrt(itemIds.length)));
  const positions: DesignLayout = {};
  itemIds.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[id] = {
      x: DESIGN_CANVAS_PAD + col * (DESIGN_BOX_W + DESIGN_GAP_X),
      y: DESIGN_CANVAS_PAD + row * (DESIGN_BOX_H + DESIGN_GAP_Y),
    };
  });
  return positions;
}

export function mergeDesignPositions(
  itemIds: string[],
  saved: DesignLayout | undefined,
): DesignLayout {
  const merged: DesignLayout = { ...initialDesignPositions(itemIds) };
  if (saved) {
    for (const id of itemIds) {
      if (saved[id]) merged[id] = saved[id];
    }
  }
  return resolveLayoutOverlaps(itemIds, merged);
}
