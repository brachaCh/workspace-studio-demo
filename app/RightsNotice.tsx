import Image from "next/image";

export const RIGHTS_LINE =
  "כל הזכויות שמורות לאופיסנס (Ofisense) ולביזנס-רום (Business Room). הדגמה לתיק עבודות בלבד — שמות ונתונים בדויים, ללא מידע סודי או מזהה של לקוחות.";

export function RightsLogos({
  ofisenseClassName = "h-8 w-auto",
  businessroomClassName = "h-11 w-auto",
}: {
  ofisenseClassName?: string;
  businessroomClassName?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className="inline-flex items-center rounded-md bg-white px-2 py-1 ring-1 ring-[#17140f]/10">
        <Image
          src="/logos/ofisense.png"
          alt="Ofisense"
          width={945}
          height={145}
          className={ofisenseClassName}
        />
      </span>
      <span className="inline-flex items-center overflow-hidden rounded-md bg-black ring-1 ring-[#17140f]/10">
        <Image
          src="/logos/businessroom.png"
          alt="Businessroom"
          width={965}
          height={250}
          className={businessroomClassName}
        />
      </span>
    </div>
  );
}

export function RightsNotice() {
  return (
    <div className="border-b border-[#17140f]/10 bg-[#fffdf7] px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 sm:flex-row">
        <RightsLogos />
        <p className="max-w-xl text-center text-xs leading-relaxed text-[#6f665a]">
          {RIGHTS_LINE}
        </p>
      </div>
    </div>
  );
}
