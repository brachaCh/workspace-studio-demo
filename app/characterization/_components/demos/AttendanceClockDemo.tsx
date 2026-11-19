"use client";

import { useEffect, useState } from "react";
import { DemoScreen } from "./DemoScreen";

function useLiveClock() {
  // הרכיב נטען רק בתוך המודאל (צד לקוח), לכן אתחול ישיר בטוח — אין SSR
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function handDegrees(time: Date) {
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();
  return {
    secondDeg: (s + ms / 1000) * 6,
    minuteDeg: (m + s / 60) * 6,
    hourDeg: ((h % 12) + m / 60) * 30,
    secondProgress: (s + ms / 1000) / 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function AnalogClock({ time, className = "h-44 w-44" }: { time: Date; className?: string }) {
  const { secondDeg, minuteDeg, hourDeg, secondProgress } = handDegrees(time);
  const circumference = 2 * Math.PI * 120;
  const rad = (deg: number) => (deg - 90) * (Math.PI / 180);

  return (
    <svg viewBox="0 0 260 260" className={className} aria-hidden>
      <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(23,20,15,0.06)" strokeWidth="3" />
      <circle
        cx="130"
        cy="130"
        r="120"
        fill="none"
        stroke="url(#clockGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - secondProgress)}
        transform="rotate(-90 130 130)"
        style={{ transition: "stroke-dashoffset 0.25s linear" }}
      />
      <circle cx="130" cy="130" r="105" fill="#fffdf7" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const major = i % 3 === 0;
        return (
          <line
            key={i}
            x1={130 + 95 * Math.cos(angle)}
            y1={130 + 95 * Math.sin(angle)}
            x2={130 + (major ? 84 : 89) * Math.cos(angle)}
            y2={130 + (major ? 84 : 89) * Math.sin(angle)}
            stroke={major ? "rgba(23,20,15,0.4)" : "rgba(23,20,15,0.15)"}
            strokeWidth={major ? 2.5 : 1.5}
            strokeLinecap="round"
          />
        );
      })}
      <line
        x1="130"
        y1="130"
        x2={130 + 52 * Math.cos(rad(hourDeg))}
        y2={130 + 52 * Math.sin(rad(hourDeg))}
        stroke="rgba(23,20,15,0.8)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="130"
        y1="130"
        x2={130 + 72 * Math.cos(rad(minuteDeg))}
        y2={130 + 72 * Math.sin(rad(minuteDeg))}
        stroke="rgba(23,20,15,0.55)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="130"
        y1="130"
        x2={130 + 84 * Math.cos(rad(secondDeg))}
        y2={130 + 84 * Math.sin(rad(secondDeg))}
        stroke="#e0431f"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="130" cy="130" r="5" fill="#e0431f" />
      <circle cx="130" cy="130" r="2" fill="#fffdf7" />
      <defs>
        <linearGradient id="clockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0431f" />
          <stop offset="60%" stopColor="#f2542f" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** שעון אנלוגי חי זעיר — להטמעה על כרטיס המודול בלוח */
export function MiniAttendanceClock() {
  const now = useLiveClock();
  return (
    <div className="demo-float relative rounded-full bg-[#fffdf7] p-1 shadow-sm ring-1 ring-black/10">
      <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#e0431f]/10" />
      <AnalogClock time={now} className="relative h-14 w-14 drop-shadow-sm" />
      <span className="absolute -left-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 ring-2 ring-white" />
    </div>
  );
}

function elapsed(fromMs: number, toMs: number) {
  const total = Math.max(0, Math.floor((toMs - fromMs) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

type ShiftLog = { inMs: number; outMs: number | null };

export function AttendanceClockDemo() {
  const now = useLiveClock();
  const [activeSince, setActiveSince] = useState<number | null>(null);
  const [logs, setLogs] = useState<ShiftLog[]>([]);

  const nowMs = now.getTime();
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const secStr = pad(now.getSeconds());
  const dateStr = now.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  function toggleClock() {
    if (activeSince == null) {
      setActiveSince(Date.now());
    } else {
      setLogs((prev) => [{ inMs: activeSince, outMs: Date.now() }, ...prev].slice(0, 4));
      setActiveSince(null);
    }
  }

  return (
    <DemoScreen tone="light" label="attendance">
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center">
        <AnalogClock time={now} />
        <div className="mt-3 flex items-baseline gap-1" dir="ltr">
          <span className="font-mono text-4xl font-black tracking-tight text-[#17140f]">
            {timeStr}
          </span>
          <span className="font-mono text-xl font-bold text-[#e0431f]/60">:{secStr}</span>
        </div>
        <p className="mt-1 text-sm text-[#6f665a]">{dateStr}</p>
      </div>

      {activeSince != null ? (
        <div className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-emerald-800">משמרת פעילה</span>
          <span className="font-mono text-xs text-emerald-700" dir="ltr">
            {elapsed(activeSince, nowMs)}
          </span>
        </div>
      ) : (
        <div className="text-xs font-semibold text-[#6f665a]">אין משמרת פעילה כרגע</div>
      )}

      <button
        type="button"
        onClick={toggleClock}
        className={[
          "w-full max-w-xs rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
          activeSince != null
            ? "bg-[#17140f] shadow-black/20 hover:bg-black"
            : "bg-[#e0431f] shadow-orange-900/20 hover:bg-[#f2542f]",
        ].join(" ")}
      >
        {activeSince != null ? "החתמת יציאה" : "החתמת כניסה"}
      </button>

      {logs.length > 0 ? (
        <div className="w-full max-w-xs">
          <div className="mb-2 text-xs font-bold text-[#6f665a]">משמרות היום</div>
          <ul className="flex flex-col gap-1.5">
            {logs.map((log, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-black/[0.08] bg-[#fffdf7] px-3 py-2 text-xs"
                dir="ltr"
              >
                <span className="font-mono text-[#17140f]">
                  {pad(new Date(log.inMs).getHours())}:{pad(new Date(log.inMs).getMinutes())}
                  {" – "}
                  {log.outMs
                    ? `${pad(new Date(log.outMs).getHours())}:${pad(new Date(log.outMs).getMinutes())}`
                    : "—"}
                </span>
                <span className="font-mono font-bold text-[#e0431f]">
                  {log.outMs ? elapsed(log.inMs, log.outMs) : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
    </DemoScreen>
  );
}
