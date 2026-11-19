"use client";

import { useState } from "react";
import { DemoScreen } from "./DemoScreen";

/* נתוני הדגמה בדויים */
type Lesson = { id: number; title: string; len: string; done: boolean };
export function CourseMaterialsDemo() {
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: 1, title: "מבוא — הכרת המערכת", len: "12 דק׳", done: true },
    { id: 2, title: "בניית דשבורד ראשון", len: "18 דק׳", done: true },
    { id: 3, title: "ניהול לקוחות ולידים", len: "22 דק׳", done: false },
    { id: 4, title: "אוטומציות ואינטגרציות", len: "15 דק׳", done: false },
    { id: 5, title: "דוחות ופיננסים", len: "20 דק׳", done: false },
  ]);
  const done = lessons.filter((l) => l.done).length;
  const pct = Math.round((done / lessons.length) * 100);
  return (
    <DemoScreen tone="light" label="course-materials">
      <div className="w-full">
        <div className="mb-1 font-display text-lg leading-tight text-[#17140f]">חומרי הקורס</div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.07]">
            <div className="h-full rounded-full bg-gradient-to-l from-[#e0431f] to-[#f5a623] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-mono text-xs font-bold text-[#6f665a]">{pct}%</span>
        </div>
        <ul className="flex flex-col gap-2">
          {lessons.map((l, i) => (
            <li key={l.id} className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] p-2.5">
              <button
                type="button"
                onClick={() => setLessons((p) => p.map((x) => (x.id === l.id ? { ...x, done: !x.done } : x)))}
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  l.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-black/20 text-[#6f665a]",
                ].join(" ")}
              >
                {l.done ? "✓" : i + 1}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold ${l.done ? "text-[#6f665a] line-through" : "text-[#17140f]"}`}>{l.title}</div>
                <div className="text-[0.7rem] text-[#6f665a]">▶ {l.len}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniCourse() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {[true, true, false].map((d, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className={`flex h-3 w-3 items-center justify-center rounded-full text-[0.5rem] text-white ${d ? "bg-emerald-500" : "bg-black/20"}`}>{d ? "✓" : ""}</span>
          <span className="h-1 flex-1 rounded-full bg-black/15" />
        </div>
      ))}
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-black/10">
        <div className="mini-media-bar h-full w-full rounded-full bg-gradient-to-l from-[#e0431f] to-[#f5a623]" />
      </div>
    </div>
  );
}

/* נתוני הדגמה בדויים */
const BLUEPRINTS = [
  { id: "launch", name: "פוסט השקה", emoji: "🚀", sample: "🚀 הרגע שחיכיתם לו הגיע! משיקים את… הצטרפו אלינו והיו הראשונים ליהנות." },
  { id: "tip", name: "טיפ מקצועי", emoji: "💡", sample: "💡 טיפ שיווקי: עקביות מנצחת מושלמות. פרסמו קבוע — הקהל שלכם יזכור." },
  { id: "story", name: "סיפור לקוח", emoji: "⭐", sample: "⭐ «העסק שלי זינק מאז שהתחלנו לעבוד יחד» — עוד לקוחה מרוצה מספרת." },
  { id: "sale", name: "מבצע", emoji: "🔥", sample: "🔥 רק השבוע: הטבה מיוחדת לנרשמים החדשים. אל תפספסו — כמות מוגבלת!" },
];
export function ContentCreationDemo() {
  const [sel, setSel] = useState<string | null>(null);
  const chosen = BLUEPRINTS.find((b) => b.id === sel);
  return (
    <DemoScreen tone="light" label="content">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">יצירת התוכן</div>
        <div className="grid grid-cols-2 gap-2">
          {BLUEPRINTS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSel(b.id)}
              className={[
                "flex items-center gap-2 rounded-xl border p-3 text-right transition-all duration-200 hover:-translate-y-0.5",
                sel === b.id ? "border-[#e0431f] bg-[#e0431f]/[0.06]" : "border-black/[0.08] bg-[#fffdf7]",
              ].join(" ")}
            >
              <span className="text-xl">{b.emoji}</span>
              <span className="text-sm font-bold text-[#17140f]">{b.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-black/[0.08] bg-[#faf6ec] p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[#e0431f]">
            <span>✨</span> תוכן שנוצר עם AI
          </div>
          <p className="min-h-16 text-sm leading-relaxed text-[#17140f]">
            {chosen ? chosen.sample : "בחרו תבנית למעלה כדי לראות תוכן לדוגמה שנוצר אוטומטית…"}
          </p>
        </div>
      </div>
    </DemoScreen>
  );
}
export function MiniContent() {
  return (
    <div className="demo-float relative flex h-14 w-14 items-center justify-center rounded-xl border border-black/10 bg-gradient-to-br from-[#e0431f]/12 to-[#f5a623]/12 shadow-sm">
      <span className="text-2xl">✨</span>
      <span className="absolute bottom-1 left-1 right-1 h-1 overflow-hidden rounded-full bg-black/10">
        <span className="mini-media-bar block h-full w-full rounded-full bg-gradient-to-l from-[#e0431f] to-[#f5a623]" />
      </span>
    </div>
  );
}

/* ============ הערכות — טופס הערכה עם דירוג כוכבים ============ */
const CRITERIA = ["שירות", "מקצועיות", "זמינות", "תוצאות"];
export function AssessmentsDemo() {
  const [ratings, setRatings] = useState<Record<string, number>>({ שירות: 4, מקצועיות: 5 });
  const avg =
    Object.keys(ratings).length > 0
      ? (Object.values(ratings).reduce((a, b) => a + b, 0) / CRITERIA.length).toFixed(1)
      : "0.0";
  return (
    <DemoScreen tone="light" label="assessments">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-lg leading-tight text-[#17140f]">הערכות</div>
          <span className="rounded-full bg-[#e0431f]/10 px-3 py-1 text-sm font-black text-[#e0431f]">
            ★ {avg}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {CRITERIA.map((c) => (
            <li key={c} className="flex items-center justify-between rounded-xl border border-black/[0.08] bg-[#fffdf7] p-3">
              <span className="text-sm font-bold text-[#17140f]">{c}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatings((p) => ({ ...p, [c]: star }))}
                    className={[
                      "text-xl transition-transform hover:scale-110",
                      (ratings[c] ?? 0) >= star ? "text-[#f5a623]" : "text-black/15",
                    ].join(" ")}
                  >
                    ★
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
export function MiniAssessments() {
  return (
    <div className="demo-float flex h-14 w-14 flex-col items-center justify-center gap-1 rounded-xl border border-black/10 bg-[#fffdf7] shadow-sm">
      <div className="flex gap-0.5 text-[0.6rem]">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i < 4 ? "text-[#f5a623]" : "text-black/15"}>★</span>
        ))}
      </div>
      <span className="text-sm font-black text-[#e0431f]">4.0</span>
    </div>
  );
}

/* נתוני הדגמה בדויים */
type Stage = "חדש" | "בטיפול" | "נסגר";
const STAGES: Stage[] = ["חדש", "בטיפול", "נסגר"];
const STAGE_CLASS: Record<Stage, string> = {
  חדש: "bg-sky-100 text-sky-700",
  בטיפול: "bg-amber-100 text-amber-700",
  נסגר: "bg-emerald-100 text-emerald-700",
};
type Lead = { id: number; name: string; stage: Stage };
export function MarketingLeadsDemo() {
  const [leads, setLeads] = useState<Lead[]>([
    { id: 1, name: "רבקה — קליניקה", stage: "חדש" },
    { id: 2, name: "משה — עסק משפחתי", stage: "בטיפול" },
    { id: 3, name: "שרה — רשת חנויות", stage: "בטיפול" },
    { id: 4, name: "דוד — סטארטאפ", stage: "נסגר" },
  ]);
  function advance(id: number) {
    setLeads((p) =>
      p.map((l) => {
        if (l.id !== id) return l;
        const i = STAGES.indexOf(l.stage);
        return { ...l, stage: STAGES[Math.min(i + 1, STAGES.length - 1)] };
      }),
    );
  }
  return (
    <DemoScreen tone="light" label="marketing">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">שיווק — לידים</div>
        <div className="grid grid-cols-3 gap-2">
          {STAGES.map((s) => (
            <div key={s} className="flex flex-col gap-2">
              <div className={`rounded-lg px-2 py-1 text-center text-[0.7rem] font-black ${STAGE_CLASS[s]}`}>
                {s} · {leads.filter((l) => l.stage === s).length}
              </div>
              {leads
                .filter((l) => l.stage === s)
                .map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => advance(l.id)}
                    title="העברה לשלב הבא"
                    className="rounded-lg border border-black/[0.08] bg-[#fffdf7] p-2 text-right text-[0.7rem] font-bold text-[#17140f] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#e0431f]/40"
                  >
                    {l.name}
                  </button>
                ))}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[0.7rem] text-[#6f665a]">לחצו על ליד כדי להעביר אותו לשלב הבא</p>
      </div>
    </DemoScreen>
  );
}
export function MiniMarketingLeads() {
  return (
    <div className="demo-float grid w-16 grid-cols-3 gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {[["#0284c7"], ["#d97706", "#d97706"], ["#059669"]].map((col, i) => (
        <div key={i} className="flex flex-col gap-1">
          {col.map((c, j) => (
            <span key={j} className="h-2.5 rounded-sm" style={{ backgroundColor: c, opacity: 0.6 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
