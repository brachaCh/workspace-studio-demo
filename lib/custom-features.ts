import type { CustomModuleFeature, Feature } from "@/lib/schema";

export const CUSTOM_MODULE_FEATURE_PREFIX = "module__custom__";

/** Modules that support adding custom feature buttons in step 2. */
export const MODULES_WITH_CUSTOM_FEATURES = new Set([
  "dashboard",
  "attendance_clock",
  "projects",
  "marketing_materials_gantt",
  "media",
  "assessments",
  "course_materials",
  "sales",
  "posts",
  "create_documents",
  "institutions_cluster",
  "suppliers_cluster",
  "self_entrepreneurship",
  "freelance_ventures",
  "tasks",
  "finance",
  "integrations",
  "chat",
  "quick_links",
  "links",
  "faq",
  "settings",
  "content_creation",
  "marketing",
  "meetings",
  "customers",
  "permissions",
]);

export function moduleAllowsCustomFeatures(tabId: string): boolean {
  return MODULES_WITH_CUSTOM_FEATURES.has(tabId);
}

export function newCustomModuleFeatureId(): string {
  return `${CUSTOM_MODULE_FEATURE_PREFIX}${crypto.randomUUID()}`;
}

export function newCustomModuleFeature(tabId: string): CustomModuleFeature {
  return { id: newCustomModuleFeatureId(), tabId, label: "" };
}

export function mergeModuleFeatures(
  staticFeatures: Feature[],
  customFeatures: CustomModuleFeature[],
): Feature[] {
  const overrideById = new Map(
    customFeatures.filter((c) => c.label.trim()).map((c) => [c.id, c.label.trim()]),
  );
  return [
    ...staticFeatures.map((f) => ({
      ...f,
      label: overrideById.get(f.id) ?? f.label,
    })),
    ...customFeatures
      .filter((c) => !staticFeatures.some((f) => f.id === c.id))
      .map((c) => ({
        id: c.id,
        tabId: c.tabId,
        label: c.label.trim() || "כפתור חדש",
        description: "נוסף ידנית",
      })),
  ];
}

export function moduleFeatureLabel(
  id: string,
  staticFeatures: Feature[],
  customFeatures: CustomModuleFeature[],
): string {
  const custom = customFeatures.find((f) => f.id === id);
  if (custom?.label.trim()) return custom.label.trim();
  const staticFeature = staticFeatures.find((f) => f.id === id);
  if (staticFeature) return staticFeature.label;
  if (custom) return "כפתור חדש (ללא שם)";
  return id;
}

export function customFeaturesForTab(
  customFeatures: CustomModuleFeature[],
  tabId: string,
): CustomModuleFeature[] {
  return customFeatures.filter((f) => f.tabId === tabId);
}
