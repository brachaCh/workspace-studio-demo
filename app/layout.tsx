import type { Metadata } from "next";
import { Assistant, Suez_One } from "next/font/google";
import { RightsNotice } from "./RightsNotice";
import "./globals.css";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
});

const suezOne = Suez_One({
  variable: "--font-display",
  subsets: ["hebrew", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "סטודיו עבודה — דמו אפיון",
  description: "הדגמה לתיק עבודות של טופס אפיון ודמואים. נתונים בדויים.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${assistant.variable} ${suezOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RightsNotice />
        {children}
      </body>
    </html>
  );
}
