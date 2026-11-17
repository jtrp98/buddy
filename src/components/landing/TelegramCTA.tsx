import Link from "next/link";
import { ArrowRight, Gift, KeyRound } from "lucide-react";
import { SnowGlobe3D } from "@/components/illustrations/ChristmasIllustrations";
import { christmasButtonClass } from "@/components/ui/buttonStyles";

/**
 * Closing North Pole Workshop CTA inviting visitors to start their Christmas adventure.
 */
export function TelegramCTA() {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
      <div className="christmas-card-elevated overflow-hidden rounded-3xl border border-primary/40 shadow-2xl">
        <div className="candy-stripe-bar h-1.5 w-full" />
        <div className="flex flex-col items-center justify-between gap-6 p-6 text-center sm:p-10 md:flex-row md:text-left">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="shrink-0">
              <SnowGlobe3D className="h-28 w-28" />
            </div>
            <div>
              <span className="font-display-en text-sm font-semibold italic text-primary">
                Ready to Begin Your Christmas Adventure?
              </span>
              <h2 className="thai-keep mt-1 text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
                พร้อมเริ่มต้นกิจกรรม Secret Buddy ของทีมคุณแล้วหรือยัง?
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
                สร้างกลุ่มฟรีใน 1 นาที แชร์ลิงก์ให้เพื่อนเขียน Wish List
                และให้ซานต้าส่งซองลับถึงมือทุกคนโดยอัตโนมัติ
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/admin/register"
              className={christmasButtonClass("primary", "lg", "w-full sm:w-auto")}
            >
              <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>สร้างกิจกรรมฟรีเลย</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <Link
              href="/recover"
              className={christmasButtonClass("secondary", "lg", "w-full sm:w-auto")}
            >
              <KeyRound className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>ขอลิงก์ส่วนตัว</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
