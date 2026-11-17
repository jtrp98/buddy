import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FestiveAtmosphereProvider } from "@/components/FestiveAtmosphere";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🎁 Secret Buddy — North Pole Post & Holiday Gift Exchange",
  description:
    "สร้างกิจกรรมจับคู่ Secret Buddy สไตล์การ์ดของขวัญวันคริสต์มาส กำหนดงบและเวลาปิดรับสมัคร สมาชิกเข้าร่วมได้โดยไม่ต้องสมัครบัญชี พร้อมระบบรักษาความลับ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbf4e6] text-[#2a1f1b] selection:bg-[#f6e3a8] selection:text-[#2a1f1b]">
        <FestiveAtmosphereProvider>
          <Navbar showDevOutbox={isDev} />
          <main className="relative z-10 flex-1">{children}</main>
          <footer className="relative z-10 mt-12 border-t-2 border-[#2a1f1b] bg-[#f3e7d1]">
            <div className="candy-stripe-bar h-2 w-full border-b-2 border-[#2a1f1b]" />
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs font-medium text-[#5c493e] sm:flex-row sm:text-left">
              <div className="flex items-center gap-2">
                <span className="inline-block rounded border border-[#2a1f1b] bg-[#fffdf7] px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#9e221d]">
                  NORTH POLE POST
                </span>
                <span>🎁 Secret Buddy • ระบบจับคู่ของขวัญแบบลับสุดยอด</span>
              </div>
              <span className="font-mono text-[11px] text-[#6e5a50]">
                CRAFTED FOR COZY HOLIDAY EXCHANGE • PRIVACY GUARANTEED
              </span>
            </div>
          </footer>
        </FestiveAtmosphereProvider>
      </body>
    </html>
  );
}
