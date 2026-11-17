import type { Metadata } from "next";
import Link from "next/link";
import { Charm, Fraunces, IBM_Plex_Sans_Thai, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FestiveAtmosphereProvider } from "@/components/FestiveAtmosphere";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const charm = Charm({
  variable: "--font-charm",
  subsets: ["thai", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Secret Buddy — A Magical Christmas Adventure | แลกของขวัญแบบลับ ๆ",
  description:
    "เนรมิตกิจกรรม Secret Buddy และ Secret Santa ให้กลายเป็นความทรงจำคริสต์มาสสุดมหัศจรรย์ จับคู่ลับ 100% พร้อม Wish List และการเปิดกล่องของขวัญสุดพิเศษ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} ${inter.variable} ${fraunces.variable} ${charm.variable} h-full antialiased`}
    >
      <body className="evergreen-canvas min-h-full flex flex-col bg-background text-text-primary selection:bg-christmas-red selection:text-snow-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-lg"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>

        <FestiveAtmosphereProvider>
          <Navbar showDevOutbox={isDev} />
          <main id="main-content" className="relative z-10 flex-1 focus:outline-none">
            {children}
          </main>
          <footer className="relative z-10 mt-20 border-t border-border bg-[#091322]/95 backdrop-blur-md">
            <div className="candy-stripe-bar h-1.5 w-full" />
            <div
              className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 pt-8 text-center text-sm text-text-secondary sm:flex-row sm:px-6 sm:text-left ${
                isDev ? "pb-16 xl:pb-8" : "pb-8"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/45 bg-surface-elevated px-3 py-1 text-[11px] font-bold tracking-wider text-primary uppercase">
                    NORTH POLE WORKSHOP · SECRET BUDDY
                  </span>
                  <span className="thai-keep font-bold text-text-primary">
                    A Magical Christmas Adventure
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  ผู้เข้าร่วมไม่ต้องสมัครบัญชี • เข้ารหัสผลจับคู่ AES-256-GCM • Admin ไม่เห็นผลจับคู่
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
                <Link
                  href="/admin/register"
                  className="text-primary transition hover:text-primary-hover hover:underline underline-offset-4"
                >
                  สร้างกิจกรรมใหม่
                </Link>
                <span aria-hidden="true" className="text-border">•</span>
                <Link
                  href="/recover"
                  className="text-text-secondary transition hover:text-text-primary hover:underline underline-offset-4"
                >
                  ขอลิงก์ส่วนตัว
                </Link>
                <span aria-hidden="true" className="text-border">•</span>
                <Link
                  href="/admin/login"
                  className="text-text-secondary transition hover:text-text-primary hover:underline underline-offset-4"
                >
                  เข้าสู่ระบบ Admin
                </Link>
              </div>
            </div>
          </footer>
        </FestiveAtmosphereProvider>
      </body>
    </html>
  );
}
