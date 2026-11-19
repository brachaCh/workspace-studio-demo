import { describe, expect, it } from "vitest";
import { buildDashboardDrawIoXml } from "@/lib/drawio-export";

describe("buildDashboardDrawIoXml", () => {
  it("includes labels and positions for each box", () => {
    const xml = buildDashboardDrawIoXml(
      [
        { id: "dashboard", label: "דשבורד" },
        { id: "tasks", label: "משימות <חדש>" },
      ],
      {
        dashboard: { x: 40, y: 40 },
        tasks: { x: 240, y: 40 },
      },
    );

    expect(xml).toContain('value="דשבורד"');
    expect(xml).toContain('value="משימות &lt;חדש&gt;"');
    expect(xml).toContain('x="40" y="40"');
    expect(xml).toContain('x="240" y="40"');
  });
});
