import { describe, expect, it } from "vitest";
import { normalizeSelectionState } from "@/lib/selection";

describe("normalizeSelectionState", () => {
  it("dedupes tabs and custom arrays", () => {
    const state = normalizeSelectionState({
      tabs: ["dashboard", "dashboard"],
      features: ["a", "a"],
      fields: {},
      fieldOrder: {},
      customDashboardTabs: [
        { id: "dashboard__custom__x", label: "א" },
        { id: "dashboard__custom__x", label: "ב" },
      ],
      customModuleFeatures: [],
      customBusinessFields: [],
      customContactFields: [],
      customModuleFields: [],
    });
    expect(state.tabs).toEqual(["dashboard"]);
    expect(state.features).toEqual(["a"]);
    expect(state.customDashboardTabs).toHaveLength(1);
  });
});
