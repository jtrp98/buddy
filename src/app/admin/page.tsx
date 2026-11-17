"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  Gift,
  LogOut,
  MailCheck,
  Plus,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { WashiTape, WaxSeal } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudgetWithPrefix } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";

interface AdminGroupSummary {
  id: string;
  title: string;
  description: string | null;
  inviteCode: string;
  budgetType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  registrationClosesAt: string;
  revealAt: string | null;
  status: string;
  drawError: string | null;
  drawnAt: string | null;
  totalMembers: number;
  verifiedMembers: number;
  emailSummary: {
    sent: number;
    failed: number;
    pending: number;
  };
}

interface AdminInfo {
  adminId: string;
  email: string;
  name: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { triggerClickSound } = useFestiveAtmosphere();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [groups, setGroups] = useState<AdminGroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch("/api/admin/auth/me", { cache: "no-store" });
        if (meRes.status === 401) {
          if (!cancelled) router.replace("/admin/login");
          return;
        }
        const meData = await meRes.json();
        if (!cancelled) setAdmin(meData.admin);

        const grpRes = await fetch("/api/admin/groups", { cache: "no-store" });
        const grpData = await grpRes.json();
        if (cancelled) return;
        if (!grpRes.ok) {
          setError(grpData.error || "ไม่สามารถโหลดรายการกลุ่มได้");
        } else {
          setError("");
          setGroups(grpData.groups || []);
        }
      } catch {
        if (!cancelled) setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    triggerClickSound();
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="analog-card h-32 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <div className="analog-card printed-double-rule flex flex-wrap items-center justify-between gap-4 rounded-md p-6">
        <div className="relative z-10">
          <span className="font-type text-[10px] font-bold tracking-[0.18em] text-pine uppercase">
            SANTA&apos;S WORKSHOP LEDGER
          </span>
          <h1 className="thai-keep letterpress mt-0.5 font-display text-2xl text-ink sm:text-3xl">
            แดชบอร์ด Admin
          </h1>
          {admin && (
            <p className="mt-1 font-serif text-sm text-ink-soft">
              สวัสดีคุณ <span className="font-bold text-ink">{admin.name}</span> ({admin.email})
            </p>
          )}
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/groups/new"
            className="analog-btn inline-flex min-h-[44px] items-center gap-2 rounded bg-xmas-red px-4 py-2 text-sm font-bold text-paper hover:bg-xmas-red-deep"
          >
            <Plus className="h-4 w-4" />
            <span>สร้างกลุ่ม Buddy ใหม่</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="analog-btn inline-flex min-h-[44px] items-center gap-1.5 rounded bg-paper px-3.5 py-2 text-sm font-bold text-ink hover:bg-cream"
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-xmas-red/45 bg-red-wash px-4 py-3 text-sm font-medium text-xmas-red-deep">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="analog-card printed-double-rule mt-8 rounded-md p-12 text-center">
          <div className="relative z-10">
            <WaxSeal tone="red" size="lg" className="mx-auto">
              <Gift className="h-7 w-7" />
            </WaxSeal>
            <h2 className="thai-keep letterpress mt-4 font-display text-lg text-ink">
              ยังไม่มีกลุ่มกิจกรรม Secret Buddy
            </h2>
            <p className="mt-1.5 font-serif text-sm text-ink-soft">
              สร้างกลุ่มแรกของคุณเพื่อกำหนดงบของขวัญ เวลาปิดรับสมัคร และรับลิงก์เชิญสมาชิก
            </p>
            <Link
              href="/admin/groups/new"
              className="analog-btn-lg mt-6 inline-flex min-h-[46px] items-center gap-2 rounded bg-xmas-red px-5 py-2.5 text-sm font-bold text-paper hover:bg-xmas-red-deep"
            >
              <Plus className="h-4 w-4" />
              <span>สร้างกลุ่มใหม่เลย</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {groups.map((g, index) => (
            <Link
              key={g.id}
              href={`/admin/groups/${g.id}`}
              className="analog-card printed-double-rule group relative flex flex-col justify-between rounded-md p-6 pt-7 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-paper-lifted"
            >
              <WashiTape
                tone={index % 2 === 0 ? "red" : "green"}
                className="absolute -top-2 left-6 z-20 -rotate-2"
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="thai-keep font-serif text-lg font-bold text-ink group-hover:text-xmas-red">
                    {g.title}
                  </h2>
                  <StatusBadge status={g.status} />
                </div>

                {g.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                    {g.description}
                  </p>
                )}

                {g.drawError && (
                  <div className="mt-3 flex items-start gap-2 rounded border border-amber-ink/40 bg-amber-wash px-3 py-2 text-xs font-medium text-amber-ink">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{g.drawError}</span>
                  </div>
                )}
              </div>

              <div className="relative z-10 mt-5 space-y-2 border-t border-dashed border-rule pt-4 text-xs text-ink-soft">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Gift className="h-3.5 w-3.5 text-xmas-red" />
                    {formatBudgetWithPrefix(g.budgetType, g.budgetMin, g.budgetMax)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded border border-ink/20 bg-paper px-2 py-0.5 font-bold text-ink">
                    <Users className="h-3.5 w-3.5 text-pine" />
                    ยืนยันแล้ว {g.verifiedMembers} / {g.totalMembers} คน
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-ink-soft" />
                  <span>ปิดรับสมัคร: {formatThaiDateTime(g.registrationClosesAt)}</span>
                </div>

                {(g.status === "ACTIVE" || g.status === "COMPLETED") && (
                  <div className="flex items-center gap-1.5 font-bold text-pine-deep">
                    <MailCheck className="h-3.5 w-3.5" />
                    <span>
                      ส่งอีเมลแจ้งผล: สำเร็จ {g.emailSummary.sent}
                      {g.emailSummary.failed > 0 && (
                        <span className="ml-1 font-bold text-xmas-red">
                          • ล้มเหลว {g.emailSummary.failed}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
