"use client";

import { useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  Mail,
  Menu,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  FestiveStringLights,
  FestiveToggleSwitches,
} from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { Ornament } from "@/components/vintage/Ornament";

export function Navbar({ showDevOutbox = false }: { showDevOutbox?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { festiveFx, toggleFestiveFx, soundEnabled, toggleSound } =
    useFestiveAtmosphere();

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b border-ink/25 bg-paper/95 shadow-[0_2px_10px_-4px_rgba(70,53,44,0.18)] backdrop-blur-sm"
        onKeyDown={(e) => {
          if (e.key === "Escape" && mobileMenuOpen) {
            setMobileMenuOpen(false);
          }
        }}
      >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex min-w-0 shrink-0 items-center gap-2 text-ink transition sm:gap-2.5"
        >
          <span className="analog-btn flex h-9 w-9 shrink-0 items-center justify-center rounded bg-xmas-red text-paper sm:h-10 sm:w-10">
            <Ornament name="horn" className="h-5 w-6 sm:h-5 sm:w-6" />
          </span>
          <div className="leading-tight">
            <span className="block whitespace-nowrap font-display text-base leading-none tracking-tight text-ink group-hover:text-xmas-red sm:text-lg">
              Secret Buddy
            </span>
            <span className="mt-0.5 block font-type text-[8.5px] tracking-[0.18em] text-pine uppercase sm:text-[9px]">
              NORTH POLE POST
            </span>
          </div>
        </Link>

        {/* Desktop & Tablet Navigation */}
        <nav className="hidden shrink-0 items-center gap-2 text-xs font-semibold sm:flex sm:text-sm">
          <FestiveToggleSwitches />

          {showDevOutbox && (
            <Link
              href="/dev/outbox"
              title="กล่องอีเมลจำลอง"
              aria-label="กล่องอีเมลจำลอง"
              className="analog-btn inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded bg-amber-wash px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-cream"
            >
              <Mail className="h-3.5 w-3.5 text-xmas-red" />
              <span className="hidden lg:inline">กล่องเมลจำลอง</span>
            </Link>
          )}

          <Link
            href="/recover"
            title="ขอลิงก์ส่วนตัวใหม่"
            aria-label="ขอลิงก์ส่วนตัวใหม่"
            className="analog-btn thai-keep inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded bg-paper px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-cream"
          >
            <KeyRound className="h-3.5 w-3.5 text-pine" />
            <span>ขอลิงก์ส่วนตัว</span>
          </Link>

          <Link
            href="/admin"
            className="analog-btn thai-keep inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded bg-pine px-3 py-1.5 text-xs font-bold text-paper hover:bg-pine-deep"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            <span>สำหรับ Admin</span>
          </Link>
        </nav>

        {/* Mobile Compact Bar (44px+ tap targets, zero icon ambiguity) */}
        <div className="flex shrink-0 items-center gap-1.5 sm:hidden">
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="analog-btn inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded bg-pine px-3 text-xs font-bold text-paper hover:bg-pine-deep"
          >
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>Admin</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-post-drawer"
            aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนูและตั้งค่า"}
            className="analog-btn inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded bg-cream text-ink hover:bg-paper"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Stationery Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-post-drawer"
          className="border-t border-dashed border-rule bg-cream/95 px-4 py-3 sm:hidden"
        >
          <div className="mx-auto max-w-5xl space-y-2">
            <Link
              href="/recover"
              onClick={() => setMobileMenuOpen(false)}
              className="analog-btn flex min-h-[44px] w-full items-center justify-between rounded bg-paper px-3.5 text-sm font-bold text-ink"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-pine" />
                <span>ขอลิงก์ส่วนตัวใหม่</span>
              </span>
              <span className="font-type text-[10px] tracking-wider text-ink-soft">
                RECOVER
              </span>
            </Link>

            {showDevOutbox && (
              <Link
                href="/dev/outbox"
                onClick={() => setMobileMenuOpen(false)}
                className="analog-btn flex min-h-[44px] w-full items-center justify-between rounded bg-amber-wash px-3.5 text-sm font-bold text-ink"
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-xmas-red" />
                  <span>กล่องอีเมลจำลอง</span>
                </span>
                <span className="font-type text-[10px] tracking-wider text-ink-soft">
                  DEV OUTBOX
                </span>
              </Link>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={toggleFestiveFx}
                aria-pressed={festiveFx}
                className={`analog-btn flex min-h-[44px] items-center justify-center gap-1.5 rounded px-3 text-xs font-bold ${
                  festiveFx
                    ? "bg-amber-wash text-ink"
                    : "bg-paper text-ink-soft"
                }`}
              >
                <Sparkles className="h-4 w-4 text-gold-ink" />
                <span>{festiveFx ? "หิมะ: เปิด" : "หิมะ: ปิด"}</span>
              </button>

              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={soundEnabled}
                className={`analog-btn flex min-h-[44px] items-center justify-center gap-1.5 rounded px-3 text-xs font-bold ${
                  soundEnabled
                    ? "bg-pine-wash text-pine-deep"
                    : "bg-paper text-ink-soft"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-pine" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                <span>{soundEnabled ? "เสียง: เปิด" : "เสียง: ปิด"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </header>

      {/* Vintage 1950s C9 Garland hanging transparently over the desk/hero top (non-sticky so it never obscures scrolled content) */}
      <div className="pointer-events-none relative z-20 -mb-9">
        <FestiveStringLights />
      </div>
    </>
  );
}
