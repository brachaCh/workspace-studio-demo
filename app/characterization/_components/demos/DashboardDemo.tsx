"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DemoScreen } from "./DemoScreen";

type TileDef = {
  key: string;
  label: string;
  gradient: string;
  icon: ReactNode;
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const TILES: TileDef[] = [
  {
    key: "marketing",
    label: "שיווק",
    gradient: "from-[#e0431f] to-[#f5a623]",
    icon: (
      <Icon>
        <path d="M3 11v2a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" />
        <path d="M15 8a4 4 0 0 1 0 8" />
      </Icon>
    ),
  },
  {
    key: "tasks",
    label: "משימות",
    gradient: "from-[#0f766e] to-[#2dd4bf]",
    icon: (
      <Icon>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 3h6v3H9z" />
        <path d="M9 11l2 2 4-4" />
      </Icon>
    ),
  },
  {
    key: "projects",
    label: "פרויקטים",
    gradient: "from-[#7a1533] to-[#e0431f]",
    icon: (
      <Icon>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </Icon>
    ),
  },
  {
    key: "finance",
    label: "פיננסים",
    gradient: "from-[#166534] to-[#4ade80]",
    icon: (
      <Icon>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-4" />
        <path d="M12 16V8" />
        <path d="M16 16v-6" />
      </Icon>
    ),
  },
  {
    key: "media",
    label: "מדיה",
    gradient: "from-[#9333ea] to-[#e879f9]",
    icon: (
      <Icon>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m21 16-5-5L5 19" />
      </Icon>
    ),
  },
  {
    key: "chat",
    label: "צ׳אט",
    gradient: "from-[#1d4ed8] to-[#38bdf8]",
    icon: (
      <Icon>
        <path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </Icon>
    ),
  },
];

function greeting(h: number) {
  if (h < 6) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 18) return "צהריים טובים";
  return "ערב טוב";
}

export function DashboardDemo() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;
  const activeTile = TILES.find((t) => t.key === active);

  return (
    <DemoScreen tone="dark" label="dashboard">
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[0.7rem] font-medium text-white/50">{greeting(now.getHours())} 👋</div>
            <div className="font-display text-lg leading-tight text-white">הלוח שלי</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-white/80" dir="ltr">
              {timeStr}
            </span>
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e0431f] px-1 text-[9px] font-bold text-white">
                3
              </span>
            </span>
          </div>
        </div>

        {/* רשת אריחים */}
        <div className="grid grid-cols-3 gap-2.5">
          {TILES.map((tile) => {
            const isActive = active === tile.key;
            return (
              <button
                key={tile.key}
                type="button"
                onClick={() => setActive(tile.key)}
                className={[
                  "group flex aspect-square flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br p-2 text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110",
                  tile.gradient,
                  isActive ? "ring-2 ring-white ring-offset-2 ring-offset-[#2a221b]" : "",
                ].join(" ")}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 transition-transform group-hover:scale-110">
                  {tile.icon}
                </span>
                <span className="text-xs font-bold leading-tight">{tile.label}</span>
              </button>
            );
          })}
        </div>

        {/* פס תחתון — משוב חי על בחירה */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2.5">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            {activeTile ? (
              <span>
                נכנסת אל <span className="font-bold text-white">{activeTile.label}</span>
              </span>
            ) : (
              <span>לחצו על מודול כדי להיכנס</span>
            )}
          </div>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80">
            {TILES.length} מודולים
          </span>
        </div>
      </div>
    </DemoScreen>
  );
}

/** תצוגת מיני חיה של הדשבורד — רשת אריחים זעירה לכרטיס המודול */
export function MiniDashboard() {
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLit((n) => (n + 1) % 6), 700);
    return () => clearInterval(t);
  }, []);

  const gradients = [
    "from-[#e0431f] to-[#f5a623]",
    "from-[#0f766e] to-[#2dd4bf]",
    "from-[#7a1533] to-[#e0431f]",
    "from-[#166534] to-[#4ade80]",
    "from-[#9333ea] to-[#e879f9]",
    "from-[#1d4ed8] to-[#38bdf8]",
  ];

  return (
    <div className="demo-float relative overflow-hidden rounded-lg bg-[#1c1712] p-1.5 shadow-sm ring-1 ring-white/10">
      {/* בזל עליון של "מסך" */}
      <div className="mb-1 flex items-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-[#ff5f57]" />
        <span className="h-1 w-1 rounded-full bg-[#febc2e]" />
        <span className="h-1 w-1 rounded-full bg-[#28c840]" />
      </div>
      <div className="grid grid-cols-3 gap-1">
        {gradients.map((g, i) => (
          <span
            key={i}
            className={[
              "h-3.5 w-3.5 rounded-[3px] bg-gradient-to-br transition-all duration-300",
              g,
              lit === i
                ? "scale-125 opacity-100 shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                : "opacity-60",
            ].join(" ")}
          />
        ))}
      </div>
      {/* בוהק נע אלכסוני */}
      <span className="demo-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  );
}
