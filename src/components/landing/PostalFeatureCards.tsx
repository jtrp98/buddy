import { Gift, Lock, MailCheck, Settings2, Shuffle, UserCheck } from "lucide-react";
import { OrnamentDivider } from "@/components/vintage/OrnamentDivider";
import { PostalCard } from "@/components/vintage/PostalCard";

const FEATURES = [
  {
    cardNumber: "01",
    kicker: "EASY WORKSHOP SETUP",
    tone: "gold" as const,
    showPostmark: false,
    icon: <Settings2 className="h-5 w-5" aria-hidden="true" />,
    title: "สร้างปาร์ตี้ได้ใน 1 นาที",
    description:
      "ตั้งชื่อกิจกรรม เลือกงบของขวัญได้ 4 รูปแบบ และกำหนดเวลาปิดรับสมัครเวลาไทย (UTC+7) ได้อย่างแม่นยำ",
  },
  {
    cardNumber: "02",
    kicker: "NO ACCOUNT NEEDED",
    tone: "pine" as const,
    showPostmark: true,
    icon: <UserCheck className="h-5 w-5" aria-hidden="true" />,
    title: "เพื่อนเข้าร่วมได้โดยไม่ต้องสมัครบัญชี",
    description:
      "แค่คลิกลิงก์เชิญ กรอกชื่อ อีเมล และความชอบ แล้วกดยืนยันอีเมล 1 ครั้งเพื่อป้องกันการลงทะเบียนซ้ำ",
  },
  {
    cardNumber: "03",
    kicker: "FAIR DERANGEMENT",
    tone: "red" as const,
    showPostmark: false,
    icon: <Shuffle className="h-5 w-5" aria-hidden="true" />,
    title: "จับคู่ลับ 1 ต่อ 1 ไม่มีทางได้ตัวเอง",
    description:
      "ใช้อัลกอริทึม Derangement ที่ยุติธรรม พร้อมระบบล็อกการสุ่มซ้ำ ทุกคนจะได้ดูแลและมีคนดูแลครบถ้วน",
  },
  {
    cardNumber: "04",
    kicker: "MAGICAL GIFT REVEAL",
    tone: "gold" as const,
    showPostmark: false,
    icon: <MailCheck className="h-5 w-5" aria-hidden="true" />,
    title: "ส่งซองลับพร้อมโมเมนต์แกะกล่อง",
    description:
      "เมื่อปิดรับสมัครหรือ Admin กดสุ่ม ระบบจะส่งลิงก์ส่วนตัวทางอีเมล ให้สมาชิกเปิดกล่องของขวัญสุดตื่นเต้น",
  },
  {
    cardNumber: "05",
    kicker: "WISH LIST & ALLERGIES",
    tone: "red" as const,
    showPostmark: false,
    icon: <Gift className="h-5 w-5" aria-hidden="true" />,
    title: "Wish List ครบทั้งสิ่งที่ชอบและสิ่งที่แพ้",
    description:
      "ระบุสีที่ชอบ เครื่องดื่มโปรด สไตล์ของขวัญ อาการแพ้ และ Wish List ให้ Buddy เลือกซื้อได้ถูกใจจริง ๆ",
  },
  {
    cardNumber: "06",
    kicker: "ZERO-KNOWLEDGE PRIVACY",
    tone: "pine" as const,
    showPostmark: true,
    icon: <Lock className="h-5 w-5" aria-hidden="true" />,
    title: "เข้ารหัส AES-256 — Admin ก็ไม่เห็นผล",
    description:
      "ผลจับคู่ถูกเข้ารหัสอย่างปลอดภัย ผู้จัดจะเห็นเฉพาะรายชื่อและสถานะส่งอีเมล ทำให้ผู้จัดร่วมสนุกด้วยได้เต็มที่",
  },
] as const;

/**
 * Six polished Christmas feature cards highlighting Secret Buddy's magic & privacy.
 */
export function PostalFeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-18">
      <OrnamentDivider label="NORTH POLE WORKSHOP · KEY FEATURES" />

      <div className="mt-8 text-center">
        <span className="font-display-en text-base font-semibold italic text-primary">
          Crafted for Joy, Built for Secrecy
        </span>
        <h2 className="thai-keep mt-1.5 text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
          ครบทุกความมหัศจรรย์เพื่อปาร์ตี้ Secret Buddy ที่ดีที่สุด
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-text-secondary sm:text-base">
          ผสานบรรยากาศคริสต์มาสสุดอบอุ่นเข้ากับประสบการณ์ใช้งานที่ลื่นไหลสำหรับทั้งผู้จัดและสมาชิก
        </p>
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feat) => (
          <PostalCard
            key={feat.cardNumber}
            cardNumber={feat.cardNumber}
            kicker={feat.kicker}
            tone={feat.tone}
            showPostmark={feat.showPostmark}
            icon={feat.icon}
            title={feat.title}
            description={feat.description}
          />
        ))}
      </div>
    </section>
  );
}
