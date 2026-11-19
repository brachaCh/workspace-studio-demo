"use client";

import { useState, type ReactNode } from "react";
import { DemoScreen } from "./DemoScreen";

/* ---------- icons ---------- */
function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
      aria-hidden
    >
      {children}
    </svg>
  );
}
const IconMegaphone = (
  <Svg>
    <path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" />
    <path d="M15 8a4 4 0 0 1 0 8" />
  </Svg>
);
const IconFileText = (
  <Svg>
    <path d="M6 2h8l4 4v16H6Z" />
    <path d="M14 2v4h4" />
    <path d="M9 12h6M9 16h6" />
  </Svg>
);
const IconFileSign = (
  <Svg>
    <path d="M6 2h8l4 4v10H6Z" />
    <path d="M14 2v4h4" />
    <path d="M4 20c1.5-1.5 3-1.5 4 0s2.5 1.5 4 0 2.5-1.5 4 0" />
  </Svg>
);
const IconBook = (
  <Svg>
    <path d="M4 5a2 2 0 0 1 2-2h9v16H6a2 2 0 0 0-2 2Z" />
    <path d="M15 3h3a1 1 0 0 1 1 1v15" />
  </Svg>
);
const IconArchive = (
  <Svg>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
    <path d="M10 12h4" />
  </Svg>
);
const IconMail = (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
const IconRefresh = (
  <Svg>
    <path d="M4 10a8 8 0 0 1 14-4l2 2" />
    <path d="M20 14a8 8 0 0 1-14 4l-2-2" />
    <path d="M18 4v4h-4M6 20v-4h4" />
  </Svg>
);
const IconSparkle = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full" aria-hidden>
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8Z" />
  </svg>
);

/* ---------- generic hub demo ---------- */
type CardTone = "sky" | "emerald" | "amber";
const TONE: Record<CardTone, string> = {
  sky: "border-sky-300/50 bg-sky-50 text-sky-700",
  emerald: "border-emerald-300/50 bg-emerald-50 text-emerald-700",
  amber: "border-amber-300/50 bg-amber-50 text-amber-700",
};

type HubCard = {
  key: string;
  icon: ReactNode;
  title: string;
  hint: string;
  tone: CardTone;
  items: string[];
};

function HubDemo({
  label,
  heroIcon,
  title,
  subtitle,
  primaryLabel,
  primaryHint,
  cards,
}: {
  label: string;
  heroIcon: ReactNode;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHint: string;
  cards: HubCard[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  function fireNew() {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1800);
  }

  const openCard = cards.find((c) => c.key === open) ?? null;

  return (
    <DemoScreen tone="light" label={label}>
      <div className="flex flex-col items-center gap-5">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7a1533] to-[#e0431f] p-3.5 text-white shadow-lg shadow-orange-900/25">
            {heroIcon}
            <span className="absolute -right-1 -top-1 h-5 w-5 text-[#f5a623] demo-float">{IconSparkle}</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-normal text-[#17140f]">{title}</h2>
          <p className="mt-1 max-w-xs text-sm text-[#6f665a]">{subtitle}</p>
        </div>

        {/* Primary action */}
        <button
          type="button"
          onClick={fireNew}
          className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-[#7a1533] to-[#e0431f] p-4 text-white shadow-md shadow-orange-900/20 transition-all duration-200 hover:-translate-y-0.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 p-2.5 transition-transform group-hover:scale-110">
            {IconSparkle}
          </span>
          <span className="min-w-0 flex-1 text-right">
            <span className="block font-bold">{primaryLabel}</span>
            <span className="block text-xs text-white/75">{primaryHint}</span>
          </span>
          <span className="text-white/80 transition-transform group-hover:-translate-x-1">←</span>
        </button>

        {flash ? (
          <div className="demo-pop flex items-center gap-2 rounded-full border border-[#f5a623]/40 bg-[#f5a623]/10 px-4 py-1.5 text-sm font-bold text-[#b45309]">
            <span className="h-4 w-4">{IconSparkle}</span>
            נוצר עם AI בכמה שניות ✨
          </div>
        ) : null}

        {/* Secondary actions */}
        <div className="grid w-full grid-cols-2 gap-3">
          {cards.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setOpen((v) => (v === c.key ? null : c.key))}
              className={[
                "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all duration-200 hover:-translate-y-0.5",
                TONE[c.tone],
                open === c.key ? "ring-2 ring-current ring-offset-2" : "",
              ].join(" ")}
            >
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 p-2.5">
                {c.icon}
                <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e0431f] px-1 text-[0.65rem] font-black text-white">
                  {c.items.length}
                </span>
              </span>
              <span className="text-sm font-black text-[#17140f]">{c.title}</span>
              <span className="text-[0.7rem] text-[#6f665a]">{c.hint}</span>
            </button>
          ))}
        </div>

        {/* Expanding panel */}
        {openCard ? (
          <div className="w-full rounded-2xl border border-black/[0.08] bg-[#faf6ec] p-3">
            <div className="mb-2 text-xs font-bold text-[#6f665a]">{openCard.title}</div>
            <ul className="flex flex-col gap-1.5">
              {openCard.items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-black/[0.06] bg-[#fffdf7] px-3 py-2 text-sm text-[#17140f]"
                >
                  <span className="h-6 w-6 shrink-0 rounded-md bg-black/[0.05] p-1.5 text-[#6f665a]">
                    {openCard.key === "guidelines" ? IconBook : IconFileText}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </DemoScreen>
  );
}

/* ---------- three demos ---------- */
export function MarketingDemo() {
  return (
    <HubDemo
      label="marketing"
      heroIcon={IconMegaphone}
      title="חומרי השיווק"
      subtitle="מליד ראשון ועד לקוח מרוצה — כל חומרי השיווק במקום אחד"
      primaryLabel="ליד חדש"
      primaryHint="הוספת לידים וחומרי שיווק חדשים"
      cards={[
        {
          key: "intro",
          icon: IconMail,
          title: "מייל היכרות",
          hint: "רושם ראשוני שאי אפשר לשכוח",
          tone: "sky",
          items: ["תבנית: פנייה ראשונה חמה", "תבנית: הצגת השירות", "תבנית: הזמנה לשיחה"],
        },
        {
          key: "followup",
          icon: IconRefresh,
          title: "פולו-אפ",
          hint: "תזכורת עדינה שסוגרת עסקאות",
          tone: "emerald",
          items: ["תזכורת אחרי 3 ימים", "תזכורת אחרי שבוע", "הצעה אחרונה"],
        },
      ]}
    />
  );
}

export function ProposalsDemo() {
  return (
    <HubDemo
      label="proposals"
      heroIcon={IconFileText}
      title="הצעות מחיר"
      subtitle="מהרעיון ועד הצעה מנצחת — הכל במקום אחד"
      primaryLabel="הצעה חדשה"
      primaryHint="יצירת הצעת מחיר חכמה עם AI"
      cards={[
        {
          key: "guidelines",
          icon: IconBook,
          title: "ההנחיות",
          hint: "כללי הזהב לפני שמתחילים",
          tone: "sky",
          items: ["להתאים לצרכי הלקוח", "לפרט תמורה ברורה", "לתמחר לפי ערך"],
        },
        {
          key: "archive",
          icon: IconArchive,
          title: "הארכיון",
          hint: "הצעות שמורות ומחכות",
          tone: "amber",
          items: ["הצעה — קליניקת שיניים.pdf", "הצעה — אתר תדמית.pdf", "הצעה — קמפיין השקה.pdf"],
        },
      ]}
    />
  );
}

export function AgreementsDemo() {
  return (
    <HubDemo
      label="agreements"
      heroIcon={IconFileSign}
      title="הסכמים"
      subtitle="סוגרים דברים כמו שצריך — הסכם מסודר בכמה דקות"
      primaryLabel="הסכם חדש"
      primaryHint="יצירת הסכם חכם עם AI"
      cards={[
        {
          key: "guidelines",
          icon: IconBook,
          title: "ההנחיות",
          hint: "כללי הזהב לפני שמתחילים",
          tone: "sky",
          items: ["להגדיר תנאי תשלום", "לציין לוחות זמנים", "סעיף ביטול הוגן"],
        },
        {
          key: "archive",
          icon: IconArchive,
          title: "הארכיון",
          hint: "הסכמים שמורים ומחכים",
          tone: "amber",
          items: ["הסכם התקשרות — לקוח א׳.pdf", "הסכם שירות שנתי.pdf", "הסכם סודיות.pdf"],
        },
      ]}
    />
  );
}

/* ---------- minis ---------- */
function MiniHubBase({ icon, tone }: { icon: ReactNode; tone: string }) {
  return (
    <div className="demo-float relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br p-3.5 text-white shadow-sm ring-1 ring-black/10">
      <span className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tone}`} />
      <span className="relative h-full w-full">{icon}</span>
      <span className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-[#f5a623]">{IconSparkle}</span>
    </div>
  );
}
export function MiniMarketing() {
  return <MiniHubBase icon={IconMegaphone} tone="from-[#7a1533] to-[#e0431f]" />;
}
export function MiniProposals() {
  return <MiniHubBase icon={IconFileText} tone="from-[#0f766e] to-[#2dd4bf]" />;
}
export function MiniAgreements() {
  return <MiniHubBase icon={IconFileSign} tone="from-[#1d4ed8] to-[#38bdf8]" />;
}
