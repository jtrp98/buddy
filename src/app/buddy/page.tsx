"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { SnowGlobeKey } from "@/components/scenery/Vignettes";
import {
  MagicalGiftReveal,
  type BuddyRevealData,
} from "@/components/reveal/MagicalGiftReveal";
import {
  EmptyState,
  LoadingState,
  PageContainer,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

function BuddyRevealContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(token ? "" : "ไม่พบลิงก์ดูผล Buddy ของคุณ");
  const [data, setData] = useState<BuddyRevealData | null>(null);

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
        setData(json as BuddyRevealData);
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
    return <LoadingState label="กำลังเตรียมกล่องของขวัญลับของคุณ..." rows={4} />;
  }

  if (error || !data) {
    return (
      <EmptyState
        icon={<SnowGlobeKey className="h-32 w-auto" />}
        title="ไม่สามารถเปิดดูผล Secret Buddy ได้"
        description={error || "ลิงก์นี้อาจไม่ถูกต้อง ถูกยกเลิก หรือหมดอายุแล้ว"}
        action={
          <Link href="/recover" className={christmasButtonClass("primary", "md")}>
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>ขอลิงก์ดูผลใหม่ทางอีเมล</span>
          </Link>
        }
      />
    );
  }

  return <MagicalGiftReveal data={data} />;
}

export default function BuddyPage() {
  return (
    <PageContainer size="md">
      <Suspense fallback={<LoadingState label="กำลังโหลด..." rows={4} />}>
        <BuddyRevealContent />
      </Suspense>
    </PageContainer>
  );
}
