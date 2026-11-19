"use client";

import { useState } from "react";
import { DemoScreen } from "./DemoScreen";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-[#e0431f]" : "bg-black/15",
      ].join(" ")}
      aria-pressed={on}
    >
      <span
        className={[
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          on ? "left-0.5" : "left-[1.375rem]",
        ].join(" ")}
      />
    </button>
  );
}

/* נתוני הדגמה בדויים */
type Integ = { id: string; name: string; desc: string; letter: string; color: string };
const INTEGRATIONS: Integ[] = [
  { id: "gcal", name: "Google Calendar", desc: "סנכרון פגישות ומשימות", letter: "G", color: "#4285f4" },
  { id: "whatsapp", name: "WhatsApp", desc: "שליחת הודעות ללקוחות", letter: "W", color: "#25d366" },
  { id: "gmail", name: "Gmail", desc: "שליחת מיילים אוטומטית", letter: "M", color: "#ea4335" },
  { id: "zoom", name: "Zoom", desc: "פתיחת שיחות וידאו", letter: "Z", color: "#2d8cff" },
];
export function IntegrationsDemo() {
  const [on, setOn] = useState<string[]>(["gcal"]);
  return (
    <DemoScreen tone="light" label="integrations">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">ממשקים</div>
        <ul className="flex flex-col gap-2">
          {INTEGRATIONS.map((it) => {
            const connected = on.includes(it.id);
            return (
              <li key={it.id} className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] p-2.5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
                  style={{ backgroundColor: it.color }}
                >
                  {it.letter}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#17140f]">{it.name}</div>
                  <div className="text-[0.7rem] text-[#6f665a]">
                    {connected ? "מחובר ✓" : it.desc}
                  </div>
                </div>
                <Toggle on={connected} onClick={() => setOn((p) => (p.includes(it.id) ? p.filter((x) => x !== it.id) : [...p, it.id]))} />
              </li>
            );
          })}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniIntegrations() {
  return (
    <div className="demo-float grid w-14 grid-cols-2 gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {["#4285f4", "#25d366", "#ea4335", "#2d8cff"].map((c, i) => (
        <span key={i} className="flex h-4 items-center justify-center rounded-md text-[0.55rem] font-black text-white" style={{ backgroundColor: c }}>
          {"GWMZ"[i]}
        </span>
      ))}
    </div>
  );
}

/* נתוני הדגמה בדויים */
export function SettingsDemo() {
  const [prefs, setPrefs] = useState({ emails: true, reminders: true, weekly: false, dark: false });
  const rows: { key: keyof typeof prefs; label: string; hint: string }[] = [
    { key: "emails", label: "התראות מייל", hint: "עדכונים חשובים למייל" },
    { key: "reminders", label: "תזכורות משימות", hint: "התראה לפני מועד יעד" },
    { key: "weekly", label: "סיכום שבועי", hint: "דוח פעילות כל יום ראשון" },
    { key: "dark", label: "מצב כהה", hint: "ערכת צבעים כהה לממשק" },
  ];
  return (
    <DemoScreen tone="light" label="settings">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">הגדרות</div>
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] p-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#17140f]">{r.label}</div>
                <div className="text-[0.7rem] text-[#6f665a]">{r.hint}</div>
              </div>
              <Toggle on={prefs[r.key]} onClick={() => setPrefs((p) => ({ ...p, [r.key]: !p[r.key] }))} />
            </li>
          ))}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniSettings() {
  return (
    <div className="demo-float flex w-16 flex-col gap-2 rounded-lg border border-black/10 bg-[#fffdf7] p-2 shadow-sm">
      {[true, false, true].map((on, i) => (
        <div key={i} className="flex items-center justify-between gap-1">
          <span className="h-1 w-5 rounded-full bg-black/15" />
          <span className={`relative h-2.5 w-5 rounded-full ${on ? "bg-[#e0431f]" : "bg-black/15"}`}>
            <span className={`absolute top-0.5 h-1.5 w-1.5 rounded-full bg-white ${on ? "left-0.5" : "left-3"}`} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* נתוני הדגמה בדויים */
type Role = "מנהלת" | "עורכת" | "צפייה";
type Member = { id: number; name: string; initials: string; role: Role };
const ROLES: Role[] = ["מנהלת", "עורכת", "צפייה"];
export function PermissionsDemo() {
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "יעל מזרחי", initials: "ימ", role: "מנהלת" },
    { id: 2, name: "רותי לוי", initials: "רל", role: "עורכת" },
    { id: 3, name: "מיכל דוד", initials: "מד", role: "צפייה" },
  ]);
  return (
    <DemoScreen tone="light" label="users">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">מורשות</div>
        <ul className="flex flex-col gap-2">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7a1533] to-[#e0431f] text-xs font-bold text-white">
                {m.initials}
              </span>
              <div className="min-w-0 flex-1 text-sm font-bold text-[#17140f]">{m.name}</div>
              <div className="flex shrink-0 gap-1">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMembers((p) => p.map((x) => (x.id === m.id ? { ...x, role: r } : x)))}
                    className={[
                      "rounded-full px-2 py-1 text-[0.65rem] font-bold transition-colors",
                      m.role === r ? "bg-[#17140f] text-white" : "bg-black/[0.05] text-[#6f665a] hover:bg-black/10",
                    ].join(" ")}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniPermissions() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1.5 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {["נכ", "רל"].map((x, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-[#7a1533] to-[#e0431f] text-[0.5rem] font-bold text-white">
            {x}
          </span>
          <span className="h-2 flex-1 rounded-full bg-black/10" />
          <span className={`h-2 w-3 rounded-full ${i === 0 ? "bg-[#e0431f]" : "bg-black/15"}`} />
        </div>
      ))}
    </div>
  );
}

/* נתוני הדגמה בדויים */
const LINKS = [
  { id: "drive", label: "Drive", color: "#f5a623", letter: "D" },
  { id: "site", label: "האתר", color: "#0f766e", letter: "★" },
  { id: "zoom", label: "Zoom", color: "#2d8cff", letter: "Z" },
  { id: "sheets", label: "גיליונות", color: "#0f9d58", letter: "S" },
  { id: "wa", label: "וואטסאפ", color: "#25d366", letter: "W" },
  { id: "mail", label: "מייל", color: "#ea4335", letter: "M" },
];
export function QuickLinksDemo() {
  const [hit, setHit] = useState<string | null>(null);
  return (
    <DemoScreen tone="light" label="quick-links">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">קישורים מהירים</div>
        <div className="grid grid-cols-3 gap-2.5">
          {LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setHit(l.id);
                window.setTimeout(() => setHit((h) => (h === l.id ? null : h)), 1200);
              }}
              className="group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border border-black/[0.08] bg-[#fffdf7] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black text-white transition-transform group-hover:scale-110" style={{ backgroundColor: l.color }}>
                {l.letter}
              </span>
              <span className="text-[0.7rem] font-bold text-[#17140f]">{l.label}</span>
              {hit === l.id ? <span className="text-[0.55rem] font-bold text-emerald-600">נפתח ↗</span> : null}
            </button>
          ))}
        </div>
      </div>
    </DemoScreen>
  );
}
export function MiniQuickLinks() {
  return (
    <div className="demo-float grid w-14 grid-cols-3 gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {LINKS.slice(0, 6).map((l, i) => (
        <span key={i} className="flex h-3.5 items-center justify-center rounded-[3px] text-[0.5rem] font-black text-white" style={{ backgroundColor: l.color }}>
          {l.letter}
        </span>
      ))}
    </div>
  );
}
export function LinksDemo() {
  return (
    <DemoScreen tone="light" label="links">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">קישורים</div>
        <ul className="flex flex-col gap-2">
          {LINKS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] p-2.5 text-right transition-colors hover:border-[#e0431f]/30 hover:bg-black/[0.02]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black text-white" style={{ backgroundColor: l.color }}>
                  {l.letter}
                </span>
                <span className="min-w-0 flex-1 text-sm font-bold text-[#17140f]">{l.label}</span>
                <span className="shrink-0 text-[#6f665a]">↗</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniLinks() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1.5 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {LINKS.slice(0, 3).map((l, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-[3px]" style={{ backgroundColor: l.color }} />
          <span className="h-1 flex-1 rounded-full bg-black/15" />
          <span className="text-[0.5rem] text-[#6f665a]">↗</span>
        </div>
      ))}
    </div>
  );
}
