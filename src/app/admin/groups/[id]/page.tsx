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
  UserMinus,
  Users,
  XCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ChristmasJourney } from "@/components/ChristmasJourney";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { JoinScene } from "@/components/join/JoinScene";
import { PixelAvatar } from "@/components/join/PixelAvatar";
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
  participantSeed: string;
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
  const [memberToDelete, setMemberToDelete] = useState<MemberRow | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);
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

  const handleExpire = useCallback(() => {
    void loadGroup();
  }, [loadGroup]);

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

  const handleConfirmDeleteMember = async () => {
    if (!memberToDelete) return;
    triggerClickSound();
    setDeletingMember(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(
        `/api/admin/groups/${groupId}/members/${memberToDelete.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่สามารถลบสมาชิกได้");
      } else {
        setNotice(`ลบคุณ${memberToDelete.displayName} ออกจากกลุ่มเรียบร้อยแล้ว`);
      }
      setMemberToDelete(null);
      await loadGroup();
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setMemberToDelete(null);
    } finally {
      setDeletingMember(false);
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
          icon={<ChristmasTree stage={1} ground={false} className="h-32 w-auto" />}
          title="ไม่พบกลุ่มกิจกรรมนี้"
          description={error || "กลุ่มนี้อาจถูกลบไปแล้วหรือคุณไม่มีสิทธิ์เข้าถึง"}
          action={
            <Link href="/admin" className={christmasButtonClass("primary", "md")}>
              กลับไปหน้ากิจกรรมของคุณ
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
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>กลับไปหน้ากิจกรรมของคุณ</span>
        </Link>

        <ChristmasButton
          variant="ghost"
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

      {/* Title */}
      <header className="rise-in space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={group.status} />
          {group.status === "OPEN" && (
            <CountdownTimer targetIso={group.registrationClosesAt} onExpire={handleExpire} />
          )}
        </div>
        <h1 className="thai-keep text-3xl leading-tight text-text-primary sm:text-5xl">{group.title}</h1>
        {group.description && (
          <p className="max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
            {group.description}
          </p>
        )}
      </header>

      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}
      {group.drawError && (
        <Alert tone="warning" title="ยังไม่สามารถสุ่มจับคู่ได้">
          {group.drawError}
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---------------- Main column ---------------- */}
        <div className="min-w-0 space-y-6">
          {/* The group's own tree, exactly as participants see it on the invite page */}
          <JoinScene
            compact
            participants={members.map((m) => ({ seed: m.participantSeed, verified: m.verified }))}
            total={members.length}
            mySeed={null}
          />

          {/* Key facts */}
          <dl className="christmas-card grid overflow-hidden rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-border">
            <div className="border-b border-border p-4 sm:border-b-0 sm:p-5">
              <dt className="flex items-center gap-1.5 text-xs text-text-muted">
                <Gift className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                งบประมาณของขวัญ
              </dt>
              <dd className="mt-1 font-semibold text-text-primary">
                {formatBudgetWithPrefix(group.budgetType, group.budgetMin, group.budgetMax)}
              </dd>
            </div>
            <div className="border-b border-border p-4 sm:border-b-0 sm:p-5">
              <dt className="flex items-center gap-1.5 text-xs text-text-muted">
                <CalendarClock className="h-3.5 w-3.5 text-christmas-red-light" aria-hidden="true" />
                ปิดรับสมัคร
              </dt>
              <dd className="mt-1 text-sm font-semibold text-text-primary">
                {formatThaiDateTime(group.registrationClosesAt)}
              </dd>
              {group.revealAt && (
                <dd className="mt-1 text-xs text-text-secondary">
                  เฉลย Buddy {formatThaiDateTime(group.revealAt)}
                </dd>
              )}
            </div>
            <div className="p-4 sm:p-5">
              <dt className="flex items-center justify-between gap-2 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  ยืนยันอีเมลแล้ว
                </span>
                <span className="font-semibold text-success">{verifyPct}%</span>
              </dt>
              <dd className="mt-1 font-semibold text-text-primary">
                {verifiedMembers.length}{" "}
                <span className="text-sm font-normal text-text-secondary">จาก {members.length} คน</span>
              </dd>
              <dd className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-input-bg">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-success))] transition-all duration-500"
                  style={{ width: `${verifyPct}%` }}
                />
              </dd>
            </div>
          </dl>

          {/* Inline edit form */}
          {editing && (
            <ChristmasCard tone="paper" className="parcel-reveal relative">
              <div aria-hidden="true" className="paper-frame" />
              <form onSubmit={handleSaveEdit} className="relative space-y-5 p-6 sm:p-8">
                <h2 className="text-2xl text-text-primary">แก้ไขรายละเอียดกิจกรรม</h2>

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

                <div className="flex flex-col-reverse justify-end gap-2.5 sm:flex-row">
                  <ChristmasButton variant="secondary" onClick={() => setEditing(false)}>
                    ยกเลิก
                  </ChristmasButton>
                  <ChristmasButton type="submit" variant="primary" loading={savingEdit} loadingText="กำลังบันทึก...">
                    บันทึกการเปลี่ยนแปลง
                  </ChristmasButton>
                </div>
              </form>
            </ChristmasCard>
          )}

          {/* Roster */}
          <section aria-labelledby="roster-title" className="christmas-card-elevated rounded-[1.4rem] p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="roster-title" className="text-2xl text-text-primary">
                  ผู้ลงทะเบียน <span className="text-text-muted">({members.length})</span>
                </h2>
                <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                  เฉพาะคนที่ยืนยันอีเมลแล้ว ({verifiedMembers.length} คน) จะถูกนำไปสุ่มจับคู่
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
              <div className="mt-6 rounded-2xl border border-dashed border-border-strong/60 px-6 py-10 text-center">
                <p className="font-display text-xl text-text-primary">ต้นไม้ยังรอคนแรกอยู่</p>
                <p className="mt-1 text-sm text-text-secondary">
                  คัดลอกลิงก์เชิญจากแผงด้านข้างแล้วส่งให้เพื่อน ๆ ได้เลย
                </p>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {members.map((m) => (
                  <li key={m.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-[linear-gradient(180deg,#1a3a4c,#dce7ee_78%)] pb-0.5">
                        <PixelAvatar seed={m.participantSeed} px={2} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-text-primary">{m.displayName}</p>
                        <p className="truncate font-mono text-xs text-text-secondary">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-15 sm:pl-0">
                      <VerificationPill verified={m.verified} />
                      {isDrawn && <EmailResultStatus member={m} />}
                      {isDrawn && m.verified && (
                        <ChristmasButton
                          variant="ghost"
                          size="sm"
                          loading={resendingMemberId === m.id}
                          loadingText="กำลังส่ง..."
                          onClick={() => handleResendOne(m.id, m.displayName)}
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>ส่งอีเมลซ้ำ</span>
                        </ChristmasButton>
                      )}
                      {(group.status === "DRAFT" ||
                        group.status === "OPEN" ||
                        (isDrawn && !m.verified)) && (
                        <ChristmasButton
                          variant="ghost"
                          size="sm"
                          className="text-christmas-red-light hover:border-christmas-red/50 hover:bg-christmas-red/12 hover:text-christmas-red-light"
                          onClick={() => {
                            triggerClickSound();
                            setMemberToDelete(m);
                          }}
                          aria-label={`ลบคุณ${m.displayName}ออกจากกลุ่ม`}
                        >
                          <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>ลบออก</span>
                        </ChristmasButton>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ---------------- Side panel ---------------- */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          {/* Invitation link */}
          <ChristmasCard tone="paper" className="relative">
            <div className="p-5">
              <p className="font-script text-xl text-christmas-red-light">ลิงก์เชิญ</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                ส่งให้เพื่อนกรอกชื่อ อีเมล และ Wish List ไม่ต้องสมัครบัญชี
              </p>
              <div className="mt-3 truncate rounded-xl border border-border bg-input-bg px-3 py-2.5 font-mono text-xs text-text-primary select-all">
                {inviteUrl}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ChristmasButton variant="primary" size="sm" onClick={copyInviteLink}>
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  <span>{copied ? "คัดลอกแล้ว!" : "คัดลอก"}</span>
                </ChristmasButton>
                <Link
                  href={`/join/${group.inviteCode}`}
                  target="_blank"
                  className={christmasButtonClass("secondary", "sm")}
                >
                  <span>เปิดดู</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </ChristmasCard>

          {/* Next step & controls */}
          <ChristmasCard elevated>
            <div className="space-y-3 p-5">
              <h2 className="text-lg text-text-primary">ขั้นตอนถัดไป</h2>

              {group.status === "DRAFT" && (
                <>
                  <p className="text-sm text-text-secondary">กลุ่มยังเป็นฉบับร่าง เปิดรับสมัครเพื่อให้ลิงก์เชิญใช้งานได้</p>
                  <ChristmasButton variant="primary" className="w-full" onClick={handlePublishOpen}>
                    เปิดรับสมัครทันที
                  </ChristmasButton>
                </>
              )}

              {group.status === "OPEN" && (
                <>
                  <p className="text-sm text-text-secondary">
                    ระบบจะสุ่มให้อัตโนมัติเมื่อถึงเวลาปิดรับสมัคร หรือกดสุ่มเองตอนนี้ก็ได้
                  </p>
                  <ChristmasButton
                    variant="primary"
                    className="w-full"
                    loading={drawing}
                    loadingText="กำลังสุ่ม..."
                    onClick={() => {
                      triggerClickSound();
                      setConfirmDrawOpen(true);
                    }}
                  >
                    <Shuffle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>ปิดรับสมัครและสุ่มจับคู่</span>
                  </ChristmasButton>
                </>
              )}

              {group.status === "DRAWING" && (
                <p className="text-sm text-text-secondary">ระบบกำลังสุ่มจับคู่และส่งอีเมล กดรีเฟรชเพื่อดูสถานะล่าสุด</p>
              )}

              {group.status === "ACTIVE" && (
                <>
                  <p className="text-sm text-text-secondary">จับคู่แล้ว ทุกคนได้รับลิงก์เปิดกล่องทางอีเมล</p>
                  <ChristmasButton variant="secondary" className="w-full" onClick={() => handleToggleCompleted("COMPLETED")}>
                    ปิดกิจกรรม (Completed)
                  </ChristmasButton>
                </>
              )}

              {group.status === "COMPLETED" && (
                <>
                  <p className="text-sm text-text-secondary">กิจกรรมจบแล้ว สมาชิกยังเปิดดูผลย้อนหลังได้</p>
                  <ChristmasButton variant="secondary" className="w-full" onClick={() => handleToggleCompleted("ACTIVE")}>
                    เปิดให้ดูผลต่อ (Active)
                  </ChristmasButton>
                </>
              )}

              <ChristmasButton
                variant="ghost"
                className="w-full"
                onClick={() => {
                  triggerClickSound();
                  setEditing((v) => !v);
                }}
              >
                <Edit3 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{editing ? "ยกเลิกแก้ไข" : "แก้ไขรายละเอียด"}</span>
              </ChristmasButton>
            </div>
          </ChristmasCard>

          <ChristmasJourney mode="admin" currentStep={getAdminJourneyStep(group.status)} className="[&_ol]:grid-cols-2 [&_ol]:sm:grid-cols-4 [&_ol]:lg:grid-cols-2" />

          <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-text-muted">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            Admin เห็นเฉพาะรายชื่อและสถานะอีเมล ไม่เห็นผลการจับคู่
          </p>

          <div className="border-t border-border pt-4">
            <ChristmasButton
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => {
                triggerClickSound();
                setConfirmDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>ลบกลุ่มกิจกรรมนี้</span>
            </ChristmasButton>
          </div>
        </aside>
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

      <ConfirmationDialog
        open={memberToDelete !== null}
        title="ยืนยันลบสมาชิกออกจากกลุ่ม?"
        description={
          memberToDelete ? (
            <div className="space-y-2">
              <p>
                คุณต้องการลบ{" "}
                <strong className="text-text-primary">{memberToDelete.displayName}</strong>{" "}
                <span className="font-mono text-xs text-text-secondary">
                  ({memberToDelete.email})
                </span>{" "}
                ออกจากกลุ่มนี้ใช่หรือไม่?
              </p>
              <p className="text-xs text-christmas-red-light">
                {memberToDelete.verified
                  ? "* สมาชิกคนนี้ยืนยันอีเมลแล้ว หากลบออก ลิงก์ส่วนตัวเดิมจะใช้งานไม่ได้และจะไม่ถูกนำไปสุ่มจับคู่ (สามารถลงทะเบียนใหม่ได้หากยังไม่ปิดรับสมัคร)"
                  : "* ข้อมูลการลงทะเบียนที่ยังไม่ยืนยันอีเมลนี้จะถูกลบถาวร"}
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmLabel="ยืนยันลบสมาชิก"
        cancelLabel="ยกเลิก"
        tone="danger"
        loading={deletingMember}
        onConfirm={handleConfirmDeleteMember}
        onCancel={() => setMemberToDelete(null)}
      />
    </PageContainer>
  );
}

function VerificationPill({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/45 bg-success-bg px-2.5 py-0.5 text-xs font-semibold text-success">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>ยืนยันแล้ว</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/45 bg-warning-bg px-2.5 py-0.5 text-xs font-semibold text-warning">
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
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
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
