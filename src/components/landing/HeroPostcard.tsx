"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { PostageStamp } from "@/components/AnalogPrimitives";
import { EnvelopeLetter } from "@/components/envelope/EnvelopeLetter";
import { SecretEnvelope } from "@/components/envelope/SecretEnvelope";
import { Ornament } from "@/components/vintage/Ornament";
import { OrnamentDivider } from "@/components/vintage/OrnamentDivider";
import { Postmark } from "@/components/vintage/Postmark";

/**
 * Hero composition: a giant 1950s printed postcard lying on a deep pine felt desk blotter.
 * Left: Message side (headline, lead, primary CTAs, postal assurances).
 * Right: Address side (postage stamp, postmark cancel, interactive wax-sealed SecretEnvelope).
 */
export function HeroPostcard() {
  const sampleHeadingRef = useRef<HTMLHeadingElement | null>(null);

  return (
    <section className="felt-blotter relative overflow-x-clip py-10 sm:py-14 lg:py-16">
      <div className="relative z-10 mx-auto max-w-5xl px-4">
        {/* Outer airmail-framed postcard lying slightly angled on the felt blotter */}
        <div className="airmail-frame rounded-md shadow-paper-lifted lg:-rotate-[0.35deg]">
          <div className="paper-surface paper-grain relative rounded-sm border border-ink/25 p-5 sm:p-8 lg:p-10">
            {/* Delicate antique gold corner marks */}
            <Ornament
              name="star"
              className="pointer-events-none absolute top-3 left-3 h-4 w-4 text-gold-ink/55"
            />
            <Ornament
              name="star"
              className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-gold-ink/55"
            />

            <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:gap-0">
              {/* LEFT: Postcard Message Side */}
              <div className="flex flex-col justify-between lg:col-span-7 lg:pr-9">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-px w-4 shrink-0 bg-xmas-red/50 sm:w-6" />
                    <span className="whitespace-nowrap font-type text-[9.5px] tracking-[0.12em] text-xmas-red uppercase sm:text-[11px] sm:tracking-[0.18em]">
                      NORTH POLE POST OFFICE · EST. 1950
                    </span>
                    <span className="h-px flex-1 bg-rule/70" />
                  </div>

                  <h1 className="thai-keep letterpress mt-5 font-display text-3xl leading-[1.35] text-balance text-ink sm:text-[44px] lg:text-[48px]">
                    จัดกิจกรรม{" "}
                    <span className="inline-block text-xmas-red">Secret Buddy</span>{" "}
                    ที่เก็บความลับได้จริง
                  </h1>

                  <p className="mt-4 max-w-xl font-serif text-base leading-[1.8] text-pretty text-ink-soft sm:text-[17px]">
                    Admin สร้างกลุ่ม กำหนดงบของขวัญ และตั้งเวลาปิดรับสมัครได้ง่าย ๆ
                    ส่วนเพื่อน ๆ แค่กดลิงก์เชิญ กรอกความชอบและ Wish List ลงบนการ์ด
                    เมื่อถึงเวลาระบบจะสุ่มและส่งซองลับทางอีเมลให้อัตโนมัติ
                  </p>

                  {/* Primary & Secondary Actions */}
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href="/admin/register"
                      className="analog-btn-lg thai-keep inline-flex min-h-[48px] items-center gap-2 rounded bg-xmas-red px-6 py-3 text-sm font-bold text-paper hover:bg-xmas-red-deep"
                    >
                      <Gift className="h-4 w-4 shrink-0" />
                      <span>เริ่มสร้างกลุ่ม Buddy (Admin)</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                    <Link
                      href="/admin/login"
                      className="analog-btn-lg thai-keep inline-flex min-h-[48px] items-center gap-2 rounded bg-paper px-5 py-3 text-sm font-bold text-ink hover:bg-cream"
                    >
                      <span>เข้าสู่ระบบ Admin</span>
                    </Link>
                  </div>

                  <div className="mt-3">
                    <Link
                      href="/recover"
                      className="thai-keep inline-flex min-h-[44px] items-center gap-1.5 py-1.5 font-serif text-sm font-semibold text-pine underline decoration-gold-ink/60 decoration-dashed underline-offset-4 hover:text-xmas-red"
                    >
                      <span>ทำลิงก์ส่วนตัวหาย? ขอลิงก์ใหม่</span>
                    </Link>
                  </div>
                </div>

                {/* Stamped Postal Assurances */}
                <div className="mt-6 border-t border-dashed border-rule pt-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "ไม่ต้องสมัครสมาชิก",
                      "Admin ไม่เห็นผลจับคู่",
                      "ส่งซองลับทางอีเมลอัตโนมัติ",
                    ].map((badge) => (
                      <span
                        key={badge}
                        className="thai-keep inline-flex items-center gap-1.5 rounded-xs border border-pine/30 bg-paper/75 px-2.5 py-1 font-serif text-xs font-medium text-pine"
                      >
                        <span aria-hidden="true" className="text-xmas-red">
                          ✦
                        </span>
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Horizontal Spine Divider */}
              <div className="lg:hidden">
                <OrnamentDivider label="POST CARD · CARTE POSTALE · ไปรษณียบัตร" />
              </div>

              {/* RIGHT: Postcard Address Side & Interactive Secret Envelope */}
              <div className="relative flex flex-col justify-between lg:col-span-5 lg:border-l lg:border-rule lg:pl-8">
                {/* Desktop vertical postcard spine caption */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 -left-px hidden -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap bg-cream px-2 font-type text-[8.5px] tracking-[0.22em] text-ink-soft/75 uppercase lg:block"
                >
                  POST CARD · ไปรษณียบัตร
                </span>

                {/* Stamp & Cancellation Header */}
                <div className="flex items-start justify-between gap-2 pb-3">
                  <div className="pt-1">
                    <span className="block font-type text-[10px] tracking-[0.18em] text-xmas-red uppercase">
                      SAMPLE PARCEL · TRY ME
                    </span>
                    <span className="mt-0.5 block font-serif text-sm font-bold text-ink">
                      ตัวอย่างซองลับ Secret Buddy
                    </span>
                    <div aria-hidden="true" className="mt-2.5 hidden w-28 space-y-2 sm:block">
                      <div className="h-px bg-rule/80" />
                      <div className="h-px bg-rule/60" />
                    </div>
                  </div>

                  <div className="relative shrink-0 pr-1">
                    <PostageStamp
                      topText="NORTH POLE"
                      mainText="25 DEC"
                      bottomText="25¢ POST"
                      tone="red"
                      vignette="tree"
                    />
                    <Postmark
                      city="NORTH POLE"
                      date="25 DEC"
                      subtext="SECRET"
                      wavyLines
                      tone="ink"
                      size="sm"
                      className="pointer-events-none absolute -bottom-2 -left-10 -rotate-6 opacity-65"
                    />
                  </div>
                </div>

                {/* Hero Interactive Wax-Sealed Envelope */}
                <SecretEnvelope
                  recipientLabel="พี่มิ้นต์ (ฝ่าย HR)"
                  hintText="ลองกดแกะผนึกขี้ผึ้งดูสิ"
                  openButtonAriaLabel="ลองกดแกะผนึกขี้ผึ้งเพื่อเปิดซองตัวอย่าง Secret Buddy"
                  closeLabel="พับซองกลับ"
                  headingRef={sampleHeadingRef}
                >
                  <EnvelopeLetter
                    headingRef={sampleHeadingRef}
                    salutation="ถึง พี่มิ้นต์ (ฝ่าย HR)"
                    intro="คุณได้รับมอบหมายให้ดูแลเป็น Secret Buddy ของ"
                    buddyName="คุณต้น (Dev Team)"
                    rows={[
                      { label: "งบประมาณ", value: "300–500 บาท" },
                      { label: "ชอบ", value: "กาแฟคั่วกลาง, ต้นไม้จิ๋ว" },
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
      </div>
    </section>
  );
}
