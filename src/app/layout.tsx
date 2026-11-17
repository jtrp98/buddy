import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Fraunces, IBM_Plex_Sans_Thai, Inter, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FestiveAtmosphereProvider } from "@/components/FestiveAtmosphere";
import { ForestEdge } from "@/components/scenery/WinterScene";
import { SITE_DESCRIPTION, SITE_TITLE, siteUrl } from "@/lib/site";

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
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-serif-thai",
  subsets: ["thai"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  applicationName: "Secret Buddy",
  title: {
    default: SITE_TITLE,
    template: "%s · Secret Buddy",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Secret Buddy",
    locale: "th_TH",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1829",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} ${inter.variable} ${fraunces.variable} ${notoSerifThai.variable} h-full antialiased`}
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
          <div className="relative z-10 mt-16">
            <ForestEdge />
          </div>
          <footer className="relative z-10 bg-evergreen-deep">
            <div
              className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 pt-6 text-center text-sm text-text-secondary sm:flex-row sm:px-6 sm:text-left ${
                isDev ? "pb-16 xl:pb-8" : "pb-8"
              }`}
            >
              <div className="space-y-1">
                <p className="font-display text-lg text-text-primary">
                  Secret Buddy
                  <span className="ml-2 font-script text-base text-primary">คริสต์มาสนี้ ส่งความลับดี ๆ ให้กัน</span>
                </p>
                <p className="text-xs text-text-muted">
                  ผู้เข้าร่วมไม่ต้องสมัครบัญชี · ผลจับคู่เข้ารหัส AES-256-GCM · Admin ไม่เห็นผลจับคู่
                </p>
              </div>

              <nav aria-label="ลิงก์ส่วนท้าย" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold">
                <Link href="/admin/register" className="text-primary underline-offset-4 transition hover:text-primary-hover hover:underline">
                  สร้างกิจกรรมใหม่
                </Link>
                <Link href="/recover" className="text-text-secondary underline-offset-4 transition hover:text-text-primary hover:underline">
                  ขอลิงก์ส่วนตัว
                </Link>
                <Link href="/admin/login" className="text-text-secondary underline-offset-4 transition hover:text-text-primary hover:underline">
                  เข้าสู่ระบบ Admin
                </Link>
              </nav>
            </div>
          </footer>
        </FestiveAtmosphereProvider>
      </body>
    </html>
  );
}
