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
        <div className="analog-card h-32 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <div className="analog-card flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#1f5e46] uppercase">
            SANTA&apos;S WORKSHOP LEDGER
          </span>
          <h1 className="text-2xl font-bold text-[#2a1f1b] sm:text-3xl">
            แดชบอร์ด Admin
          </h1>
          {admin && (
            <p className="mt-1 text-sm text-[#675449]">
              สวัสดีคุณ <span className="font-bold text-[#2a1f1b]">{admin.name}</span> ({admin.email})
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/groups/new"
            className="analog-btn inline-flex items-center gap-2 rounded-xl bg-[#c8322b] px-4 py-2.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
          >
            <Plus className="h-4 w-4" />
            <span>สร้างกลุ่ม Buddy ใหม่</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="analog-btn inline-flex items-center gap-1.5 rounded-xl bg-[#fffdf7] px-3.5 py-2.5 text-sm font-bold text-[#2a1f1b] hover:bg-[#f3e7d1]"
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border-2 border-[#c8322b] bg-[#fdeceb] px-4 py-3 text-sm font-medium text-[#8b1a15]">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="analog-card mt-8 rounded-3xl p-12 text-center">
          <WaxSeal tone="red" size="lg" className="mx-auto">
            <Gift className="h-7 w-7" />
          </WaxSeal>
          <h2 className="mt-4 text-lg font-bold text-[#2a1f1b]">
            ยังไม่มีกลุ่มกิจกรรม Secret Buddy
          </h2>
          <p className="mt-1.5 text-sm text-[#675449]">
            สร้างกลุ่มแรกของคุณเพื่อกำหนดงบของขวัญ เวลาปิดรับสมัคร และรับลิงก์เชิญสมาชิก
          </p>
          <Link
            href="/admin/groups/new"
            className="analog-btn-lg mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c8322b] px-5 py-2.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
          >
            <Plus className="h-4 w-4" />
            <span>สร้างกลุ่มใหม่เลย</span>
          </Link>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {groups.map((g, index) => (
            <Link
              key={g.id}
              href={`/admin/groups/${g.id}`}
              className="analog-card group relative flex flex-col justify-between rounded-2xl p-6 pt-7 transition hover:-translate-y-0.5"
            >
              <WashiTape
                tone={index % 2 === 0 ? "red" : "green"}
                className="absolute -top-2.5 left-6 -rotate-2"
              />

              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-[#2a1f1b] group-hover:text-[#c8322b]">
                    {g.title}
                  </h2>
                  <StatusBadge status={g.status} />
                </div>

                {g.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-[#5c493e]">
                    {g.description}
                  </p>
                )}

                {g.drawError && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-[#b7791f] bg-[#fdf3db] px-3 py-2 text-xs font-medium text-[#7c4d08]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{g.drawError}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2 border-t-2 border-dashed border-[#cbb7a6] pt-4 text-xs text-[#5c493e]">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Gift className="h-3.5 w-3.5 text-[#c8322b]" />
                    {formatBudgetWithPrefix(g.budgetType, g.budgetMin, g.budgetMax)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#2a1f1b] bg-[#fdf6e9] px-2 py-0.5 font-bold text-[#2a1f1b]">
                    <Users className="h-3.5 w-3.5 text-[#1f5e46]" />
                    ยืนยันแล้ว {g.verifiedMembers} / {g.totalMembers} คน
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5 text-[#675449]" />
                  <span>ปิดรับสมัคร: {formatThaiDateTime(g.registrationClosesAt)}</span>
                </div>

                {(g.status === "ACTIVE" || g.status === "COMPLETED") && (
                  <div className="flex items-center gap-1.5 font-bold text-[#154231]">
                    <MailCheck className="h-3.5 w-3.5" />
                    <span>
                      ส่งอีเมลแจ้งผล: สำเร็จ {g.emailSummary.sent}
                      {g.emailSummary.failed > 0 && (
                        <span className="ml-1 font-bold text-[#c8322b]">
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
