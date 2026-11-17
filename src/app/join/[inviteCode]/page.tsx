"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Gift,
  KeyRound,
  MailCheck,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  BuddyProfileFormFields,
  EMPTY_BUDDY_PROFILE,
  type BuddyProfileValues,
} from "@/components/BuddyProfileFormFields";
import { CandyStripeBar, WashiTape, WaxSeal } from "@/components/AnalogPrimitives";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudget } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";

interface InviteGroupInfo {
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
  totalMembers: number;
  verifiedMembers: number;
  isAcceptingRegistrations: boolean;
}

function JoinGroupContent() {
  const params = useParams<{ inviteCode: string }>();
  const inviteCode = params.inviteCode;
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();

  const [group, setGroup] = useState<InviteGroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<BuddyProfileValues>(EMPTY_BUDDY_PROFILE);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedMsg, setSubmittedMsg] = useState("");

  const loadGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/invite/${inviteCode}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "ไม่พบกิจกรรมนี้");
        return;
      }
      setGroup(data.group);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/groups/invite/${inviteCode}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "ไม่พบกิจกรรมนี้");
          return;
        }
        setGroup(data.group);
      } catch {
        if (!cancelled) setError("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerClickSound();
    setSubmitError("");
    if (profile.interests.length === 0) {
      setSubmitError("กรุณาเลือกสิ่งที่ชอบอย่างน้อย 1 หมวดหมู่");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/invite/${inviteCode}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          ...profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "ไม่สามารถลงทะเบียนได้");
        await loadGroup();
        return;
      }
      triggerChimeSound();
      setSubmittedMsg(data.message);
      await loadGroup();
    } catch {
      setSubmitError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="analog-card h-48 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="analog-card rounded-3xl p-8">
          <h1 className="text-xl font-bold text-[#2a1f1b]">ไม่พบกิจกรรม Secret Buddy</h1>
          <p className="mt-2 text-sm text-[#675449]">
            {error || "ลิงก์เชิญนี้อาจไม่ถูกต้องหรือถูกลบไปแล้ว"}
          </p>
        </div>
      </div>
    );
  }

  const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      {/* Group Holiday Invitation Ticket */}
      <section className="analog-card-lg relative overflow-hidden rounded-3xl">
        <CandyStripeBar />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={group.status} />
            {group.isAcceptingRegistrations && (
              <CountdownTimer
                targetIso={group.registrationClosesAt}
                onExpire={() => loadGroup()}
              />
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#2a1f1b] sm:text-3xl">
            🎁 {group.title}
          </h1>

          {group.description && (
            <p className="mt-2 text-sm leading-relaxed text-[#5c493e]">{group.description}</p>
          )}

          <div className="perforated-divider mt-5 pt-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#fde2df] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9e221d]">
                  <Gift className="h-3.5 w-3.5" />
                  <span>งบประมาณของขวัญ</span>
                </div>
                <div className="mt-1 text-base font-bold text-[#2a1f1b]">{budgetText}</div>
              </div>

              <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#fdf6e9] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#675449]">
                  <CalendarClock className="h-3.5 w-3.5 text-[#c8322b]" />
                  <span>ปิดรับสมัคร</span>
                </div>
                <div className="mt-1 text-xs font-bold text-[#2a1f1b]">
                  {formatThaiDateTime(group.registrationClosesAt)}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#dff0e6] p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#154231]">
                  <Users className="h-3.5 w-3.5" />
                  <span>สมาชิกยืนยันแล้ว</span>
                </div>
                <div className="mt-1 text-base font-bold text-[#154231]">
                  {group.verifiedMembers} คน
                </div>
              </div>
            </div>
          </div>

          {group.revealAt && (
            <p className="mt-3 text-xs font-medium text-[#675449]">
              🎉 วันเฉลย Buddy:{" "}
              <span className="font-bold text-[#2a1f1b]">
                {formatThaiDateTime(group.revealAt)}
              </span>
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Link
              href={`/join/${inviteCode}/recover`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1f5e46] underline decoration-dashed underline-offset-4 hover:text-[#c8322b]"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>เคยลงทะเบียนแล้ว? ขอลิงก์แก้ไขข้อมูล / ดูผลจับคู่ใหม่</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      {submittedMsg ? (
        <section className="analog-card rounded-3xl p-8 text-center">
          <WaxSeal tone="green" size="lg" className="mx-auto">
            <MailCheck className="h-7 w-7" />
          </WaxSeal>
          <h2 className="mt-4 text-xl font-bold text-[#2a1f1b]">
            ตรวจสอบอีเมลเพื่อยืนยันตัวตน!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5c493e]">
            {submittedMsg}
          </p>
          <p className="mt-3 text-xs text-[#675449]">
            ส่งไปที่อีเมล <span className="font-bold text-[#2a1f1b]">{email}</span> • หากไม่พบกรุณาเช็กกล่องจดหมายขยะ (Spam)
          </p>
        </section>
      ) : !group.isAcceptingRegistrations ? (
        <section className="analog-card rounded-3xl p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[#675449]" />
          <h2 className="mt-3 text-lg font-bold text-[#2a1f1b]">
            กิจกรรมนี้ปิดรับสมัครแล้ว
          </h2>
          <p className="mt-1.5 text-sm text-[#675449]">
            {group.status === "DRAFT"
              ? "ผู้ดูแลกิจกรรมกำลังตั้งค่ากลุ่ม และยังไม่เปิดรับสมัครในขณะนี้"
              : "ขณะนี้หมดเวลาลงทะเบียนแล้ว หากคุณลงทะเบียนและยืนยันอีเมลไว้แล้ว สามารถขอลิงก์ส่วนตัวใหม่ได้ด้านล่าง"}
          </p>
          <Link
            href={`/join/${inviteCode}/recover`}
            className="analog-btn-lg mt-5 inline-flex items-center gap-2 rounded-xl bg-[#c8322b] px-5 py-2.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
          >
            <KeyRound className="h-4 w-4" />
            <span>ขอลิงก์ส่วนตัวทางอีเมล</span>
          </Link>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="analog-card-lg relative space-y-6 rounded-3xl p-6 sm:p-8"
        >
          <WashiTape tone="green" className="absolute -top-2.5 right-8 rotate-2" />

          <div>
            <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#9e221d] uppercase">
              CHRISTMAS WISH CARD
            </span>
            <h2 className="mt-0.5 text-xl font-bold text-[#2a1f1b]">
              ลงทะเบียนเข้าร่วม &amp; กรอก Buddy Profile
            </h2>
            <p className="mt-1 text-xs text-[#675449]">
              ไม่ต้องสมัครบัญชี • ข้อมูลความชอบนี้จะแสดงให้เฉพาะผู้ที่จับได้คุณเห็นเท่านั้น
            </p>
          </div>

          {submitError && (
            <div className="rounded-xl border-2 border-[#c8322b] bg-[#fdeceb] px-4 py-3 text-sm font-medium text-[#8b1a15]">
              {submitError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-[#2a1f1b]">
                ชื่อ / ชื่อเล่น <span className="text-[#c8322b]">*</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="เช่น นนท์, แพรว (ฝ่ายการตลาด)"
                className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#2a1f1b]">
                อีเมล (สำหรับยืนยันตัวตนและรับผล Buddy){" "}
                <span className="text-[#c8322b]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="analog-input mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <hr className="border-t-2 border-dashed border-[#cbb7a6]" />

          <BuddyProfileFormFields value={profile} onChange={setProfile} />

          <button
            type="submit"
            disabled={submitting}
            className="analog-btn-lg w-full rounded-xl bg-[#c8322b] py-3.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923] disabled:opacity-60"
          >
            {submitting
              ? "กำลังบันทึกและส่งอีเมลยืนยัน..."
              : "🎁 ลงทะเบียนเข้าร่วมกิจกรรม"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="analog-card h-48 animate-pulse rounded-3xl" />
        </div>
      }
    >
      <JoinGroupContent />
    </Suspense>
  );
}
