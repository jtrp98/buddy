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
      <div className="analog-card rounded-3xl p-10 text-center">
        <p className="text-sm font-bold text-[#5c493e]">กำลังตรวจสอบและประทับตรายืนยันอีเมลของคุณ...</p>
      </div>
    );
  }

  if (status === "error" || !result) {
    return (
      <div className="analog-card rounded-3xl p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-[#c8322b]" />
        <h1 className="mt-4 text-xl font-bold text-[#2a1f1b]">ยืนยันอีเมลไม่สำเร็จ</h1>
        <p className="mt-2 text-sm font-medium text-[#9e221d]">{error}</p>
        <Link
          href="/recover"
          className="analog-btn-lg mt-6 inline-flex rounded-xl bg-[#c8322b] px-5 py-2.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
        >
          ขอลิงก์ส่วนตัวใหม่
        </Link>
      </div>
    );
  }

  return (
    <div className="analog-card-lg overflow-hidden rounded-3xl">
      <CandyStripeBar />
      <div className="p-8 text-center">
        <div className="flex justify-center">
          <PostageStamp topText="POST OFFICE" mainText="VERIFIED" bottomText="CHECKED" tone="green" />
        </div>

        <WaxSeal tone="green" size="lg" className="mx-auto mt-5">
          <CheckCircle2 className="h-8 w-8" />
        </WaxSeal>

        <h1 className="mt-4 text-2xl font-bold text-[#2a1f1b]">
          ยืนยันอีเมลเรียบร้อยแล้ว! 🎉
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5c493e]">
          ยินดีต้อนรับคุณ <span className="font-bold text-[#2a1f1b]">{result.displayName}</span>{" "}
          เข้าสู่กิจกรรม{" "}
          <span className="font-bold text-[#c8322b]">{result.groupTitle}</span>
        </p>
        <p className="mt-2 text-xs text-[#675449]">
          เราได้ส่งลิงก์สำหรับแก้ไขข้อมูล Buddy Profile ไปให้ทางอีเมลของคุณด้วยแล้ว
          และเมื่อถึงเวลาปิดรับสมัคร ระบบจะส่งอีเมลแจ้งผล Buddy ให้โดยอัตโนมัติ
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/me/profile?token=${encodeURIComponent(result.manageToken)}`}
            className="analog-btn-lg inline-flex items-center gap-2 rounded-xl bg-[#c8322b] px-5 py-3 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
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
          <div className="analog-card rounded-3xl p-10 text-center text-sm font-bold text-[#675449]">
            กำลังโหลด...
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
