import type { Metadata } from "next";
import {
  Charm,
  Chonburi,
  Noto_Sans_Thai,
  Special_Elite,
  Trirong,
} from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FestiveAtmosphereProvider } from "@/components/FestiveAtmosphere";

const chonburi = Chonburi({
  variable: "--font-chonburi",
  subsets: ["thai", "latin"],
  weight: "400",
  display: "swap",
});

const trirong = Trirong({
  variable: "--font-trirong",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const charm = Charm({
  variable: "--font-charm",
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const specialElite = Special_Elite({
  variable: "--font-special-elite",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Secret Buddy — North Pole Post & Holiday Gift Exchange",
  description:
    "สร้างกิจกรรมจับคู่ Secret Buddy สไตล์ไปรษณีย์คริสต์มาสยุค 1950s กำหนดงบและเวลาปิดรับสมัคร สมาชิกเข้าร่วมได้โดยไม่ต้องสมัครบัญชี พร้อมระบบรักษาความลับ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <html
      lang="th"
      className={`${chonburi.variable} ${trirong.variable} ${charm.variable} ${notoSansThai.variable} ${specialElite.variable} h-full antialiased`}
    >
      <body className="linen-desk min-h-full flex flex-col text-ink selection:bg-gold/30 selection:text-ink">
        <FestiveAtmosphereProvider>
          <Navbar showDevOutbox={isDev} />
          <main className="relative z-10 flex-1">{children}</main>
          <footer className="relative z-10 mt-14 border-t border-ink/20 bg-cream/95">
            <div className="candy-stripe-bar h-2 w-full" />
            <div
              className={`mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 pt-5 text-center text-xs text-ink-soft sm:flex-row sm:text-left ${
                isDev ? "pb-16 xl:pb-6" : "pb-6"
              }`}
            >
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-block whitespace-nowrap rounded-sm border border-xmas-red/40 bg-paper px-2.5 py-0.5 font-type text-[10px] tracking-[0.16em] text-xmas-red">
                  NORTH POLE POST · 25 DEC
                </span>
                <span className="thai-keep font-serif text-sm font-medium text-ink">
                  Secret Buddy · ระบบจับคู่ของขวัญแบบลับสุดยอด
                </span>
              </div>
              <span className="font-type text-[11px] tracking-[0.12em] text-ink-soft">
                HANDCRAFTED STATIONERY · PRIVACY GUARANTEED
              </span>
            </div>
          </footer>
        </FestiveAtmosphereProvider>
      </body>
    </html>
  );
}
