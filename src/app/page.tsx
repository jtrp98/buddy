import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Gift,
  Lock,
  MailCheck,
  Shuffle,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  CandyStripeBar,
  PostageStamp,
  WashiTape,
  WaxSeal,
} from "@/components/AnalogPrimitives";
import { InteractivePostcardPreview } from "@/components/InteractivePostcardPreview";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      {/* Hero Holiday Postcard */}
      <section className="analog-card-lg relative overflow-hidden rounded-3xl">
        <CandyStripeBar />
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#2a1f1b] bg-[#dff0e6] px-3.5 py-1 text-xs font-bold text-[#154231] shadow-[2px_2px_0_#2a1f1b]">
              <Sparkles className="h-3.5 w-3.5 text-[#c8322b]" />
              <span>จับคู่ของขวัญคริสต์มาสแบบลับสุดยอด • ไม่ต้องสมัครสมาชิก</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#2a1f1b] sm:text-5xl">
              จัดกิจกรรม{" "}
              <span className="inline-block -rotate-1 rounded-xl border-2 border-[#2a1f1b] bg-[#fde2df] px-3 py-0.5 font-serif text-[#c8322b] shadow-[3px_3px_0_#2a1f1b]">
                Secret Buddy
              </span>{" "}
              ที่เก็บความลับได้จริง
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[#5c493e] sm:text-lg">
              Admin สร้างกลุ่ม กำหนดงบของขวัญ และตั้งเวลาปิดรับสมัครได้ง่าย ๆ
              ส่วนเพื่อน ๆ แค่กดลิงก์เชิญ กรอกความชอบและ Wish List ลงบนการ์ด
              เมื่อถึงเวลาระบบจะสุ่มและส่งซองลับทางอีเมลให้อัตโนมัติ
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/admin/register"
                className="analog-btn-lg inline-flex items-center gap-2 rounded-2xl bg-[#c8322b] px-6 py-3.5 text-sm font-bold text-[#fffdf7] hover:bg-[#b22923]"
              >
                <Gift className="h-4 w-4" />
                <span>เริ่มสร้างกลุ่ม Buddy (Admin)</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/login"
                className="analog-btn-lg inline-flex items-center gap-2 rounded-2xl bg-[#fffdf7] px-5 py-3.5 text-sm font-bold text-[#2a1f1b] hover:bg-[#f3e7d1]"
              >
                <span>เข้าสู่ระบบ Admin</span>
              </Link>
              <Link
                href="/recover"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#1f5e46] underline decoration-dashed underline-offset-4 hover:text-[#c8322b]"
              >
                <span>ทำลิงก์ส่วนตัวหาย? ขอลิงก์ใหม่</span>
              </Link>
            </div>
          </div>

          {/* Interactive Sample Envelope */}
          <div className="relative lg:col-span-5">
            <WashiTape tone="red" className="absolute -top-2 left-8 z-10 -rotate-6" />
            <WashiTape tone="green" className="absolute -top-2 right-8 z-10 rotate-6" />
            <InteractivePostcardPreview />
          </div>
        </div>
      </section>

      {/* Highlights — Workshop Index Cards */}
      <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="analog-card relative rounded-2xl p-6 pt-8">
          <WashiTape tone="red" className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-2" />
          <div className="flex items-center justify-between">
            <WaxSeal tone="red" size="md">
              <UserCheck className="h-5 w-5" />
            </WaxSeal>
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#675449]">
              CARD NO. 01
            </span>
          </div>
          <h2 className="mt-4 text-base font-bold text-[#2a1f1b]">
            สมาชิกไม่ต้องสมัครบัญชี
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#5c493e]">
            เข้าผ่านลิงก์เชิญ กรอกชื่อ อีเมล และความชอบ/สิ่งที่แพ้ พร้อมยืนยันอีเมลเพื่อกันสมัครซ้ำ
          </p>
        </div>

        <div className="analog-card relative rounded-2xl p-6 pt-8">
          <WashiTape tone="gold" className="absolute -top-2.5 left-1/2 -translate-x-1/2 rotate-2" />
          <div className="flex items-center justify-between">
            <WaxSeal tone="gold" size="md">
              <Shuffle className="h-5 w-5" />
            </WaxSeal>
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#675449]">
              CARD NO. 02
            </span>
          </div>
          <h2 className="mt-4 text-base font-bold text-[#2a1f1b]">
            สุ่มยุติธรรม 1 ต่อ 1 ไม่จับได้ตัวเอง
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#5c493e]">
            ทุกคนจะได้ดูแลเพื่อน 1 คน และมีคนดูแล 1 คน ป้องกันการสุ่มซ้ำด้วยระบบล็อกระดับฐานข้อมูล
          </p>
        </div>

        <div className="analog-card relative rounded-2xl p-6 pt-8 sm:col-span-2 lg:col-span-1">
          <WashiTape tone="green" className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-1" />
          <div className="flex items-center justify-between">
            <WaxSeal tone="green" size="md">
              <Lock className="h-5 w-5" />
            </WaxSeal>
            <span className="font-mono text-[10px] font-bold tracking-widest text-[#675449]">
              CARD NO. 03
            </span>
          </div>
          <h2 className="mt-4 text-base font-bold text-[#2a1f1b]">
            Admin ก็ไม่เห็นผลจับคู่
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#5c493e]">
            Admin จัดการกลุ่ม ดูจำนวนผู้สมัคร และส่งอีเมลซ้ำเมื่อส่งพลาดได้ โดยไม่มีทางเห็นว่าใครจับได้ใคร
          </p>
        </div>
      </section>

      {/* Steps — Holiday Gift Tag Workflow */}
      <section className="analog-card mt-12 rounded-3xl p-7 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-[#cbb7a6] pb-5">
          <div>
            <span className="font-mono text-[11px] font-bold tracking-[0.16em] text-[#1f5e46] uppercase">
              HOLIDAY WORKSHOP GUIDE
            </span>
            <h2 className="mt-1 text-xl font-bold text-[#2a1f1b] sm:text-2xl">
              ขั้นตอนการใช้งานง่าย ๆ 3 สเต็ป
            </h2>
          </div>
          <PostageStamp topText="SANTA" mainText="3 STEPS" bottomText="READY" tone="red" />
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#fdf6e9] p-5">
            <div className="flex items-center gap-3">
              <WaxSeal tone="red" size="sm">
                1
              </WaxSeal>
              <div className="flex items-center gap-1.5 font-bold text-[#2a1f1b]">
                <CalendarClock className="h-4 w-4 text-[#c8322b]" />
                <span>ตั้งกลุ่มและงบของขวัญ</span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5c493e]">
              เลือกงบตายตัว งบแบบช่วง งบขั้นต่ำ หรือไม่จำกัดงบ พร้อมตั้งเวลาปิดรับสมัครเวลาไทย
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#fdf6e9] p-5">
            <div className="flex items-center gap-3">
              <WaxSeal tone="gold" size="sm">
                2
              </WaxSeal>
              <div className="flex items-center gap-1.5 font-bold text-[#2a1f1b]">
                <Gift className="h-4 w-4 text-[#9e6c14]" />
                <span>แชร์ลิงก์ให้เพื่อนลงทะเบียน</span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5c493e]">
              เพื่อนกรอก Buddy Profile เลือกความชอบ สี อาหาร สิ่งที่แพ้ และ Wish List แล้วกดยืนยันอีเมล
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#2a1f1b] bg-[#fdf6e9] p-5">
            <div className="flex items-center gap-3">
              <WaxSeal tone="green" size="sm">
                3
              </WaxSeal>
              <div className="flex items-center gap-1.5 font-bold text-[#2a1f1b]">
                <MailCheck className="h-4 w-4 text-[#1f5e46]" />
                <span>สุ่มและส่งซองลับทางอีเมล</span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5c493e]">
              สมาชิกกดลิงก์ส่วนตัวจากอีเมลเพื่อแกะผนึกดู Buddy ของตัวเองได้ทันทีแบบเป็นความลับ
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
