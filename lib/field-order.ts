export type FieldOrderMap = Record<string, string[]>;

export const FIELD_ORDER_CONTACT = "contact";
export const FIELD_ORDER_BUSINESS = "business";
export const FIELD_ORDER_GENERAL = "_general";

export function fieldOrderSectionForFeature(featureId: string): string {
  return `feature:${featureId}`;
}

/** Merge stored order with the current field id set (append new ids at the end). */
export function resolveFieldOrder(
  storedOrder: string[] | undefined,
  fieldIds: string[],
): string[] {
  const allowed = new Set(fieldIds);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const id of storedOrder ?? []) {
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  for (const id of fieldIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }

  return out;
}

export function insertFieldRelative(
  storedOrder: string[] | undefined,
  fieldIds: string[],
  newId: string,
  anchorId: string,
  position: "before" | "after",
): string[] {
  const withNew = fieldIds.includes(newId) ? fieldIds : [...fieldIds, newId];
  const resolved = resolveFieldOrder(storedOrder, withNew).filter((id) => id !== newId);
  const anchorIdx = resolved.indexOf(anchorId);
  if (anchorIdx === -1) return resolveFieldOrder(storedOrder, withNew);
  const insertAt = position === "before" ? anchorIdx : anchorIdx + 1;
  resolved.splice(insertAt, 0, newId);
  return resolved;
}

export function moveField(
  storedOrder: string[] | undefined,
  fieldIds: string[],
  fieldId: string,
  direction: "up" | "down",
): string[] {
  const base = resolveFieldOrder(storedOrder, fieldIds);
  const idx = base.indexOf(fieldId);
  if (idx === -1) return base;
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= base.length) return base;
  const next = [...base];
  [next[idx], next[target]] = [next[target], next[idx]];
  return next;
}

/** Move dragged field to the position of target field (for drag-and-drop reorder). */
export function reorderField(
  storedOrder: string[] | undefined,
  fieldIds: string[],
  draggedId: string,
  targetId: string,
): string[] {
  const base = resolveFieldOrder(storedOrder, fieldIds);
  const fromIdx = base.indexOf(draggedId);
  const toIdx = base.indexOf(targetId);
  if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return base;
  const next = [...base];
  next.splice(fromIdx, 1);
  next.splice(toIdx, 0, draggedId);
  return next;
}

export function removeFieldFromOrder(
  storedOrder: string[] | undefined,
  fieldIds: string[],
  fieldId: string,
): string[] {
  return resolveFieldOrder(
    (storedOrder ?? []).filter((id) => id !== fieldId),
    fieldIds.filter((id) => id !== fieldId),
  );
}

export function pruneFieldOrder(
  fieldOrder: FieldOrderMap,
  sectionFieldIds: Record<string, string[]>,
): FieldOrderMap {
  const out: FieldOrderMap = {};
  for (const [section, ids] of Object.entries(sectionFieldIds)) {
    const pruned = resolveFieldOrder(fieldOrder[section], ids);
    if (pruned.length) out[section] = pruned;
  }
  return out;
}
