import {
  DESIGN_BOX_H,
  DESIGN_BOX_W,
  DESIGN_CANVAS_PAD,
  type DesignLayout,
} from "@/lib/design-layout";

const DRAW_IO_BASE = "https://app.diagrams.net/";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type DrawIoDashboardItem = { id: string; label: string };

export function buildDashboardDrawIoXml(
  items: DrawIoDashboardItem[],
  positions: DesignLayout,
): string {
  const cells = items
    .map((item, index) => {
      const pos = positions[item.id] ?? { x: DESIGN_CANVAS_PAD, y: DESIGN_CANVAS_PAD };
      const id = index + 2;
      return `<mxCell id="${id}" value="${escapeXml(item.label)}" style="rounded=0;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;fontFamily=Helvetica;fontSize=14;strokeColor=#000000;fillColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="${pos.x}" y="${pos.y}" width="${DESIGN_BOX_W}" height="${DESIGN_BOX_H}" as="geometry"/></mxCell>`;
    })
    .join("");

  return `<mxfile host="app.diagrams.net" agent="workspace-studio-demo" version="22.1.0"><diagram name="דשבורד" id="dashboard-layout"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="0" arrows="0" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root></mxGraphModel></diagram></mxfile>`;
}

async function compressXmlForDrawIo(xml: string): Promise<string> {
  const encoded = encodeURIComponent(xml);
  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) bytes[i] = encoded.charCodeAt(i);

  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const buffer = await new Response(stream).arrayBuffer();
  const compressed = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < compressed.length; i++) binary += String.fromCharCode(compressed[i]!);
  return btoa(binary);
}

function buildDrawIoUrlFromXml(xml: string, compressed: boolean, data: string): string {
  const createObj = { type: "xml" as const, compressed, data };
  return `${DRAW_IO_BASE}?grid=1&pv=0&title=${encodeURIComponent("דשבורד")}#create=${encodeURIComponent(JSON.stringify(createObj))}`;
}

/** Opens draw.io with dashboard boxes pre-loaded (positions from wireframe). */
export async function buildDashboardDrawIoUrl(
  items: DrawIoDashboardItem[],
  positions: DesignLayout,
): Promise<string> {
  if (!items.length) return DRAW_IO_BASE;

  const xml = buildDashboardDrawIoXml(items, positions);

  if (typeof CompressionStream !== "undefined") {
    try {
      const data = await compressXmlForDrawIo(xml);
      return buildDrawIoUrlFromXml(xml, true, data);
    } catch {
      // fall through to uncompressed
    }
  }

  return buildDrawIoUrlFromXml(xml, false, xml);
}

export function openDashboardInDrawIo(
  items: DrawIoDashboardItem[],
  positions: DesignLayout,
): void {
  void buildDashboardDrawIoUrl(items, positions).then((url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  });
}
