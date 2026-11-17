"use client";

import { Suspense, useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  Gift,
  KeyRound,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ChristmasJourney } from "@/components/ChristmasJourney";
import {
  BuddyProfileFormFields,
  EMPTY_BUDDY_PROFILE,
  type BuddyProfileValues,
} from "@/components/BuddyProfileFormFields";
import {
  ElfCharacter3D,
  MagicalSparkleBurst,
  NorthPoleMailbox3D,
  SnowGlobe3D,
} from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { formatBudget } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";
import {
  Alert,
  ChristmasButton,
  ChristmasCard,
  EmptyState,
  FormField,
  Input,
  LoadingState,
  PageContainer,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

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

  const nameId = useId();
  const emailId = useId();

  const [group, setGroup] = useState<InviteGroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<BuddyProfileValues>(EMPTY_BUDDY_PROFILE);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedMsg, setSubmittedMsg] = useState("");
  const [burstActive, setBurstActive] = useState(false);

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

    if (!displayName.trim()) {
      setSubmitError("กรุณากรอกชื่อ / ชื่อเล่น");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    if (profile.interests.length === 0) {
      setSubmitError("กรุณาเลือกหมวดหมู่ของขวัญที่สนใจอย่างน้อย 1 ข้อ");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/invite/${inviteCode}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim(),
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
      setBurstActive(true);
      window.setTimeout(() => setBurstActive(false), 2200);
      await loadGroup();
    } catch {
      setSubmitError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer size="md">
        <LoadingState label="กำลังเปิดซองจดหมายเชิญจาก North Pole..." rows={4} />
      </PageContainer>
    );
  }

  if (error || !group) {
    return (
      <PageContainer size="md">
        <EmptyState
          icon={<SnowGlobe3D className="h-28 w-28" />}
          title="ไม่พบกิจกรรม Secret Buddy"
          description={error || "ลิงก์เชิญนี้อาจไม่ถูกต้องหรือถูกลบไปแล้ว"}
          action={
            <Link href="/" className={christmasButtonClass("secondary", "md")}>
              กลับหน้าแรก
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);

  return (
    <PageContainer size="md" className="space-y-6">
      <ChristmasJourney
        mode="participant"
        currentStep={submittedMsg ? 3 : 2}
      />

      {/* Personal Christmas Invitation Letter Header */}
      <ChristmasCard elevated withStripe>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/45 bg-background/70 px-3 py-1 text-[11px] font-bold tracking-wider text-primary uppercase">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>SECRET CHRISTMAS INVITATION</span>
                </span>
                <StatusBadge status={group.status} />
              </div>

              <p className="font-display-en text-lg font-semibold italic text-primary sm:text-xl">
                You&apos;re Invited to a Secret Christmas Mission!
              </p>

              <h1 className="thai-keep text-2xl font-bold leading-snug text-snow-white sm:text-3xl">
                {group.title}
              </h1>

              {group.description && (
                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                  {group.description}
                </p>
              )}
            </div>

            <div className="hidden shrink-0 rounded-2xl border border-primary/30 bg-background/70 p-2.5 sm:block">
              <NorthPoleMailbox3D className="h-24 w-24" />
            </div>
          </div>

          {group.isAcceptingRegistrations && (
            <div className="mt-5">
              <CountdownTimer
                targetIso={group.registrationClosesAt}
                onExpire={() => loadGroup()}
              />
            </div>
          )}

          <div className="mt-6 grid gap-3.5 border-t border-border pt-5 sm:grid-cols-3">
            <div className="rounded-xl border border-primary/35 bg-background/60 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>งบประมาณของขวัญ</span>
              </div>
              <div className="mt-1 text-base font-bold text-snow-white">{budgetText}</div>
            </div>

            <div className="rounded-xl border border-white/15 bg-background/60 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-christmas-red-light">
                <CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>ปิดรับสมัคร</span>
              </div>
              <div className="mt-1 text-xs font-bold text-snow-white sm:text-sm">
                {formatThaiDateTime(group.registrationClosesAt)}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-400/30 bg-evergreen/55 p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>เพื่อนร่วมทีมที่ยืนยันแล้ว</span>
              </div>
              <div className="mt-1 text-base font-bold text-emerald-100">
                {group.verifiedMembers} คน
              </div>
            </div>
          </div>

          {group.revealAt && (
            <p className="mt-4 text-xs font-medium text-text-secondary sm:text-sm">
              วันนัดเฉลย Buddy:{" "}
              <strong className="text-snow-white">
                {formatThaiDateTime(group.revealAt)}
              </strong>
            </p>
          )}

          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <Link
              href={`/join/${inviteCode}/recover`}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-primary underline decoration-primary/50 underline-offset-4 hover:text-primary-hover sm:text-sm"
            >
              <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>เคยลงทะเบียนแล้ว? ขอลิงก์แก้ไขข้อมูล / ดูผลจับคู่ใหม่</span>
            </Link>
          </div>
        </div>
      </ChristmasCard>

      {/* Registration Flow */}
      {submittedMsg ? (
        <ChristmasCard elevated className="relative p-6 text-center sm:p-10 parcel-reveal">
          <MagicalSparkleBurst active={burstActive} />

          <div className="mx-auto flex justify-center">
            <ElfCharacter3D className="h-28 w-28" />
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/45 bg-evergreen/80 px-3.5 py-1 text-xs font-bold text-emerald-100">
            <MailCheck className="h-4 w-4" aria-hidden="true" />
            <span>บันทึก Wish List เรียบร้อยแล้ว!</span>
          </div>

          <h2 className="thai-keep mt-4 text-xl font-bold text-snow-white sm:text-2xl">
            ขั้นตอนสุดท้าย: กดยืนยันอีเมลของคุณ
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
            {submittedMsg}
          </p>
          <p className="mt-2 text-xs text-text-secondary sm:text-sm">
            ส่งไปที่อีเมล <strong className="text-primary">{email}</strong> •
            หากไม่พบกรุณาตรวจสอบกล่องจดหมายขยะ (Spam / Junk)
          </p>

          <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-primary/25 bg-background/75 p-5 text-left">
            <div className="text-xs font-bold tracking-wider text-primary uppercase">
              WHAT HAPPENS NEXT · ภารกิจถัดไป
            </div>
            <ol className="mt-3 space-y-2.5 text-xs leading-relaxed text-text-secondary sm:text-sm">
              <li>
                <strong className="text-snow-white">1. เปิดอีเมลของคุณ</strong> แล้วคลิกปุ่มยืนยันตัวตนเพื่อเข้าร่วมการสุ่ม
              </li>
              <li>
                <strong className="text-snow-white">2. รับลิงก์แก้ไข Wish List ส่วนตัว</strong> เผื่ออยากเปลี่ยนใจเพิ่มของที่อยากได้ก่อนปิดรับสมัคร
              </li>
              <li>
                <strong className="text-snow-white">3. รอรับกล่องของขวัญลับทางอีเมล</strong> เมื่อถึงเวลาสุ่มจับคู่!
              </li>
            </ol>
          </div>
        </ChristmasCard>
      ) : !group.isAcceptingRegistrations ? (
        <ChristmasCard className="p-8 text-center sm:p-10">
          <CheckCircle2 className="mx-auto h-11 w-11 text-primary" aria-hidden="true" />
          <h2 className="thai-keep mt-3 text-xl font-bold text-snow-white">
            กิจกรรมนี้ยังไม่เปิดหรือปิดรับสมัครแล้ว
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
            {group.status === "DRAFT"
              ? "ผู้ดูแลกิจกรรมกำลังตั้งค่ากลุ่ม และยังไม่เปิดรับสมัครในขณะนี้"
              : "ขณะนี้หมดเวลาลงทะเบียนแล้ว หากคุณลงทะเบียนและยืนยันอีเมลไว้แล้ว สามารถขอลิงก์ส่วนตัวใหม่ได้ด้านล่าง"}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={`/join/${inviteCode}/recover`}
              className={christmasButtonClass("primary", "md")}
            >
              <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>ขอลิงก์ส่วนตัวทางอีเมล</span>
            </Link>
          </div>
        </ChristmasCard>
      ) : (
        <ChristmasCard elevated className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-7">
            <div className="border-b border-border pb-5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-evergreen/75 px-3 py-1 text-xs font-semibold text-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>ไม่ต้องสมัครบัญชี • ข้อมูลจะแสดงเฉพาะ Buddy ที่จับได้คุณเท่านั้น</span>
              </div>
              <h2 className="thai-keep mt-3 text-xl font-bold text-snow-white sm:text-2xl">
                ตอบรับภารกิจ &amp; เขียน Buddy Profile
              </h2>
              <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                กรอกชื่อ อีเมล ความชอบ และ Wish List แล้วกดยืนยันในอีเมลเพื่อเข้าร่วมการจับคู่
              </p>
            </div>

            {submitError && <Alert tone="error">{submitError}</Alert>}

            {/* Group 0: Personal Information */}
            <section className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-primary">
                  ข้อมูลผู้เข้าร่วม (Personal Information)
                </h3>
                <p className="mt-0.5 text-xs text-text-secondary">
                  ชื่อนี้จะแสดงบนกล่องของขวัญของเพื่อนที่จับได้คุณ และอีเมลใช้สำหรับส่งผลจับคู่ลับ
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="ชื่อ / ชื่อเล่น"
                  htmlFor={nameId}
                  required
                  helperText="ใส่ชื่อหรือแผนกที่เพื่อนในทีมจำได้ง่าย"
                >
                  <Input
                    id={nameId}
                    type="text"
                    required
                    disabled={submitting}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น นนท์, แพรว (ฝ่ายการตลาด)"
                  />
                </FormField>

                <FormField
                  label="อีเมล"
                  htmlFor={emailId}
                  required
                  helperText="ใช้ยืนยันตัวตนและรับลิงก์เปิดกล่อง Secret Buddy"
                >
                  <Input
                    id={emailId}
                    type="email"
                    required
                    disabled={submitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </FormField>
              </div>
            </section>

            <div className="border-t border-border pt-6">
              <BuddyProfileFormFields
                value={profile}
                onChange={setProfile}
                disabled={submitting}
              />
            </div>

            <ChristmasButton
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              loadingText="กำลังส่งคำขอเข้าร่วม..."
              className="w-full"
            >
              <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>ส่งข้อมูลเข้าร่วมภารกิจ Secret Buddy</span>
            </ChristmasButton>
          </form>
        </ChristmasCard>
      )}
    </PageContainer>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense
      fallback={
        <PageContainer size="md">
          <LoadingState label="กำลังเปิดซองจดหมายเชิญจาก North Pole..." rows={4} />
        </PageContainer>
      }
    >
      <JoinGroupContent />
    </Suspense>
  );
}
