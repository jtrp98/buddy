"use client";

import { Suspense, useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Gift,
  Lock,
  MailCheck,
  RefreshCw,
  Send,
  Shuffle,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ChristmasJourney } from "@/components/ChristmasJourney";
import { ChristmasTree3D } from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudgetWithPrefix, type BudgetTypeValue } from "@/lib/budget";
import { formatThaiDateTime, utcToBangkokLocalInput } from "@/lib/timezone";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  ConfirmationDialog,
  EmptyState,
  FormField,
  Input,
  LoadingState,
  PageContainer,
  Select,
  Textarea,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

interface GroupDetail {
  id: string;
  title: string;
  description: string | null;
  inviteCode: string;
  budgetType: BudgetTypeValue;
  budgetMin: number | null;
  budgetMax: number | null;
  registrationClosesAt: string;
  revealAt: string | null;
  status: "DRAFT" | "OPEN" | "DRAWING" | "ACTIVE" | "COMPLETED";
  drawError: string | null;
  drawnAt: string | null;
}

interface MemberRow {
  id: string;
  displayName: string;
  email: string;
  verified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  resultEmail: {
    status: "PENDING" | "SENT" | "FAILED";
    attempts: number;
    lastError: string | null;
    sentAt: string | null;
  } | null;
}

function getAdminJourneyStep(status: GroupDetail["status"]): 1 | 2 | 3 | 4 {
  if (status === "DRAFT") return 1;
  if (status === "OPEN") return 2;
  if (status === "DRAWING" || status === "ACTIVE") return 3;
  return 4;
}

function AdminGroupDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const groupId = params.id;
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();

  const editTitleId = useId();
  const editRevealId = useId();
  const editDescId = useId();
  const editBudgetTypeId = useId();
  const editCloseId = useId();
  const editBudgetMinId = useId();
  const editBudgetMaxId = useId();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const [drawing, setDrawing] = useState(false);
  const [confirmDrawOpen, setConfirmDrawOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resendingAll, setResendingAll] = useState(false);
  const [resendingMemberId, setResendingMemberId] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBudgetType, setEditBudgetType] = useState<BudgetTypeValue>("FIXED");
  const [editBudgetMin, setEditBudgetMin] = useState("");
  const [editBudgetMax, setEditBudgetMax] = useState("");
  const [editCloseAt, setEditCloseAt] = useState("");
  const [editRevealAt, setEditRevealAt] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const syncEditFields = (g: GroupDetail) => {
    setEditTitle(g.title);
    setEditDesc(g.description || "");
    setEditBudgetType(g.budgetType);
    setEditBudgetMin(g.budgetMin != null ? String(g.budgetMin) : "");
    setEditBudgetMax(g.budgetMax != null ? String(g.budgetMax) : "");
    setEditCloseAt(utcToBangkokLocalInput(g.registrationClosesAt));
    setEditRevealAt(g.revealAt ? utcToBangkokLocalInput(g.revealAt) : "");
  };

  const loadGroup = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่พบข้อมูลกลุ่ม");
        return;
      }
      setError("");
      const g: GroupDetail = data.group;
      setGroup(g);
      setMembers(data.members || []);
      syncEditFields(g);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลกลุ่มได้");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/groups/${groupId}`, { cache: "no-store" });
        if (res.status === 401) {
          if (!cancelled) router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "ไม่พบข้อมูลกลุ่ม");
          return;
        }
        setError("");
        const g: GroupDetail = data.group;
        setGroup(g);
        setMembers(data.members || []);
        syncEditFields(g);
      } catch {
        if (!cancelled) setError("ไม่สามารถโหลดข้อมูลกลุ่มได้");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId, router]);

  const inviteUrl =
    typeof window !== "undefined" && group
      ? `${window.location.origin}/join/${group.inviteCode}`
      : "";

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    triggerClickSound();
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishOpen = async () => {
    triggerClickSound();
    setNotice("");
    setError("");
    const res = await fetch(`/api/admin/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "OPEN" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "ไม่สามารถเปิดรับสมัครได้");
      return;
    }
    triggerChimeSound();
    setNotice("เปิดรับสมัครเรียบร้อยแล้ว! สามารถแชร์ลิงก์ให้สมาชิกเข้าร่วมได้ทันที");
    await loadGroup();
  };

  const handleConfirmDraw = async () => {
    if (!group) return;
    triggerClickSound();
    setDrawing(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/draw`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถสุ่มจับคู่ได้");
      } else {
        triggerChimeSound();
        setNotice(
          `สุ่มจับคู่สำเร็จ ${data.result.count} คน! ส่งอีเมลสำเร็จ ${data.result.sent} ฉบับ` +
            (data.result.failed > 0 ? ` (ล้มเหลว ${data.result.failed} ฉบับ)` : "")
        );
      }
      setConfirmDrawOpen(false);
      await loadGroup();
    } catch {
      setError("เกิดข้อผิดพลาดในการสุ่มจับคู่");
    } finally {
      setDrawing(false);
    }
  };

  const handleResendFailed = async () => {
    triggerClickSound();
    setResendingAll(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/resend-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ส่งอีเมลซ้ำไม่สำเร็จ");
      } else {
        setNotice(
          `ดำเนินการส่งอีเมลซ้ำแล้ว: สำเร็จ ${data.result.sent} ฉบับ` +
            (data.result.failed > 0 ? `, ล้มเหลว ${data.result.failed} ฉบับ` : "")
        );
      }
      await loadGroup();
    } finally {
      setResendingAll(false);
    }
  };

  const handleResendOne = async (memberId: string, displayName: string) => {
    triggerClickSound();
    setResendingMemberId(memberId);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/resend-emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ส่งอีเมลซ้ำไม่สำเร็จ");
      } else if (data.result.sent > 0) {
        setNotice(`ส่งอีเมลแจ้งผลลิงก์ใหม่ให้คุณ${displayName} เรียบร้อยแล้ว (โดยไม่สุ่มคู่ใหม่)`);
      } else {
        setError(`ส่งอีเมลให้คุณ${displayName} ไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าอีเมล`);
      }
      await loadGroup();
    } finally {
      setResendingMemberId(null);
    }
  };

  const handleToggleCompleted = async (nextStatus: "COMPLETED" | "ACTIVE") => {
    triggerClickSound();
    setError("");
    setNotice("");
    const res = await fetch(`/api/admin/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "ไม่สามารถเปลี่ยนสถานะได้");
      return;
    }
    setNotice(
      nextStatus === "COMPLETED" ? "บันทึกสถานะจบกิจกรรมเรียบร้อยแล้ว" : "เปิดสถานะดูผลต่อเรียบร้อยแล้ว"
    );
    await loadGroup();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setSavingEdit(true);
    setError("");
    setNotice("");
    try {
      const isPreDraw = group?.status === "DRAFT" || group?.status === "OPEN";
      const payload = isPreDraw
        ? {
            title: editTitle,
            description: editDesc || null,
            budgetType: editBudgetType,
            budgetMin:
              editBudgetType === "UNLIMITED"
                ? null
                : editBudgetMin
                  ? Number(editBudgetMin)
                  : null,
            budgetMax:
              editBudgetType === "RANGE"
                ? editBudgetMax
                  ? Number(editBudgetMax)
                  : null
                : null,
            registrationClosesAt: editCloseAt,
            revealAt: editRevealAt || null,
          }
        : {
            title: editTitle,
            description: editDesc || null,
            revealAt: editRevealAt || null,
          };

      const res = await fetch(`/api/admin/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "บันทึกการแก้ไขไม่สำเร็จ");
        return;
      }
      setEditing(false);
      setNotice("บันทึกข้อมูลกิจกรรมเรียบร้อยแล้ว");
      await loadGroup();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    triggerClickSound();
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/groups/${groupId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
      } else {
        setError("ไม่สามารถลบกลุ่มได้");
        setConfirmDeleteOpen(false);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setConfirmDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingState label="กำลังโหลดข้อมูลกิจกรรม..." rows={5} />
      </PageContainer>
    );
  }

  if (!group) {
    return (
      <PageContainer size="md">
        <EmptyState
          icon={<ChristmasTree3D className="h-24 w-24" />}
          title="ไม่พบกลุ่มกิจกรรมนี้"
          description={error || "กลุ่มนี้อาจถูกลบไปแล้วหรือคุณไม่มีสิทธิ์เข้าถึง"}
          action={
            <Link href="/admin" className={christmasButtonClass("primary", "md")}>
              กลับไปหน้า Mission Control
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const verifiedMembers = members.filter((m) => m.verified);
  const verifyPct =
    members.length > 0 ? Math.round((verifiedMembers.length / members.length) * 100) : 0;
  const failedEmailCount = members.filter(
    (m) => m.resultEmail?.status === "FAILED" || m.resultEmail?.status === "PENDING"
  ).length;
  const isDrawn = group.status === "ACTIVE" || group.status === "COMPLETED";

  return (
    <PageContainer className="space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>กลับไปหน้า Mission Control</span>
        </Link>

        <ChristmasButton
          variant="secondary"
          size="sm"
          loading={refreshing}
          loadingText="กำลังรีเฟรช..."
          onClick={() => {
            triggerClickSound();
            void loadGroup();
          }}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>รีเฟรชข้อมูล</span>
        </ChristmasButton>
      </div>

      {/* Group Mission Journey Stepper */}
      <ChristmasJourney mode="admin" currentStep={getAdminJourneyStep(group.status)} />

      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      {group.drawError && (
        <Alert tone="warning" title="ยังไม่สามารถสุ่มจับคู่ได้">
          {group.drawError}
        </Alert>
      )}

      {/* Header Control Card */}
      <ChristmasCard elevated withStripe>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div className="hidden shrink-0 rounded-2xl border border-primary/25 bg-background/65 p-2 sm:block">
                <ChristmasTree3D className="h-20 w-20" />
              </div>

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={group.status} />
                  {group.status === "OPEN" && (
                    <CountdownTimer
                      targetIso={group.registrationClosesAt}
                      onExpire={() => loadGroup()}
                    />
                  )}
                </div>

                <h1 className="thai-keep text-2xl font-bold leading-snug text-snow-white sm:text-3xl">
                  {group.title}
                </h1>

                {group.description && (
                  <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                    {group.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2.5">
              {group.status === "DRAFT" && (
                <ChristmasButton variant="primary" onClick={handlePublishOpen}>
                  เปิดรับสมัครทันที
                </ChristmasButton>
              )}

              {group.status === "OPEN" && (
                <ChristmasButton
                  variant="primary"
                  loading={drawing}
                  loadingText="กำลังสุ่ม..."
                  onClick={() => {
                    triggerClickSound();
                    setConfirmDrawOpen(true);
                  }}
                >
                  <Shuffle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>ปิดรับสมัครและสุ่มจับคู่ทันที</span>
                </ChristmasButton>
              )}

              {group.status === "ACTIVE" && (
                <ChristmasButton
                  variant="secondary"
                  onClick={() => handleToggleCompleted("COMPLETED")}
                >
                  ปิดกิจกรรม (Completed)
                </ChristmasButton>
              )}

              {group.status === "COMPLETED" && (
                <ChristmasButton
                  variant="secondary"
                  onClick={() => handleToggleCompleted("ACTIVE")}
                >
                  เปิดให้ดูผลต่อ (Active)
                </ChristmasButton>
              )}

              <ChristmasButton
                variant="secondary"
                onClick={() => {
                  triggerClickSound();
                  setEditing((v) => !v);
                }}
              >
                <Edit3 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{editing ? "ยกเลิกแก้ไข" : "แก้ไขรายละเอียด"}</span>
              </ChristmasButton>
            </div>
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid gap-3.5 sm:grid-cols-3">
            <div className="rounded-xl border border-primary/35 bg-background/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>งบประมาณของขวัญ</span>
              </div>
              <div className="mt-1.5 text-base font-bold text-snow-white">
                {formatBudgetWithPrefix(group.budgetType, group.budgetMin, group.budgetMax)}
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-background/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-christmas-red-light">
                <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>วันเวลาปิดรับสมัคร</span>
              </div>
              <div className="mt-1.5 text-sm font-bold text-snow-white">
                {formatThaiDateTime(group.registrationClosesAt)}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-400/35 bg-evergreen/55 p-4">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>ผู้ยืนยันอีเมลแล้ว</span>
                </span>
                <span>{verifyPct}%</span>
              </div>
              <div className="mt-1.5 text-base font-bold text-emerald-100">
                {verifiedMembers.length} คน{" "}
                <span className="text-xs font-normal text-text-secondary">
                  (ทั้งหมด {members.length} คน)
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/65">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E8C47A] to-[#4ADE80] transition-all duration-500"
                  style={{ width: `${verifyPct}%` }}
                />
              </div>
            </div>
          </div>

          {group.revealAt && (
            <p className="mt-3 text-xs font-medium text-text-secondary sm:text-sm">
              วันนัดเฉลย Buddy:{" "}
              <strong className="text-snow-white">
                {formatThaiDateTime(group.revealAt)}
              </strong>
            </p>
          )}

          {/* Invite Link Sharing Box */}
          <div className="mt-6 rounded-2xl border border-dashed border-primary/50 bg-[#0B1728]/85 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs font-bold tracking-wider text-primary uppercase">
                  INVITATION LINK — ลิงก์เชิญสมาชิกเข้าร่วม
                </div>
                <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                  แชร์ลิงก์นี้ให้เพื่อนกรอกชื่อ อีเมล และ Wish List (ผู้เข้าร่วมไม่ต้องสมัครบัญชี)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ChristmasButton
                  variant="gold"
                  size="sm"
                  onClick={copyInviteLink}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์เชิญ"}</span>
                </ChristmasButton>
                <Link
                  href={`/join/${group.inviteCode}`}
                  target="_blank"
                  className={christmasButtonClass("secondary", "sm")}
                >
                  <span>เปิดหน้าบัตรเชิญ</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="mt-3 truncate rounded-xl border border-border bg-surface px-3.5 py-2.5 font-mono text-xs text-snow-white select-all sm:text-sm">
              {inviteUrl}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary">
            <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              ระบบรักษาความลับ: หน้าจัดการ Admin จะแสดงเฉพาะรายชื่อและสถานะส่งอีเมล โดยไม่แสดงผลการจับคู่
            </span>
          </div>

          {/* Inline Edit Form */}
          {editing && (
            <form
              onSubmit={handleSaveEdit}
              className="mt-6 space-y-5 rounded-2xl border border-primary/35 bg-background/80 p-5 sm:p-6"
            >
              <h2 className="text-base font-bold text-primary">แก้ไขรายละเอียดกิจกรรม</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="ชื่อกิจกรรม" htmlFor={editTitleId} required>
                  <Input
                    id={editTitleId}
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </FormField>

                <FormField label="วันเฉลย Buddy (ไม่บังคับ)" htmlFor={editRevealId}>
                  <Input
                    id={editRevealId}
                    type="datetime-local"
                    value={editRevealAt}
                    onChange={(e) => setEditRevealAt(e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="รายละเอียดกิจกรรม" htmlFor={editDescId}>
                <Textarea
                  id={editDescId}
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </FormField>

              {!isDrawn && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="ประเภทงบประมาณ" htmlFor={editBudgetTypeId}>
                    <Select
                      id={editBudgetTypeId}
                      value={editBudgetType}
                      onChange={(e) => setEditBudgetType(e.target.value as BudgetTypeValue)}
                    >
                      <option value="FIXED">งบตายตัว</option>
                      <option value="RANGE">งบแบบช่วง</option>
                      <option value="MIN">งบขั้นต่ำ</option>
                      <option value="UNLIMITED">ไม่จำกัดงบ</option>
                    </Select>
                  </FormField>

                  <FormField label="วันเวลาปิดรับสมัคร (เวลาไทย)" htmlFor={editCloseId} required>
                    <Input
                      id={editCloseId}
                      type="datetime-local"
                      required
                      value={editCloseAt}
                      onChange={(e) => setEditCloseAt(e.target.value)}
                    />
                  </FormField>

                  {editBudgetType !== "UNLIMITED" && (
                    <FormField
                      label={editBudgetType === "RANGE" ? "งบต่ำสุด (บาท)" : "จำนวนเงิน (บาท)"}
                      htmlFor={editBudgetMinId}
                      required
                    >
                      <Input
                        id={editBudgetMinId}
                        type="number"
                        min={1}
                        required
                        value={editBudgetMin}
                        onChange={(e) => setEditBudgetMin(e.target.value)}
                      />
                    </FormField>
                  )}

                  {editBudgetType === "RANGE" && (
                    <FormField label="งบสูงสุด (บาท)" htmlFor={editBudgetMaxId} required>
                      <Input
                        id={editBudgetMaxId}
                        type="number"
                        min={1}
                        required
                        value={editBudgetMax}
                        onChange={(e) => setEditBudgetMax(e.target.value)}
                      />
                    </FormField>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2.5">
                <ChristmasButton
                  variant="secondary"
                  onClick={() => setEditing(false)}
                >
                  ยกเลิก
                </ChristmasButton>
                <ChristmasButton
                  type="submit"
                  variant="primary"
                  loading={savingEdit}
                  loadingText="กำลังบันทึก..."
                >
                  บันทึกการเปลี่ยนแปลง
                </ChristmasButton>
              </div>
            </form>
          )}
        </div>
      </ChristmasCard>

      {/* Members & Email Delivery Status */}
      <ChristmasCard className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              PARTICIPANTS ROSTER
            </span>
            <h2 className="thai-keep mt-0.5 text-xl font-bold text-snow-white">
              รายชื่อผู้ลงทะเบียน ({members.length} คน)
            </h2>
            <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
              เฉพาะสมาชิกที่ยืนยันอีเมลแล้ว ({verifiedMembers.length} คน) จึงจะถูกนำมารวมในการสุ่มจับคู่
            </p>
          </div>

          {isDrawn && failedEmailCount > 0 && (
            <ChristmasButton
              variant="primary"
              size="sm"
              loading={resendingAll}
              loadingText="กำลังส่งซ้ำ..."
              onClick={handleResendFailed}
            >
              <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>ส่งอีเมลที่ล้มเหลวซ้ำ ({failedEmailCount})</span>
            </ChristmasButton>
          )}
        </div>

        {members.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-primary/35 bg-background/50 p-10 text-center">
            <Users className="mx-auto h-9 w-9 text-primary/75" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-snow-white">
              ยังไม่มีผู้ลงทะเบียนในกลุ่มนี้
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              คัดลอกลิงก์เชิญด้านบนแล้วส่งให้เพื่อน ๆ เพื่อเริ่มลงทะเบียนได้เลย
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Stacked Cards */}
            <div className="mt-5 space-y-3 md:hidden">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-border bg-background/60 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-bold text-snow-white">
                        {m.displayName}
                      </div>
                      <div className="truncate font-mono text-xs text-text-secondary">
                        {m.email}
                      </div>
                    </div>
                    <VerificationPill verified={m.verified} />
                  </div>

                  {isDrawn && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <EmailResultStatus member={m} />
                      {m.verified && (
                        <ChristmasButton
                          variant="secondary"
                          size="sm"
                          loading={resendingMemberId === m.id}
                          loadingText="กำลังส่ง..."
                          onClick={() => handleResendOne(m.id, m.displayName)}
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>ส่งอีเมลซ้ำ</span>
                        </ChristmasButton>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Table */}
            <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-border bg-background/55 md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/75 text-xs font-bold tracking-wide text-text-secondary uppercase">
                    <th className="px-4 py-3.5">ชื่อ / ชื่อเล่น</th>
                    <th className="px-4 py-3.5">อีเมล</th>
                    <th className="px-4 py-3.5">การยืนยันอีเมล</th>
                    {isDrawn && <th className="px-4 py-3.5">สถานะส่งซองลับ</th>}
                    {isDrawn && <th className="px-4 py-3.5 text-right">จัดการ</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-elevated/40">
                      <td className="px-4 py-3.5 font-semibold text-snow-white">
                        {m.displayName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-text-secondary">
                        {m.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <VerificationPill verified={m.verified} />
                      </td>
                      {isDrawn && (
                        <td className="px-4 py-3.5">
                          <EmailResultStatus member={m} />
                        </td>
                      )}
                      {isDrawn && (
                        <td className="px-4 py-3.5 text-right">
                          {m.verified && (
                            <ChristmasButton
                              variant="secondary"
                              size="sm"
                              loading={resendingMemberId === m.id}
                              loadingText="กำลังส่ง..."
                              onClick={() => handleResendOne(m.id, m.displayName)}
                            >
                              <Send className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>ส่งอีเมลซ้ำ</span>
                            </ChristmasButton>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </ChristmasCard>

      {/* Danger Zone */}
      <div className="flex justify-end">
        <ChristmasButton
          variant="danger"
          size="sm"
          onClick={() => {
            triggerClickSound();
            setConfirmDeleteOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>ลบกลุ่มกิจกรรมนี้</span>
        </ChristmasButton>
      </div>

      {/* Accessible Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmDrawOpen}
        title="ยืนยันปิดรับสมัครและสุ่มจับคู่ทันที?"
        description={
          <div className="space-y-2">
            <p>
              ระบบจะทำการสุ่มจับคู่แบบเป็นความลับและส่งอีเมลซองลับให้สมาชิกที่ยืนยันอีเมลแล้วทั้งหมด{" "}
              <strong className="text-primary">{verifiedMembers.length} คน</strong>
            </p>
            <p className="text-xs text-christmas-red-light">
              * หลังสุ่มแล้วจะไม่สามารถเพิ่มผู้เข้าร่วมหรือสุ่มใหม่ได้
            </p>
          </div>
        }
        confirmLabel="ยืนยันสุ่มจับคู่ทันที"
        cancelLabel="ยกเลิก"
        tone="primary"
        loading={drawing}
        onConfirm={handleConfirmDraw}
        onCancel={() => setConfirmDrawOpen(false)}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="ยืนยันลบกลุ่มกิจกรรมนี้?"
        description="ข้อมูลสมาชิกและผลจับคู่ทั้งหมดในกลุ่มนี้จะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้"
        confirmLabel="ลบกลุ่มถาวร"
        cancelLabel="ยกเลิก"
        tone="danger"
        loading={deleting}
        onConfirm={handleConfirmDeleteGroup}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </PageContainer>
  );
}

function VerificationPill({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/45 bg-evergreen/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>ยืนยันแล้ว</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/45 bg-amber-950/65 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>รอยืนยันอีเมล</span>
    </span>
  );
}

function EmailResultStatus({ member }: { member: MemberRow }) {
  if (!member.verified) {
    return <span className="text-xs text-text-secondary">ไม่ได้ร่วมสุ่ม (ยังไม่ยืนยันอีเมล)</span>;
  }
  if (member.resultEmail?.status === "SENT") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
        <MailCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>ส่งอีเมลสำเร็จ ({member.resultEmail.attempts} ครั้ง)</span>
      </span>
    );
  }
  if (member.resultEmail?.status === "FAILED") {
    return (
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-christmas-red-light">
          <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>เกิดข้อผิดพลาดในการส่ง</span>
        </span>
        {member.resultEmail.lastError && (
          <div className="mt-0.5 max-w-xs truncate text-xs text-christmas-red-light/85">
            {member.resultEmail.lastError}
          </div>
        )}
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>รอดำเนินการส่ง</span>
    </span>
  );
}

export default function AdminGroupDetailPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <LoadingState label="กำลังโหลดข้อมูลกิจกรรม..." rows={5} />
        </PageContainer>
      }
    >
      <AdminGroupDetailContent />
    </Suspense>
  );
}
