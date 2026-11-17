import { Lock, Shuffle, UserCheck } from "lucide-react";
import { OrnamentDivider } from "@/components/vintage/OrnamentDivider";
import { PostalCard } from "@/components/vintage/PostalCard";

/**
 * Three vintage letterpress postal cards presenting Secret Buddy's core guarantees.
 */
export function PostalFeatureCards() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 sm:pt-16">
      <OrnamentDivider label="NORTH POLE ✦ SECRET POST ✦ 25 DEC" />

      <div className="mt-8 text-center">
        <span className="font-type text-[11px] tracking-[0.2em] text-pine uppercase">
          POSTAL ARCHIVE · 01–03
        </span>
        <h2 className="thai-keep letterpress mt-1.5 font-display text-2xl leading-[1.35] text-ink sm:text-3xl">
          เสน่ห์ของการจับคู่แบบส่งจดหมายจริง
        </h2>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PostalCard
          cardNumber="No. 01"
          kicker="POSTAL CARD"
          tone="red"
          rotationClass="lg:-rotate-[0.6deg]"
          showPostmark
          icon={<UserCheck className="h-5 w-5" />}
          title="สมาชิกไม่ต้องสมัครบัญชี"
          description="เข้าผ่านลิงก์เชิญ กรอกชื่อ อีเมล และความชอบ/สิ่งที่แพ้ พร้อมยืนยันอีเมลเพื่อกันสมัครซ้ำ"
        />

        <PostalCard
          cardNumber="No. 02"
          kicker="POSTAL CARD"
          tone="gold"
          rotationClass="lg:rotate-[0.45deg]"
          icon={<Shuffle className="h-5 w-5" />}
          title={
            <>
              สุ่มยุติธรรม 1 ต่อ 1{" "}
              <span className="whitespace-nowrap">ไม่จับได้ตัวเอง</span>
            </>
          }
          description="ทุกคนจะได้ดูแลเพื่อน 1 คน และมีคนดูแล 1 คน ป้องกันการสุ่มซ้ำด้วยระบบล็อกระดับฐานข้อมูล"
        />

        <PostalCard
          cardNumber="No. 03"
          kicker="POSTAL CARD"
          tone="pine"
          rotationClass="sm:col-span-2 lg:col-span-1 lg:-rotate-[0.35deg]"
          showPostmark
          icon={<Lock className="h-5 w-5" />}
          title="Admin ก็ไม่เห็นผลจับคู่"
          description="Admin จัดการกลุ่ม ดูจำนวนผู้สมัคร และส่งอีเมลซ้ำเมื่อส่งพลาดได้ โดยไม่มีทางเห็นว่าใครจับได้ใคร"
        />
      </div>
    </section>
  );
}
