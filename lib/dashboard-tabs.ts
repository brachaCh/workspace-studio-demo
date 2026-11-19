import type { CustomDashboardTab, Tab } from "@/lib/schema";

export const CUSTOM_DASHBOARD_TAB_PREFIX = "dashboard__custom__";

export function newCustomDashboardTabId(): string {
  return `${CUSTOM_DASHBOARD_TAB_PREFIX}${crypto.randomUUID()}`;
}

export function newCustomDashboardTab(): CustomDashboardTab {
  return { id: newCustomDashboardTabId(), label: "" };
}

export function mergeDashboardTabs(
  staticTabs: Tab[],
  customTabs: CustomDashboardTab[],
): Tab[] {
  const overrideById = new Map(
    customTabs.filter((c) => c.label.trim()).map((c) => [c.id, c.label.trim()]),
  );
  return [
    ...staticTabs.map((t) => ({
      ...t,
      label: overrideById.get(t.id) ?? t.label,
    })),
    ...customTabs
      .filter((c) => !staticTabs.some((t) => t.id === c.id))
      .map((c) => ({
        id: c.id,
        label: c.label.trim() || "כפתור חדש",
        description: "כפתור שהוסף ידנית",
      })),
  ];
}

export function dashboardTabLabel(
  id: string,
  staticTabs: Tab[],
  customTabs: CustomDashboardTab[],
): string {
  const custom = customTabs.find((t) => t.id === id);
  if (custom?.label.trim()) return custom.label.trim();
  const staticTab = staticTabs.find((t) => t.id === id);
  if (staticTab) return staticTab.label;
  if (custom) return "כפתור חדש (ללא שם)";
  return id;
}
