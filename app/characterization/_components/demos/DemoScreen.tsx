"use client";

import type { ReactNode } from "react";

/**
 * מסגרת "חלון אפליקציה" ריאליסטית — כדי שהדמו בתוך הפופאפ ירגיש כמו מסך
 * אמיתי של המערכת (traffic-lights + שורת כתובת). tone קובע רקע בהיר/כהה.
 */
export function DemoScreen({
  label,
  tone = "light",
  children,
}: {
  label: string;
  tone?: "light" | "dark";
  children: ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={[
        "overflow-hidden rounded-xl shadow-[0_18px_50px_rgba(23,20,15,0.18)] ring-1",
        dark ? "bg-[#1c1712] ring-white/10" : "bg-[#fffdf7] ring-black/10",
      ].join(" ")}
    >
      {/* window chrome */}
      <div
        className={[
          "flex items-center gap-2 px-3 py-2",
          dark ? "bg-black/40" : "border-b border-black/[0.07] bg-black/[0.03]",
        ].join(" ")}
      >
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span
          className={[
            "mx-auto flex items-center gap-1.5 rounded-md px-3 py-0.5 text-[0.65rem] font-medium",
            dark ? "bg-white/10 text-white/55" : "bg-black/[0.05] text-[#6f665a]",
          ].join(" ")}
          dir="ltr"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden>
            <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" />
          </svg>
          studio.example.com/{label}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
