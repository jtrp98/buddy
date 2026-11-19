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
  Crown,
  Gift,
  Lock,
  LogOut,
  MailCheck,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { WinterScene } from "@/components/scenery/WinterScene";
import { PixelAvatar } from "@/components/join/PixelAvatar";
import { treeStage } from "@/lib/join-scene";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudgetWithPrefix } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";
import {
  Alert,
  ChristmasButton,
  EmptyState,
  Input,
  LoadingState,
  PageContainer,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

interface GroupOwner {
  id: string;
  name: string;
  email: string;
}

interface AdminGroupSummary {
  id: string;
  adminId: string;
  owner?: GroupOwner;
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
  participantSeeds: string[];
}

interface AdminInfo {
  adminId: string;
  email: string;
  name: string;
  isSuperAdmin?: boolean;
}

interface SuperAdminOverview {
  totalAdmins: number;
  totalGroups: number;
  totalMembers: number;
  verifiedMembers: number;
  activeOrCompletedGroups: number;
  openGroups: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { triggerClickSound } = useFestiveAtmosphere();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [groups, setGroups] = useState<AdminGroupSummary[]>([]);
  const [overview, setOverview] = useState<SuperAdminOverview | null>(null);
  const [scopeFilter, setScopeFilter] = useState<"all" | "mine">("all");
  const [searchQuery, setSearchQuery] = useState("");
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
          setOverview(grpData.overview ?? null);
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
        <LoadingState label="กำลังโหลดกิจกรรมของคุณ..." rows={4} />
      </PageContainer>
    );
  }

  const isSuperAdmin = Boolean(admin?.isSuperAdmin);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleGroups = groups.filter((g) => {
    if (isSuperAdmin && scopeFilter === "mine" && admin && g.adminId !== admin.adminId) {
      return false;
    }
    if (!normalizedQuery) return true;
    const haystack = [
      g.title,
      g.description ?? "",
      g.inviteCode,
      g.owner?.name ?? "",
      g.owner?.email ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const openCount = groups.filter((g) => g.status === "OPEN").length;
  const activeCount = groups.filter(
    (g) => g.status === "ACTIVE" || g.status === "COMPLETED"
  ).length;
  const totalVerified = groups.reduce((acc, g) => acc + g.verifiedMembers, 0);
  const totalMembers = groups.reduce((acc, g) => acc + g.totalMembers, 0);

  const inProgress = visibleGroups.filter((g) => g.status === "DRAFT" || g.status === "OPEN" || g.status === "DRAWING");
  const finished = visibleGroups.filter((g) => g.status === "ACTIVE" || g.status === "COMPLETED");
  // A small forest on the banner: one tree per group (most recent first), each at its own stage.
  const forest = groups.slice(0, 7);

  const renderGroup = (g: AdminGroupSummary) => {
    const isCopied = copiedGroupId === g.id;
    const verifyPct = g.totalMembers > 0 ? Math.round((g.verifiedMembers / g.totalMembers) * 100) : 0;
    const stage = treeStage(g.totalMembers);
    const extraPeople = Math.max(0, g.totalMembers - g.participantSeeds.length);

    return (
      <li key={g.id}>
        <article className="christmas-card group/card grid gap-5 rounded-[1.4rem] p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/45 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          {/* Tree */}
          <div className="flex items-center gap-4 lg:block lg:text-center">
            <ChristmasTree stage={stage} ground={false} className="h-20 w-auto shrink-0 lg:mx-auto" />
            <p className="text-[11px] font-semibold text-text-muted lg:mt-1">ต้นไม้ {stage}/5</p>
          </div>

          {/* Details */}
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={g.status} />
              {isSuperAdmin && g.owner && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
                  ผู้จัด: {g.owner.name} ({g.owner.email})
                </span>
              )}
              {g.drawError && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  ต้องตรวจสอบ
                </span>
              )}
            </div>
            <h3 className="thai-keep font-display text-2xl leading-snug text-text-primary">
              <Link href={`/admin/groups/${g.id}`} className="underline-offset-4 hover:text-primary hover:underline">
                {g.title}
              </Link>
            </h3>
            {g.description && (
              <p className="line-clamp-1 text-sm text-text-secondary">{g.description}</p>
            )}

            <dl className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">งบประมาณ</dt>
                <Gift className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <dd className="text-text-primary">{formatBudgetWithPrefix(g.budgetType, g.budgetMin, g.budgetMax)}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">ปิดรับสมัคร</dt>
                <CalendarClock className="h-4 w-4 shrink-0 text-christmas-red-light" aria-hidden="true" />
                <dd className="text-text-secondary">{formatThaiDateTime(g.registrationClosesAt)}</dd>
              </div>
              {(g.status === "ACTIVE" || g.status === "COMPLETED") && (
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">อีเมลแจ้งผล</dt>
                  <MailCheck className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  <dd className="text-text-secondary">
                    ส่งแล้ว {g.emailSummary.sent}
                    {g.emailSummary.failed > 0 && (
                      <span className="ml-2 font-semibold text-christmas-red-light">ล้มเหลว {g.emailSummary.failed}</span>
                    )}
                    {g.emailSummary.pending > 0 && <span className="ml-2 text-primary">รอส่ง {g.emailSummary.pending}</span>}
                  </dd>
                </div>
              )}
            </dl>

            {/* People */}
            <div className="flex flex-wrap items-center gap-3">
              {g.totalMembers > 0 ? (
                <div className="flex items-end -space-x-1.5" aria-hidden="true">
                  {g.participantSeeds.map((seed) => (
                    <span
                      key={seed}
                      className="flex h-9 w-8 items-end justify-center overflow-hidden rounded-lg border-2 border-surface bg-[linear-gradient(180deg,#1a3a4c,#dce7ee_80%)]"
                    >
                      <PixelAvatar seed={seed} px={2} className="-mb-1.5" />
                    </span>
                  ))}
                  {extraPeople > 0 && (
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-lg border-2 border-surface bg-surface-elevated px-1.5 text-xs font-bold text-text-primary">
                      +{extraPeople}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-text-muted">ยังไม่มีผู้ลงทะเบียน</span>
              )}
              <span className="flex items-center gap-2 text-xs text-text-secondary">
                <Users className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                ยืนยันแล้ว {g.verifiedMembers}/{g.totalMembers}
                <span className="block h-1.5 w-20 overflow-hidden rounded-full bg-input-bg" aria-hidden="true">
                  <span
                    className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-success))]"
                    style={{ width: `${verifyPct}%` }}
                  />
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Link href={`/admin/groups/${g.id}`} className={christmasButtonClass("primary", "sm", "w-full lg:w-44")}>
              <span>จัดการกิจกรรม</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <ChristmasButton
              variant="secondary"
              size="sm"
              onClick={() => handleCopyInvite(g.id, g.title, g.inviteCode)}
              className="w-full lg:w-44"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
              <span>{isCopied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์เชิญ"}</span>
            </ChristmasButton>
          </div>
        </article>
      </li>
    );
  };

  return (
    <PageContainer className="space-y-8">
      {/* Banner: greeting + a little forest of this admin's groups */}
      <section className="rise-in relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[var(--shadow-card-lifted)]">
        <WinterScene variant="auth" showCabin={false} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,18,36,0.85)_0%,rgba(8,18,36,0.5)_45%,transparent_75%)]"
        />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-script text-2xl text-primary">
                {admin ? `สวัสดี ${admin.name}` : "สวัสดี"}
              </p>
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-primary">
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                  Superadmin
                </span>
              )}
            </div>
            <h1 className="thai-keep mt-1 text-4xl leading-tight text-text-primary sm:text-5xl">
              {isSuperAdmin ? "ภาพรวมระบบทั้งหมด" : "กิจกรรมของคุณ"}
            </h1>
            {admin && <p className="mt-2 text-sm text-text-secondary">{admin.email}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link href="/admin/groups/new" className={christmasButtonClass("primary", "md")}>
                <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>สร้างกิจกรรมใหม่</span>
              </Link>
              <ChristmasButton variant="secondary" size="md" onClick={handleLogout}>
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>ออกจากระบบ</span>
              </ChristmasButton>
            </div>
          </div>

          {forest.length > 0 && (
            <div aria-hidden="true" className="hidden items-end justify-end gap-1 sm:flex">
              {forest.map((g, i) => (
                <ChristmasTree
                  key={g.id}
                  stage={treeStage(g.totalMembers)}
                  ground={false}
                  className="w-auto"
                  style={{ height: `${150 - (i % 3) * 22}px` }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {(groups.length > 0 || isSuperAdmin) && (
        <dl className={`grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-5 ${isSuperAdmin ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
          {isSuperAdmin && overview && (
            <div>
              <dt className="text-xs text-text-muted">ผู้ดูแลระบบ (Admins)</dt>
              <dd className="mt-1 font-display text-4xl text-primary">{overview.totalAdmins}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-text-muted">กิจกรรมทั้งหมด</dt>
            <dd className="mt-1 font-display text-4xl text-text-primary">{groups.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">กำลังเปิดรับสมัคร</dt>
            <dd className="mt-1 font-display text-4xl text-success">{openCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">จับคู่แล้ว</dt>
            <dd className="mt-1 font-display text-4xl text-primary">{activeCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">ผู้เข้าร่วมยืนยันแล้ว</dt>
            <dd className="mt-1 font-display text-4xl text-text-primary">
              {totalVerified}
              <span className="ml-1 text-base text-text-muted">/ {totalMembers}</span>
            </dd>
          </div>
        </dl>
      )}

      {isSuperAdmin && groups.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScopeFilter("all")}
              className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                scopeFilter === "all"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-elevated text-text-secondary hover:border-primary/40"
              }`}
            >
              ทุกกลุ่ม ({groups.length})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter("mine")}
              className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                scopeFilter === "mine"
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface-elevated text-text-secondary hover:border-primary/40"
              }`}
            >
              กลุ่มของฉัน ({groups.filter((g) => g.adminId === admin?.adminId).length})
            </button>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อกลุ่ม, โค้ด, หรือผู้จัด..."
              className="pl-9"
              aria-label="ค้นหากลุ่ม"
            />
          </div>
        </div>
      )}

      {toastTitle && (
        <Alert tone="success" title="คัดลอกลิงก์เชิญเรียบร้อยแล้ว!">
          นำลิงก์ของกิจกรรม <strong>{toastTitle}</strong> ไปส่งให้เพื่อน ๆ ในแชทได้เลย
        </Alert>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {groups.length === 0 ? (
        <EmptyState
          icon={<ChristmasTree stage={1} ground={false} className="h-36 w-auto" />}
          title="ต้นคริสต์มาสต้นแรกกำลังรอคุณอยู่"
          description="สร้างปาร์ตี้แรก กำหนดงบของขวัญ แล้วรับลิงก์เชิญไปส่งให้เพื่อน ๆ ได้เลย"
          action={
            <Link href="/admin/groups/new" className={christmasButtonClass("primary", "lg")}>
              <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>สร้างกิจกรรมแรกเลย</span>
            </Link>
          }
        />
      ) : (
        <div className="space-y-10">
          {inProgress.length > 0 && (
            <section aria-labelledby="in-progress-title">
              <h2 id="in-progress-title" className="text-2xl text-text-primary">
                กำลังดำเนินการ <span className="text-text-muted">({inProgress.length})</span>
              </h2>
              <ul className="mt-4 space-y-4">{inProgress.map(renderGroup)}</ul>
            </section>
          )}
          {finished.length > 0 && (
            <section aria-labelledby="finished-title">
              <h2 id="finished-title" className="text-2xl text-text-primary">
                จับคู่แล้ว <span className="text-text-muted">({finished.length})</span>
              </h2>
              <ul className="mt-4 space-y-4">{finished.map(renderGroup)}</ul>
            </section>
          )}
        </div>
      )}

      <p className="flex items-center gap-2 px-1 text-xs text-text-muted sm:text-sm">
        <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        {isSuperAdmin
          ? "บัญชี Superadmin สามารถดูภาพรวม จัดการทุกกลุ่ม และตรวจสอบคู่บัดดี้ภายในกลุ่มที่สุ่มจับคู่แล้วได้"
          : "Admin เห็นเฉพาะรายชื่อผู้เข้าร่วมและสถานะการส่งอีเมล ไม่เห็นผลการจับคู่"}
      </p>
    </PageContainer>
  );
}
