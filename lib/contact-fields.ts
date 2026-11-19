import type { CustomContactField } from "@/lib/schema";

export type { CustomContactField };

export const CONTACT_FIELD_GROUP = "פרטי הלקוח";
export const CUSTOM_CONTACT_FIELD_PREFIX = "contact__custom__";

export function isCustomContactFieldId(id: string): boolean {
  return id.startsWith(CUSTOM_CONTACT_FIELD_PREFIX);
}

export function newCustomContactFieldId(): string {
  return `${CUSTOM_CONTACT_FIELD_PREFIX}${crypto.randomUUID()}`;
}

export function newCustomContactField(): CustomContactField {
  return { id: newCustomContactFieldId(), label: "" };
}

export function contactFieldLabel(
  id: string,
  customFields: CustomContactField[],
  schemaFields: { id: string; label: string }[] = [],
  catalogFields: CustomContactField[] = [],
): string {
  const custom = customFields.find((f) => f.id === id);
  if (custom?.label.trim()) return custom.label.trim();
  const catalog = catalogFields.find((f) => f.id === id);
  if (catalog?.label.trim()) return catalog.label.trim();
  if (custom) return "שדה נוסף (ללא כותרת)";
  return schemaFields.find((f) => f.id === id)?.label ?? id;
}

/** Raw label for editable inputs — no fallback placeholder text. */
export function editableContactFieldLabel(
  id: string,
  customFields: CustomContactField[],
  schemaFields: { id: string; label: string }[] = [],
): string {
  const custom = customFields.find((f) => f.id === id);
  if (custom) return custom.label;
  return schemaFields.find((f) => f.id === id)?.label ?? "";
}

export function cleanSubmittedContactFields(
  values: Record<string, unknown>,
  staticIds: string[],
  customFields: CustomContactField[],
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

export function contactStepFields(all: { when?: { contactStep?: boolean } }[]): typeof all {
  return all.filter((f) => f.when?.contactStep);
}
