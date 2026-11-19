import { isCustomBusinessFieldId } from "@/lib/business-fields";
import { isCustomContactFieldId } from "@/lib/contact-fields";
import { isCustomModuleFieldId } from "@/lib/custom-fields";
import { CUSTOM_MODULE_FEATURE_PREFIX } from "@/lib/custom-features";
import type { CatalogData } from "@/lib/catalog";
import type { CharacterizationPayload } from "@/lib/db/payload";
import { CUSTOM_DASHBOARD_TAB_PREFIX } from "@/lib/dashboard-tabs";
import type {
  CustomBusinessField,
  CustomContactField,
  CustomDashboardTab,
  CustomModuleFeature,
  CustomModuleField,
} from "@/lib/schema";
import {
  schemaLabelById,
  staticBusinessFieldIds,
  staticContactFieldIds,
  staticFeatureIds,
  staticModuleFieldIds,
  staticTabIds,
} from "@/lib/static-schema-ids";

export const MAX_CUSTOM_LABEL_LENGTH = 120;

export type CustomItemArrays = {
  customDashboardTabs: CustomDashboardTab[];
  customModuleFeatures: CustomModuleFeature[];
  customBusinessFields: CustomBusinessField[];
  customContactFields: CustomContactField[];
  customModuleFields: CustomModuleField[];
};

function unionById<T extends { id: string }>(mine: T[], extra: T[]): T[] {
  const seen = new Set(mine.map((m) => m.id));
  return [...mine, ...extra.filter((e) => !seen.has(e.id))];
}

function normalizeLabel(label: string): string {
  return label.trim().slice(0, MAX_CUSTOM_LABEL_LENGTH);
}

function isValidLabel(label: string): boolean {
  const trimmed = label.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_CUSTOM_LABEL_LENGTH;
}

function fieldSelected(fields: Record<string, unknown>, id: string): boolean {
  const value = fields[id];
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function isKnownDashboardTabId(id: string): boolean {
  return staticTabIds.has(id) || id.startsWith(CUSTOM_DASHBOARD_TAB_PREFIX);
}

function isKnownModuleFeatureId(id: string): boolean {
  return staticFeatureIds.has(id) || id.startsWith(CUSTOM_MODULE_FEATURE_PREFIX);
}

function isKnownBusinessFieldId(id: string): boolean {
  return staticBusinessFieldIds.has(id) || isCustomBusinessFieldId(id);
}

function isKnownContactFieldId(id: string): boolean {
  return staticContactFieldIds.has(id) || isCustomContactFieldId(id);
}

function isKnownModuleFieldId(id: string): boolean {
  return staticModuleFieldIds.has(id) || isCustomModuleFieldId(id);
}

function labelDiffersFromSchema(id: string, label: string): boolean {
  const schema = schemaLabelById.get(id);
  if (!schema) return true;
  return normalizeLabel(label) !== normalizeLabel(schema);
}

function allowedTabIds(
  payloadTabs: string[],
  ownedDashboardTabs: CustomDashboardTab[],
  catalog: CatalogData,
): Set<string> {
  return new Set([
    ...staticTabIds,
    ...ownedDashboardTabs.map((t) => t.id),
    ...catalog.dashboardTabs.filter((t) => payloadTabs.includes(t.id)).map((t) => t.id),
  ]);
}

function allowedFeatureIds(
  payloadFeatures: string[],
  ownedModuleFeatures: CustomModuleFeature[],
  catalog: CatalogData,
): Set<string> {
  return new Set([
    ...staticFeatureIds,
    ...ownedModuleFeatures.map((f) => f.id),
    ...catalog.moduleFeatures.filter((f) => payloadFeatures.includes(f.id)).map((f) => f.id),
  ]);
}

function sanitizeDashboardTab(item: CustomDashboardTab): CustomDashboardTab | null {
  if (!isKnownDashboardTabId(item.id)) return null;
  if (!isValidLabel(item.label)) return null;
  if (staticTabIds.has(item.id) && !labelDiffersFromSchema(item.id, item.label)) return null;
  return { id: item.id, label: normalizeLabel(item.label) };
}

function sanitizeBusinessField(item: CustomBusinessField): CustomBusinessField | null {
  if (!isKnownBusinessFieldId(item.id)) return null;
  if (!isValidLabel(item.label)) return null;
  if (staticBusinessFieldIds.has(item.id) && !labelDiffersFromSchema(item.id, item.label)) {
    return null;
  }
  return { id: item.id, label: normalizeLabel(item.label) };
}

function sanitizeContactField(item: CustomContactField): CustomContactField | null {
  if (!isKnownContactFieldId(item.id)) return null;
  if (!isValidLabel(item.label)) return null;
  if (staticContactFieldIds.has(item.id) && !labelDiffersFromSchema(item.id, item.label)) {
    return null;
  }
  return { id: item.id, label: normalizeLabel(item.label) };
}

function sanitizeModuleFeature(
  item: CustomModuleFeature,
  tabIds: Set<string>,
): CustomModuleFeature | null {
  if (!isKnownModuleFeatureId(item.id)) return null;
  if (!isValidLabel(item.label)) return null;
  if (!tabIds.has(item.tabId)) return null;
  if (staticFeatureIds.has(item.id) && !labelDiffersFromSchema(item.id, item.label)) return null;
  return {
    id: item.id,
    tabId: item.tabId,
    label: normalizeLabel(item.label),
  };
}

function sanitizeModuleField(
  item: CustomModuleField,
  featureIds: Set<string>,
): CustomModuleField | null {
  if (!isKnownModuleFieldId(item.id)) return null;
  if (!isValidLabel(item.label)) return null;
  if (!featureIds.has(item.featureId)) return null;
  if (staticModuleFieldIds.has(item.id) && !labelDiffersFromSchema(item.id, item.label)) {
    return null;
  }
  return {
    id: item.id,
    featureId: item.featureId,
    label: normalizeLabel(item.label),
  };
}

/** Custom items and label overrides the client claims — validated by known IDs and label. */
export function ownedCustomItems(
  raw: Pick<
    CharacterizationPayload,
    | "tabs"
    | "features"
    | "customDashboardTabs"
    | "customModuleFeatures"
    | "customBusinessFields"
    | "customContactFields"
    | "customModuleFields"
  >,
  catalog: CatalogData,
): CustomItemArrays {
  const customDashboardTabs = raw.customDashboardTabs
    .map(sanitizeDashboardTab)
    .filter((item): item is CustomDashboardTab => item != null);

  const tabIds = allowedTabIds(raw.tabs, customDashboardTabs, catalog);

  const customModuleFeatures = raw.customModuleFeatures
    .map((item) => sanitizeModuleFeature(item, tabIds))
    .filter((item): item is CustomModuleFeature => item != null);

  const featureIds = allowedFeatureIds(raw.features, customModuleFeatures, catalog);

  const customBusinessFields = raw.customBusinessFields
    .map(sanitizeBusinessField)
    .filter((item): item is CustomBusinessField => item != null);

  const customContactFields = (raw.customContactFields ?? [])
    .map(sanitizeContactField)
    .filter((item): item is CustomContactField => item != null);

  const customModuleFields = raw.customModuleFields
    .map((item) => sanitizeModuleField(item, featureIds))
    .filter((item): item is CustomModuleField => item != null);

  return {
    customDashboardTabs,
    customModuleFeatures,
    customBusinessFields,
    customContactFields,
    customModuleFields,
  };
}

/** Merge owned items with approved catalog labels currently in use. */
export function effectiveCustomArrays(
  payload: Pick<
    CharacterizationPayload,
    | "tabs"
    | "features"
    | "fields"
    | "customDashboardTabs"
    | "customModuleFeatures"
    | "customBusinessFields"
    | "customContactFields"
    | "customModuleFields"
  >,
  catalog: CatalogData,
): CustomItemArrays {
  const owned = ownedCustomItems(payload, catalog);

  return {
    customDashboardTabs: unionById(
      owned.customDashboardTabs,
      catalog.dashboardTabs.filter((t) => payload.tabs.includes(t.id)),
    ),
    customModuleFeatures: unionById(
      owned.customModuleFeatures,
      catalog.moduleFeatures.filter((f) => payload.features.includes(f.id)),
    ),
    customBusinessFields: unionById(
      owned.customBusinessFields,
      catalog.businessFields.filter((f) => fieldSelected(payload.fields, f.id)),
    ),
    customContactFields: unionById(
      owned.customContactFields,
      catalog.contactFields.filter((f) => fieldSelected(payload.fields, f.id)),
    ),
    customModuleFields: unionById(
      owned.customModuleFields,
      catalog.moduleFields.filter((f) => fieldSelected(payload.fields, f.id)),
    ),
  };
}

function catalogLabelById<T extends { id: string; label: string }>(
  items: T[],
): Map<string, string> {
  return new Map(items.map((item) => [item.id, normalizeLabel(item.label)]));
}

function shouldPromoteLabelChange(
  item: { id: string; label: string },
  catalogLabels: Map<string, string>,
): boolean {
  const normalized = normalizeLabel(item.label);
  const existing = catalogLabels.get(item.id);
  if (!existing) return true;
  return existing !== normalized;
}

/** New custom items and label changes queue for admin approval. */
export function promotableCustomItems(
  owned: CustomItemArrays,
  catalog: CatalogData,
): CustomItemArrays {
  const catalogTabLabels = catalogLabelById(catalog.dashboardTabs);
  const catalogFeatureLabels = catalogLabelById(catalog.moduleFeatures);
  const catalogBusinessLabels = catalogLabelById(catalog.businessFields);
  const catalogContactLabels = catalogLabelById(catalog.contactFields);
  const catalogModuleLabels = catalogLabelById(catalog.moduleFields);

  return {
    customDashboardTabs: owned.customDashboardTabs.filter((t) =>
      shouldPromoteLabelChange(t, catalogTabLabels),
    ),
    customModuleFeatures: owned.customModuleFeatures.filter((f) =>
      shouldPromoteLabelChange(f, catalogFeatureLabels),
    ),
    customBusinessFields: owned.customBusinessFields.filter((f) =>
      shouldPromoteLabelChange(f, catalogBusinessLabels),
    ),
    customContactFields: owned.customContactFields.filter((f) =>
      shouldPromoteLabelChange(f, catalogContactLabels),
    ),
    customModuleFields: owned.customModuleFields.filter((f) =>
      shouldPromoteLabelChange(f, catalogModuleLabels),
    ),
  };
}

export function promotableCustomItemsFromSubmission(
  raw: Pick<
    CharacterizationPayload,
    | "tabs"
    | "features"
    | "fields"
    | "customDashboardTabs"
    | "customModuleFeatures"
    | "customBusinessFields"
    | "customContactFields"
    | "customModuleFields"
  >,
  catalog: CatalogData,
): CustomItemArrays {
  const owned = ownedCustomItems(raw, catalog);
  return promotableCustomItems(owned, catalog);
}

export function characterizationPayloadForDb(
  raw: CharacterizationPayload,
  owned: CustomItemArrays,
): CharacterizationPayload {
  return {
    ...raw,
    customDashboardTabs: owned.customDashboardTabs,
    customModuleFeatures: owned.customModuleFeatures,
    customBusinessFields: owned.customBusinessFields,
    customContactFields: owned.customContactFields,
    customModuleFields: owned.customModuleFields,
  };
}
