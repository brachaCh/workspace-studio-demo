"use client";

import { useState } from "react";
import { DemoScreen } from "./DemoScreen";

/** נתוני הדגמה בדויים */
type Period = "month" | "quarter" | "year";

const DATA: Record<Period, { labels: string[]; income: number[]; expense: number[] }> = {
  month: {
    labels: ["א׳", "ב׳", "ג׳", "ד׳"],
    income: [12, 18, 9, 22],
    expense: [7, 9, 6, 11],
  },
  quarter: {
    labels: ["ינו׳", "פבר׳", "מרץ"],
    income: [42, 55, 48],
    expense: [26, 30, 28],
  },
  year: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    income: [145, 168, 152, 190],
    expense: [92, 101, 96, 110],
  },
};

const PERIODS: { id: Period; label: string }[] = [
  { id: "month", label: "החודש" },
  { id: "quarter", label: "רבעון" },
  { id: "year", label: "שנה" },
];

export function FinanceDemo() {
  const [period, setPeriod] = useState<Period>("quarter");
  const d = DATA[period];
  const totalIncome = d.income.reduce((a, b) => a + b, 0);
  const totalExpense = d.expense.reduce((a, b) => a + b, 0);
  const profit = totalIncome - totalExpense;
  const max = Math.max(...d.income, ...d.expense);

  return (
    <DemoScreen tone="light" label="finance">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-lg leading-tight text-[#17140f]">פיננסים</div>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={[
                  "rounded-full px-2.5 py-1 text-[0.7rem] font-bold transition-colors",
                  period === p.id ? "bg-[#17140f] text-white" : "bg-black/[0.05] text-[#6f665a] hover:bg-black/10",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* stat cards */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Stat label="הכנסות" value={totalIncome} tone="emerald" />
          <Stat label="הוצאות" value={totalExpense} tone="red" />
          <Stat label="רווח" value={profit} tone="coral" />
        </div>

        {/* chart */}
        <div className="rounded-2xl border border-black/[0.08] bg-[#faf6ec] p-3">
          <div className="flex h-36 items-end justify-around gap-2">
            {d.labels.map((lab, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-28 w-full items-end justify-center gap-1">
                  <div
                    className="w-1/2 rounded-t-md bg-gradient-to-t from-[#e0431f] to-[#f5a623] transition-all duration-500"
                    style={{ height: `${(d.income[i] / max) * 100}%` }}
                    title={`הכנסות: ${d.income[i]}k`}
                  />
                  <div
                    className="w-1/2 rounded-t-md bg-black/15 transition-all duration-500"
                    style={{ height: `${(d.expense[i] / max) * 100}%` }}
                    title={`הוצאות: ${d.expense[i]}k`}
                  />
                </div>
                <span className="text-[0.65rem] font-bold text-[#6f665a]">{lab}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-center gap-4 text-[0.7rem] text-[#6f665a]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#e0431f]" /> הכנסות
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-black/30" /> הוצאות
            </span>
          </div>
        </div>
      </div>
    </DemoScreen>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "emerald" | "red" | "coral" }) {
  const cls = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    red: "text-red-700 bg-red-50 border-red-200",
    coral: "text-[#e0431f] bg-[#e0431f]/8 border-[#e0431f]/20",
  }[tone];
  return (
    <div className={`rounded-xl border p-2.5 text-center ${cls}`}>
      <div className="font-mono text-lg font-black" dir="ltr">
        ₪{value}k
      </div>
      <div className="text-[0.65rem] font-bold opacity-80">{label}</div>
    </div>
  );
}

export function MiniFinance() {
  const bars = [40, 70, 55, 90];
  return (
    <div className="demo-float flex h-14 w-14 items-end justify-center gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-2 shadow-sm">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-2 rounded-t-sm bg-gradient-to-t from-[#e0431f] to-[#f5a623]"
          style={{ height: `${h}%`, animation: `demo-float ${2 + i * 0.3}s ease-in-out infinite` }}
        />
      ))}
    </div>
  );
}
