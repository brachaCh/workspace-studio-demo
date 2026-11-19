import { businessFields, contactFields, features, fields, tabs } from "@/lib/schema";

export const staticTabIds = new Set(tabs.map((t) => t.id));
export const staticFeatureIds = new Set(features.map((f) => f.id));
export const staticBusinessFieldIds = new Set(businessFields.map((f) => f.id));
export const staticContactFieldIds = new Set(contactFields.map((f) => f.id));
export const staticModuleFieldIds = new Set(fields.map((f) => f.id));

export const schemaLabelById = new Map<string, string>([
  ...tabs.map((t) => [t.id, t.label] as const),
  ...features.map((f) => [f.id, f.label] as const),
  ...businessFields.map((f) => [f.id, f.label] as const),
  ...contactFields.map((f) => [f.id, f.label] as const),
  ...fields.map((f) => [f.id, f.label] as const),
]);
