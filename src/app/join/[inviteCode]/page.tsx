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
        <div className="analog-card h-48 animate-pulse rounded-md" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="analog-card rounded-md p-8">
          <h1 className="text-xl font-bold text-ink">ไม่พบกิจกรรม Secret Buddy</h1>
          <p className="mt-2 text-sm text-ink-soft">
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
      <section className="analog-card-lg printed-double-rule relative overflow-hidden rounded-md">
        <CandyStripeBar />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={group.status} />
            {group.isAcceptingRegistrations && (
              <CountdownTimer
                targetIso={group.registrationClosesAt}
                onExpire={() => loadGroup()}
              />
            )}
          </div>

          <h1 className="thai-keep letterpress mt-4 font-display text-2xl leading-[1.35] text-ink sm:text-3xl">
            {group.title}
          </h1>

          {group.description && (
            <p className="mt-2 font-serif text-sm leading-[1.75] text-ink-soft">
              {group.description}
            </p>
          )}

          <div className="perforated-divider mt-5 pt-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded border border-xmas-red/30 bg-red-wash/70 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-xmas-red-deep">
                  <Gift className="h-3.5 w-3.5" />
                  <span>งบประมาณของขวัญ</span>
                </div>
                <div className="mt-1 font-serif text-base font-bold text-ink">{budgetText}</div>
              </div>

              <div className="rounded border border-ink/20 bg-cream/75 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                  <CalendarClock className="h-3.5 w-3.5 text-xmas-red" />
                  <span>ปิดรับสมัคร</span>
                </div>
                <div className="mt-1 font-serif text-xs font-bold text-ink">
                  {formatThaiDateTime(group.registrationClosesAt)}
                </div>
              </div>

              <div className="rounded border border-pine/30 bg-pine-wash/75 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-pine-deep">
                  <Users className="h-3.5 w-3.5" />
                  <span>สมาชิกยืนยันแล้ว</span>
                </div>
                <div className="mt-1 font-serif text-base font-bold text-pine-deep">
                  {group.verifiedMembers} คน
                </div>
              </div>
            </div>
          </div>

          {group.revealAt && (
            <p className="mt-3 text-xs font-medium text-ink-soft">
              วันเฉลย Buddy:{" "}
              <span className="font-bold text-ink">
                {formatThaiDateTime(group.revealAt)}
              </span>
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Link
              href={`/join/${inviteCode}/recover`}
              className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-bold text-pine underline decoration-dashed underline-offset-4 hover:text-xmas-red"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>เคยลงทะเบียนแล้ว? ขอลิงก์แก้ไขข้อมูล / ดูผลจับคู่ใหม่</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      {submittedMsg ? (
        <section className="analog-card printed-double-rule rounded-md p-8 text-center">
          <div className="relative z-10">
            <WaxSeal tone="green" size="lg" className="mx-auto">
              <MailCheck className="h-7 w-7" />
            </WaxSeal>
            <h2 className="thai-keep letterpress mt-4 font-display text-xl text-ink">
              ตรวจสอบอีเมลเพื่อยืนยันตัวตน
            </h2>
            <p className="mx-auto mt-2 max-w-md font-serif text-sm leading-[1.75] text-ink-soft">
              {submittedMsg}
            </p>
            <p className="mt-3 text-xs text-ink-soft">
              ส่งไปที่อีเมล <span className="font-bold text-ink">{email}</span> • หากไม่พบกรุณาเช็กกล่องจดหมายขยะ (Spam)
            </p>
          </div>
        </section>
      ) : !group.isAcceptingRegistrations ? (
        <section className="analog-card printed-double-rule rounded-md p-8 text-center">
          <div className="relative z-10">
            <CheckCircle2 className="mx-auto h-10 w-10 text-ink-soft" />
            <h2 className="thai-keep letterpress mt-3 font-display text-lg text-ink">
              กิจกรรมนี้ปิดรับสมัครแล้ว
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              {group.status === "DRAFT"
                ? "ผู้ดูแลกิจกรรมกำลังตั้งค่ากลุ่ม และยังไม่เปิดรับสมัครในขณะนี้"
                : "ขณะนี้หมดเวลาลงทะเบียนแล้ว หากคุณลงทะเบียนและยืนยันอีเมลไว้แล้ว สามารถขอลิงก์ส่วนตัวใหม่ได้ด้านล่าง"}
            </p>
            <Link
              href={`/join/${inviteCode}/recover`}
              className="analog-btn-lg thai-keep mt-5 inline-flex min-h-[44px] items-center gap-2 rounded bg-xmas-red px-5 py-2.5 text-sm font-bold text-paper hover:bg-xmas-red-deep"
            >
              <KeyRound className="h-4 w-4" />
              <span>ขอลิงก์ส่วนตัวทางอีเมล</span>
            </Link>
          </div>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="analog-card-lg printed-double-rule relative space-y-6 rounded-md p-6 sm:p-8"
        >
          <WashiTape tone="green" className="absolute -top-2 right-8 z-20 rotate-2" />

          <div className="relative z-10 space-y-6">
            <div>
              <span className="font-type text-[10px] font-bold tracking-[0.16em] text-xmas-red-deep uppercase">
                CHRISTMAS WISH CARD
              </span>
              <h2 className="thai-keep letterpress mt-0.5 font-display text-xl text-ink">
                ลงทะเบียนเข้าร่วม &amp; กรอก Buddy Profile
              </h2>
              <p className="mt-1 text-xs text-ink-soft">
                ไม่ต้องสมัครบัญชี • ข้อมูลความชอบนี้จะแสดงให้เฉพาะผู้ที่จับได้คุณเห็นเท่านั้น
              </p>
            </div>

            {submitError && (
              <div className="rounded border border-xmas-red/45 bg-red-wash px-4 py-3 text-sm font-medium text-xmas-red-deep">
                {submitError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-serif text-sm font-bold text-ink">
                  ชื่อ / ชื่อเล่น <span className="text-xmas-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น นนท์, แพรว (ฝ่ายการตลาด)"
                  className="analog-input mt-1.5 w-full rounded px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block font-serif text-sm font-bold text-ink">
                  อีเมล (สำหรับยืนยันตัวตนและรับผล Buddy){" "}
                  <span className="text-xmas-red">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="analog-input mt-1.5 w-full rounded px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            <hr className="border-t border-dashed border-rule" />

            <BuddyProfileFormFields value={profile} onChange={setProfile} />

            <button
              type="submit"
              disabled={submitting}
              className="analog-btn-lg thai-keep min-h-[48px] w-full rounded bg-xmas-red py-3.5 text-sm font-bold text-paper hover:bg-xmas-red-deep disabled:opacity-60"
            >
              {submitting
                ? "กำลังบันทึกและส่งอีเมลยืนยัน..."
                : "ลงทะเบียนเข้าร่วมกิจกรรม"}
            </button>
          </div>
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
          <div className="analog-card h-48 animate-pulse rounded-md" />
        </div>
      }
    >
      <JoinGroupContent />
    </Suspense>
  );
}
