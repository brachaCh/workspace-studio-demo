"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Tab } from "@/lib/schema";
import {
  DESIGN_BOX_H,
  DESIGN_BOX_W,
  DESIGN_CANVAS_PAD,
  mergeDesignPositions,
  placeWithoutOverlap,
  type DesignLayout,
} from "@/lib/design-layout";
import { openDashboardInDrawIo } from "@/lib/drawio-export";

export type { DesignBoxPos, DesignLayout } from "@/lib/design-layout";

function canvasHeight(items: Tab[], positions: DesignLayout): number {
  if (!items.length) return 320;
  let maxY = 0;
  for (const item of items) {
    const pos = positions[item.id];
    if (pos) maxY = Math.max(maxY, pos.y + DESIGN_BOX_H);
  }
  return Math.max(320, maxY + DESIGN_CANVAS_PAD);
}

function DashboardStopNotice() {
  return (
    <div
      className="flex w-full items-center justify-center rounded-[1.25rem] border-2 border-red-400 bg-red-50/80 px-8 py-10 text-center shadow-md shadow-red-500/10 backdrop-blur-sm"
      role="status"
    >
      <p className="text-2xl font-extrabold leading-relaxed tracking-tight text-red-900 sm:text-3xl">
        עצור!
        <br />
        <span className="mt-2 block text-xl font-bold text-red-800 sm:text-2xl">
          זה השלב לשלוח ולקבל דמו - דשבורד
        </span>
      </p>
    </div>
  );
}

export function DashboardDesignStep({
  items,
  layout,
  onLayoutChange,
}: {
  items: Tab[];
  layout?: DesignLayout;
  onLayoutChange?: (layout: DesignLayout) => void;
}) {
  const positions = useMemo(
    () => mergeDesignPositions(
      items.map((t) => t.id),
      layout,
    ),
    [items, layout],
  );
  const itemIdsRef = useRef(items.map((t) => t.id));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DesignLayout | null>(null);
  const positionsRef = useRef(positions);
  const dragPreviewRef = useRef<DesignLayout | null>(null);
  const onLayoutChangeRef = useRef(onLayoutChange);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    positionsRef.current = positions;
    itemIdsRef.current = items.map((t) => t.id);
  }, [positions, items]);

  useEffect(() => {
    onLayoutChangeRef.current = onLayoutChange;
  }, [onLayoutChange]);

  const displayPositions = dragPreview ?? positions;
  const height = canvasHeight(items, displayPositions);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      const raw = {
        x: Math.max(0, drag.originX + dx),
        y: Math.max(0, drag.originY + dy),
      };
      const placed = placeWithoutOverlap(drag.id, raw, positionsRef.current);
      const next = { ...positionsRef.current, [drag.id]: placed };
      dragPreviewRef.current = next;
      setDragPreview(next);
    }

    function onPointerUp() {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      const finalLayout = dragPreviewRef.current;
      dragPreviewRef.current = null;
      setDragPreview(null);
      if (finalLayout) {
        onLayoutChangeRef.current?.(finalLayout);
      }
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  function onBoxPointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    setSelectedId(id);
    const pos = displayPositions[id];
    if (!pos) return;
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onOpenDrawIo() {
    openDashboardInDrawIo(
      items.map((t) => ({ id: t.id, label: t.label })),
      displayPositions,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardStopNotice />

      <div className="glass-panel rounded-[1.25rem] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold tracking-tight text-[#17140f]">עורך דיאגרמות</h3>
            <p className="mt-1 text-sm text-[#6f665a]">
              תצוגת wireframe של הדשבורד — גררו ריבועים לסידור. בפתיחת draw.io ייטענו כל הכפתורים
              שנבחרו.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDrawIo}
            disabled={!items.length}
            className="inline-flex items-center justify-center rounded-full bg-[#e0431f] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-600/25 transition-all duration-200 hover:scale-[1.02] hover:bg-[#0077ed] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            פתיחת draw.io ↗
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-black/[0.1] bg-white shadow-sm">
        <div className="glass-header flex items-center justify-between px-4 py-2.5">
          <span className="text-sm font-semibold text-[#17140f]">דשבורד — wireframe</span>
          <span className="text-xs text-[#6f665a]">{items.length} רכיבים · גרירה לסידור</span>
        </div>

        {items.length === 0 ? (
          <p className="m-4 rounded-xl border border-orange-200/70 bg-orange-50/80 px-4 py-3 text-sm text-orange-900">
            לא נבחרו כפתורים על הדשבורד. חזרו לשלב הקודם ובחרו לפחות כפתור אחד.
          </p>
        ) : (
          <div
            className="relative w-full cursor-default overflow-auto"
            style={{
              height,
              backgroundColor: "#f8f9fa",
              backgroundImage: `
                linear-gradient(to right, #d1d5db 1px, transparent 1px),
                linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
              `,
              backgroundSize: "10px 10px",
            }}
            onPointerDown={() => setSelectedId(null)}
          >
            {items.map((tab) => {
              const pos = displayPositions[tab.id] ?? { x: DESIGN_CANVAS_PAD, y: DESIGN_CANVAS_PAD };
              return (
                <WireframeBox
                  key={tab.id}
                  label={tab.label}
                  x={pos.x}
                  y={pos.y}
                  selected={selectedId === tab.id}
                  onPointerDown={(e) => onBoxPointerDown(e, tab.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function WireframeBox({
  label,
  x,
  y,
  selected,
  onPointerDown,
}: {
  label: string;
  x: number;
  y: number;
  selected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={onPointerDown}
      className={[
        "absolute flex cursor-grab select-none items-center justify-center bg-white px-3 text-center text-sm font-medium text-[#17140f] active:cursor-grabbing",
        selected
          ? "border-2 border-dashed border-[#e0431f] shadow-[0_0_0_2px_rgba(224,67,31,0.15)]"
          : "border border-[#17140f]",
      ].join(" ")}
      style={{
        left: x,
        top: y,
        width: DESIGN_BOX_W,
        height: DESIGN_BOX_H,
        direction: "rtl",
      }}
    >
      {selected ? (
        <>
          <span className="pointer-events-none leading-snug">{label}</span>
          <ResizeHandle className="absolute -right-1.5 -top-1.5" />
          <ResizeHandle className="absolute -left-1.5 -top-1.5" />
          <ResizeHandle className="absolute -right-1.5 -bottom-1.5" />
          <ResizeHandle className="absolute -left-1.5 -bottom-1.5" />
          <ResizeHandle className="absolute -top-1.5 left-1/2 -translate-x-1/2" />
          <ResizeHandle className="absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
          <ResizeHandle className="absolute -right-1.5 top-1/2 -translate-y-1/2" />
          <ResizeHandle className="absolute -left-1.5 top-1/2 -translate-y-1/2" />
        </>
      ) : (
        <span className="pointer-events-none leading-snug">{label}</span>
      )}
    </div>
  );
}

function ResizeHandle({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none h-2.5 w-2.5 rounded-full border-2 border-[#e0431f] bg-white ${className}`}
      aria-hidden
    />
  );
}
