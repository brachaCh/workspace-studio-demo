"use client";

import { type ReactNode } from "react";
import { type AccentId, accentStyles } from "@/lib/theme";

export function Section({
  title,
  description,
  children,
  accent = "violet",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  accent?: AccentId;
}) {
  const a = accentStyles[accent];
  return (
    <section className={`glass-panel rounded-2xl p-6 ${a.groupBorder}`}>
      <header className="mb-5 border-b border-black/[0.06] pb-4">
        <h2 className="font-display text-xl font-normal text-[#17140f]">{title}</h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[#6f665a]">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-[#e0431f] text-white shadow-sm shadow-orange-900/20 hover:bg-[#f2542f] focus-visible:ring-orange-400"
      : variant === "secondary"
        ? "border border-black/15 bg-[#fffdf7] text-[#17140f] hover:border-black/25 hover:bg-white focus-visible:ring-orange-300"
        : "text-[#6f665a] hover:bg-black/[0.05] hover:text-[#17140f] focus-visible:ring-black/20";
  return (
    <button type={type} className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function CardButton({
  title,
  description,
  selected,
  onClick,
  accent = "indigo",
  onTitleChange,
  media,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  accent?: AccentId;
  onTitleChange?: (title: string) => void;
  media?: ReactNode;
}) {
  const a = accentStyles[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full rounded-xl border p-4 text-right transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        selected
          ? a.cardSelected
          : `border-black/[0.1] bg-[#fffdf7] text-[#17140f] shadow-sm ${a.cardHover}`,
        !selected && a.ring,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        {media ? <div className="shrink-0">{media}</div> : null}
        <div className="min-w-0 flex-1">
          {onTitleChange ? (
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={[
                "w-full rounded-md border px-2 py-1 text-sm font-semibold outline-none transition-colors focus:ring-2",
                selected
                  ? "border-white/50 bg-white text-[#17140f] placeholder:text-slate-400 focus:border-white focus:ring-white/40"
                  : "border-black/10 bg-white text-[#17140f] focus:border-orange-400 focus:ring-orange-100",
              ].join(" ")}
              placeholder="שם..."
            />
          ) : (
            <div className="font-display text-base font-normal">{title}</div>
          )}
          {description ? (
            <div
              className={
                selected ? "mt-1 text-sm text-white/85" : "mt-1 text-sm text-[#6f665a]"
              }
            >
              {description}
            </div>
          ) : null}
        </div>
        <div
          className={[
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition-colors",
            selected
              ? "border-white/50 bg-white/25 text-white"
              : "border-black/[0.15] bg-white/60 text-transparent",
          ].join(" ")}
        >
          {selected ? "✓" : ""}
        </div>
      </div>
    </button>
  );
}
