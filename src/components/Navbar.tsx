"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gift,
  KeyRound,
  Mail,
  Menu,
  Music2,
  ShieldCheck,
  SkipForward,
  Snowflake,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { FestiveToggleSwitches } from "@/components/AnalogPrimitives";
import { ChristmasLights } from "@/components/atmosphere/ChristmasLights";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { christmasButtonClass } from "@/components/ui/buttonStyles";

function DesktopNavLinks({ showDevOutbox }: { showDevOutbox: boolean }) {
  const pathname = usePathname();
  const isRecover = pathname === "/recover" || pathname?.endsWith("/recover");
  const isAdmin = pathname?.startsWith("/admin");
  const isOutbox = pathname?.startsWith("/dev/outbox");

  return (
    <nav
      aria-label="เมนูหลัก"
      className="hidden shrink-0 items-center gap-2 text-sm font-semibold sm:flex"
    >
      <FestiveToggleSwitches />

      {showDevOutbox && (
        <Link
          href="/dev/outbox"
          title="กล่องอีเมลจำลอง"
          aria-label="กล่องอีเมลจำลอง"
          className={`analog-btn inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-semibold transition ${
            isOutbox
              ? "border-primary bg-primary/15 text-primary"
              : "border-primary/35 bg-surface-elevated/90 text-primary hover:border-primary/65 hover:bg-evergreen-light"
          }`}
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden lg:inline">กล่องเมลจำลอง</span>
        </Link>
      )}

      <Link
        href="/recover"
        className={`analog-btn thai-keep inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-semibold sm:text-sm ${
          isRecover
            ? "border-primary bg-primary/15 text-primary"
            : "border-border bg-surface-elevated/90 text-text-primary hover:border-primary/60 hover:bg-evergreen-light"
        }`}
      >
        <KeyRound className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>ขอลิงก์ส่วนตัว</span>
      </Link>

      <Link
        href="/admin"
        className={christmasButtonClass(
          isAdmin ? "gold" : "primary",
          "sm",
          "whitespace-nowrap"
        )}
      >
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>สำหรับ Admin</span>
      </Link>
    </nav>
  );
}

export function Navbar({ showDevOutbox = false }: { showDevOutbox?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    festiveFx,
    toggleFestiveFx,
    soundEnabled,
    toggleSound,
    currentTrack,
    nextTrack,
  } = useFestiveAtmosphere();

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b border-white/8 bg-background/88 shadow-[0_8px_30px_-12px_rgba(3,10,12,0.8)] backdrop-blur-md"
        onKeyDown={(e) => {
          if (e.key === "Escape" && mobileMenuOpen) {
            setMobileMenuOpen(false);
          }
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="group flex min-w-0 shrink-0 items-center gap-2.5 text-text-primary transition sm:gap-3"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-[linear-gradient(180deg,var(--color-christmas-red-hover),var(--color-christmas-red-deep))] text-ivory shadow-[0_4px_14px_-4px_rgba(179,38,46,0.7),inset_0_1px_0_rgba(255,255,255,0.3)] transition group-hover:scale-105">
              <Gift className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <span className="font-display-en block whitespace-nowrap text-base font-bold tracking-tight text-text-primary group-hover:text-primary sm:text-lg">
                Secret Buddy
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-primary/90">
                แลกของขวัญแบบลับ ๆ
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Navigation */}
          <Suspense
            fallback={
              <div className="hidden h-10 w-48 sm:block" aria-hidden="true" />
            }
          >
            <DesktopNavLinks showDevOutbox={showDevOutbox} />
          </Suspense>

          {/* Mobile Compact Bar (44px+ tap targets) */}
          <div className="flex shrink-0 items-center gap-2 sm:hidden">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={christmasButtonClass("primary", "sm", "min-h-[44px] px-3.5 text-xs")}
            >
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Admin</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-post-drawer"
              aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนูและตั้งค่า"}
              className="analog-btn inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-surface-elevated text-text-primary hover:border-primary/60"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-post-drawer"
            className="border-t border-border bg-surface px-4 py-4 sm:hidden"
          >
            <div className="mx-auto max-w-6xl space-y-2.5">
              <Link
                href="/recover"
                onClick={() => setMobileMenuOpen(false)}
                className="analog-btn flex min-h-[46px] w-full items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 text-sm font-semibold text-text-primary"
              >
                <span className="flex items-center gap-2.5">
                  <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>ขอลิงก์ส่วนตัวใหม่</span>
                </span>
                <span className="text-xs font-medium text-text-secondary">
                  กู้คืนลิงก์
                </span>
              </Link>

              {showDevOutbox && (
                <Link
                  href="/dev/outbox"
                  onClick={() => setMobileMenuOpen(false)}
                  className="analog-btn flex min-h-[46px] w-full items-center justify-between rounded-xl border border-primary/40 bg-surface-elevated px-4 text-sm font-semibold text-primary"
                >
                  <span className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>กล่องอีเมลจำลอง</span>
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    DEV OUTBOX
                  </span>
                </Link>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={toggleFestiveFx}
                  aria-pressed={festiveFx}
                  className={`analog-btn flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold ${
                    festiveFx
                      ? "border-primary/60 bg-surface-elevated text-primary"
                      : "border-border bg-background text-text-secondary"
                  }`}
                >
                  <Snowflake className="h-4 w-4 text-ice-blue" aria-hidden="true" />
                  <span>{festiveFx ? "หิมะ: เปิด" : "หิมะ: ปิด"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSound}
                  aria-pressed={soundEnabled}
                  className={`analog-btn flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold ${
                    soundEnabled
                      ? "border-success/50 bg-success-bg text-success"
                      : "border-border bg-background text-text-secondary"
                  }`}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <VolumeX className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{soundEnabled ? "เสียง: เปิด" : "เสียง: ปิด"}</span>
                </button>
              </div>

              {soundEnabled && (
                <button
                  type="button"
                  onClick={nextTrack}
                  className="analog-btn flex min-h-[44px] w-full items-center justify-between rounded-xl border border-success/40 bg-surface-elevated px-3.5 text-xs font-semibold text-success"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Music2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{currentTrack.title}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-text-secondary">
                    <span>เปลี่ยนเพลง</span>
                    <SkipForward className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
        {/* A real string of Christmas lights, hanging from the navbar and floating over the page */}
        <div className="pointer-events-none absolute inset-x-0 top-full">
          <ChristmasLights />
        </div>
      </header>

    </>
  );
}
