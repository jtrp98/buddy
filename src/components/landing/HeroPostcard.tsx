"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Gift,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PostageStamp } from "@/components/AnalogPrimitives";
import { EnvelopeLetter } from "@/components/envelope/EnvelopeLetter";
import { SecretEnvelope } from "@/components/envelope/SecretEnvelope";
import {
  InteractiveGiftBox3D,
  MagicalSparkleBurst,
  NorthPoleWorkshopScene,
} from "@/components/illustrations/ChristmasIllustrations";
import { Postmark } from "@/components/vintage/Postmark";
import { christmasButtonClass } from "@/components/ui/ChristmasUI";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

const TRUST_ITEMS = [
  "ผู้เข้าร่วมไม่ต้องสมัครบัญชี",
  "สุ่มจับคู่แบบ 1-to-1 เป็นความลับ",
  "Admin ไม่มีทางเห็นผลจับคู่",
] as const;

/**
 * Immersive Christmas Hero featuring Santa's Snowy North Pole Workshop,
 * expressive holiday typography, and an interactive Secret Gift & Envelope preview.
 */
export function HeroPostcard() {
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const sampleHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const previewSectionRef = useRef<HTMLDivElement | null>(null);
  const [openSignal, setOpenSignal] = useState(0);
  const [giftStage, setGiftStage] = useState<"idle" | "untying" | "opening" | "open">("idle");
  const [burstActive, setBurstActive] = useState(false);

  const handleTriggerPreview = () => {
    triggerClickSound();
    previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setOpenSignal((n) => n + 1);
    if (giftStage === "idle") {
      setGiftStage("untying");
      window.setTimeout(() => setGiftStage("opening"), 260);
      window.setTimeout(() => {
        setGiftStage("open");
        setBurstActive(true);
        triggerChimeSound();
      }, 820);
      window.setTimeout(() => setBurstActive(false), 2300);
    }
  };

  const handleGiftBoxClick = () => {
    triggerClickSound();
    if (giftStage === "open") {
      setGiftStage("idle");
      return;
    }
    if (giftStage !== "idle") return;
    setGiftStage("untying");
    window.setTimeout(() => setGiftStage("opening"), 260);
    window.setTimeout(() => {
      setGiftStage("open");
      setBurstActive(true);
      triggerChimeSound();
      setOpenSignal((n) => n + 1);
    }, 820);
    window.setTimeout(() => setBurstActive(false), 2300);
  };

  return (
    <section className="felt-blotter relative overflow-x-clip border-b border-primary/20 pt-6 pb-12 sm:pt-9 sm:pb-14 lg:pt-10">
      <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        {/* Main Hero Showcase Card */}
        <div className="christmas-card-elevated overflow-hidden rounded-3xl border border-primary/35 shadow-2xl">
          <div className="candy-stripe-bar h-2 w-full" />

          <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-9 lg:p-9">
            {/* LEFT: Expressive Headline, Thai Copy & CTAs */}
            <div className="flex flex-col justify-between lg:col-span-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-background/75 px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>NORTH POLE EDITION · 2026</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-evergreen/80 px-3 py-1 text-xs font-semibold text-emerald-100">
                    เล่นฟรีทั้งทีม ไม่ต้องสมัครสมาชิก
                  </span>
                </div>

                <p className="font-display-en mt-3.5 text-2xl font-bold italic leading-tight tracking-tight text-primary sm:text-3xl">
                  Make Christmas a Little More Magical.
                </p>

                <h1 className="thai-keep mt-1.5 text-3xl font-bold leading-[1.26] tracking-tight text-snow-white sm:text-4xl lg:text-[40px]">
                  จัดกิจกรรม <span className="text-primary">Secret Buddy</span>{" "}
                  ให้เต็มไปด้วยความตื่นเต้นและอบอุ่น
                </h1>

                <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary sm:text-[16px]">
                  สร้างปาร์ตี้แลกของขวัญ แชร์ลิงก์ให้เพื่อนเขียน{" "}
                  <strong className="text-snow-white">Wish List</strong>{" "}
                  และลุ้นเปิดกล่องของขวัญลับพร้อมกันทั้งทีม — รักษาความลับด้วยระบบเข้ารหัส
                  แม้แต่ผู้จัดก็ไม่มีทางรู้ผลจับคู่
                </p>

                {/* Primary & Interactive Preview CTAs */}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href="/admin/register"
                    className={christmasButtonClass("primary", "lg", "w-full sm:w-auto")}
                  >
                    <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>สร้างกิจกรรมฟรีเลย</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleTriggerPreview}
                    className={christmasButtonClass("gold", "lg", "w-full sm:w-auto")}
                  >
                    <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>ลองเปิดกล่อง &amp; ซองลับ</span>
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <Link
                    href="/admin/login"
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-primary underline decoration-primary/50 underline-offset-4 hover:text-primary-hover"
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>เข้าสู่ระบบ Admin</span>
                  </Link>
                  <Link
                    href="/recover"
                    className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-text-secondary underline decoration-white/30 underline-offset-4 hover:text-text-primary"
                  >
                    <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>ทำลิงก์ส่วนตัวหาย? ขอลิงก์ใหม่</span>
                  </Link>
                </div>
              </div>

              {/* Trust Highlights */}
              <ul className="mt-6 grid gap-2.5 border-t border-border pt-5 sm:grid-cols-3">
                {TRUST_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="frost-pill flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold leading-snug text-snow-white"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="thai-keep">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: North Pole Snowy Workshop Diorama */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border border-primary/35 bg-[#091526] p-2 shadow-[0_20px_50px_rgba(4,10,20,0.65)]">
                <NorthPoleWorkshopScene className="h-auto w-full rounded-xl" />

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0D1E32]/90 px-4 py-2.5 text-xs">
                  <span className="flex items-center gap-2 font-semibold text-text-secondary">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                    <span>Santa&apos;s Workshop เปิดทำการแล้ว</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleTriggerPreview}
                    className="font-bold text-primary transition hover:text-primary-hover hover:underline underline-offset-4"
                  >
                    ลองสัมผัสความตื่นเต้นด้านล่าง ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Secret Gift & Envelope Preview Band */}
        <div
          id="sample-envelope"
          ref={previewSectionRef}
          className="christmas-card relative overflow-hidden rounded-3xl border border-primary/30 p-6 sm:p-8 lg:p-10"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] text-primary uppercase">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>INTERACTIVE REVEAL PREVIEW</span>
              </span>
              <h2 className="thai-keep mt-1 text-xl font-bold text-text-primary sm:text-2xl">
                ตัวอย่างโมเมนต์แกะกล่องของขวัญ &amp; ซองจดหมาย Secret Buddy
              </h2>
              <p className="mt-1 text-xs text-text-secondary sm:text-sm">
                ลองคลิกกล่องของขวัญ 3 มิติหรือกดแกะผนึกขี้ผึ้งเพื่อดูประสบการณ์ที่เพื่อนของคุณจะได้รับ
              </p>
            </div>

            <div className="relative hidden shrink-0 sm:block">
              <PostageStamp
                topText="NORTH POLE"
                mainText="25 DEC"
                bottomText="SECRET POST"
                tone="red"
                vignette="tree"
              />
              <Postmark
                city="NORTH POLE"
                date="25 DEC"
                subtext="SECRET"
                wavyLines
                tone="gold"
                size="sm"
                className="pointer-events-none absolute -bottom-2 -left-8 -rotate-6 opacity-50"
              />
            </div>
          </div>

          <div className="mt-6 grid items-center gap-8 lg:grid-cols-12">
            {/* Interactive 3D Gift Box */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0A1729]/80 p-6 text-center lg:col-span-5">
              <MagicalSparkleBurst active={burstActive} />

              <button
                type="button"
                onClick={handleGiftBoxClick}
                aria-label="คลิกเพื่อลองแกะกล่องของขวัญตัวอย่าง"
                className="group relative flex flex-col items-center focus-visible:outline-2 focus-visible:outline-primary rounded-2xl p-2"
              >
                <InteractiveGiftBox3D
                  tone="red"
                  stage={giftStage}
                  className="h-44 w-44 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/45 bg-surface-elevated px-4 py-1.5 text-xs font-bold text-primary shadow-sm transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {giftStage === "open"
                      ? "ปิดกล่องตัวอย่างอีกครั้ง"
                      : "คลิกกล่องของขวัญเพื่อเปิดดูซองลับ!"}
                  </span>
                </span>
              </button>

              <p className="mt-3 max-w-xs text-xs leading-relaxed text-text-secondary">
                {giftStage === "open"
                  ? "เซอร์ไพรส์! ซองจดหมาย Secret Buddy เปิดออกพร้อม Wish List ของเพื่อนคุณแล้ว"
                  : "เมื่อสมาชิกเปิดลิงก์ผลจับคู่ จะได้สัมผัสประสบการณ์แกะของขวัญสุดพิเศษแบบนี้"}
              </p>
            </div>

            {/* Interactive Wax-Sealed Secret Envelope */}
            <div className="rounded-2xl border border-white/10 bg-[#091524]/85 px-4 py-6 sm:px-6 lg:col-span-7">
              <SecretEnvelope
                recipientLabel="พี่มิ้นต์ (ฝ่าย HR)"
                hintText="ลองกดแกะผนึกขี้ผึ้งดูสิ"
                openButtonLabel="เปิดตัวอย่างซองลับ"
                openButtonAriaLabel="ลองกดแกะผนึกขี้ผึ้งเพื่อเปิดซองตัวอย่าง Secret Buddy"
                closeLabel="พับซองกลับ"
                openSignal={openSignal}
                headingRef={sampleHeadingRef}
              >
                <EnvelopeLetter
                  headingRef={sampleHeadingRef}
                  salutation="ถึง พี่มิ้นต์ (ฝ่าย HR)"
                  intro="คุณได้รับมอบหมายให้ดูแลเป็น Secret Buddy ของ"
                  buddyName="คุณต้น (Dev Team)"
                  rows={[
                    { label: "งบประมาณ", value: "300–500 บาท" },
                    { label: "สิ่งที่ชอบ", value: "กาแฟคั่วกลาง, ต้นไม้จิ๋ว" },
                    {
                      label: "Wish List",
                      value: "แก้วเก็บความเย็นสีเขียวเข้ม หรือเมล็ดกาแฟดริป",
                    },
                  ]}
                />
              </SecretEnvelope>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
