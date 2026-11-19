"use client";

import type { CatalogNote } from "@/lib/catalog";
import { NOTES_CUSTOMER_FIELD_ID } from "@/lib/notes";

export { NOTES_CUSTOMER_FIELD_ID };

export function NotesStepSection({
  value,
  onChange,
  approvedNotes,
}: {
  value: unknown;
  onChange: (value: string) => void;
  approvedNotes: CatalogNote[];
}) {
  const text = typeof value === "string" ? value : "";

  return (
    <div className="flex flex-col gap-6">
      <label className="field-card flex flex-col gap-2 transition-colors">
        <div className="text-sm font-medium text-[#17140f]">הערות</div>
        <textarea
          className="field-input min-h-56"
          value={text}
          placeholder="כתבו כאן הערות, דגשים או בקשות נוספות…"
          onChange={(e) => onChange(e.target.value)}
        />
      </label>

      <div className="glass-panel rounded-2xl p-5">
        <h3 className="font-display text-base font-normal text-[#17140f]">הערות שמורות</h3>
        <p className="mt-1 text-sm text-[#6f665a]">
          הערות לדוגמה בלבד, להצגת המסך.
        </p>

        {approvedNotes.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-black/[0.15] bg-[#faf6ec] px-4 py-3 text-sm text-[#6f665a]">
            אין עדיין הערות שמורות.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {approvedNotes.map((note) => (
              <li
                key={note.id}
                className="whitespace-pre-wrap rounded-xl border border-black/[0.08] bg-[#fffdf7] px-4 py-3 text-sm leading-relaxed text-[#17140f] shadow-sm"
              >
                {note.content}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
