import type { CustomModuleField, Field } from "@/lib/schema";

export const CUSTOM_MODULE_FIELD_PREFIX = "field__custom__";

export function isCustomModuleFieldId(id: string): boolean {
  return id.startsWith(CUSTOM_MODULE_FIELD_PREFIX);
}

export function newCustomModuleFieldId(): string {
  return `${CUSTOM_MODULE_FIELD_PREFIX}${crypto.randomUUID()}`;
}

export function newCustomModuleField(featureId: string): CustomModuleField {
  return { id: newCustomModuleFieldId(), featureId, label: "" };
}

export function customModuleFieldsToSchemaFields(
  customFields: CustomModuleField[],
): Field[] {
  return customFields.map((c) => ({
    id: c.id,
    type: "textarea" as const,
    label: c.label.trim() || "שדה חדש",
    when: { featuresAny: [c.featureId] },
  }));
}

export function moduleFieldLabel(
  id: string,
  customFields: CustomModuleField[],
  schemaFields: { id: string; label: string }[] = [],
  catalogFields: CustomModuleField[] = [],
): string {
  const custom = customFields.find((f) => f.id === id);
  if (custom?.label.trim()) return custom.label.trim();
  const catalog = catalogFields.find((f) => f.id === id);
  if (catalog?.label.trim()) return catalog.label.trim();
  if (custom) return "שדה חדש (ללא שם)";
  return schemaFields.find((f) => f.id === id)?.label ?? id;
}

/** Raw label for editable inputs — no fallback placeholder text. */
export function editableModuleFieldLabel(
  id: string,
  customFields: CustomModuleField[],
  schemaFields: { id: string; label: string }[] = [],
): string {
  const custom = customFields.find((f) => f.id === id);
  if (custom) return custom.label;
  return schemaFields.find((f) => f.id === id)?.label ?? "";
}

export function customFieldsForFeature(
  customFields: CustomModuleField[],
  featureId: string,
): CustomModuleField[] {
  return customFields.filter((f) => f.featureId === featureId);
}

export function mergeModuleFieldLabels(
  staticFields: Field[],
  overrides: CustomModuleField[],
): Field[] {
  const overrideById = new Map(
    overrides.filter((o) => o.label.trim()).map((o) => [o.id, o.label.trim()]),
  );
  return staticFields.map((f) => ({
    ...f,
    label: overrideById.get(f.id) ?? f.label,
  }));
}
