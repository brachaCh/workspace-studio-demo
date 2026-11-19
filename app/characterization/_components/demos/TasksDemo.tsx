"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoScreen } from "./DemoScreen";

type Task = {
  id: number;
  title: string;
  time: string;
  duration: number;
  completed: boolean;
};

const SEED: Task[] = [
  { id: 1, title: "שיחה עם רו״ח", time: "09:30", duration: 30, completed: false },
  { id: 2, title: "אישור חומרי שיווק לקמפיין", time: "11:00", duration: 45, completed: false },
  { id: 3, title: "מעקב תשלומים מלקוחות", time: "13:15", duration: 20, completed: true },
  { id: 4, title: "הכנת סיכום שבועי לצוות", time: "16:00", duration: 60, completed: false },
];

const DURATIONS = [15, 30, 45, 60];

export function TasksDemo() {
  const [tasks, setTasks] = useState<Task[]>(SEED);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [nextId, setNextId] = useState(100);

  const openCount = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks]);
  const doneCount = tasks.length - openCount;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  function toggle(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function remove(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function add() {
    const t = title.trim();
    if (!t) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setTasks((prev) => [
      ...prev,
      { id: nextId, title: t, time, duration, completed: false },
    ]);
    setNextId((n) => n + 1);
    setTitle("");
  }

  return (
    <DemoScreen tone="light" label="tasks">
    <div className="w-full">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="font-display text-lg leading-tight text-[#17140f]">המשימות שלי</div>
          <div className="text-xs text-[#6f665a]">
            {openCount > 0 ? `${openCount} פתוחות` : "הכול בוצע 🎉"}
          </div>
        </div>
        <span className="rounded-full bg-[#e0431f]/10 px-2.5 py-1 text-xs font-bold text-[#e0431f]">
          {doneCount}/{tasks.length} הושלמו
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[#e0431f] to-[#f5a623] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Add task */}
      <div className="mb-4 rounded-xl border border-black/[0.08] bg-[#faf6ec] p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
            placeholder="הוספת משימה חדשה…"
            className="field-input flex-1"
          />
          <button
            type="button"
            onClick={add}
            className="shrink-0 rounded-lg bg-[#e0431f] px-4 text-sm font-bold text-white transition-colors hover:bg-[#f2542f]"
          >
            הוספה
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={[
                "rounded-full border px-2.5 py-1 text-[0.7rem] font-bold transition-colors",
                duration === d
                  ? "border-[#e0431f] bg-[#e0431f]/10 text-[#e0431f]"
                  : "border-black/10 bg-white text-[#6f665a] hover:border-[#e0431f]/40",
              ].join(" ")}
            >
              {d} דק׳
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="group flex items-center gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] px-3 py-2.5 transition-colors hover:border-[#e0431f]/30"
          >
            <button
              type="button"
              onClick={() => toggle(task.id)}
              aria-label={task.completed ? "בטל השלמה" : "סמן כהושלם"}
              className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                task.completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-black/20 text-transparent hover:border-[#e0431f]",
              ].join(" ")}
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
                <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="min-w-0 flex-1">
              <div
                className={[
                  "truncate text-sm font-semibold",
                  task.completed ? "text-[#6f665a] line-through" : "text-[#17140f]",
                ].join(" ")}
              >
                {task.title}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[0.7rem] text-[#6f665a]" dir="ltr">
                <span className="font-mono">{task.time}</span>
                <span className="rounded-full bg-black/[0.05] px-1.5 py-0.5 font-bold">
                  {task.duration}′
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => remove(task.id)}
              aria-label="מחיקה"
              className="shrink-0 rounded-lg p-1.5 text-[#6f665a] opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </li>
        ))}
        {tasks.length === 0 ? (
          <li className="rounded-xl border border-dashed border-black/15 bg-[#faf6ec] py-6 text-center text-sm text-[#6f665a]">
            אין משימות — הוסיפו אחת למעלה
          </li>
        ) : null}
      </ul>
    </div>
    </DemoScreen>
  );
}

/** תצוגת מיני חיה — צ׳ק-ליסט זעיר לכרטיס המודול */
export function MiniTasks() {
  const [done, setDone] = useState([true, false, false]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % 3;
      setDone((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    }, 900);
    return () => clearInterval(t);
  }, []);

  const pct = Math.round((done.filter(Boolean).length / done.length) * 100);

  return (
    <div className="demo-float flex w-16 flex-col gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {done.map((d, i) => (
        <div key={i} className="flex items-center gap-1">
          <span
            className={[
              "flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-[3px] border transition-all duration-300",
              d ? "demo-pop border-emerald-500 bg-emerald-500" : "border-black/25",
            ].join(" ")}
          >
            {d ? (
              <svg viewBox="0 0 20 20" fill="none" className="h-1.5 w-1.5 text-white" aria-hidden>
                <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
          <span
            className={[
              "h-1 flex-1 rounded-full transition-colors duration-300",
              d ? "bg-emerald-300/70" : "bg-black/15",
            ].join(" ")}
          />
        </div>
      ))}
      {/* פס התקדמות נע */}
      <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[#e0431f] to-[#f5a623] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
