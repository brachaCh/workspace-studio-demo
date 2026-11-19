"use client";

import { useEffect } from "react";
import { getDemo } from "./registry";

export function DemoPreviewModal({
  tabId,
  onClose,
}: {
  tabId: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!tabId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [tabId, onClose]);

  if (!tabId) return null;
  const demo = getDemo(tabId);
  if (!demo) return null;

  const { title, subtitle, Component } = demo;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`דמו — ${title}`}
      onClick={onClose}
    >
      <div
        className="glass-panel my-auto flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-header flex items-start justify-between gap-3 px-6 py-4">
          <div>
            <div className="eyebrow text-[0.65rem] font-semibold text-[#e0431f]">
              דמו חי
            </div>
            <h2 className="font-display text-2xl font-normal leading-tight text-[#17140f]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-[#6f665a]">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="shrink-0 rounded-full p-2 text-[#6f665a] transition-colors hover:bg-black/[0.06] hover:text-[#17140f]"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-7">
          <Component />
        </div>

        <div className="border-t border-black/[0.06] bg-[#faf6ec] px-6 py-3 text-center text-xs text-[#6f665a]">
          זוהי הדגמה אינטראקטיבית — כך הפיצ׳ר יראה ויעבוד במערכת שלך
        </div>
      </div>
    </div>
  );
}
