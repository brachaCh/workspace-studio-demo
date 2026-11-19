"use client";

import { useState, type ChangeEvent } from "react";
import { DemoScreen } from "./DemoScreen";

const PLATFORMS = [
  { id: "facebook", label: "פייסבוק", color: "#1877f2" },
  { id: "instagram", label: "אינסטגרם", color: "#e1306c" },
  { id: "whatsapp", label: "וואטסאפ", color: "#25d366" },
  { id: "tiktok", label: "טיקטוק", color: "#111111" },
  { id: "linkedin", label: "לינקדאין", color: "#0a66c2" },
];

const BLUEPRINT =
  "✨ שמחות לבשר על השקה חדשה! הצטרפו אלינו למסע מרגש — פרטים בקרוב. #סטודיו_לדוגמה";

type Preview = { name: string; url: string; isImage: boolean };
type Post = {
  id: number;
  platforms: string[];
  message: string;
  when: string;
  preview: Preview | null;
};

export function MediaDemo() {
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextId, setNextId] = useState(1);

  function togglePlatform(id: string) {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview({ name: f.name, url: isImage ? URL.createObjectURL(f) : "", isImage });
  }

  function publish() {
    if (!message.trim() && !preview) return;
    setPosts((prev) => [
      {
        id: nextId,
        platforms: [...platforms],
        message: message.trim() || "(ללא טקסט)",
        when: when || "עכשיו",
        preview,
      },
      ...prev,
    ]);
    setNextId((n) => n + 1);
    setMessage("");
    setWhen("");
    setPreview(null);
  }

  return (
    <DemoScreen tone="light" label="media">
      <div className="w-full">
        <div className="mb-3 font-display text-lg leading-tight text-[#17140f]">
          העלאה למדיה
        </div>

        {/* Composer */}
        <div className="rounded-2xl border border-black/[0.08] bg-[#faf6ec] p-3">
          {/* platforms */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => {
              const on = platforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={[
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-bold transition-all",
                    on
                      ? "border-transparent text-white"
                      : "border-black/10 bg-white text-[#6f665a] hover:border-black/25",
                  ].join(" ")}
                  style={on ? { backgroundColor: p.color } : undefined}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: on ? "rgba(255,255,255,0.9)" : p.color }}
                  />
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* upload zone */}
          <label className="mb-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/15 bg-white/60 px-3 py-4 text-center transition-colors hover:border-[#e0431f]/50 hover:bg-white">
            <input type="file" className="hidden" onChange={onFile} accept="image/*,video/*,application/pdf" />
            {preview ? (
              preview.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.url} alt={preview.name} className="max-h-28 rounded-lg object-contain" />
              ) : (
                <span className="text-sm font-bold text-[#17140f]">{preview.name}</span>
              )
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7 text-[#e0431f]" aria-hidden>
                  <path d="M12 16V4m0 0 4 4m-4-4L8 8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
                </svg>
                <span className="text-sm font-bold text-[#17140f]">העלאת תמונה / וידאו / קובץ</span>
                <span className="text-[0.7rem] text-[#6f665a]">גררו לכאן או לחצו לבחירה</span>
              </>
            )}
          </label>

          {/* message */}
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="כתבו את תוכן הפרסום…"
              className="field-input min-h-20 w-full pl-9"
            />
            <button
              type="button"
              onClick={() => setMessage(BLUEPRINT)}
              title="יצירת תוכן עם AI"
              className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-lg bg-[#e0431f]/10 text-[#e0431f] transition-colors hover:bg-[#e0431f]/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M12 2l1.6 4.6L18 8l-4.4 1.4L12 14l-1.6-4.6L6 8l4.4-1.4Z" />
              </svg>
            </button>
          </div>

          {/* schedule + publish */}
          <div className="mt-2 flex items-center gap-2">
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="field-input flex-1"
            />
            <button
              type="button"
              onClick={publish}
              className="shrink-0 rounded-lg bg-[#e0431f] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#f2542f]"
            >
              העלאה
            </button>
          </div>
        </div>

        {/* Feed */}
        {posts.length > 0 ? (
          <div className="mt-4">
            <div className="mb-2 text-xs font-bold text-[#6f665a]">פורסמו למדיה</div>
            <ul className="flex flex-col gap-2">
              {posts.map((post) => (
                <li key={post.id} className="flex gap-3 rounded-xl border border-black/[0.08] bg-[#fffdf7] p-2.5">
                  {post.preview ? (
                    post.preview.isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.preview.url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] text-[0.6rem] font-bold text-[#6f665a]">
                        קובץ
                      </span>
                    )
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#e0431f]/20 to-[#f5a623]/20 text-[#e0431f]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden>
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="8.5" cy="10" r="1.5" />
                        <path d="m21 16-5-5L5 19" />
                      </svg>
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-[#17140f]">{post.message}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {post.platforms.map((pid) => {
                        const p = PLATFORMS.find((x) => x.id === pid);
                        if (!p) return null;
                        return (
                          <span
                            key={pid}
                            className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold text-white"
                            style={{ backgroundColor: p.color }}
                          >
                            {p.label}
                          </span>
                        );
                      })}
                      <span className="text-[0.65rem] text-[#6f665a]">· {post.when}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </DemoScreen>
  );
}

/** תצוגת מיני חיה — העלאה עם פס התקדמות שמתמלא שוב ושוב */
export function MiniMedia() {
  return (
    <div className="demo-float relative flex h-14 w-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br from-[#e0431f]/15 to-[#f5a623]/15 shadow-sm">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-[#e0431f]" aria-hidden>
        <path d="M12 16V4m0 0 4 4m-4-4L8 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
      </svg>
      <div className="h-1 w-8 overflow-hidden rounded-full bg-black/10">
        <div className="mini-media-bar h-full w-full rounded-full bg-gradient-to-l from-[#e0431f] to-[#f5a623]" />
      </div>
    </div>
  );
}
