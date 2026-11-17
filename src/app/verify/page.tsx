"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Edit3, KeyRound, Sparkles } from "lucide-react";
import { ChristmasJourney } from "@/components/ChristmasJourney";
import {
  InteractiveGiftBox3D,
  MagicalSparkleBurst,
} from "@/components/illustrations/ChristmasIllustrations";
import { SnowGlobeKey } from "@/components/scenery/Vignettes";
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
        <LoadingState label="กำลังยืนยันอีเมลของคุณ..." rows={3} />
      </div>
    );
  }

  if (status === "error" || !result) {
    return (
      <EmptyState
        icon={<SnowGlobeKey className="h-32 w-auto" />}
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

      <ChristmasCard tone="paper" className="parcel-reveal relative">
        <div aria-hidden="true" className="paper-frame" />
        <div className="relative p-7 text-center sm:p-12">
          <MagicalSparkleBurst active={burstActive} />

          <div className="mx-auto w-fit">
            <InteractiveGiftBox3D tone="evergreen" stage="idle" className="h-32 w-32" />
          </div>

          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3.5 py-1 text-xs font-bold text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ลงทะเบียนเข้าร่วมสมบูรณ์
          </p>

          <h1 className="thai-keep mt-4 text-3xl text-text-primary sm:text-4xl">ยืนยันอีเมลเรียบร้อยแล้ว!</h1>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
            ยินดีต้อนรับคุณ <strong className="text-text-primary">{result.displayName}</strong> สู่ปาร์ตี้{" "}
            <strong className="text-primary">{result.groupTitle}</strong>
          </p>
          <p className="mt-1 font-script text-xl text-christmas-red-light">ตัวละครของคุณยืนอยู่ที่ต้นคริสต์มาสแล้ว</p>

          <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-surface/60 p-4 text-sm leading-relaxed text-text-secondary">
            <Sparkles className="mx-auto mb-1.5 h-4 w-4 text-primary" aria-hidden="true" />
            <p>
              คุณสามารถเข้ามา <strong className="text-text-primary">เพิ่มหรือแก้ไขข้อมูลความชอบและ Wish List ได้ทุกเมื่อที่เว็บนี้</strong>{" "}
              ผ่านปุ่มด้านล่างหรือลิงก์ที่ส่งไปในอีเมล (หากอัปเดตข้อมูลเพิ่มหลังสุ่มจับคู่แล้ว ระบบจะส่งอีเมลแจ้งซานต้าของคุณให้อัตโนมัติ)
            </p>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={`/me/profile?token=${encodeURIComponent(result.manageToken)}`}
              className={christmasButtonClass("primary", "lg")}
            >
              <Edit3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>เพิ่ม / แก้ไข Buddy Profile &amp; Wish List</span>
            </Link>
            <Link href={`/join/${encodeURIComponent(result.inviteCode)}`} className={christmasButtonClass("secondary", "lg")}>
              ไปดูต้นคริสต์มาสของกลุ่ม
            </Link>
          </div>
        </div>
      </ChristmasCard>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <PageContainer size="md" className="max-w-2xl pt-12 pb-10 sm:pt-16 sm:pb-14">
      <Suspense fallback={<LoadingState label="กำลังโหลด..." rows={3} />}>
        <VerifyContent />
      </Suspense>
    </PageContainer>
  );
}
