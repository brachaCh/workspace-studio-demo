import { describe, expect, it } from "vitest";
import { emptyCatalog } from "@/lib/catalog";
import { ownedCustomItems, promotableCustomItems, promotableCustomItemsFromSubmission } from "@/lib/catalog-custom";

describe("ownedCustomItems", () => {
  it("accepts valid custom dashboard tab with correct prefix", () => {
    const owned = ownedCustomItems(
      {
        tabs: ["dashboard__custom__abc"],
        features: [],
        customDashboardTabs: [{ id: "dashboard__custom__abc", label: "טאב חדש" }],
        customModuleFeatures: [],
        customBusinessFields: [],
        customContactFields: [],
        customModuleFields: [],
      },
      emptyCatalog(),
    );
    expect(owned.customDashboardTabs).toHaveLength(1);
    expect(owned.customDashboardTabs[0]?.label).toBe("טאב חדש");
  });

  it("rejects custom tab with wrong prefix", () => {
    const owned = ownedCustomItems(
      {
        tabs: ["evil_tab"],
        features: [],
        customDashboardTabs: [{ id: "evil_tab", label: "זדוני" }],
        customModuleFeatures: [],
        customBusinessFields: [],
        customContactFields: [],
        customModuleFields: [],
      },
      emptyCatalog(),
    );
    expect(owned.customDashboardTabs).toHaveLength(0);
  });

  it("rejects labels longer than max length", () => {
    const owned = ownedCustomItems(
      {
        tabs: [],
        features: [],
        customDashboardTabs: [{ id: "dashboard__custom__x", label: "א".repeat(121) }],
        customModuleFeatures: [],
        customBusinessFields: [],
        customContactFields: [],
        customModuleFields: [],
      },
      emptyCatalog(),
    );
    expect(owned.customDashboardTabs).toHaveLength(0);
  });
});

describe("promotableCustomItems", () => {
  it("excludes items already in catalog", () => {
    const owned = {
      customDashboardTabs: [{ id: "dashboard__custom__a", label: "א" }],
      customModuleFeatures: [],
      customBusinessFields: [],
      customContactFields: [],
      customModuleFields: [],
    };
    const catalog = {
      ...emptyCatalog(),
      dashboardTabs: [{ id: "dashboard__custom__a", label: "א" }],
    };
    const promotable = promotableCustomItems(owned, catalog);
    expect(promotable.customDashboardTabs).toHaveLength(0);
  });

  it("re-queues label change on an already-approved catalog item", () => {
    const promotable = promotableCustomItems(
      {
        customDashboardTabs: [],
        customModuleFeatures: [],
        customBusinessFields: [{ id: "business__general", label: "שם מעודכן שוב" }],
        customContactFields: [],
        customModuleFields: [],
      },
      {
        ...emptyCatalog(),
        businessFields: [{ id: "business__general", label: "שם מאושר" }],
      },
    );
    expect(promotable.customBusinessFields).toHaveLength(1);
  });
});

describe("promotableCustomItemsFromSubmission", () => {
  it("queues all owned custom tabs with valid labels", () => {
    const promotable = promotableCustomItemsFromSubmission(
      {
        tabs: ["dashboard__custom__selected"],
        features: [],
        fields: {},
        customDashboardTabs: [
          { id: "dashboard__custom__selected", label: "נבחר" },
          { id: "dashboard__custom__ignored", label: "לא נבחר" },
        ],
        customModuleFeatures: [],
        customBusinessFields: [],
        customContactFields: [],
        customModuleFields: [],
      },
      emptyCatalog(),
    );
    expect(promotable.customDashboardTabs).toHaveLength(2);
  });

  it("rejects invalid ids even when selected", () => {
    const promotable = promotableCustomItemsFromSubmission(
      {
        tabs: ["evil_tab"],
        features: [],
        fields: {},
        customDashboardTabs: [{ id: "evil_tab", label: "זדוני" }],
        customModuleFeatures: [],
        customBusinessFields: [],
        customContactFields: [],
        customModuleFields: [],
      },
      emptyCatalog(),
    );
    expect(promotable.customDashboardTabs).toHaveLength(0);
  });

  it("queues custom module fields with a label even without checkbox value", () => {
    const promotable = promotableCustomItemsFromSubmission(
      {
        tabs: [],
        features: ["dashboard__create_project"],
        fields: {},
        customDashboardTabs: [],
        customModuleFeatures: [],
        customBusinessFields: [],
        customContactFields: [],
        customModuleFields: [
          {
            id: "field__custom__abc",
            featureId: "dashboard__create_project",
            label: "שדה חדש",
          },
        ],
      },
      emptyCatalog(),
    );
    expect(promotable.customModuleFields).toHaveLength(1);
  });
});
