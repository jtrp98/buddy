"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Check,
  Copy,
  Gift,
  Lock,
  LogOut,
  MailCheck,
  Plus,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ChristmasTree3D,
  SantaCharacter3D,
} from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudgetWithPrefix } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  EmptyState,
  LoadingState,
  PageContainer,
  PageHeader,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

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
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);
  const [toastTitle, setToastTitle] = useState<string | null>(null);

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

  const handleCopyInvite = async (
    groupId: string,
    groupTitle: string,
    inviteCode: string
  ) => {
    if (typeof window === "undefined") return;
    triggerClickSound();
    const url = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedGroupId(groupId);
    setToastTitle(groupTitle);
    setTimeout(() => {
      setCopiedGroupId((current) => (current === groupId ? null : current));
      setToastTitle((current) => (current === groupTitle ? null : current));
    }, 2400);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState label="กำลังเปิด Santa's Mission Control..." rows={4} />
      </PageContainer>
    );
  }

  const openCount = groups.filter((g) => g.status === "OPEN").length;
  const activeCount = groups.filter(
    (g) => g.status === "ACTIVE" || g.status === "COMPLETED"
  ).length;
  const totalVerified = groups.reduce((acc, g) => acc + g.verifiedMembers, 0);

  return (
    <PageContainer className="space-y-6">
      {/* Mission Control Header */}
      <ChristmasCard elevated withStripe>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden shrink-0 rounded-2xl border border-primary/30 bg-[#0B1728]/70 p-2 sm:block">
              <SantaCharacter3D className="h-20 w-20" />
            </div>
            <PageHeader
              kicker="SANTA'S CHRISTMAS MISSION CONTROL"
              title="ศูนย์ควบคุมกิจกรรม Secret Buddy"
              description={
                admin ? (
                  <span>
                    สวัสดีหัวหน้าเวิร์กช็อป{" "}
                    <strong className="text-snow-white">{admin.name}</strong> ({admin.email})
                  </span>
                ) : (
                  "สร้างกิจกรรม แชร์ลิงก์เชิญ และติดตามความคืบหน้าของสมาชิกทุกคน"
                )
              }
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <Link
              href="/admin/groups/new"
              className={christmasButtonClass("primary", "md")}
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>สร้างกิจกรรมใหม่</span>
            </Link>
            <ChristmasButton variant="secondary" size="md" onClick={handleLogout}>
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>ออกจากระบบ</span>
            </ChristmasButton>
          </div>
        </div>

        {/* Mission Control Overview Metrics */}
        {groups.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-background/60 p-3.5 sm:p-4">
              <div className="text-xs font-medium text-text-secondary">กิจกรรมทั้งหมด</div>
              <div className="mt-1 text-xl font-bold text-snow-white sm:text-2xl">
                {groups.length}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-400/30 bg-evergreen/55 p-3.5 sm:p-4">
              <div className="text-xs font-medium text-emerald-200">กำลังเปิดรับสมัคร</div>
              <div className="mt-1 text-xl font-bold text-emerald-100 sm:text-2xl">
                {openCount}
              </div>
            </div>
            <div className="rounded-xl border border-primary/35 bg-background/60 p-3.5 sm:p-4">
              <div className="text-xs font-medium text-primary">จับคู่สำเร็จแล้ว</div>
              <div className="mt-1 text-xl font-bold text-primary sm:text-2xl">
                {activeCount}
              </div>
            </div>
            <div className="rounded-xl border border-ice-blue/25 bg-background/60 p-3.5 sm:p-4">
              <div className="text-xs font-medium text-ice-blue">สมาชิกยืนยันแล้ว</div>
              <div className="mt-1 text-xl font-bold text-snow-white sm:text-2xl">
                {totalVerified}
              </div>
            </div>
          </div>
        )}
        </div>
      </ChristmasCard>

      {/* Celebratory Copy Confirmation Toast */}
      {toastTitle && (
        <Alert tone="success" title="คัดลอกลิงก์เชิญเรียบร้อยแล้ว!">
          นำลิงก์ของกิจกรรม <strong>{toastTitle}</strong> ไปวางส่งให้เพื่อน ๆ ในแชททีมได้เลย
        </Alert>
      )}

      {/* Privacy Reminder */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface/85 px-4 py-3 text-xs font-medium text-text-secondary sm:text-sm">
        <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          ระบบรักษาความลับ: Admin จะเห็นเฉพาะรายชื่อผู้เข้าร่วมและสถานะส่งอีเมลเท่านั้น ไม่สามารถดูผลการจับคู่ได้
        </span>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {groups.length === 0 ? (
        <EmptyState
          icon={<ChristmasTree3D className="h-28 w-28" />}
          title="ยังไม่มีกิจกรรม Secret Buddy ในเวิร์กช็อปของคุณ"
          description="เริ่มเตรียมปาร์ตี้คริสต์มาสแรก กำหนดงบของขวัญ และรับลิงก์เชิญสุดพิเศษสำหรับส่งให้เพื่อน ๆ ได้เลย"
          action={
            <Link
              href="/admin/groups/new"
              className={christmasButtonClass("primary", "lg")}
            >
              <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>สร้างกิจกรรมแรกเลย</span>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((g) => {
            const isCopied = copiedGroupId === g.id;
            const verifyPct =
              g.totalMembers > 0
                ? Math.round((g.verifiedMembers / g.totalMembers) * 100)
                : 0;

            return (
              <ChristmasCard
                key={g.id}
                className="flex flex-col justify-between p-6 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/50"
              >
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2.5">
                    <h2 className="thai-keep min-w-0 flex-1 text-lg font-bold text-snow-white sm:text-xl">
                      <Link
                        href={`/admin/groups/${g.id}`}
                        className="hover:text-primary hover:underline underline-offset-4"
                      >
                        {g.title}
                      </Link>
                    </h2>
                    <StatusBadge status={g.status} />
                  </div>

                  {g.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                      {g.description}
                    </p>
                  )}

                  {g.drawError && (
                    <Alert tone="warning" className="mt-4 py-2.5 text-xs">
                      <span className="font-semibold">หมายเหตุการจับคู่:</span> {g.drawError}
                    </Alert>
                  )}

                  {/* Christmas-themed Participant Verification Progress Bar */}
                  <div className="mt-5 rounded-xl border border-white/10 bg-background/55 p-3.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <Users className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                        <span>ความคืบหน้าการยืนยันสมาชิก</span>
                      </span>
                      <span className="text-primary">
                        {g.verifiedMembers} / {g.totalMembers} คน ({verifyPct}%)
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C62838] via-[#E8C47A] to-[#4ADE80] transition-all duration-500"
                        style={{ width: `${verifyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Event Metadata */}
                  <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-2 text-text-secondary">
                        <Gift className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>งบประมาณ</span>
                      </dt>
                      <dd className="font-semibold text-snow-white">
                        {formatBudgetWithPrefix(g.budgetType, g.budgetMin, g.budgetMax)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-2 text-text-secondary">
                        <CalendarClock className="h-4 w-4 shrink-0 text-christmas-red-light" aria-hidden="true" />
                        <span>ปิดรับสมัคร</span>
                      </dt>
                      <dd className="text-right text-xs font-medium text-snow-white sm:text-sm">
                        {formatThaiDateTime(g.registrationClosesAt)}
                      </dd>
                    </div>

                    {(g.status === "ACTIVE" || g.status === "COMPLETED") && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="flex items-center gap-2 text-text-secondary">
                          <MailCheck className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                          <span>สถานะอีเมลแจ้งผล</span>
                        </dt>
                        <dd className="text-xs font-semibold sm:text-sm">
                          <span className="text-emerald-300">
                            ส่งสำเร็จ {g.emailSummary.sent}
                          </span>
                          {g.emailSummary.failed > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-christmas-red-light">
                              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                              ล้มเหลว {g.emailSummary.failed}
                            </span>
                          )}
                          {g.emailSummary.pending > 0 && (
                            <span className="ml-2 text-primary">
                              รอส่ง {g.emailSummary.pending}
                            </span>
                          )}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Card Actions */}
                <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-4 sm:flex-row">
                  <ChristmasButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyInvite(g.id, g.title, g.inviteCode)}
                    className="flex-1"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4 text-primary" aria-hidden="true" />
                    )}
                    <span>{isCopied ? "คัดลอกลิงก์แล้ว!" : "คัดลอกลิงก์เชิญ"}</span>
                  </ChristmasButton>

                  <Link
                    href={`/admin/groups/${g.id}`}
                    className={christmasButtonClass("primary", "sm", "flex-1")}
                  >
                    <span>จัดการกิจกรรม</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                </div>
              </ChristmasCard>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
