"use client";

import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
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
import { MagicalSparkleBurst } from "@/components/illustrations/ChristmasIllustrations";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { JoinScene, type SceneParticipant } from "@/components/join/JoinScene";
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
  participants?: SceneParticipant[];
}

/** How often the scene checks for new participants while the page is visible. */
const POLL_MS = 20_000;

function mySeedKey(inviteCode: string) {
  return `buddy_me_${inviteCode}`;
}

function JoinGroupContent() {
  const params = useParams<{ inviteCode: string }>();
  const inviteCode = params.inviteCode;
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();

  const nameId = useId();
  const emailId = useId();
  const sceneRef = useRef<HTMLDivElement | null>(null);

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
  // Which character is "you" on this device (an anonymous seed, not personal data).
  // Only read on the client; the scene that uses it renders after data loads.
  const [mySeed, setMySeed] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(mySeedKey(inviteCode));
    } catch {
      return null;
    }
  });

  /** `silent` refreshes (polling) never replace the page with an error state. */
  const loadGroup = useCallback(
    async (silent = false) => {
      try {
        const res = await fetch(`/api/groups/invite/${inviteCode}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          if (!silent) setError(data.error || "ไม่พบกิจกรรมนี้");
          return;
        }
        setGroup(data.group);
      } catch {
        if (!silent) setError("ไม่สามารถโหลดข้อมูลกิจกรรมได้");
      } finally {
        setLoading(false);
      }
    },
    [inviteCode]
  );

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

  // Lightweight sync: refresh participants while the tab is visible and registration is open.
  const accepting = Boolean(group?.isAcceptingRegistrations);
  useEffect(() => {
    if (!accepting) return;
    const tick = () => {
      if (!document.hidden) void loadGroup(true);
    };
    const timer = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void loadGroup(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [accepting, loadGroup]);

  const handleExpire = useCallback(() => {
    void loadGroup();
  }, [loadGroup]);

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
        await loadGroup(true);
        return;
      }
      if (typeof data.participantSeed === "string") {
        setMySeed(data.participantSeed);
        try {
          window.localStorage.setItem(mySeedKey(inviteCode), data.participantSeed);
        } catch {
          // ignore
        }
      }
      triggerChimeSound();
      setSubmittedMsg(data.message);
      setBurstActive(true);
      window.setTimeout(() => setBurstActive(false), 2200);
      // Registration succeeded: now refresh so the new character walks into the scene.
      await loadGroup(true);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      sceneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    } catch {
      setSubmitError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer size="md">
        <LoadingState label="กำลังเปิดการ์ดเชิญคริสต์มาส..." rows={4} />
      </PageContainer>
    );
  }

  if (error || !group) {
    return (
      <PageContainer size="md">
        <EmptyState
          icon={<ChristmasTree stage={1} className="h-36 w-auto" />}
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
  const participants = group.participants ?? [];

  return (
    <PageContainer size="lg" className="space-y-8 sm:space-y-10">
      {/* Invitation heading */}
      <header className="rise-in mx-auto max-w-3xl text-center">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <span className="font-script text-xl text-primary sm:text-2xl">คุณได้รับเชิญ!</span>
          <StatusBadge status={group.status} />
        </div>
        <h1 className="thai-keep mt-2 text-3xl leading-tight text-text-primary sm:text-5xl">{group.title}</h1>
        {group.description && (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
            {group.description}
          </p>
        )}
      </header>

      {/* The living Christmas scene */}
      <div ref={sceneRef} className="rise-in scroll-mt-24" style={{ "--rise-delay": "120ms" } as React.CSSProperties}>
        <JoinScene participants={participants} total={group.totalMembers} mySeed={mySeed} />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Invitation details */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          <ChristmasCard elevated withStripe>
            <div className="space-y-5 p-6">
              <h2 className="text-xl text-text-primary">รายละเอียดคำเชิญ</h2>

              <dl className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Gift className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">งบประมาณของขวัญ</span>
                  </dt>
                  <dd>
                    <span className="block text-xs text-text-muted">งบประมาณของขวัญ</span>
                    <span className="font-semibold text-text-primary">{budgetText}</span>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-christmas-red/20 text-christmas-red-light">
                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">ปิดรับสมัคร</span>
                  </dt>
                  <dd>
                    <span className="block text-xs text-text-muted">ปิดรับสมัคร</span>
                    <span className="font-semibold text-text-primary">
                      {formatThaiDateTime(group.registrationClosesAt)}
                    </span>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">ผู้เข้าร่วม</span>
                  </dt>
                  <dd>
                    <span className="block text-xs text-text-muted">ผู้เข้าร่วม</span>
                    <span className="font-semibold text-text-primary">
                      ลงทะเบียน {group.totalMembers} คน · ยืนยันอีเมลแล้ว {group.verifiedMembers} คน
                    </span>
                  </dd>
                </div>
                {group.revealAt && (
                  <div className="flex items-start gap-3">
                    <dt className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">วันนัดเฉลย Buddy</span>
                    </dt>
                    <dd>
                      <span className="block text-xs text-text-muted">วันนัดเฉลย Buddy</span>
                      <span className="font-semibold text-text-primary">{formatThaiDateTime(group.revealAt)}</span>
                    </dd>
                  </div>
                )}
              </dl>

              {group.isAcceptingRegistrations && (
                <CountdownTimer targetIso={group.registrationClosesAt} onExpire={handleExpire} />
              )}

              <div className="border-t border-border pt-4">
                <Link
                  href={`/join/${inviteCode}/recover`}
                  className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:text-primary-hover"
                >
                  <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>เคยลงทะเบียนแล้ว? ขอลิงก์ส่วนตัวใหม่</span>
                </Link>
              </div>
            </div>
          </ChristmasCard>

          <ChristmasJourney mode="participant" currentStep={submittedMsg ? 3 : 2} />
        </aside>

        {/* Registration */}
        <div className="min-w-0">
          {submittedMsg ? (
            <ChristmasCard tone="paper" className="parcel-reveal relative p-6 text-center sm:p-10">
              <div aria-hidden="true" className="paper-frame" />
              <MagicalSparkleBurst active={burstActive} />

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-bg text-success">
                <MailCheck className="h-8 w-8" aria-hidden="true" />
              </div>
              <p className="mt-4 font-script text-2xl text-primary">ยินดีต้อนรับสู่ต้นคริสต์มาส!</p>
              <h2 className="thai-keep mt-1 text-2xl text-text-primary sm:text-3xl">
                ขั้นตอนสุดท้าย: ยืนยันอีเมลของคุณ
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base">
                {submittedMsg}
              </p>
              <p className="mt-2 text-xs text-text-muted sm:text-sm">
                ส่งไปที่ <strong className="text-text-primary">{email}</strong> · ถ้าไม่เจอ ลองดูในกล่องจดหมายขยะ
              </p>

              <div className="mx-auto mt-7 max-w-lg rounded-2xl border border-border bg-surface/60 p-5 text-left">
                <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">ต่อจากนี้</p>
                <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-secondary">
                  <li>
                    <strong className="text-text-primary">1. เปิดอีเมล</strong> แล้วกดยืนยันตัวตนเพื่อเข้าร่วมการสุ่ม
                  </li>
                  <li>
                    <strong className="text-text-primary">2. รับลิงก์แก้ไข Wish List ส่วนตัว</strong>{" "}
                    เผื่ออยากเปลี่ยนใจก่อนปิดรับสมัคร
                  </li>
                  <li>
                    <strong className="text-text-primary">3. รอเปิดกล่องของขวัญลับทางอีเมล</strong> เมื่อถึงเวลาจับคู่
                  </li>
                </ol>
              </div>
            </ChristmasCard>
          ) : !group.isAcceptingRegistrations ? (
            <ChristmasCard elevated className="p-8 text-center sm:p-10">
              <CheckCircle2 className="mx-auto h-11 w-11 text-primary" aria-hidden="true" />
              <h2 className="thai-keep mt-3 text-2xl text-text-primary">กิจกรรมนี้ยังไม่เปิดหรือปิดรับสมัครแล้ว</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
                {group.status === "DRAFT"
                  ? "ผู้ดูแลกิจกรรมกำลังตั้งค่ากลุ่ม และยังไม่เปิดรับสมัครในขณะนี้"
                  : "ขณะนี้หมดเวลาลงทะเบียนแล้ว หากคุณลงทะเบียนและยืนยันอีเมลไว้แล้ว สามารถขอลิงก์ส่วนตัวใหม่ได้ด้านล่าง"}
              </p>
              <div className="mt-6 flex justify-center">
                <Link href={`/join/${inviteCode}/recover`} className={christmasButtonClass("primary", "md")}>
                  <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>ขอลิงก์ส่วนตัวทางอีเมล</span>
                </Link>
              </div>
            </ChristmasCard>
          ) : (
            <ChristmasCard tone="paper" className="relative">
              <div aria-hidden="true" className="paper-frame" />
              <form onSubmit={handleSubmit} noValidate className="relative space-y-8 p-6 sm:p-10">
                <div className="text-center">
                  <p className="font-script text-2xl text-christmas-red-light">R.S.V.P.</p>
                  <h2 className="thai-keep mt-1 text-2xl text-text-primary sm:text-3xl">
                    ตอบรับคำเชิญ &amp; เขียน Buddy Profile
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                    กรอกชื่อ อีเมล ความชอบ และ Wish List แล้วกดยืนยันในอีเมลเพื่อเข้าร่วมการจับคู่
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ไม่ต้องสมัครบัญชี · ข้อมูลแสดงเฉพาะ Buddy ที่จับได้คุณ
                  </p>
                </div>

                {submitError && <Alert tone="error">{submitError}</Alert>}

                <section className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-primary sm:text-lg">ข้อมูลผู้เข้าร่วม</h3>
                    <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
                      ชื่อนี้จะแสดงบนกล่องของขวัญของเพื่อนที่จับได้คุณ และอีเมลใช้สำหรับส่งผลจับคู่ลับ
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="ชื่อ / ชื่อเล่น"
                      htmlFor={nameId}
                      required
                      helperText="ใส่ชื่อที่ทุกคนในกลุ่มจำได้ง่าย"
                    >
                      <Input
                        id={nameId}
                        type="text"
                        required
                        autoComplete="nickname"
                        disabled={submitting}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="เช่น นนท์, แพรว, พี่ต้น"
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
                        autoComplete="email"
                        disabled={submitting}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </FormField>
                  </div>
                </section>

                <div className="border-t border-border pt-6">
                  <BuddyProfileFormFields value={profile} onChange={setProfile} disabled={submitting} />
                </div>

                <ChristmasButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  loadingText="กำลังส่งคำตอบรับ..."
                  className="w-full"
                >
                  <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>ตอบรับคำเชิญ แล้วไปยืนที่ต้นคริสต์มาส</span>
                </ChristmasButton>
              </form>
            </ChristmasCard>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense
      fallback={
        <PageContainer size="md">
          <LoadingState label="กำลังเปิดการ์ดเชิญคริสต์มาส..." rows={4} />
        </PageContainer>
      }
    >
      <JoinGroupContent />
    </Suspense>
  );
}
