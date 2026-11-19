import {
  BUSINESS_FIELD_GROUP,
  CUSTOM_BUSINESS_FIELD_PREFIX,
  businessFieldLabel,
  cleanSubmittedBusinessFields,
  newCustomBusinessFieldId,
} from "@/lib/business-fields";
import {
  dashboardTabLabel,
  mergeDashboardTabs,
  newCustomDashboardTab,
} from "@/lib/dashboard-tabs";
import {
  customModuleFieldsToSchemaFields,
  isCustomModuleFieldId,
  newCustomModuleField,
} from "@/lib/custom-fields";
import {
  mergeModuleFeatures,
  moduleAllowsCustomFeatures,
  moduleFeatureLabel,
  newCustomModuleFeature,
} from "@/lib/custom-features";
import type {
  CustomBusinessField,
  CustomContactField,
  CustomDashboardTab,
  CustomModuleFeature,
  CustomModuleField,
  Feature,
  Field,
  FieldWhen,
  Tab,
} from "@/lib/schema";

import type { FieldOrderMap } from "@/lib/field-order";

export type DesignLayout = Record<string, { x: number; y: number }>;

export type SelectionState = {
  tabs: string[];
  features: string[];
  fields: Record<string, unknown>;
  fieldOrder: FieldOrderMap;
  designLayout: DesignLayout;
  customBusinessFields: CustomBusinessField[];
  customContactFields: CustomContactField[];
  customDashboardTabs: CustomDashboardTab[];
  customModuleFeatures: CustomModuleFeature[];
  customModuleFields: CustomModuleField[];
};

export {
  cleanSubmittedBusinessFields,
  businessFieldLabel,
  BUSINESS_FIELD_GROUP,
  dashboardTabLabel,
  mergeDashboardTabs,
  mergeModuleFeatures,
  moduleAllowsCustomFeatures,
  moduleFeatureLabel,
};

export function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function isWhenSatisfied(
  when: FieldWhen | undefined,
  state: Pick<SelectionState, "tabs" | "features">,
): boolean {
  if (!when) return true;
  if (when.businessStep || when.contactStep) return false;

  const tabsOk =
    !when.tabsAny?.length || when.tabsAny.some((t) => state.tabs.includes(t));
  const featuresOk =
    !when.featuresAny?.length ||
    when.featuresAny.some((f) => state.features.includes(f));

  return tabsOk && featuresOk;
}

export function visibleFeatures(all: Feature[], tabs: string[]): Feature[] {
  if (!tabs.length) return [];
  return all.filter((f) => tabs.includes(f.tabId));
}

export function visibleFields(all: Field[], state: SelectionState): Field[] {
  const staticVisible = all.filter(
    (f) =>
      !f.when?.businessStep &&
      !f.when?.contactStep &&
      isWhenSatisfied(f.when, state),
  );
  const customVisible = customModuleFieldsToSchemaFields(
    state.customModuleFields.filter((f) => state.features.includes(f.featureId)),
  );
  return [...staticVisible, ...customVisible];
}

export function businessStepFields(all: Field[]): Field[] {
  return all.filter((f) => f.when?.businessStep);
}

export function pruneSelectionsForTabs(
  state: SelectionState,
  allFeatures: Feature[],
): SelectionState {
  const allowedFeatureIds = new Set(
    visibleFeatures(allFeatures, state.tabs).map((f) => f.id),
  );

  const nextFeatures = state.features.filter((id) => allowedFeatureIds.has(id));
  const allowedFeatureSet = new Set(nextFeatures);
  return {
    ...state,
    features: nextFeatures,
    customModuleFields: state.customModuleFields.filter((f) =>
      allowedFeatureSet.has(f.featureId),
    ),
  };
}

export type FeatureGroup = { tab: Tab; features: Feature[] };

export function groupFeaturesByTab(
  allTabs: Tab[],
  allFeatures: Feature[],
  selectedTabIds: string[],
  options?: { includeEmptyTabs?: boolean },
): FeatureGroup[] {
  const groups = allTabs
    .filter((t) => selectedTabIds.includes(t.id))
    .map((t) => ({
      tab: t,
      features: allFeatures.filter((f) => f.tabId === t.id),
    }));
  if (options?.includeEmptyTabs) return groups;
  return groups.filter((g) => g.features.length > 0);
}

export function allTabsWithFeatures(allTabs: Tab[], allFeatures: Feature[]): FeatureGroup[] {
  return allTabs.map((t) => ({
    tab: t,
    features: allFeatures.filter((f) => f.tabId === t.id),
  }));
}

export type FieldGroup = { key: string; label: string; fields: Field[] };

export function groupFieldsByFeature(
  visible: Field[],
  allFeatures: Feature[],
  selectedFeatureIds?: ReadonlySet<string> | readonly string[],
): FieldGroup[] {
  const selected =
    selectedFeatureIds instanceof Set
      ? selectedFeatureIds
      : selectedFeatureIds
        ? new Set(selectedFeatureIds)
        : undefined;

  const general: Field[] = [];
  const byFeature = new Map<string, Field[]>();

  for (const f of visible) {
    const candidates = f.when?.featuresAny;
    if (candidates?.length) {
      const matchingFeatures = selected?.size
        ? candidates.filter((id) => selected.has(id))
        : [candidates[0]];

      for (const featureId of matchingFeatures) {
        const list = byFeature.get(featureId) ?? [];
        list.push(f);
        byFeature.set(featureId, list);
      }
    } else if (
      !f.id.startsWith(CUSTOM_BUSINESS_FIELD_PREFIX) &&
      !isCustomModuleFieldId(f.id)
    ) {
      general.push(f);
    }
  }

  const groups: FieldGroup[] = [];
  if (general.length) {
    groups.push({ key: "_general", label: "פרטים כלליים", fields: general });
  }
  for (const feature of allFeatures) {
    const list = byFeature.get(feature.id);
    if (list?.length) {
      groups.push({ key: feature.id, label: feature.label, fields: list });
    }
  }
  return groups;
}

function isFieldEmpty(field: Field, value: unknown): boolean {
  if (field.type === "checkbox") return value !== true;
  return value == null || (typeof value === "string" && value.trim() === "");
}

export function missingRequiredFields(
  visible: Field[],
  values: Record<string, unknown>,
): Field[] {
  return visible.filter((f) => f.required && isFieldEmpty(f, values[f.id]));
}

export function cleanSubmittedFields(
  visible: Field[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of visible) {
    const v = values[f.id];
    if (isFieldEmpty(f, v)) continue;
    out[f.id] = f.type === "checkbox" ? true : v;
  }
  return out;
}

export function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export function normalizeSelectionState(
  parsed: Partial<SelectionState>,
): SelectionState {
  return {
    tabs: uniq(parsed.tabs ?? []),
    features: uniq(parsed.features ?? []),
    fields: parsed.fields ?? {},
    fieldOrder: parsed.fieldOrder ?? {},
    designLayout: parsed.designLayout ?? {},
    customBusinessFields: uniqueById(parsed.customBusinessFields ?? []),
    customContactFields: uniqueById(parsed.customContactFields ?? []),
    customDashboardTabs: uniqueById(parsed.customDashboardTabs ?? []),
    customModuleFeatures: uniqueById(parsed.customModuleFeatures ?? []),
    customModuleFields: uniqueById(parsed.customModuleFields ?? []),
  };
}

export function newCustomBusinessField(): CustomBusinessField {
  return { id: newCustomBusinessFieldId(), label: "" };
}

export { newCustomDashboardTab, newCustomModuleFeature, newCustomModuleField };
