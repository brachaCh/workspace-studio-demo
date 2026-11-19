"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoScreen } from "./DemoScreen";

type Status = "active" | "paused" | "completed";
type Priority = "urgent" | "high" | "normal";

type Step = { label: string; done: boolean };
type Project = {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  steps: Step[];
};

const STATUS_LABEL: Record<Status, string> = {
  active: "פעיל",
  paused: "מושהה",
  completed: "הושלם",
};
const STATUS_CLASS: Record<Status, string> = {
  active: "bg-teal-100 text-teal-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};
const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "דחוף",
  high: "גבוה",
  normal: "רגיל",
};
const PRIORITY_CLASS: Record<Priority, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-black/[0.06] text-[#6f665a]",
};

const FLOW = ["פתיחת תיק", "אפיון", "הצעת מחיר", "ביצוע", "מסירה"];

function makeSteps(doneCount: number): Step[] {
  return FLOW.map((label, i) => ({ label, done: i < doneCount }));
}

const SEED: Project[] = [
  { id: 1, title: "הקמת מותג — קליניקת שיניים", status: "active", priority: "high", steps: makeSteps(3) },
  { id: 2, title: "אתר תדמית לעסק משפחתי", status: "active", priority: "urgent", steps: makeSteps(1) },
  { id: 3, title: "קמפיין השקה — אפליקציה", status: "paused", priority: "normal", steps: makeSteps(2) },
  { id: 4, title: "מיתוג מחדש — רשת חנויות", status: "completed", priority: "normal", steps: makeSteps(5) },
];

type Filter = "all" | "active" | "paused";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "הכל" },
  { id: "active", label: "פעילים" },
  { id: "paused", label: "מושהים" },
];

export function ProjectsDemo() {
  const [projects, setProjects] = useState<Project[]>(SEED);
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(
    () => projects.filter((p) => (filter === "all" ? true : p.status === filter)),
    [projects, filter],
  );

  function toggleStep(projectId: number, stepIndex: number) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const steps = p.steps.map((s, i) => (i === stepIndex ? { ...s, done: !s.done } : s));
        const allDone = steps.every((s) => s.done);
        const anyDone = steps.some((s) => s.done);
        const status: Status = allDone ? "completed" : anyDone ? "active" : p.status;
        return { ...p, steps, status };
      }),
    );
  }

  return (
    <DemoScreen tone="light" label="projects">
      <div className="w-full">
        {/* Header + filters */}
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-lg leading-tight text-[#17140f]">הפרויקטים</div>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={[
                  "rounded-full px-2.5 py-1 text-[0.7rem] font-bold transition-colors",
                  filter === f.id
                    ? "bg-[#17140f] text-white"
                    : "bg-black/[0.05] text-[#6f665a] hover:bg-black/10",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project cards */}
        <ul className="flex flex-col gap-2.5">
          {shown.map((p) => {
            const done = p.steps.filter((s) => s.done).length;
            const pct = Math.round((done / p.steps.length) * 100);
            return (
              <li
                key={p.id}
                className="rounded-xl border border-black/[0.08] bg-[#fffdf7] p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 text-sm font-bold text-[#17140f]">{p.title}</h3>
                  <div className="flex shrink-0 gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${PRIORITY_CLASS[p.priority]}`}>
                      {PRIORITY_LABEL[p.priority]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${STATUS_CLASS[p.status]}`}>
                      {STATUS_LABEL[p.status]}
                    </span>
                  </div>
                </div>

                {/* progress */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-[#e0431f] to-[#f5a623] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[0.65rem] font-bold text-[#6f665a]">
                    {done}/{p.steps.length}
                  </span>
                </div>

                {/* flow steps — clickable */}
                <div className="mt-2.5 flex items-center gap-1">
                  {p.steps.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleStep(p.id, i)}
                      title={s.label}
                      className="group flex flex-1 flex-col items-center gap-1"
                    >
                      <span
                        className={[
                          "flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem] font-bold transition-all",
                          s.done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-black/20 bg-white text-[#6f665a] group-hover:border-[#e0431f]",
                        ].join(" ")}
                      >
                        {s.done ? (
                          <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden>
                            <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="w-full truncate text-center text-[0.55rem] leading-none text-[#6f665a]">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
          {shown.length === 0 ? (
            <li className="rounded-xl border border-dashed border-black/15 bg-[#faf6ec] py-6 text-center text-sm text-[#6f665a]">
              אין פרויקטים בסינון זה
            </li>
          ) : null}
        </ul>
      </div>
    </DemoScreen>
  );
}

/** תצוגת מיני חיה — ערימת פרויקטים עם פסי התקדמות שמתמלאים */
export function MiniProjects() {
  const [fill, setFill] = useState([30, 60, 45]);
  useEffect(() => {
    const t = setInterval(() => {
      setFill((prev) => prev.map((v) => (v >= 100 ? 20 : v + 15)));
    }, 800);
    return () => clearInterval(t);
  }, []);

  const colors = [
    "from-[#e0431f] to-[#f5a623]",
    "from-[#0f766e] to-[#2dd4bf]",
    "from-[#7a1533] to-[#e0431f]",
  ];

  return (
    <div className="demo-float flex w-16 flex-col gap-1.5 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {fill.map((w, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <span className="h-1 w-6 rounded-full bg-black/15" />
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className={`h-full rounded-full bg-gradient-to-l ${colors[i]} transition-all duration-500`}
              style={{ width: `${w}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
