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
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { WinterScene } from "@/components/scenery/WinterScene";
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

const TEXT_GLOW = "[text-shadow:0_2px_14px_rgba(5,12,24,0.95)]";

export function MagicalGiftReveal({ data }: { data: BuddyRevealData }) {
  const { triggerStampSound, triggerChimeSound, triggerClickSound, boostSnow } =
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
        boostSnow(3500);
        timersRef.current.push(window.setTimeout(() => setCelebrating(false), 2100));
      }
      window.setTimeout(() => {
        const heading = revealHeadingRef.current;
        heading?.focus({ preventScroll: true });
        // The gift stage is taller than the name card, so bring the name into view.
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        heading?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      }, 60);
    },
    [clearTimers, triggerChimeSound, boostSnow]
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

  const replayReveal = () => {
    foldSecretBack();
    window.setTimeout(() => {
      setStage("untying");
      triggerStampSound();
      timersRef.current.push(window.setTimeout(() => setStage("opening"), 360));
      timersRef.current.push(window.setTimeout(() => completeReveal(true), 1220));
    }, 80);
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

      {stage !== "revealed" ? (
        /* STAGE 1–3: the gift waits in the snow under the stars */
        <section
          aria-labelledby="reveal-stage-title"
          className="rise-in relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[var(--shadow-card-lifted)]"
        >
          <WinterScene variant="reveal" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_62%,rgba(255,210,122,0.22),transparent_70%)]"
          />
          <div className="relative flex flex-col items-center px-5 pt-10 pb-8 text-center sm:px-10 sm:pt-14">
            <p className={`font-script text-2xl text-primary ${TEXT_GLOW}`}>ถึงคุณ {viewerName}</p>
            <h1
              id="reveal-stage-title"
              className={`thai-keep mt-1 text-3xl leading-tight text-text-primary sm:text-4xl ${TEXT_GLOW}`}
            >
              กล่องของขวัญลับของคุณมาถึงแล้ว
            </h1>
            <p className={`mt-2 text-sm text-text-secondary ${TEXT_GLOW}`}>{group.title}</p>
            <p className={`mt-4 max-w-md text-sm leading-relaxed text-text-secondary sm:text-base ${TEXT_GLOW}`}>
              ดูให้แน่ใจว่าไม่มีใครแอบมองหน้าจอ แล้วแตะที่กล่องเพื่อดูว่าคุณต้องดูแลใคร
            </p>

            <button
              type="button"
              disabled={stage !== "anticipation"}
              onClick={startMagicalReveal}
              aria-label="แตะเพื่อแกะกล่องของขวัญเปิดชื่อ Secret Buddy ของคุณ"
              className="group relative mt-4 flex flex-col items-center rounded-3xl p-3 disabled:cursor-default"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-6 rounded-full bg-primary/25 blur-3xl transition-colors duration-500 group-hover:bg-primary/40"
              />
              <InteractiveGiftBox3D
                tone="red"
                stage={giftBoxStage}
                className="relative z-10 h-56 w-56 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] sm:h-64 sm:w-64"
              />
            </button>

            <div className="mt-2 flex flex-col items-center gap-3">
              <ChristmasButton
                variant="primary"
                size="lg"
                disabled={stage !== "anticipation"}
                onClick={startMagicalReveal}
              >
                <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  {stage === "anticipation"
                    ? "แกะกล่อง เปิดชื่อ Secret Buddy"
                    : stage === "untying"
                      ? "กำลังแกะริบบิ้น..."
                      : "กำลังเปิดฝากล่อง..."}
                </span>
              </ChristmasButton>

              {stage === "anticipation" ? (
                <button
                  type="button"
                  onClick={skipAnimation}
                  className={`min-h-[44px] text-xs font-semibold text-text-secondary underline decoration-white/30 underline-offset-4 transition hover:text-primary ${TEXT_GLOW}`}
                >
                  ข้ามแอนิเมชัน (เปิดดูผลทันที)
                </button>
              ) : (
                <p className="text-xs font-semibold text-primary" aria-live="polite">
                  เตรียมพบกับเพื่อนคนพิเศษของคุณ...
                </p>
              )}
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-medium text-text-secondary">
              <Lock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>ลับเฉพาะคุณ · งบประมาณของขวัญ {budgetText}</span>
            </p>
          </div>
        </section>
      ) : (
        /* STAGE 4–5: the name card, then the full Wish List dossier */
        <div className="parcel-reveal relative space-y-6">
          <MagicalSparkleBurst active={celebrating} />

          <section
            aria-labelledby="buddy-name"
            className="theme-paper relative overflow-hidden rounded-[1.75rem] p-7 text-center sm:p-12"
          >
            <div aria-hidden="true" className="paper-frame" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] max-w-[140%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,210,122,0.45),transparent)]"
            />
            <div className="relative">
              <ChristmasTree stage={5} ground={false} className="mx-auto h-20 w-auto" />
              <p className="mt-3 font-script text-2xl text-christmas-red-light sm:text-3xl">
                Ho Ho Ho! Buddy ของคุณคือ...
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                คุณ <strong className="text-text-primary">{viewerName}</strong>{" "}
                ได้รับมอบหมายให้เตรียมของขวัญเซอร์ไพรส์ให้
              </p>
              <h2
                id="buddy-name"
                ref={revealHeadingRef}
                tabIndex={-1}
                className="thai-keep mt-4 text-4xl leading-tight text-christmas-red-light focus:outline-none sm:text-6xl"
              >
                {buddy.displayName}
              </h2>
              <div
                aria-hidden="true"
                className="mx-auto mt-5 h-px w-40 bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)]"
              />

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 font-semibold text-text-primary">
                  <Gift className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  งบประมาณ {budgetText}
                </span>
                {group.revealAt && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 font-semibold text-text-primary">
                    <CalendarClock className="h-4 w-4 text-christmas-red-light" aria-hidden="true" />
                    วันนัดเฉลย {formatThaiDateTime(group.revealAt)}
                  </span>
                )}
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-5">
                <ChristmasButton variant="secondary" size="sm" onClick={foldSecretBack}>
                  <EyeOff className="h-4 w-4 text-christmas-red-light" aria-hidden="true" />
                  ซ่อนหน้าจอชั่วคราว
                </ChristmasButton>
                <ChristmasButton variant="ghost" size="sm" onClick={replayReveal}>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  เล่นเอฟเฟกต์เปิดกล่องอีกครั้ง
                </ChristmasButton>
              </div>
            </div>
          </section>

          <section
            aria-label={`ข้อมูลของ ${buddy.displayName}`}
            className="christmas-card-elevated space-y-7 rounded-[1.75rem] p-6 sm:p-9"
          >
            {group.status === "COMPLETED" && (
              <Alert tone="info">กิจกรรมนี้ปิดแล้ว (คุณยังเปิดกลับมาดูข้อมูลย้อนหลังได้)</Alert>
            )}

            <div className="relative rounded-2xl border border-primary/40 bg-[radial-gradient(120%_120%_at_100%_0%,rgba(220,183,94,0.16),transparent_55%)] p-5 sm:p-7">
              <p className="font-script text-xl text-primary">Christmas Wish List</p>
              <h3 className="mt-0.5 font-display text-2xl text-text-primary">
                สิ่งที่ {buddy.displayName} อยากได้
              </h3>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-text-primary">
                {buddy.wishList || "ไม่ได้ระบุไว้เป็นพิเศษ ลองเลือกจากความชอบด้านล่างได้เลย"}
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-display text-xl text-text-primary">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                หมวดหมู่ของขวัญที่ชอบ
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {buddy.interests.map((key) => (
                  <span
                    key={key}
                    className="inline-flex items-center rounded-full border border-primary/40 bg-primary/12 px-3.5 py-1.5 text-sm font-semibold text-primary"
                  >
                    {getInterestLabel(key)}
                  </span>
                ))}
              </div>
              {buddy.interestOther && (
                <p className="mt-3 text-sm text-text-secondary">
                  <strong className="text-text-primary">เพิ่มเติม:</strong> {buddy.interestOther}
                </p>
              )}
            </div>

            <dl className="grid gap-x-8 sm:grid-cols-2">
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
                icon={<Gift className="h-4 w-4 text-success" aria-hidden="true" />}
                label="สไตล์ของขวัญที่ชอบ"
                value={buddy.giftStyle}
              />
            </dl>

            {(buddy.dislikes || buddy.allergies) && (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {buddy.dislikes && (
                  <div className="rounded-xl border border-warning/40 bg-warning-bg p-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-warning">
                      <ThumbsDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                      สิ่งที่ไม่ชอบ
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-text-primary">
                      {buddy.dislikes}
                    </p>
                  </div>
                )}
                {buddy.allergies && (
                  <div className="rounded-xl border border-error/50 bg-error-bg p-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-error">
                      <AlertOctagon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      สิ่งที่แพ้หรือควรหลีกเลี่ยง
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm font-bold leading-relaxed text-text-primary">
                      {buddy.allergies}
                    </p>
                  </div>
                )}
              </div>
            )}

            {buddy.noteToBuddy && (
              <figure className="theme-paper rounded-2xl p-5 sm:p-6">
                <figcaption className="flex items-center gap-1.5 text-sm font-bold text-primary">
                  <MessageSquareHeart className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ข้อความจาก {buddy.displayName} ถึงคุณ
                </figcaption>
                <blockquote className="mt-2 whitespace-pre-line font-script text-xl leading-relaxed text-text-primary sm:text-2xl">
                  “{buddy.noteToBuddy}”
                </blockquote>
              </figure>
            )}

            <p className="border-t border-border pt-4 text-center text-xs text-text-muted sm:text-sm">
              เปิดลิงก์นี้กลับมาเช็ค Wish List ได้ตลอดกิจกรรม · เก็บเป็นความลับไว้จนถึงวันเฉลยนะ
            </p>
          </section>
        </div>
      )}
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
    <div className="border-t border-border py-3.5">
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="mt-1 text-sm font-semibold text-text-primary">
        {value || <span className="font-normal text-text-muted">ไม่ได้ระบุ</span>}
      </dd>
    </div>
  );
}
