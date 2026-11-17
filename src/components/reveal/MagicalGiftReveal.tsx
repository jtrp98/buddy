"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertOctagon,
  CalendarClock,
  Coffee,
  EyeOff,
  Gift,
  Heart,
  Lock,
  MessageSquareHeart,
  Palette,
  RotateCcw,
  Sparkles,
  ThumbsDown,
} from "lucide-react";
import {
  InteractiveGiftBox3D,
  MagicalSparkleBurst,
} from "@/components/illustrations/ChristmasIllustrations";
import { ChristmasJourney } from "@/components/ChristmasJourney";
import { Ornament } from "@/components/vintage/Ornament";
import { OrnamentDivider } from "@/components/vintage/OrnamentDivider";
import { PostageStamp } from "@/components/AnalogPrimitives";
import { Alert, ChristmasButton } from "@/components/ui/ChristmasUI";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { getInterestLabel } from "@/lib/constants";
import { formatBudget } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";

export interface BuddyRevealData {
  viewerName: string;
  group: {
    id: string;
    title: string;
    description: string | null;
    inviteCode: string;
    budgetType: string;
    budgetMin: number | null;
    budgetMax: number | null;
    revealAt: string | null;
    status: string;
  };
  buddy: {
    displayName: string;
    interests: string[];
    interestOther: string | null;
    favoriteColor: string | null;
    favoriteFoodDrink: string | null;
    hobbies: string | null;
    giftStyle: string | null;
    dislikes: string | null;
    allergies: string | null;
    wishList: string | null;
    noteToBuddy: string | null;
  };
}

type RevealStage = "anticipation" | "untying" | "opening" | "revealed";

export function MagicalGiftReveal({ data }: { data: BuddyRevealData }) {
  const { triggerStampSound, triggerChimeSound, triggerClickSound } =
    useFestiveAtmosphere();
  const [stage, setStage] = useState<RevealStage>("anticipation");
  const [celebrating, setCelebrating] = useState(false);
  const timersRef = useRef<number[]>([]);
  const revealHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const completeReveal = useCallback(
    (withBurst: boolean) => {
      clearTimers();
      setStage("revealed");
      triggerChimeSound();
      if (withBurst) {
        setCelebrating(true);
        timersRef.current.push(window.setTimeout(() => setCelebrating(false), 2100));
      }
      window.setTimeout(() => {
        revealHeadingRef.current?.focus({ preventScroll: true });
      }, 60);
    },
    [clearTimers, triggerChimeSound]
  );

  const startMagicalReveal = () => {
    if (stage !== "anticipation") return;
    clearTimers();
    triggerStampSound();

    if (prefersReducedMotion()) {
      completeReveal(false);
      return;
    }

    setStage("untying");
    timersRef.current.push(
      window.setTimeout(() => {
        setStage("opening");
      }, 360)
    );
    timersRef.current.push(
      window.setTimeout(() => {
        completeReveal(true);
      }, 1220)
    );
  };

  const skipAnimation = () => {
    triggerClickSound();
    completeReveal(false);
  };

  const foldSecretBack = () => {
    clearTimers();
    triggerClickSound();
    setCelebrating(false);
    setStage("anticipation");
  };

  const { viewerName, group, buddy } = data;
  const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);

  const giftBoxStage =
    stage === "anticipation"
      ? "idle"
      : stage === "untying"
        ? "untying"
        : stage === "opening"
          ? "opening"
          : "open";

  return (
    <div className="space-y-6">
      <ChristmasJourney mode="participant" currentStep={4} />

      {/* STAGE 1 - 3: Magical Gift Box Theater (or compact header when revealed) */}
      <div className="christmas-card-elevated relative overflow-hidden rounded-3xl border border-primary/40 shadow-2xl">
        <div className="candy-stripe-bar h-2 w-full" />

        <div className="relative p-6 sm:p-8 lg:p-10">
          {/* Header Row */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/45 bg-background/75 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>GIFT DISPATCH FOR: {viewerName}</span>
              </span>
              <p className="mt-2.5 text-xs font-semibold tracking-wider text-text-secondary uppercase">
                {group.title}
              </p>
              <h1 className="thai-keep mt-1 text-2xl font-bold leading-snug text-snow-white sm:text-3xl">
                {stage === "revealed"
                  ? "กล่องของขวัญ Secret Buddy เปิดออกแล้ว!"
                  : "กล่องของขวัญลับจาก North Pole มาถึงแล้ว"}
              </h1>
            </div>

            <div className="hidden shrink-0 sm:block">
              <PostageStamp
                topText="CONFIDENTIAL"
                mainText="SECRET"
                bottomText="BUDDY"
                tone="red"
                vignette="star"
              />
            </div>
          </div>

          {/* Interactive Gift Box Stage */}
          {stage !== "revealed" ? (
            <div className="relative mt-6 flex flex-col items-center rounded-2xl border border-primary/25 bg-[radial-gradient(ellipse_at_center,rgba(232,196,122,0.14)_0%,rgba(11,23,40,0.92)_68%)] px-4 py-10 text-center sm:px-8 sm:py-12">
              <p className="max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
                สวัสดีคุณ <strong className="text-snow-white">{viewerName}</strong>{" "}
                ตรวจสอบรอบตัวให้แน่ใจว่าไม่มีใครแอบมองหน้าจอ แล้วแตะที่กล่องของขวัญเพื่อเปิดดูว่าคุณต้องดูแลใคร!
              </p>

              {/* Clickable 3D Gift Box */}
              <button
                type="button"
                disabled={stage !== "anticipation"}
                onClick={startMagicalReveal}
                aria-label="แตะเพื่อแกะกล่องของขวัญเปิดชื่อ Secret Buddy ของคุณ"
                className="group relative mt-6 flex flex-col items-center rounded-3xl p-4 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-4 rounded-full bg-primary/15 blur-2xl transition-opacity duration-500 group-hover:bg-primary/25"
                />
                <InteractiveGiftBox3D
                  tone="red"
                  stage={giftBoxStage}
                  className="relative z-10 h-52 w-52 transition-transform duration-300 group-hover:scale-105 sm:h-60 sm:w-60"
                />
              </button>

              <div className="mt-4 flex flex-col items-center gap-3">
                <ChristmasButton
                  variant="primary"
                  size="lg"
                  disabled={stage !== "anticipation"}
                  onClick={startMagicalReveal}
                  className="px-7 text-base"
                >
                  <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>
                    {stage === "anticipation"
                      ? "แตะเพื่อแกะกล่องของขวัญเปิดชื่อ Secret Buddy"
                      : stage === "untying"
                        ? "กำลังแกะริบบิ้นสีทอง..."
                        : "กำลังเปิดฝาและปลดผนึกความลับ..."}
                  </span>
                </ChristmasButton>

                {stage === "anticipation" ? (
                  <button
                    type="button"
                    onClick={skipAnimation}
                    className="text-xs font-semibold text-text-muted underline decoration-white/25 underline-offset-4 transition hover:text-primary"
                  >
                    ข้ามแอนิเมชัน (เปิดดูผลทันที)
                  </button>
                ) : (
                  <p className="text-xs font-semibold text-primary" aria-live="polite">
                    ✨ เตรียมพบกับเพื่อนคนพิเศษของคุณ...
                  </p>
                )}
              </div>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary">
                <Lock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                <span>ความลับระดับ North Pole • งบประมาณของขวัญ: {budgetText}</span>
              </p>
            </div>
          ) : (
            /* STAGE 4 & 5: Revealed Result Card + Celebration Sparkles */
            <div className="relative mt-6 space-y-6 parcel-reveal">
              <MagicalSparkleBurst active={celebrating} />

              {/* Hero Reveal Stationery Card (Warm Snow White & Cream for maximum celebration contrast) */}
              <div className="workshop-cream-card relative overflow-hidden rounded-2xl p-6 text-center sm:p-9">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold tracking-wider text-christmas-red uppercase">
                  <span className="inline-flex items-center gap-1.5">
                    <Ornament name="holly" className="h-4 w-6 text-evergreen" />
                    <span>NORTH POLE SECRET DISPATCH</span>
                  </span>
                  <span className="rounded-full border border-christmas-red/30 bg-christmas-red/10 px-2.5 py-0.5">
                    CONFIDENTIAL · ลับเฉพาะคุณ
                  </span>
                </div>

                <p className="font-display-en mt-5 text-lg font-semibold italic text-evergreen sm:text-xl">
                  Ho Ho Ho! Your Secret Buddy Is...
                </p>
                <p className="mt-1 text-sm font-semibold text-[#334E68]">
                  คุณ <strong className="text-[#102134]">{viewerName}</strong>{" "}
                  ได้รับมอบหมายให้ดูแลและเตรียมของขวัญเซอร์ไพรส์ให้แก่
                </p>

                <div className="mx-auto mt-4 inline-flex max-w-full flex-col items-center rounded-2xl border-2 border-christmas-red/30 bg-gradient-to-b from-[#FFFFFF] to-[#FFF2DB] px-7 py-4 shadow-md">
                  <h2
                    ref={revealHeadingRef}
                    tabIndex={-1}
                    className="thai-keep text-3xl font-bold tracking-tight text-christmas-red focus:outline-none sm:text-4xl"
                  >
                    🎁 {buddy.displayName}
                  </h2>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-[#123D32]/25 bg-[#123D32] px-4 py-2 text-sm font-bold text-snow-white shadow-xs">
                    <Gift className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>งบประมาณ: {budgetText}</span>
                  </span>

                  {group.revealAt && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#123D32]/25 bg-white/80 px-4 py-2 text-xs font-bold text-[#132234] sm:text-sm">
                      <CalendarClock className="h-4 w-4 text-christmas-red" aria-hidden="true" />
                      <span>วันนัดเฉลย: {formatThaiDateTime(group.revealAt)}</span>
                    </span>
                  )}
                </div>

                {/* Privacy & Replay Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-[#132234]/15 pt-5">
                  <button
                    type="button"
                    onClick={foldSecretBack}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#132234]/20 bg-white/85 px-4 py-2 text-xs font-bold text-[#132234] transition hover:bg-white sm:text-sm"
                  >
                    <EyeOff className="h-4 w-4 text-christmas-red" aria-hidden="true" />
                    <span>ซ่อนหน้าจอชั่วคราว (เผื่อมีคนเดินผ่าน)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      foldSecretBack();
                      window.setTimeout(() => {
                        setStage("untying");
                        triggerStampSound();
                        timersRef.current.push(
                          window.setTimeout(() => setStage("opening"), 360)
                        );
                        timersRef.current.push(
                          window.setTimeout(() => completeReveal(true), 1220)
                        );
                      }, 80);
                    }}
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#E8C47A] bg-[#FFF8EA] px-4 py-2 text-xs font-bold text-[#6E4D12] transition hover:bg-[#FFF0D1] sm:text-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>เล่นเอฟเฟกต์เปิดกล่องอีกครั้ง</span>
                  </button>
                </div>
              </div>

              {/* Secret Buddy Full Dossier */}
              <div className="space-y-6 rounded-2xl border border-white/15 bg-[#0D1E31]/85 p-5 sm:p-7">
                {group.status === "COMPLETED" && (
                  <Alert tone="info">
                    กิจกรรมนี้ปิดแล้ว (คุณยังสามารถเปิดกลับมาดูข้อมูลย้อนหลังได้)
                  </Alert>
                )}

                {/* Highlighted Wish List */}
                <div className="rounded-2xl border border-emerald-400/45 bg-gradient-to-br from-evergreen/85 to-[#0C2B24]/90 p-5 sm:p-6 shadow-md">
                  <h3 className="flex items-center gap-2 text-base font-bold text-emerald-200 sm:text-lg">
                    <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>Christmas Wish List ของ {buddy.displayName}</span>
                  </h3>
                  <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-snow-white sm:text-base">
                    {buddy.wishList || "ไม่ได้ระบุไว้เป็นพิเศษ (เลือกดูจากความชอบด้านล่างได้เลย!)"}
                  </p>
                </div>

                {/* Interests */}
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-snow-white">
                    <Gift className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>หมวดหมู่ของขวัญที่ชอบ</span>
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {buddy.interests.map((key) => (
                      <span
                        key={key}
                        className="inline-flex items-center rounded-xl border border-primary/45 bg-primary/15 px-3.5 py-1.5 text-xs font-semibold text-primary sm:text-sm"
                      >
                        {getInterestLabel(key)}
                      </span>
                    ))}
                  </div>
                  {buddy.interestOther && (
                    <p className="mt-3 text-sm text-text-secondary">
                      <strong className="text-snow-white">เพิ่มเติม:</strong>{" "}
                      {buddy.interestOther}
                    </p>
                  )}
                </div>

                <OrnamentDivider ornament="star" />

                {/* Detail Boxes */}
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <DetailBox
                    icon={<Palette className="h-4 w-4 text-primary" aria-hidden="true" />}
                    label="สีที่ชอบ"
                    value={buddy.favoriteColor}
                  />
                  <DetailBox
                    icon={<Coffee className="h-4 w-4 text-primary" aria-hidden="true" />}
                    label="อาหารและเครื่องดื่มโปรด"
                    value={buddy.favoriteFoodDrink}
                  />
                  <DetailBox
                    icon={<Heart className="h-4 w-4 text-christmas-red-light" aria-hidden="true" />}
                    label="งานอดิเรก"
                    value={buddy.hobbies}
                  />
                  <DetailBox
                    icon={<Gift className="h-4 w-4 text-emerald-300" aria-hidden="true" />}
                    label="สไตล์ของขวัญที่ชอบ"
                    value={buddy.giftStyle}
                  />
                </div>

                {/* Dislikes & Allergies */}
                {(buddy.dislikes || buddy.allergies) && (
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {buddy.dislikes && (
                      <div className="rounded-xl border border-amber-400/40 bg-amber-950/45 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200 sm:text-sm">
                          <ThumbsDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>สิ่งที่ไม่ชอบ</span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-amber-100">
                          {buddy.dislikes}
                        </p>
                      </div>
                    )}

                    {buddy.allergies && (
                      <div className="rounded-xl border border-christmas-red-light/55 bg-[#45111C]/80 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-christmas-red-light sm:text-sm">
                          <AlertOctagon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>สิ่งที่แพ้หรือควรหลีกเลี่ยง</span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm font-bold leading-relaxed text-[#FFE8EC]">
                          {buddy.allergies}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Note to Buddy */}
                {buddy.noteToBuddy && (
                  <div className="rounded-2xl border border-dashed border-primary/45 bg-[#091626]/70 p-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary sm:text-sm">
                      <MessageSquareHeart className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>ข้อความจาก {buddy.displayName} ถึงคุณ</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-snow-white sm:text-base">
                      “{buddy.noteToBuddy}”
                    </p>
                  </div>
                )}

                <p className="border-t border-border pt-4 text-center text-xs font-medium text-text-secondary sm:text-sm">
                  สามารถเปิดลิงก์นี้กลับมาเช็ค Wish List ได้ตลอดกิจกรรม • รักษาเป็นความลับไว้จนถึงวันเฉลยนะ!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-surface/75 p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-bold text-snow-white">
        {value || <span className="font-normal text-text-muted">ไม่ได้ระบุ</span>}
      </p>
    </div>
  );
}
