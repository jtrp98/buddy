"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Edit3, XCircle } from "lucide-react";
import { CandyStripeBar, PostageStamp, WaxSeal } from "@/components/AnalogPrimitives";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

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
  }, [token]);

  if (status === "loading") {
    return (
      <div className="analog-card rounded-md p-10 text-center">
        <p className="text-sm font-bold text-ink-soft">กำลังตรวจสอบและประทับตรายืนยันอีเมลของคุณ...</p>
      </div>
    );
  }

  if (status === "error" || !result) {
    return (
      <div className="analog-card printed-double-rule rounded-md p-8 text-center">
        <div className="relative z-10">
          <XCircle className="mx-auto h-12 w-12 text-xmas-red" />
          <h1 className="thai-keep letterpress mt-4 font-display text-xl text-ink">
            ยืนยันอีเมลไม่สำเร็จ
          </h1>
          <p className="mt-2 font-serif text-sm font-medium text-xmas-red-deep">{error}</p>
          <Link
            href="/recover"
            className="analog-btn-lg thai-keep mt-6 inline-flex min-h-[44px] items-center rounded bg-xmas-red px-5 py-2.5 text-sm font-bold text-paper hover:bg-xmas-red-deep"
          >
            ขอลิงก์ส่วนตัวใหม่
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="analog-card-lg printed-double-rule overflow-hidden rounded-md">
      <CandyStripeBar />
      <div className="relative z-10 p-8 text-center">
        <div className="flex justify-center">
          <PostageStamp
            topText="POST OFFICE"
            mainText="VERIFIED"
            bottomText="CHECKED"
            tone="green"
            vignette="star"
          />
        </div>

        <WaxSeal tone="green" size="lg" className="mx-auto mt-5">
          <CheckCircle2 className="h-8 w-8" />
        </WaxSeal>

        <h1 className="thai-keep letterpress mt-4 font-display text-2xl text-ink">
          ยืนยันอีเมลเรียบร้อยแล้ว
        </h1>
        <p className="mt-2 font-serif text-sm leading-[1.75] text-ink-soft">
          ยินดีต้อนรับคุณ <span className="font-bold text-ink">{result.displayName}</span>{" "}
          เข้าสู่กิจกรรม{" "}
          <span className="font-bold text-xmas-red">{result.groupTitle}</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          เราได้ส่งลิงก์สำหรับแก้ไขข้อมูล Buddy Profile ไปให้ทางอีเมลของคุณด้วยแล้ว
          และเมื่อถึงเวลาปิดรับสมัคร ระบบจะส่งอีเมลแจ้งผล Buddy ให้โดยอัตโนมัติ
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/me/profile?token=${encodeURIComponent(result.manageToken)}`}
            className="analog-btn-lg thai-keep inline-flex min-h-[46px] items-center gap-2 rounded bg-xmas-red px-5 py-3 text-sm font-bold text-paper hover:bg-xmas-red-deep"
          >
            <Edit3 className="h-4 w-4" />
            <span>ดู / แก้ไข Buddy Profile ของฉัน</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <Suspense
        fallback={
          <div className="analog-card rounded-md p-10 text-center text-sm font-bold text-ink-soft">
            กำลังโหลด...
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
