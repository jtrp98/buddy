"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Edit3, KeyRound, Sparkles } from "lucide-react";
import { PostageStamp } from "@/components/AnalogPrimitives";
import { ChristmasJourney } from "@/components/ChristmasJourney";
import {
  ElfCharacter3D,
  MagicalSparkleBurst,
  SnowGlobe3D,
} from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import {
  ChristmasCard,
  EmptyState,
  LoadingState,
  PageContainer,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { triggerChimeSound } = useFestiveAtmosphere();

  const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
    token ? "loading" : "error"
  );
  const [error, setError] = useState(() =>
    token ? "" : "ไม่พบรหัสยืนยันในลิงก์นี้"
  );
  const [result, setResult] = useState<{
    displayName: string;
    groupTitle: string;
    inviteCode: string;
    manageToken: string;
  } | null>(null);
  const [burstActive, setBurstActive] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/members/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setError(data.error || "ไม่สามารถยืนยันอีเมลได้");
          return;
        }
        setResult(data);
        setStatus("success");
        setBurstActive(true);
        triggerChimeSound();
        window.setTimeout(() => setBurstActive(false), 2200);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, triggerChimeSound]);

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <ChristmasJourney mode="participant" currentStep={3} />
        <LoadingState label="เอลฟ์กำลังประทับตรา North Pole ยืนยันอีเมลของคุณ..." rows={3} />
      </div>
    );
  }

  if (status === "error" || !result) {
    return (
      <EmptyState
        icon={<SnowGlobe3D className="h-28 w-28" />}
        title="ไม่สามารถยืนยันอีเมลได้"
        description={error || "ลิงก์ยืนยันตัวตนอาจหมดอายุหรือถูกใช้งานไปแล้ว"}
        action={
          <Link href="/recover" className={christmasButtonClass("primary", "md")}>
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>ขอลิงก์ส่วนตัวใหม่</span>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <ChristmasJourney mode="participant" currentStep={3} />

      <ChristmasCard elevated withStripe className="relative parcel-reveal">
        <div className="p-7 text-center sm:p-10">
          <MagicalSparkleBurst active={burstActive} />

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-5">
              <ElfCharacter3D className="h-24 w-24" />
              <PostageStamp
                topText="NORTH POLE"
                mainText="VERIFIED"
                bottomText="CONFIRMED"
                tone="green"
                vignette="star"
              />
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-evergreen/85 px-3.5 py-1 text-xs font-bold text-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              <span>ลงทะเบียนเข้าร่วมสมบูรณ์</span>
            </span>
          </div>

          <h1 className="thai-keep mt-4 text-2xl font-bold text-snow-white sm:text-3xl">
            ยืนยันอีเมลเรียบร้อยแล้ว!
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
            ยินดีต้อนรับคุณ <strong className="text-snow-white">{result.displayName}</strong>{" "}
            เข้าสู่ปาร์ตี้{" "}
            <strong className="text-primary">{result.groupTitle}</strong>
          </p>

          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-primary/25 bg-background/70 p-4 text-xs leading-relaxed text-text-secondary sm:text-sm">
            <Sparkles className="mx-auto mb-1.5 h-4 w-4 text-primary" aria-hidden="true" />
            เราได้ส่งลิงก์ส่วนตัวสำหรับแก้ไข Wish List ไปยังอีเมลของคุณแล้ว
            และเมื่อถึงเวลาจับคู่ ระบบจะส่งกล่องของขวัญแจ้งชื่อ Secret Buddy ให้โดยอัตโนมัติ
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={`/me/profile?token=${encodeURIComponent(result.manageToken)}`}
              className={christmasButtonClass("primary", "lg")}
            >
              <Edit3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>ดู / แก้ไข Buddy Profile &amp; Wish List</span>
            </Link>
          </div>
        </div>
      </ChristmasCard>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <PageContainer size="md" className="max-w-2xl py-10 sm:py-14">
      <Suspense fallback={<LoadingState label="กำลังโหลด..." rows={3} />}>
        <VerifyContent />
      </Suspense>
    </PageContainer>
  );
}
