export type AccentId = "violet" | "indigo" | "sky" | "emerald" | "amber" | "rose";

export const tabAccent: Record<string, AccentId> = {
  business: "rose",
  dashboard: "violet",
  tasks: "sky",
  finance: "emerald",
  marketing: "amber",
  settings: "indigo",
};

/**
 * פלטה מגזינית חמה — המפתחות ההיסטוריים נשמרים אך ממופים לגווני jewel חמים:
 * violet→coral/orange, indigo→rose, sky→teal, emerald→emerald, amber→amber,
 * rose→fuchsia. כרטיס נבחר = מילוי רווי + פס מבטא צד + טקסט לבן.
 */
export const accentStyles: Record<
  AccentId,
  {
    cardSelected: string;
    cardHover: string;
    pillActive: string;
    groupBorder: string;
    groupBg: string;
    badge: string;
    ring: string;
  }
> = {
  violet: {
    cardSelected:
      "border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-600/25",
    cardHover: "hover:border-orange-300 hover:bg-orange-50/60",
    pillActive: "bg-orange-600 text-white shadow-sm shadow-orange-600/30",
    groupBorder: "border-r-4 border-r-orange-500",
    groupBg: "bg-orange-50/50",
    badge: "bg-orange-100/80 text-orange-800",
    ring: "focus-visible:ring-orange-400",
  },
  indigo: {
    cardSelected:
      "border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-600/25",
    cardHover: "hover:border-rose-300 hover:bg-rose-50/60",
    pillActive: "bg-rose-600 text-white shadow-sm shadow-rose-600/30",
    groupBorder: "border-r-4 border-r-rose-500",
    groupBg: "bg-rose-50/50",
    badge: "bg-rose-100/80 text-rose-800",
    ring: "focus-visible:ring-rose-400",
  },
  sky: {
    cardSelected:
      "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/25",
    cardHover: "hover:border-teal-300 hover:bg-teal-50/60",
    pillActive: "bg-teal-600 text-white shadow-sm shadow-teal-600/30",
    groupBorder: "border-r-4 border-r-teal-500",
    groupBg: "bg-teal-50/50",
    badge: "bg-teal-100/80 text-teal-800",
    ring: "focus-visible:ring-teal-400",
  },
  emerald: {
    cardSelected:
      "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25",
    cardHover: "hover:border-emerald-300 hover:bg-emerald-50/60",
    pillActive: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
    groupBorder: "border-r-4 border-r-emerald-500",
    groupBg: "bg-emerald-50/50",
    badge: "bg-emerald-100/80 text-emerald-800",
    ring: "focus-visible:ring-emerald-400",
  },
  amber: {
    cardSelected:
      "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/25",
    cardHover: "hover:border-amber-300 hover:bg-amber-50/60",
    pillActive: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
    groupBorder: "border-r-4 border-r-amber-400",
    groupBg: "bg-amber-50/50",
    badge: "bg-amber-100/80 text-amber-800",
    ring: "focus-visible:ring-amber-400",
  },
  rose: {
    cardSelected:
      "border-fuchsia-600 bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/25",
    cardHover: "hover:border-fuchsia-300 hover:bg-fuchsia-50/60",
    pillActive: "bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/30",
    groupBorder: "border-r-4 border-r-fuchsia-500",
    groupBg: "bg-fuchsia-50/50",
    badge: "bg-fuchsia-100/80 text-fuchsia-800",
    ring: "focus-visible:ring-fuchsia-400",
  },
};

export type FormStepId = "contact" | "business" | 1 | "design" | 2 | 3 | "notes";

export const stepAccents: Record<FormStepId, AccentId> = {
  contact: "indigo",
  business: "rose",
  1: "violet",
  design: "amber",
  2: "sky",
  3: "emerald",
  notes: "indigo",
};

export function accentForTab(tabId: string): AccentId {
  return tabAccent[tabId] ?? "indigo";
}
