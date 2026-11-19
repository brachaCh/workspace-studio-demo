import Link from "next/link";
import { RIGHTS_LINE, RightsLogos } from "./RightsNotice";

const STEPS = [
  "פרטי הדגמה",
  "אפיון העסק",
  "על הדשבורד",
  "פיצ׳רים",
  "שדות",
] as const;

export default function Home() {
  return (
    <div dir="rtl" className="app-gradient-bg flex flex-1 items-center px-6 py-16">
      <main className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="eyebrow fade-rise mb-4 text-xs font-semibold text-[#e0431f]">
            סטודיו עבודה · דמו אפיון
          </div>
          <h1 className="fade-rise fade-rise-1 font-display text-6xl font-normal leading-[1.05] text-[#17140f] sm:text-7xl">
            טופס
            <br />
            <span className="text-[#e0431f]">האפיון</span>
          </h1>
          <p className="fade-rise fade-rise-2 mt-6 max-w-md text-lg leading-relaxed text-[#6f665a]">
            אותם מסכי אפיון ואותם דמואים חיים. הנתונים בדויים, והטיוטה נשמרת רק
            בדפדפן. אין כאן שליחת מייל, סליקה או מפתחות.
          </p>
          <div className="fade-rise fade-rise-2 mt-4 flex max-w-md flex-col items-start gap-3">
            <RightsLogos ofisenseClassName="h-7 w-auto" businessroomClassName="h-10 w-auto" />
            <p className="text-sm leading-relaxed text-[#6f665a]">{RIGHTS_LINE}</p>
          </div>

          <div className="fade-rise fade-rise-3 mt-9 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-lg bg-[#e0431f] px-8 py-3.5 text-sm font-semibold text-white shadow-sm shadow-orange-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f2542f] active:translate-y-0"
              href="/characterization?sample=1"
            >
              כניסה עם נתוני דוגמה
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-lg border border-black/15 bg-[#fffdf7] px-8 py-3.5 text-sm font-semibold text-[#17140f] transition-all duration-200 hover:-translate-y-0.5 hover:border-black/30 hover:bg-white active:translate-y-0"
              href="/characterization"
            >
              טופס ריק
            </Link>
          </div>
        </div>

        <ol className="fade-rise fade-rise-4 glass-panel flex flex-col gap-1 rounded-2xl p-4">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:bg-[#e0431f]/[0.06]"
            >
              <span className="font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e0431f]/10 text-base text-[#e0431f]">
                {i + 1}
              </span>
              <span className="text-base font-semibold text-[#17140f]">{label}</span>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
