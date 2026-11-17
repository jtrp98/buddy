"use client";

import { Suspense, useEffect, useState } from "react";
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
  RotateCcw,
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
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

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
  const { triggerStampSound, triggerChimeSound, triggerClickSound } = useFestiveAtmosphere();

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(token ? "" : "ไม่พบลิงก์ดูผล Buddy ของคุณ");
  const [data, setData] = useState<BuddyRevealPayload | null>(null);
  const [isUnsealed, setIsUnsealed] = useState(false);

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

  const handleUnseal = () => {
    triggerStampSound();
    setTimeout(() => triggerChimeSound(), 110);
    setIsUnsealed(true);
  };

  const handleReseal = () => {
    triggerClickSound();
    setIsUnsealed(false);
  };

  if (loading) {
    return (
      <div className="analog-card rounded-3xl p-12 text-center">
        <WaxSeal tone="red" size="lg" className="mx-auto animate-pulse">
          <Gift className="h-7 w-7" />
        </WaxSeal>
        <p className="mt-4 text-sm font-bold text-[#675449]">
          กำลังเปิดกล่องพัสดุลับจาก North Pole...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="analog-card rounded-3xl p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-[#c8322b]" />
        <h1 className="mt-4 text-xl font-bold text-[#2a1f1b]">ไม่สามารถเปิดดูผล Buddy ได้</h1>
        <p className="mt-2 text-sm font-medium text-[#9e221d]">{error}</p>
        <Link
          href="/recover"
          className="analog-btn-lg mt-6 inline-flex rounded-xl bg-[#c8322b] px-5 py-2.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
        >
          ขอลิงก์ดูผลใหม่ทางอีเมล
        </Link>
      </div>
    );
  }

  const { viewerName, group, buddy } = data;
  const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);

  if (!isUnsealed) {
    return (
      <section className="analog-card-lg relative overflow-hidden rounded-3xl">
        <CandyStripeBar />
        <div className="p-7 text-center sm:p-10">
          <div className="flex items-center justify-between gap-2 text-left">
            <span className="rounded-lg border-2 border-[#2a1f1b] bg-[#fdf3d7] px-3 py-1 font-mono text-[11px] font-bold text-[#2a1f1b]">
              PARCEL FOR: {viewerName}
            </span>
            <PostageStamp topText="CONFIDENTIAL" mainText="SECRET" bottomText="BUDDY" tone="red" />
          </div>

          <div className="my-8 rounded-2xl border-2 border-dashed border-[#bfa995] bg-[#f3e7d1] px-6 py-10">
            <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#1f5e46] uppercase">
              ★ {group.title} ★
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#2a1f1b] sm:text-3xl">
              พัสดุลับของคุณมาถึงแล้ว!
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5c493e]">
              สวัสดีคุณ <span className="font-bold text-[#2a1f1b]">{viewerName}</span>{" "}
              ตรวจดูรอบข้างให้แน่ใจว่าไม่มีใครแอบมอง แล้วกดแกะผนึกขี้ผึ้งเพื่อเปิดดูว่าคุณได้ดูแลใคร
            </p>

            <button
              type="button"
              onClick={handleUnseal}
              className="analog-btn-lg mt-7 inline-flex items-center gap-3 rounded-2xl bg-[#c8322b] px-7 py-4 text-base font-bold text-[#fffdf7] hover:bg-[#b22923]"
            >
              <WaxSeal tone="gold" size="sm">
                <Gift className="h-4 w-4" />
              </WaxSeal>
              <span>แกะผนึกขี้ผึ้งเพื่อดู Buddy ของฉัน</span>
            </button>
          </div>

          <p className="text-xs font-medium text-[#675449]">
            🤫 อย่าบอกใครว่าคุณได้ใครนะ • งบประมาณของขวัญ: {budgetText}
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="parcel-reveal space-y-6">
      {/* Secret Reveal Dossier Card */}
      <section className="analog-card-lg relative overflow-hidden rounded-3xl">
        <CandyStripeBar />

        <div className="relative border-b-2 border-[#2a1f1b] bg-[#1f5e46] p-7 text-[#fffdf7] sm:p-9">
          <WashiTape tone="gold" className="absolute -top-2 right-8 rotate-3" />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#dff0e6]">
            <span>🎄 กิจกรรม: {group.title}</span>
            <div className="flex items-center gap-2">
              <span>สำหรับคุณ {viewerName}</span>
              <button
                type="button"
                onClick={handleReseal}
                title="พับซองเก็บกลับ"
                className="inline-flex items-center gap-1 rounded-lg border border-[#fffdf7]/35 bg-black/15 px-2.5 py-1 text-[11px] font-semibold text-[#fffdf7] hover:bg-black/25"
              >
                <RotateCcw className="h-3 w-3" />
                <span>พับซอง</span>
              </button>
            </div>
          </div>

          <p className="mt-5 font-mono text-xs font-bold tracking-[0.18em] text-[#f6e3a8] uppercase">
            🎁 YOUR SECRET BUDDY IS...
          </p>
          <h1 className="mt-1.5 inline-block rounded-2xl border-2 border-[#2a1f1b] bg-[#fffdf7] px-5 py-2 text-3xl font-bold tracking-tight text-[#c8322b] shadow-[4px_4px_0_#2a1f1b] sm:text-4xl">
            {buddy.displayName}
          </h1>
          <p className="mt-3 text-sm text-[#edf7f1]">
            นี่คือคนที่คุณจะต้องดูแลและเตรียมของขวัญให้ อย่าบอกใครว่าคุณได้ใครนะ 🤫
          </p>

          <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl border-2 border-[#2a1f1b] bg-[#fdf3d7] px-4 py-2 text-sm font-bold text-[#2a1f1b] shadow-[2px_2px_0_#2a1f1b]">
            <Gift className="h-4 w-4 text-[#c8322b]" />
            <span>งบประมาณของขวัญ: {budgetText}</span>
          </div>

          {group.revealAt && (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#dff0e6]">
              <CalendarClock className="h-3.5 w-3.5 text-[#f6e3a8]" />
              <span>วันเฉลย Buddy: {formatThaiDateTime(group.revealAt)}</span>
            </div>
          )}
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {group.status === "COMPLETED" && (
            <div className="rounded-2xl border-2 border-[#5148a3] bg-[#e7e5f8] px-4 py-3 text-xs font-bold text-[#352f75]">
              กิจกรรมนี้จบลงเรียบร้อยแล้ว (ข้อมูลนี้ยังคงแสดงให้ดูย้อนหลังได้)
            </div>
          )}

          {/* Interests */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#2a1f1b]">
              <Sparkles className="h-4 w-4 text-[#c8322b]" />
              <span>สิ่งที่ชอบ</span>
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {buddy.interests.map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center rounded-lg border-2 border-[#2a1f1b] bg-[#fde2df] px-3 py-1 text-xs font-bold text-[#9e221d] shadow-[2px_2px_0_#2a1f1b]"
                >
                  {getInterestLabel(key)}
                </span>
              ))}
            </div>
            {buddy.interestOther && (
              <p className="mt-2.5 text-sm text-[#4d3d35]">
                <span className="font-bold text-[#2a1f1b]">เพิ่มเติม:</span> {buddy.interestOther}
              </p>
            )}
          </div>

          {/* Detail Cards */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <DetailBox
              icon={<Palette className="h-4 w-4 text-[#c8322b]" />}
              label="สีที่ชอบ"
              value={buddy.favoriteColor}
            />
            <DetailBox
              icon={<Coffee className="h-4 w-4 text-[#9e6c14]" />}
              label="อาหารและเครื่องดื่มโปรด"
              value={buddy.favoriteFoodDrink}
            />
            <DetailBox
              icon={<Heart className="h-4 w-4 text-[#c8322b]" />}
              label="งานอดิเรก"
              value={buddy.hobbies}
            />
            <DetailBox
              icon={<Gift className="h-4 w-4 text-[#1f5e46]" />}
              label="สไตล์ของขวัญที่ชอบ"
              value={buddy.giftStyle}
            />
          </div>

          {/* Wish List */}
          <div className="rounded-2xl border-2 border-[#1f5e46] bg-[#edf7f1] p-4 shadow-[3px_3px_0_#1f5e46] sm:p-5">
            <h3 className="text-sm font-bold text-[#154231]">✨ Wish List ของที่อยากได้</h3>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#154231]">
              {buddy.wishList || "ไม่ได้ระบุไว้เป็นพิเศษ"}
            </p>
          </div>

          {/* Dislikes & Allergies */}
          {(buddy.dislikes || buddy.allergies) && (
            <div className="grid gap-3.5 sm:grid-cols-2">
              {buddy.dislikes && (
                <div className="rounded-2xl border-2 border-[#b7791f] bg-[#fdf3db] p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7c4d08]">
                    <ThumbsDown className="h-4 w-4" />
                    <span>สิ่งที่ไม่ชอบ</span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm text-[#4a3208]">
                    {buddy.dislikes}
                  </p>
                </div>
              )}

              {buddy.allergies && (
                <div className="rounded-2xl border-2 border-[#c8322b] bg-[#fdeceb] p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8b1a15]">
                    <AlertOctagon className="h-4 w-4" />
                    <span>สิ่งที่แพ้หรือควรหลีกเลี่ยง</span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm font-bold text-[#741410]">
                    {buddy.allergies}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Note to Buddy */}
          {buddy.noteToBuddy && (
            <div className="rounded-2xl border-2 border-dashed border-[#8d7665] bg-[#f6eddd] p-4 sm:p-5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#4d3d35]">
                <MessageSquareHeart className="h-4 w-4 text-[#c8322b]" />
                <span>ข้อความเพิ่มเติมถึง Buddy</span>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#2a1f1b]">
                “{buddy.noteToBuddy}”
              </p>
            </div>
          )}

          <p className="border-t-2 border-dashed border-[#dfd0bf] pt-4 text-center text-xs font-medium text-[#675449]">
            คุณสามารถเปิดลิงก์นี้กลับมาดูข้อมูลได้ตลอดกิจกรรม • ผู้รับจะไม่ทราบว่าคุณเป็นคนดูแล
          </p>
        </div>
      </section>
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
    <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#fdf6e9] p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#675449]">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-bold text-[#2a1f1b]">
        {value || <span className="font-normal text-[#8e7a6d]">ไม่ได้ระบุ</span>}
      </p>
    </div>
  );
}

export default function BuddyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="analog-card rounded-3xl p-12 text-center text-sm font-bold text-[#675449]">
            กำลังโหลด...
          </div>
        }
      >
        <BuddyRevealContent />
      </Suspense>
    </div>
  );
}
