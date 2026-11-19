import type { CustomBusinessField } from "@/lib/schema";

export type { CustomBusinessField };

export const BUSINESS_FIELD_GROUP = "אפיון העסק";
export const CUSTOM_BUSINESS_FIELD_PREFIX = "business__custom__";

export function isCustomBusinessFieldId(id: string): boolean {
  return id.startsWith(CUSTOM_BUSINESS_FIELD_PREFIX);
}

export function newCustomBusinessFieldId(): string {
  return `${CUSTOM_BUSINESS_FIELD_PREFIX}${crypto.randomUUID()}`;
}

export function businessFieldLabel(
  id: string,
  customFields: CustomBusinessField[],
  schemaFields: { id: string; label: string }[] = [],
  catalogFields: CustomBusinessField[] = [],
): string {
  const custom = customFields.find((f) => f.id === id);
  if (custom?.label.trim()) return custom.label.trim();
  const catalog = catalogFields.find((f) => f.id === id);
  if (catalog?.label.trim()) return catalog.label.trim();
  if (custom) return "שדה נוסף (ללא כותרת)";
  return schemaFields.find((f) => f.id === id)?.label ?? id;
}

/** Raw label for editable inputs — no fallback placeholder text. */
export function editableBusinessFieldLabel(
  id: string,
  customFields: CustomBusinessField[],
  schemaFields: { id: string; label: string }[] = [],
): string {
  const custom = customFields.find((f) => f.id === id);
  if (custom) return custom.label;
  return schemaFields.find((f) => f.id === id)?.label ?? "";
}

export function cleanSubmittedBusinessFields(
  values: Record<string, unknown>,
  customFields: CustomBusinessField[],
  staticIds: string[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const id of staticIds) {
    const v = values[id];
    if (typeof v === "string" && v.trim()) out[id] = v.trim();
  }
  for (const custom of customFields) {
    const v = values[custom.id];
    if (typeof v === "string" && v.trim()) out[custom.id] = v.trim();
  }
  return out;
}
