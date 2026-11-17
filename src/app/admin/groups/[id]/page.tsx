"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  Copy,
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
import { CandyStripeBar } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudgetWithPrefix, type BudgetTypeValue } from "@/lib/budget";
import { formatThaiDateTime, utcToBangkokLocalInput } from "@/lib/timezone";

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

function AdminGroupDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const groupId = params.id;
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const [drawing, setDrawing] = useState(false);
  const [resendingAll, setResendingAll] = useState(false);
  const [resendingMemberId, setResendingMemberId] = useState<string | null>(null);

  // Edit settings state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editBudgetType, setEditBudgetType] = useState<BudgetTypeValue>("FIXED");
  const [editBudgetMin, setEditBudgetMin] = useState("");
  const [editBudgetMax, setEditBudgetMax] = useState("");
  const [editCloseAt, setEditCloseAt] = useState("");
  const [editRevealAt, setEditRevealAt] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const loadGroup = useCallback(async () => {
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
      setEditTitle(g.title);
      setEditDesc(g.description || "");
      setEditBudgetType(g.budgetType);
      setEditBudgetMin(g.budgetMin != null ? String(g.budgetMin) : "");
      setEditBudgetMax(g.budgetMax != null ? String(g.budgetMax) : "");
      setEditCloseAt(utcToBangkokLocalInput(g.registrationClosesAt));
      setEditRevealAt(g.revealAt ? utcToBangkokLocalInput(g.revealAt) : "");
    } catch {
      setError("ไม่สามารถโหลดข้อมูลกลุ่มได้");
    } finally {
      setLoading(false);
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
        setEditTitle(g.title);
        setEditDesc(g.description || "");
        setEditBudgetType(g.budgetType);
        setEditBudgetMin(g.budgetMin != null ? String(g.budgetMin) : "");
        setEditBudgetMax(g.budgetMax != null ? String(g.budgetMax) : "");
        setEditCloseAt(utcToBangkokLocalInput(g.registrationClosesAt));
        setEditRevealAt(g.revealAt ? utcToBangkokLocalInput(g.revealAt) : "");
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

  const handleDrawNow = async () => {
    if (!group) return;
    triggerClickSound();
    const verifiedCount = members.filter((m) => m.verified).length;
    if (
      !window.confirm(
        `ยืนยันปิดรับสมัครและสุ่มจับคู่ Buddy ทันที?\n\nสมาชิกที่ยืนยันอีเมลแล้ว: ${verifiedCount} คน\n(หลังสุ่มแล้วจะไม่สามารถสุ่มใหม่ได้)`
      )
    ) {
      return;
    }
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
      nextStatus === "COMPLETED" ? "บันทึกสถานะจบกิจกรรมเรียบร้อยแล้ว" : "เปิดสถานะ Active อีกครั้ง"
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

  const handleDeleteGroup = async () => {
    triggerClickSound();
    if (
      !window.confirm(
        "ยืนยันลบกลุ่มกิจกรรมนี้? ข้อมูลสมาชิกและผลจับคู่ทั้งหมดในกลุ่มจะถูกลบถาวร"
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/groups/${groupId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="analog-card h-48 animate-pulse rounded-md" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="font-bold text-xmas-red">{error || "ไม่พบกลุ่มกิจกรรมนี้"}</p>
        <Link href="/admin" className="mt-4 inline-block text-sm font-bold text-pine underline">
          กลับไปหน้าแดชบอร์ด
        </Link>
      </div>
    );
  }

  const verifiedMembers = members.filter((m) => m.verified);
  const failedEmailCount = members.filter(
    (m) => m.resultEmail?.status === "FAILED" || m.resultEmail?.status === "PENDING"
  ).length;
  const isDrawn = group.status === "ACTIVE" || group.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-xmas-red"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปหน้าแดชบอร์ด</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            triggerClickSound();
            void loadGroup();
          }}
          className="analog-btn inline-flex items-center gap-1.5 rounded bg-paper px-3.5 py-1.5 text-xs font-bold text-ink hover:bg-cream"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>รีเฟรช</span>
        </button>
      </div>

      {notice && (
        <div className="rounded-md border border-pine/45 bg-pine-wash px-4 py-3 text-sm font-bold text-pine-deep shadow-paper-pressed">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-xmas-red/45 bg-red-wash px-4 py-3 text-sm font-bold text-xmas-red-deep">
          {error}
        </div>
      )}

      {group.drawError && (
        <div className="flex items-start gap-3 rounded-md border border-amber-ink/40 bg-amber-wash p-4 text-sm text-amber-ink">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-bold">ยังไม่สามารถสุ่มจับคู่ได้</div>
            <p className="mt-0.5">{group.drawError}</p>
          </div>
        </div>
      )}

      {/* Header Control Card */}
      <section className="analog-card-lg printed-double-rule overflow-hidden rounded-md">
        <CandyStripeBar />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={group.status} />
                {group.status === "OPEN" && (
                  <CountdownTimer
                    targetIso={group.registrationClosesAt}
                    onExpire={() => loadGroup()}
                  />
                )}
              </div>
              <h1 className="thai-keep letterpress font-display text-2xl leading-[1.35] text-ink sm:text-3xl">
                {group.title}
              </h1>
              {group.description && (
                <p className="max-w-2xl font-serif text-sm leading-[1.75] text-ink-soft">
                  {group.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {group.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={handlePublishOpen}
                  className="analog-btn rounded bg-pine px-4 py-2.5 text-sm font-bold text-paper hover:bg-pine-deep"
                >
                  เปิดรับสมัคร (Open)
                </button>
              )}

              {group.status === "OPEN" && (
                <button
                  type="button"
                  disabled={drawing}
                  onClick={handleDrawNow}
                  className="analog-btn inline-flex items-center gap-2 rounded bg-xmas-red px-4 py-2.5 text-sm font-bold text-paper hover:bg-xmas-red-deep disabled:opacity-60"
                >
                  <Shuffle className="h-4 w-4" />
                  <span>{drawing ? "กำลังสุ่ม..." : "ปิดรับสมัครและสุ่มจับคู่ทันที"}</span>
                </button>
              )}

              {group.status === "ACTIVE" && (
                <button
                  type="button"
                  onClick={() => handleToggleCompleted("COMPLETED")}
                  className="analog-btn rounded bg-plum px-4 py-2.5 text-sm font-bold text-paper hover:bg-plum"
                >
                  จบกิจกรรม (Completed)
                </button>
              )}

              {group.status === "COMPLETED" && (
                <button
                  type="button"
                  onClick={() => handleToggleCompleted("ACTIVE")}
                  className="analog-btn rounded bg-paper px-4 py-2.5 text-sm font-bold text-ink hover:bg-cream"
                >
                  เปิดให้ดูผลต่อ (Active)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  triggerClickSound();
                  setEditing((v) => !v);
                }}
                className="analog-btn rounded bg-paper px-4 py-2.5 text-sm font-bold text-ink hover:bg-cream"
              >
                {editing ? "ยกเลิกแก้ไข" : "แก้ไขรายละเอียด"}
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-ink/25 bg-red-wash p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-xmas-red-deep">
                <Gift className="h-3.5 w-3.5" />
                <span>งบประมาณของขวัญ</span>
              </div>
              <div className="mt-1 text-sm font-bold text-ink">
                {formatBudgetWithPrefix(group.budgetType, group.budgetMin, group.budgetMax)}
              </div>
            </div>

            <div className="rounded-md border border-ink/25 bg-cream p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                <CalendarClock className="h-3.5 w-3.5 text-xmas-red" />
                <span>วันเวลาปิดรับสมัคร</span>
              </div>
              <div className="mt-1 text-sm font-bold text-ink">
                {formatThaiDateTime(group.registrationClosesAt)}
              </div>
            </div>

            <div className="rounded-md border border-ink/25 bg-pine-wash p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pine-deep">
                <Users className="h-3.5 w-3.5" />
                <span>ผู้ลงทะเบียนที่ยืนยันแล้ว</span>
              </div>
              <div className="mt-1 text-sm font-bold text-pine-deep">
                {verifiedMembers.length} คน (ทั้งหมด {members.length} คน)
              </div>
            </div>
          </div>

          {group.revealAt && (
            <p className="mt-3 text-xs font-medium text-ink-soft">
              วันเฉลย Buddy: <span className="font-bold text-ink">{formatThaiDateTime(group.revealAt)}</span>
            </p>
          )}

          {/* Perforated Invite Ticket Stub */}
          <div className="perforated-edge-right mt-6 rounded-md border border-dashed border-xmas-red/65 bg-cream p-4 pr-7 shadow-paper-pressed sm:p-5 sm:pr-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-type text-xs font-bold uppercase tracking-wider text-xmas-red-deep">
                  INVITE TICKET STUB — ลิงก์เชิญสมาชิกเข้าร่วม
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  แชร์ลิงก์นี้ให้สมาชิกทุกคนกรอกชื่อ อีเมล และ Buddy Profile (ไม่ต้องสมัครบัญชี)
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="analog-btn inline-flex min-h-[40px] items-center gap-1.5 rounded bg-paper px-3.5 py-2 text-xs font-bold text-ink hover:bg-cream"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-pine" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}</span>
                </button>
                <Link
                  href={`/join/${group.inviteCode}`}
                  target="_blank"
                  className="analog-btn inline-flex min-h-[40px] items-center gap-1 rounded bg-xmas-red px-3.5 py-2 text-xs font-bold text-paper hover:bg-xmas-red-deep"
                >
                  <span>เปิดหน้าลงทะเบียน</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="mt-3 truncate rounded border border-ink/25 bg-paper px-3.5 py-2 font-mono text-xs font-medium text-ink">
              {inviteUrl}
            </div>
          </div>

          {/* Secrecy Note */}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-ink-soft">
            <Lock className="h-3.5 w-3.5 text-pine" />
            <span>
              ระบบรักษาความลับ: หน้าจัดการ Admin จะแสดงเฉพาะรายชื่อและสถานะส่งอีเมล โดยไม่มีผลจับคู่แสดงในหน้าเว็บ
            </span>
          </div>

          {/* Inline Edit Form */}
          {editing && (
            <form
              onSubmit={handleSaveEdit}
              className="mt-6 space-y-4 rounded-md border border-ink/25 bg-cream p-5"
            >
              <h2 className="text-base font-bold text-ink">แก้ไขรายละเอียดกลุ่ม</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-ink">ชื่อกิจกรรม</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="analog-input mt-1 w-full rounded px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink">
                    วันเฉลย Buddy (ไม่บังคับ)
                  </label>
                  <input
                    type="datetime-local"
                    value={editRevealAt}
                    onChange={(e) => setEditRevealAt(e.target.value)}
                    className="analog-input mt-1 w-full rounded px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink">รายละเอียด</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="analog-input mt-1 w-full rounded px-3.5 py-2 text-sm"
                />
              </div>

              {!isDrawn && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-ink">
                      ประเภทงบประมาณ
                    </label>
                    <select
                      value={editBudgetType}
                      onChange={(e) => setEditBudgetType(e.target.value as BudgetTypeValue)}
                      className="analog-input mt-1 w-full rounded px-3.5 py-2 text-sm"
                    >
                      <option value="FIXED">งบตายตัว</option>
                      <option value="RANGE">งบแบบช่วง</option>
                      <option value="MIN">งบขั้นต่ำ</option>
                      <option value="UNLIMITED">ไม่จำกัดงบ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink">
                      วันเวลาปิดรับสมัคร (เวลาไทย)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editCloseAt}
                      onChange={(e) => setEditCloseAt(e.target.value)}
                      className="analog-input mt-1 w-full rounded px-3.5 py-2 text-sm"
                    />
                  </div>

                  {editBudgetType !== "UNLIMITED" && (
                    <div>
                      <label className="block text-xs font-bold text-ink">
                        {editBudgetType === "RANGE" ? "งบต่ำสุด (บาท)" : "จำนวนเงิน (บาท)"}
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editBudgetMin}
                        onChange={(e) => setEditBudgetMin(e.target.value)}
                        className="analog-input mt-1 w-full rounded px-3.5 py-2 text-sm"
                      />
                    </div>
                  )}

                  {editBudgetType === "RANGE" && (
                    <div>
                      <label className="block text-xs font-bold text-ink">
                        งบสูงสุด (บาท)
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={editBudgetMax}
                        onChange={(e) => setEditBudgetMax(e.target.value)}
                        className="analog-input mt-1 w-full rounded px-3.5 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="analog-btn rounded bg-xmas-red px-5 py-2 text-sm font-bold text-paper hover:bg-xmas-red-deep disabled:opacity-60"
                >
                  {savingEdit ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Members & Email Status Ledger */}
      <section className="analog-card printed-double-rule rounded-md p-6 sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-rule pb-4">
          <div>
            <span className="font-type text-[10px] font-bold tracking-[0.16em] text-pine uppercase">
              WORKSHOP LEDGER
            </span>
            <h2 className="thai-keep letterpress font-display text-lg text-ink sm:text-xl">
              รายชื่อผู้ลงทะเบียน ({members.length} คน)
            </h2>
            <p className="text-xs text-ink-soft">
              เฉพาะสมาชิกที่ยืนยันอีเมลแล้ว ({verifiedMembers.length} คน) จึงจะถูกนำมารวมในการสุ่ม
            </p>
          </div>

          {isDrawn && failedEmailCount > 0 && (
            <button
              type="button"
              disabled={resendingAll}
              onClick={handleResendFailed}
              className="analog-btn inline-flex min-h-[40px] items-center gap-1.5 rounded bg-gold px-4 py-2 text-xs font-bold text-ink hover:bg-gold disabled:opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {resendingAll
                  ? "กำลังส่งซ้ำ..."
                  : `ส่งอีเมลที่ล้มเหลวซ้ำ (${failedEmailCount})`}
              </span>
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="relative z-10 mt-6 rounded-md border border-dashed border-rule bg-cream py-10 text-center text-sm font-medium text-ink-soft">
            ยังไม่มีผู้ลงทะเบียน แชร์ลิงก์เชิญด้านบนให้สมาชิกได้เลย!
          </div>
        ) : (
          <div className="relative z-10 mt-5 overflow-x-auto rounded border border-rule/70 bg-paper/75 p-3">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink/35 font-serif text-xs font-bold text-ink-soft">
                  <th className="pb-3 pr-4">ชื่อ / ชื่อเล่น</th>
                  <th className="pb-3 pr-4">อีเมล</th>
                  <th className="pb-3 pr-4">การยืนยันอีเมล</th>
                  {isDrawn && <th className="pb-3 pr-4">สถานะส่งผลจับคู่</th>}
                  {isDrawn && <th className="pb-3 text-right">จัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-rule">
                {members.map((m) => (
                  <tr key={m.id} className="align-middle">
                    <td className="py-3.5 pr-4 font-bold text-ink">{m.displayName}</td>
                    <td className="py-3.5 pr-4 font-mono text-xs text-ink-soft">{m.email}</td>
                    <td className="py-3.5 pr-4">
                      {m.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-pine bg-pine-wash px-2.5 py-0.5 text-xs font-bold text-pine-deep">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          ยืนยันแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-ink/50 bg-amber-wash px-2.5 py-0.5 text-xs font-bold text-amber-ink">
                          รอยืนยันอีเมล
                        </span>
                      )}
                    </td>

                    {isDrawn && (
                      <td className="py-3.5 pr-4">
                        {!m.verified ? (
                          <span className="text-xs text-ink-soft">ไม่ได้ร่วมสุ่ม</span>
                        ) : m.resultEmail?.status === "SENT" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-pine-deep">
                            <MailCheck className="h-3.5 w-3.5" />
                            ส่งแล้ว ({m.resultEmail.attempts} ครั้ง)
                          </span>
                        ) : m.resultEmail?.status === "FAILED" ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-xmas-red">
                              <XCircle className="h-3.5 w-3.5" />
                              ส่งไม่สำเร็จ
                            </span>
                            {m.resultEmail.lastError && (
                              <div className="mt-0.5 max-w-xs truncate text-[11px] text-xmas-red-deep">
                                {m.resultEmail.lastError}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-amber-ink">รอส่ง</span>
                        )}
                      </td>
                    )}

                    {isDrawn && (
                      <td className="py-3.5 text-right">
                        {m.verified && (
                          <button
                            type="button"
                            disabled={resendingMemberId === m.id}
                            onClick={() => handleResendOne(m.id, m.displayName)}
                            className="analog-btn inline-flex items-center gap-1 rounded-lg bg-paper px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-red-wash hover:text-xmas-red-deep disabled:opacity-50"
                          >
                            <Send className="h-3 w-3" />
                            <span>
                              {resendingMemberId === m.id ? "กำลังส่ง..." : "ส่งอีเมลซ้ำ"}
                            </span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleDeleteGroup}
          className="analog-btn inline-flex items-center gap-1.5 rounded bg-red-wash px-4 py-2 text-xs font-bold text-xmas-red-deep hover:bg-red-wash"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>ลบกลุ่มกิจกรรมนี้</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminGroupDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="analog-card h-48 animate-pulse rounded-md" />
        </div>
      }
    >
      <AdminGroupDetailContent />
    </Suspense>
  );
}
