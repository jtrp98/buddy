"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertOctagon,
  CalendarClock,
  Coffee,
  Gift,
  Heart,
  MessageSquareHeart,
  Palette,
  Sparkles,
  ThumbsDown,
  XCircle,
} from "lucide-react";
import { getInterestLabel } from "@/lib/constants";
import { formatBudget } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";
import {
  CandyStripeBar,
  PostageStamp,
  WashiTape,
  WaxSeal,
} from "@/components/AnalogPrimitives";
import { EnvelopeLetter } from "@/components/envelope/EnvelopeLetter";
import { SecretEnvelope } from "@/components/envelope/SecretEnvelope";
import { Ornament } from "@/components/vintage/Ornament";
import { OrnamentDivider } from "@/components/vintage/OrnamentDivider";
import { Postmark } from "@/components/vintage/Postmark";

interface BuddyRevealPayload {
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

function BuddyRevealContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(token ? "" : "ไม่พบลิงก์ดูผล Buddy ของคุณ");
  const [data, setData] = useState<BuddyRevealPayload | null>(null);
  const [isUnsealed, setIsUnsealed] = useState(false);
  const revealHeadingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/members/buddy", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || "ไม่สามารถโหลดผลการจับคู่ได้");
          setLoading(false);
          return;
        }
        setData(json as BuddyRevealPayload);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="analog-card rounded-md p-12 text-center">
        <WaxSeal tone="red" size="lg" className="mx-auto animate-pulse">
          <Gift className="h-7 w-7" />
        </WaxSeal>
        <p className="mt-4 font-serif text-sm font-bold text-ink-soft">
          กำลังเปิดกล่องพัสดุลับจาก North Pole...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="analog-card printed-double-rule rounded-md p-8 text-center sm:p-10">
        <div className="relative z-10">
          <XCircle className="mx-auto h-12 w-12 text-xmas-red" />
          <h1 className="thai-keep letterpress mt-4 font-display text-2xl text-ink">
            ไม่สามารถเปิดดูผล Buddy ได้
          </h1>
          <p className="mt-2 font-serif text-sm font-medium text-xmas-red-deep">
            {error}
          </p>
          <Link
            href="/recover"
            className="analog-btn-lg thai-keep mt-6 inline-flex min-h-[44px] items-center rounded bg-xmas-red px-6 py-2.5 text-sm font-bold text-paper hover:bg-xmas-red-deep"
          >
            ขอลิงก์ดูผลใหม่ทางอีเมล
          </Link>
        </div>
      </div>
    );
  }

  const { viewerName, group, buddy } = data;
  const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);
  const topInterests = buddy.interests.map(getInterestLabel).slice(0, 3).join(", ");

  const letterRows = [
    { label: "งบประมาณ", value: budgetText },
    ...(group.revealAt
      ? [{ label: "วันเฉลย", value: formatThaiDateTime(group.revealAt) }]
      : []),
    ...(topInterests ? [{ label: "ความชอบ", value: topInterests }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Sealed / Interactive Envelope Dispatch Card */}
      <section className="analog-card-lg relative overflow-hidden rounded-md">
        <CandyStripeBar />
        <div className="relative z-10 p-5 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-rule pb-4">
            <div>
              <span className="inline-block rounded-xs border border-ink/25 bg-cream px-2.5 py-0.5 font-type text-[10px] tracking-[0.14em] text-ink uppercase">
                PARCEL FOR: {viewerName}
              </span>
              <p className="mt-2 font-type text-[11px] tracking-[0.18em] text-pine uppercase">
                {group.title}
              </p>
              <h1 className="thai-keep letterpress mt-0.5 font-display text-2xl leading-[1.35] text-ink sm:text-3xl">
                {isUnsealed ? "ซองจดหมาย Secret Buddy ของคุณ" : "พัสดุลับของคุณมาถึงแล้ว"}
              </h1>
            </div>

            <div className="relative shrink-0">
              <PostageStamp
                topText="CONFIDENTIAL"
                mainText="SECRET"
                bottomText="BUDDY"
                tone="red"
                vignette="star"
              />
              <Postmark
                city="NORTH POLE"
                date="25 DEC"
                subtext="REGISTERED"
                wavyLines={false}
                tone="ink"
                size="sm"
                className="pointer-events-none absolute -bottom-2 -left-8 -rotate-12 opacity-45"
              />
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-lg text-center font-serif text-sm leading-[1.75] text-ink-soft">
            สวัสดีคุณ <span className="font-bold text-ink">{viewerName}</span>{" "}
            {isUnsealed
              ? "รายละเอียดทั้งหมดของเพื่อนที่คุณจะต้องดูแลแสดงอยู่ด้านล่างแล้ว"
              : "ตรวจดูรอบข้างให้แน่ใจว่าไม่มีใครแอบมอง แล้วกดแกะผนึกขี้ผึ้งเพื่อเปิดดูว่าคุณได้ดูแลใคร"}
          </p>

          {/* Felt-lined tray framing the physical SecretEnvelope */}
          <div className="felt-blotter mt-5 rounded-md border border-ink/25 px-4 py-6 shadow-inner sm:px-8 sm:py-8">
            <SecretEnvelope
              recipientLabel={viewerName}
              hintText="กดที่ตราครั่งเพื่อแกะผนึก"
              openButtonAriaLabel="แกะผนึกขี้ผึ้งเพื่อดู Buddy ของฉัน"
              closeLabel="พับซองเก็บ"
              headingRef={revealHeadingRef}
              onOpen={() => setIsUnsealed(true)}
              onClose={() => setIsUnsealed(false)}
            >
              <EnvelopeLetter
                headingRef={revealHeadingRef}
                letterhead={`NORTH POLE POST · ${group.title}`}
                salutation={`ถึง คุณ${viewerName}`}
                intro="นี่คือคนที่คุณจะต้องดูแลและเตรียมของขวัญให้ (อย่าบอกใครนะ)"
                buddyName={buddy.displayName}
                rows={letterRows}
              />
            </SecretEnvelope>
          </div>

          <p className="mt-4 text-center font-serif text-xs font-medium text-ink-soft">
            อย่าบอกใครว่าคุณได้ใครนะ • งบประมาณของขวัญ: {budgetText}
          </p>
        </div>
      </section>

      {/* Full Secret Reveal Dossier Card (mounted only after envelope is unsealed) */}
      {isUnsealed && (
        <section className="parcel-reveal analog-card-lg printed-double-rule relative overflow-hidden rounded-md">
          <div className="relative border-b border-ink/25 bg-pine p-6 text-paper sm:p-8">
            <WashiTape tone="gold" className="absolute -top-2 right-8 rotate-3" />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-pine-wash">
              <span className="flex items-center gap-1.5">
                <Ornament name="holly" className="h-4 w-6 text-gold" />
                <span>กิจกรรม: {group.title}</span>
              </span>
              <span className="font-type text-[10px] tracking-[0.15em] uppercase">
                RECIPIENT: {viewerName}
              </span>
            </div>

            <p className="mt-4 font-type text-[11px] tracking-[0.2em] text-gold uppercase">
              YOUR SECRET BUDDY DOSSIER
            </p>
            <h2 className="thai-keep letterpress-on-dark mt-1.5 inline-block rounded border border-gold/40 bg-paper px-5 py-2 font-display text-2xl tracking-tight text-xmas-red shadow-paper sm:text-3xl">
              {buddy.displayName}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded border border-ink/25 bg-cream px-3.5 py-1.5 font-serif text-sm font-bold text-ink shadow-paper-pressed">
                <Gift className="h-4 w-4 text-xmas-red" />
                <span>งบประมาณของขวัญ: {budgetText}</span>
              </span>

              {group.revealAt && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-pine-wash">
                  <CalendarClock className="h-3.5 w-3.5 text-gold" />
                  <span>วันเฉลย Buddy: {formatThaiDateTime(group.revealAt)}</span>
                </span>
              )}
            </div>
          </div>

          <div className="relative z-10 space-y-6 p-6 sm:p-8">
            {group.status === "COMPLETED" && (
              <div className="rounded border border-plum/45 bg-plum-wash px-4 py-3 text-xs font-bold text-plum">
                กิจกรรมนี้จบลงเรียบร้อยแล้ว (ข้อมูลนี้ยังคงแสดงให้ดูย้อนหลังได้)
              </div>
            )}

            {/* Interests */}
            <div>
              <h3 className="flex items-center gap-2 font-serif text-base font-bold text-ink">
                <Sparkles className="h-4 w-4 text-xmas-red" />
                <span>สิ่งที่ชอบ</span>
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {buddy.interests.map((key) => (
                  <span
                    key={key}
                    className="inline-flex items-center rounded border border-xmas-red/35 bg-red-wash px-3 py-1 text-xs font-bold text-xmas-red-deep shadow-paper-pressed"
                  >
                    {getInterestLabel(key)}
                  </span>
                ))}
              </div>
              {buddy.interestOther && (
                <p className="mt-2.5 text-sm text-ink-soft">
                  <span className="font-bold text-ink">เพิ่มเติม:</span> {buddy.interestOther}
                </p>
              )}
            </div>

            <OrnamentDivider ornament="star" />

            {/* Detail Cards */}
            <div className="grid gap-3.5 sm:grid-cols-2">
              <DetailBox
                icon={<Palette className="h-4 w-4 text-xmas-red" />}
                label="สีที่ชอบ"
                value={buddy.favoriteColor}
              />
              <DetailBox
                icon={<Coffee className="h-4 w-4 text-gold-ink" />}
                label="อาหารและเครื่องดื่มโปรด"
                value={buddy.favoriteFoodDrink}
              />
              <DetailBox
                icon={<Heart className="h-4 w-4 text-xmas-red" />}
                label="งานอดิเรก"
                value={buddy.hobbies}
              />
              <DetailBox
                icon={<Gift className="h-4 w-4 text-pine" />}
                label="สไตล์ของขวัญที่ชอบ"
                value={buddy.giftStyle}
              />
            </div>

            {/* Wish List */}
            <div className="rounded border border-pine/40 bg-pine-wash/75 p-4 shadow-paper-pressed sm:p-5">
              <h3 className="font-serif text-sm font-bold text-pine-deep">
                Wish List ของที่อยากได้
              </h3>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-[1.75] text-pine-deep">
                {buddy.wishList || "ไม่ได้ระบุไว้เป็นพิเศษ"}
              </p>
            </div>

            {/* Dislikes & Allergies */}
            {(buddy.dislikes || buddy.allergies) && (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {buddy.dislikes && (
                  <div className="rounded border border-amber-ink/40 bg-amber-wash p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-ink">
                      <ThumbsDown className="h-4 w-4" />
                      <span>สิ่งที่ไม่ชอบ</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-amber-ink">
                      {buddy.dislikes}
                    </p>
                  </div>
                )}

                {buddy.allergies && (
                  <div className="rounded border border-xmas-red/45 bg-red-wash p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-xmas-red-deep">
                      <AlertOctagon className="h-4 w-4" />
                      <span>สิ่งที่แพ้หรือควรหลีกเลี่ยง</span>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm font-bold text-xmas-red-deep">
                      {buddy.allergies}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Note to Buddy */}
            {buddy.noteToBuddy && (
              <div className="rounded border border-dashed border-ink-soft/45 bg-cream p-4 sm:p-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                  <MessageSquareHeart className="h-4 w-4 text-xmas-red" />
                  <span>ข้อความเพิ่มเติมถึง Buddy</span>
                </div>
                <p className="mt-1.5 whitespace-pre-line font-serif text-sm leading-[1.75] text-ink">
                  “{buddy.noteToBuddy}”
                </p>
              </div>
            )}

            <p className="border-t border-dashed border-rule pt-4 text-center text-xs font-medium text-ink-soft">
              คุณสามารถเปิดลิงก์นี้กลับมาดูข้อมูลได้ตลอดกิจกรรม • ผู้รับจะไม่ทราบว่าคุณเป็นคนดูแล
            </p>
          </div>
        </section>
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
    <div className="rounded border border-ink/20 bg-cream/70 p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-bold text-ink">
        {value || <span className="font-normal text-ink-soft/75">ไม่ได้ระบุ</span>}
      </p>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="analog-card rounded-md p-12 text-center text-sm font-bold text-ink-soft">
            กำลังโหลด...
          </div>
        }
      >
        <BuddyRevealContent />
      </Suspense>
    </div>
  );
}
