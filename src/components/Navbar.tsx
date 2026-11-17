import Link from "next/link";
import { Gift, KeyRound, Mail, ShieldCheck } from "lucide-react";
import {
  FestiveStringLights,
  FestiveToggleSwitches,
} from "@/components/AnalogPrimitives";

export function Navbar({ showDevOutbox = false }: { showDevOutbox?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-[#2a1f1b] bg-[#fffaf0]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-1.5 text-[#2a1f1b] transition sm:gap-2.5"
        >
          <span className="analog-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#c8322b] text-[#fffdf7] sm:h-10 sm:w-10">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <div className="leading-tight">
            <span className="block whitespace-nowrap font-serif text-sm font-bold tracking-tight text-[#2a1f1b] group-hover:text-[#c8322b] sm:text-lg">
              Secret Buddy
            </span>
            <span className="hidden font-mono text-[9px] font-bold tracking-[0.16em] text-[#1f5e46] uppercase sm:block">
              ★ Holiday Gift Post ★
            </span>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 text-xs font-semibold sm:gap-2 sm:text-sm">
          <FestiveToggleSwitches />

          {showDevOutbox && (
            <Link
              href="/dev/outbox"
              title="กล่องอีเมลจำลอง"
              aria-label="กล่องอีเมลจำลอง"
              className="analog-btn inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#f6e3a8] px-1.5 py-1.5 text-xs font-bold text-[#2a1f1b] sm:px-2.5"
            >
              <Mail className="h-3.5 w-3.5 text-[#9e221d]" />
              <span className="hidden lg:inline">กล่องเมลจำลอง</span>
            </Link>
          )}

          <Link
            href="/recover"
            title="ขอลิงก์ส่วนตัวใหม่"
            aria-label="ขอลิงก์ส่วนตัวใหม่"
            className="analog-btn inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#fffdf7] px-1.5 py-1.5 text-xs font-bold text-[#2a1f1b] hover:bg-[#f3e7d1] sm:gap-1.5 sm:px-2.5"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#1f5e46]" />
            <span className="hidden sm:inline">ขอลิงก์ส่วนตัว</span>
          </Link>

          <Link
            href="/admin"
            className="analog-btn inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-[#1f5e46] px-2 py-1.5 text-xs font-bold text-[#fffdf7] hover:bg-[#174a37] sm:gap-1.5 sm:px-3"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#f6e3a8]" />
            <span className="hidden sm:inline">สำหรับ Admin</span>
            <span className="sm:hidden">Admin</span>
          </Link>
        </nav>
      </div>

      {/* Festive Fairy Lights Wire */}
      <div className="-mb-3.5 bg-transparent">
        <FestiveStringLights />
      </div>
    </header>
  );
}
