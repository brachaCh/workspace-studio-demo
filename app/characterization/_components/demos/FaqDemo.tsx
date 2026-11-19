"use client";

import { useMemo, useState } from "react";
import { DemoScreen } from "./DemoScreen";

type QA = { id: number; q: string; a: string };

const SEED: QA[] = [
  {
    id: 1,
    q: "איך מוסיפים לקוח חדש למערכת?",
    a: "נכנסים למודול הלקוחות, לוחצים על «לקוח חדש», ממלאים פרטים ושומרים. הלקוח יופיע מיד ברשימה.",
  },
  {
    id: 2,
    q: "כמה זמן לוקח להקים דשבורד?",
    a: "לרוב בין יום ליומיים לאחר קבלת האפיון המלא. אנחנו מעדכנים בכל שלב.",
  },
  {
    id: 3,
    q: "האם אפשר לשנות שדות בהמשך?",
    a: "בהחלט — כל שדה ניתן לעריכה, הוספה או הסרה בכל עת דרך ממשק הניהול.",
  },
];

export function FaqDemo() {
  const [items, setItems] = useState<QA[]>(SEED);
  const [openId, setOpenId] = useState<number | null>(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [nextId, setNextId] = useState(100);
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const s = search.trim();
    if (!s) return items;
    return items.filter((it) => it.q.includes(s) || it.a.includes(s));
  }, [items, search]);

  function add() {
    if (!q.trim() || !a.trim()) return;
    const id = nextId;
    setItems((prev) => [{ id, q: q.trim(), a: a.trim() }, ...prev]);
    setNextId((n) => n + 1);
    setOpenId(id);
    setQ("");
    setA("");
    setAdding(false);
  }

  return (
    <DemoScreen tone="light" label="qa">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-lg leading-tight text-[#17140f]">שו״ת</div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="rounded-lg bg-[#e0431f] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#f2542f]"
          >
            {adding ? "ביטול" : "+ שאלה חדשה"}
          </button>
        </div>

        {/* search */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש בשאלות ותשובות…"
          className="field-input mb-3 w-full"
        />

        {/* add composer */}
        {adding ? (
          <div className="mb-3 flex flex-col gap-2 rounded-xl border border-[#e0431f]/20 bg-[#faf6ec] p-3">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="השאלה…"
              className="field-input w-full font-semibold"
              autoFocus
            />
            <textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="התשובה…"
              className="field-input min-h-16 w-full"
            />
            <button
              type="button"
              onClick={add}
              className="self-end rounded-lg bg-[#17140f] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              שמירה
            </button>
          </div>
        ) : null}

        {/* accordion list */}
        <ul className="flex flex-col gap-2">
          {filtered.map((it) => {
            const open = openId === it.id;
            return (
              <li key={it.id} className="overflow-hidden rounded-xl border border-black/[0.08] bg-[#fffdf7]">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : it.id)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-right transition-colors hover:bg-black/[0.02]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e0431f]/10 text-sm font-black text-[#e0431f]">
                    ?
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-bold text-[#17140f]">{it.q}</span>
                  <span
                    className={[
                      "shrink-0 text-[#6f665a] transition-transform duration-200",
                      open ? "rotate-180" : "",
                    ].join(" ")}
                  >
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className={[
                    "grid transition-all duration-300",
                    open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-black/[0.06] px-3 py-3 pr-[3.25rem] text-sm leading-relaxed text-[#6f665a]">
                      {it.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="rounded-xl border border-dashed border-black/15 bg-[#faf6ec] py-6 text-center text-sm text-[#6f665a]">
              לא נמצאו תוצאות ל־«{search}»
            </li>
          ) : null}
        </ul>
      </div>
    </DemoScreen>
  );
}

/** תצוגת מיני חיה — שאלות שנפתחות ונסגרות */
export function MiniFaq() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-[#e0431f]/15 text-[0.5rem] font-black text-[#e0431f]">
            ?
          </span>
          <span
            className={[
              "h-1 rounded-full bg-black/15",
              i === 1 ? "mini-media-bar w-full bg-[#e0431f]/40" : "w-8",
            ].join(" ")}
          />
        </div>
      ))}
    </div>
  );
}
