import Link from "next/link";
import { ArrowRight, Gift, KeyRound } from "lucide-react";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { christmasButtonClass } from "@/components/ui/buttonStyles";

const PROMISES = [
  { title: "ไม่ต้องสมัครบัญชี", body: "เพื่อนเข้าร่วมได้ด้วยลิงก์เชิญกับอีเมลเท่านั้น" },
  { title: "ไม่มีใครได้ตัวเอง", body: "สุ่มเป็นวงเดียวแบบ 1 ต่อ 1 ทุกคนได้ให้และได้รับ" },
  { title: "Admin ไม่เห็นผล", body: "ผลจับคู่เข้ารหัส AES-256-GCM ผู้จัดเองก็เปิดดูไม่ได้" },
  { title: "Wish List ครบ", body: "ทั้งสิ่งที่ชอบ สิ่งที่ไม่ชอบ และอาการแพ้ ช่วยให้เลือกของได้ตรงใจ" },
  { title: "ลิงก์หายขอใหม่ได้", body: "ขอลิงก์ส่วนตัวใหม่ทางอีเมล ลิงก์เก่าจะใช้ไม่ได้ทันที" },
  { title: "สุ่มอัตโนมัติ", body: "ถึงเวลาปิดรับสมัคร ระบบจับคู่และส่งอีเมลให้เอง" },
] as const;

/** What participants and organisers can count on, written as a ledger rather than a card grid. */
export function Promises() {
  return (
    <section aria-labelledby="promises-title" className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 sm:pt-32">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-script text-2xl text-primary">สัญญาจากเรา</p>
          <h2 id="promises-title" className="thai-keep mt-1 text-3xl text-text-primary sm:text-4xl">
            ความลับต้องเป็นความลับ ความสนุกต้องไม่ยุ่งยาก
          </h2>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            Secret Buddy ออกแบบมาให้ผู้จัดเหนื่อยน้อยที่สุด และให้ทุกคนสบายใจว่าไม่มีใครแอบรู้ก่อน
          </p>
        </div>

        <ul className="grid gap-x-10 sm:grid-cols-2">
          {PROMISES.map((p, i) => (
            <li key={p.title} className="flex gap-4 border-t border-border py-6">
              <span
                aria-hidden="true"
                className="mt-1 font-display text-sm text-primary tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-xl text-text-primary">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Closing invitation under the stars. */
export function ClosingInvite() {
  return (
    <section aria-labelledby="closing-title" className="mx-auto max-w-4xl px-4 pt-28 text-center sm:px-6 sm:pt-36">
      <ChristmasTree stage={5} ground={false} className="mx-auto h-40 w-auto sm:h-48" />
      <h2 id="closing-title" className="thai-keep mt-6 text-3xl text-text-primary sm:text-5xl">
        พร้อมจุดไฟต้นคริสต์มาส
        <span className="block">ของกลุ่มคุณ<span className="whitespace-nowrap">หรือยัง?</span></span>
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
        สร้างกลุ่มฟรีใน 1 นาที แล้วดูต้นไม้ค่อย ๆ สว่างขึ้นทุกครั้งที่มีเพื่อนตอบรับคำเชิญ
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/admin/register" className={christmasButtonClass("primary", "lg", "w-full sm:w-auto")}>
          <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
          สร้างกิจกรรมฟรี
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
        <Link href="/recover" className={christmasButtonClass("secondary", "lg", "w-full sm:w-auto")}>
          <KeyRound className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          ขอลิงก์ส่วนตัว
        </Link>
      </div>
    </section>
  );
}
