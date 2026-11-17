import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { Ornament } from "@/components/vintage/Ornament";

/**
 * Closing North Pole Telegraph dispatch strip with primary CTA.
 */
export function TelegramCTA() {
  return (
    <section className="mx-auto mt-14 max-w-5xl px-4">
      <div className="paper-sheet paper-grain relative overflow-hidden rounded-md border border-ink/25 p-6 shadow-paper sm:p-9">
        <div className="border-y border-xmas-red/35 py-5">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-pine/35 bg-pine-wash/60 text-pine">
                <Ornament name="horn" className="h-7 w-9" />
              </div>
              <div>
                <span className="font-type text-[10px] tracking-[0.2em] text-xmas-red uppercase">
                  NORTH POLE TELEGRAPH · DISPATCH NO. 25
                </span>
                <h2 className="thai-keep letterpress mt-1 font-display text-xl leading-[1.4] text-ink sm:text-2xl">
                  พร้อมส่งซองลับประจำเทศกาลแล้วหรือยัง?
                </h2>
                <p className="mt-1 font-serif text-sm text-ink-soft">
                  ตั้งกลุ่มใน 1 นาที แชร์ลิงก์ให้เพื่อน และปล่อยให้ระบบดูแลความลับทั้งหมด
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
              <Link
                href="/admin/register"
                className="analog-btn-lg thai-keep inline-flex min-h-[48px] items-center gap-2 rounded bg-xmas-red px-6 py-3 text-sm font-bold text-paper hover:bg-xmas-red-deep"
              >
                <Gift className="h-4 w-4 shrink-0" />
                <span>เริ่มสร้างกลุ่ม Buddy</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
