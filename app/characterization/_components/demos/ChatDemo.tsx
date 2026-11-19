"use client";

import { useRef, useState } from "react";
import { DemoScreen } from "./DemoScreen";

/** נתוני הדגמה בדויים */
type Msg = { id: number; me: boolean; text: string; time: string };

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const SEED: Msg[] = [
  { id: 1, me: false, text: "היי! ראית את האפיון החדש שהעליתי?", time: "09:14" },
  { id: 2, me: true, text: "כן, נראה מעולה 🙌 מתחילים היום?", time: "09:15" },
  { id: 3, me: false, text: "בטח, שולחת לך את המשימות הראשונות", time: "09:15" },
];

const REPLIES = [
  "מעולה, מטפלת בזה 👌",
  "קיבלתי, תודה!",
  "אחלה, נדבר עוד מעט",
  "סגור, מעדכנת אותך בהמשך",
];

export function ChatDemo() {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");
  const [nextId, setNextId] = useState(10);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollDown() {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }

  function send() {
    const t = text.trim();
    if (!t) return;
    const id = nextId;
    setMsgs((prev) => [...prev, { id, me: true, text: t, time: now() }]);
    setNextId((n) => n + 1);
    setText("");
    scrollDown();
    window.setTimeout(() => {
      setMsgs((prev) => [
        ...prev,
        { id: id + 1, me: false, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: now() },
      ]);
      setNextId((n) => n + 1);
      scrollDown();
    }, 900);
  }

  return (
    <DemoScreen tone="light" label="chat">
      <div className="w-full">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7a1533] to-[#e0431f] font-bold text-white">
            צ
          </span>
          <div>
            <div className="text-sm font-bold text-[#17140f]">צוות המשרד</div>
            <div className="flex items-center gap-1 text-[0.65rem] text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> מחוברים
            </div>
          </div>
        </div>

        <div
          ref={listRef}
          className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-2xl border border-black/[0.08] bg-[#faf6ec] p-3"
        >
          {msgs.map((m) => (
            <div key={m.id} className={m.me ? "flex justify-start" : "flex justify-end"}>
              <div
                className={[
                  "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                  m.me
                    ? "rounded-br-sm bg-[#e0431f] text-white"
                    : "rounded-bl-sm border border-black/[0.06] bg-white text-[#17140f]",
                ].join(" ")}
              >
                <p>{m.text}</p>
                <div className={`mt-0.5 text-[0.6rem] ${m.me ? "text-white/70" : "text-[#6f665a]"}`} dir="ltr">
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="הקלידו הודעה…"
            className="field-input flex-1"
          />
          <button
            type="button"
            onClick={send}
            className="shrink-0 rounded-lg bg-[#e0431f] px-4 text-sm font-bold text-white transition-colors hover:bg-[#f2542f]"
          >
            שליחה
          </button>
        </div>
      </div>
    </DemoScreen>
  );
}

export function MiniChat() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      <span className="h-2.5 w-9 self-end rounded-lg rounded-br-sm bg-[#e0431f]" />
      <span className="h-2.5 w-11 rounded-lg rounded-bl-sm bg-black/15" />
      <span className="mini-media-bar h-2.5 w-7 self-end rounded-lg rounded-br-sm bg-[#e0431f]/70" />
    </div>
  );
}
