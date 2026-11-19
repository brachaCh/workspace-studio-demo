/** Upsert a label override (static schema id or custom id) into a custom-items array. */
export function upsertLabel<T extends { id: string; label: string }>(
  items: T[],
  item: T,
): T[] {
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    const next = [...items];
    next[idx] = { ...next[idx], ...item };
    return next;
  }
  return [...items, item];
}
