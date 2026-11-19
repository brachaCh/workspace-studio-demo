"use client";

import { useMemo, useState } from "react";
import { DemoScreen } from "./DemoScreen";

/* נתוני הדגמה בדויים */
type Customer = { id: number; name: string; org: string; status: "פעיל" | "ליד" | "בהמתנה"; initials: string };
const CUSTOMERS: Customer[] = [
  { id: 1, name: "רבקה לוי", org: "קליניקת שיניים", status: "פעיל", initials: "רל" },
  { id: 2, name: "משה כהן", org: "עסק משפחתי", status: "ליד", initials: "מכ" },
  { id: 3, name: "שרה פרידמן", org: "רשת חנויות", status: "פעיל", initials: "שפ" },
  { id: 4, name: "דוד אברהם", org: "סטארטאפ", status: "בהמתנה", initials: "דא" },
];
const CUST_STATUS: Record<Customer["status"], string> = {
  פעיל: "bg-emerald-100 text-emerald-700",
  ליד: "bg-sky-100 text-sky-700",
  בהמתנה: "bg-amber-100 text-amber-700",
};

export function CustomersDemo() {
  const [q, setQ] = useState("");
  const list = useMemo(
    () => CUSTOMERS.filter((c) => c.name.includes(q) || c.org.includes(q)),
    [q],
  );
  return (
    <DemoScreen tone="light" label="clients">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">לקוחות</div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="חיפוש לקוח…"
          className="field-input mb-3 w-full"
        />
        <ul className="flex flex-col gap-2">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] p-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7a1533] to-[#e0431f] text-sm font-bold text-white">
                {c.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#17140f]">{c.name}</div>
                <div className="text-[0.7rem] text-[#6f665a]">{c.org}</div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${CUST_STATUS[c.status]}`}>
                {c.status}
              </span>
            </li>
          ))}
          {list.length === 0 ? (
            <li className="rounded-xl border border-dashed border-black/15 bg-[#faf6ec] py-6 text-center text-sm text-[#6f665a]">
              לא נמצאו לקוחות
            </li>
          ) : null}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniCustomers() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1.5 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {["רל", "מכ", "שפ"].map((x, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-[#7a1533] to-[#e0431f] text-[0.5rem] font-bold text-white">
            {x}
          </span>
          <span className="h-1 flex-1 rounded-full bg-black/15" />
        </div>
      ))}
    </div>
  );
}

/* נתוני הדגמה בדויים */
type Meeting = { id: number; time: string; title: string; who: string; tone: string };
const MEETINGS: Meeting[] = [
  { id: 1, time: "09:00", title: "פגישת אפיון", who: "רבקה לוי", tone: "border-r-[#e0431f]" },
  { id: 2, time: "11:30", title: "סקירת דשבורד", who: "צוות פיתוח", tone: "border-r-teal-500" },
  { id: 3, time: "14:00", title: "שיחת מכירה", who: "ליד חדש", tone: "border-r-sky-500" },
  { id: 4, time: "16:15", title: "סיכום שבועי", who: "כל הצוות", tone: "border-r-amber-500" },
];
export function MeetingsDemo() {
  const [done, setDone] = useState<number[]>([]);
  return (
    <DemoScreen tone="light" label="calendar">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-lg leading-tight text-[#17140f]">מפגשים</div>
          <span className="text-xs text-[#6f665a]">היום · {MEETINGS.length} פגישות</span>
        </div>
        <ul className="flex flex-col gap-2">
          {MEETINGS.map((m) => {
            const d = done.includes(m.id);
            return (
              <li
                key={m.id}
                className={`flex items-center gap-3 rounded-xl border border-black/[0.08] border-r-4 bg-[#fffdf7] p-2.5 ${m.tone}`}
              >
                <span className="shrink-0 font-mono text-sm font-black text-[#17140f]" dir="ltr">
                  {m.time}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-bold ${d ? "text-[#6f665a] line-through" : "text-[#17140f]"}`}>
                    {m.title}
                  </div>
                  <div className="text-[0.7rem] text-[#6f665a]">{m.who}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setDone((p) => (p.includes(m.id) ? p.filter((x) => x !== m.id) : [...p, m.id]))}
                  className={[
                    "shrink-0 rounded-full border px-2.5 py-1 text-[0.65rem] font-bold transition-colors",
                    d ? "border-emerald-500 bg-emerald-500 text-white" : "border-black/15 text-[#6f665a] hover:border-[#e0431f]",
                  ].join(" ")}
                >
                  {d ? "בוצע ✓" : "סמן"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniMeetings() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      {["#e0431f", "#0f766e", "#0284c7"].map((c, i) => (
        <div key={i} className="flex items-center gap-1 border-r-2 pr-1" style={{ borderColor: c }}>
          <span className="text-[0.5rem] font-mono font-bold text-[#6f665a]">0{9 + i}</span>
          <span className="h-1 flex-1 rounded-full bg-black/15" />
        </div>
      ))}
    </div>
  );
}

/* נתוני הדגמה בדויים */
type Notif = { id: number; text: string; time: string; read: boolean };
const NOTIFS: Notif[] = [
  { id: 1, text: "משימה חדשה הוקצתה לך", time: "לפני 5 דק׳", read: false },
  { id: 2, text: "הצעת מחיר אושרה 🎉", time: "לפני שעה", read: false },
  { id: 3, text: "פגישה מתחילה בעוד 15 דק׳", time: "לפני שעתיים", read: false },
  { id: 4, text: "מסמך חדש הועלה לארכיון", time: "אתמול", read: true },
];
export function NotificationsDemo() {
  const [items, setItems] = useState<Notif[]>(NOTIFS);
  const unread = items.filter((n) => !n.read).length;
  return (
    <DemoScreen tone="light" label="notifications">
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg leading-tight text-[#17140f]">התראות</span>
            {unread > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e0431f] px-1.5 text-[0.65rem] font-black text-white">
                {unread}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setItems((p) => p.map((n) => ({ ...n, read: true })))}
            className="text-xs font-bold text-[#e0431f] hover:underline"
          >
            סמן הכל כנקרא
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {items.map((n) => (
            <li
              key={n.id}
              onClick={() => setItems((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
              className={[
                "flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-colors",
                n.read ? "border-black/[0.06] bg-[#fffdf7]" : "border-[#e0431f]/20 bg-[#e0431f]/[0.05]",
              ].join(" ")}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-black/15" : "bg-[#e0431f]"}`} />
              <div className="min-w-0 flex-1">
                <div className={`text-sm ${n.read ? "text-[#6f665a]" : "font-bold text-[#17140f]"}`}>{n.text}</div>
                <div className="text-[0.65rem] text-[#6f665a]">{n.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniNotifications() {
  return (
    <div className="demo-float relative flex h-14 w-14 items-center justify-center rounded-xl border border-black/10 bg-[#fffdf7] shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-[#17140f]" aria-hidden>
        <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
      </svg>
      <span className="absolute right-3 top-3 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-[#e0431f] text-[0.55rem] font-black text-white">
        3
      </span>
    </div>
  );
}

/* נתוני הדגמה בדויים */
type Post = { id: number; text: string; likes: number; liked: boolean; when: string };
const POSTS: Post[] = [
  { id: 1, text: "טיפ שיווקי של היום: תוכן אותנטי מנצח תמיד 💡", likes: 24, liked: false, when: "היום 10:00" },
  { id: 2, text: "מאחורי הקלעים של הקמפיין החדש שלנו", likes: 41, liked: true, when: "אתמול" },
];
export function PostsDemo() {
  const [posts, setPosts] = useState<Post[]>(POSTS);
  const [draft, setDraft] = useState("");
  const [nextId, setNextId] = useState(50);
  function publish() {
    if (!draft.trim()) return;
    setPosts((p) => [{ id: nextId, text: draft.trim(), likes: 0, liked: false, when: "עכשיו" }, ...p]);
    setNextId((n) => n + 1);
    setDraft("");
  }
  return (
    <DemoScreen tone="light" label="posts">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">הפוסטים</div>
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && publish()}
            placeholder="מה חדש? כתבו פוסט…"
            className="field-input flex-1"
          />
          <button type="button" onClick={publish} className="shrink-0 rounded-lg bg-[#e0431f] px-4 text-sm font-bold text-white hover:bg-[#f2542f]">
            פרסום
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {posts.map((p) => (
            <li key={p.id} className="rounded-xl border border-black/[0.08] bg-[#fffdf7] p-3">
              <p className="text-sm text-[#17140f]">{p.text}</p>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setPosts((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x)),
                    )
                  }
                  className={`flex items-center gap-1 text-xs font-bold transition-colors ${p.liked ? "text-[#e0431f]" : "text-[#6f665a]"}`}
                >
                  <span>{p.liked ? "♥" : "♡"}</span> {p.likes}
                </button>
                <span className="text-[0.65rem] text-[#6f665a]">{p.when}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DemoScreen>
  );
}
export function MiniPosts() {
  return (
    <div className="demo-float flex w-16 flex-col gap-1 rounded-lg border border-black/10 bg-[#fffdf7] p-1.5 shadow-sm">
      <span className="h-1 w-full rounded-full bg-black/15" />
      <span className="h-1 w-10 rounded-full bg-black/15" />
      <span className="mt-0.5 flex items-center gap-1 text-[0.6rem] font-bold text-[#e0431f]">♥ <span className="mini-media-bar inline-block h-1 w-6 rounded-full bg-[#e0431f]/50" /></span>
    </div>
  );
}
