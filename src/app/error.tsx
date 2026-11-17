"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { SnowGlobeKey } from "@/components/scenery/Vignettes";
import { christmasButtonClass } from "@/components/ui/buttonStyles";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert" className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <SnowGlobeKey className="h-40 w-auto" />
      <p className="mt-6 font-script text-2xl text-primary">หิมะตกหนักไปหน่อย</p>
      <h1 className="thai-keep mt-1 text-3xl text-text-primary sm:text-4xl">เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary sm:text-base">
        ลองโหลดอีกครั้ง ถ้ายังไม่ได้ กลับไปหน้าแรกแล้วเริ่มใหม่
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => retry()} className={christmasButtonClass("primary", "md")}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ลองอีกครั้ง
        </button>
        <Link href="/" className={christmasButtonClass("secondary", "md")}>
          กลับหน้าแรก
        </Link>
      </div>
    </div>
  );
}
