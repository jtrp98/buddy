import {
  SantaCharacter3D,
  SnowGlobe3D,
  WishListGiftStack3D,
} from "@/components/illustrations/ChristmasIllustrations";

const JOURNEY_STOPS = [
  {
    step: "STEP 01",
    enTitle: "Create Your Christmas Group",
    title: "สร้างปาร์ตี้และกำหนดงบของขวัญ",
    description:
      "ผู้จัดตั้งชื่อกลุ่ม เลือกงบได้ 4 แบบ (ตายตัว ช่วง ขั้นต่ำ หรือไม่จำกัด) พร้อมกำหนดเวลาปิดรับสมัครเวลาไทย",
    illustration: <SantaCharacter3D className="h-24 w-24" />,
    accentClass: "border-christmas-red-light/40 bg-christmas-red/15 text-christmas-red-light",
  },
  {
    step: "STEP 02",
    enTitle: "Invite Friends & Wish Lists",
    title: "แชร์ลิงก์ให้เพื่อนเขียน Wish List",
    description:
      "เพื่อน ๆ เปิดลิงก์เชิญ กรอกความชอบ สิ่งที่ไม่ชอบ อาการแพ้ และ Wish List โดยไม่ต้องสมัครบัญชี แล้วกดยืนยันอีเมล",
    illustration: <WishListGiftStack3D className="h-24 w-24" />,
    accentClass: "border-primary/45 bg-primary/15 text-primary",
  },
  {
    step: "STEP 03",
    enTitle: "Unwrap Your Secret Buddy",
    title: "สุ่มจับคู่ลับและแกะกล่องเปิดผล",
    description:
      "เมื่อถึงเวลาหรือกดสุ่ม ระบบจะส่งลิงก์ส่วนตัวให้ทุกคนทางอีเมล เพื่อเข้ามาแกะกล่องของขวัญดูชื่อ Secret Buddy",
    illustration: <SnowGlobe3D className="h-24 w-24" />,
    accentClass: "border-emerald-400/45 bg-evergreen/75 text-emerald-200",
  },
] as const;

/**
 * Illustrated 3-step Christmas adventure workflow on the landing page.
 */
export function LetterJourney() {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
      <div className="christmas-card-elevated overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
              HOW THE MAGIC WORKS · 3 STEPS
            </span>
            <h2 className="thai-keep mt-1.5 text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
              เริ่มต้นการผจญภัยคริสต์มาสใน 3 ขั้นตอนง่าย ๆ
            </h2>
            <p className="mt-1 text-sm text-text-secondary sm:text-base">
              ตั้งแต่งานปาร์ตี้เริ่มวางแผน จนถึงวินาทีที่ทุกคนแกะกล่องรู้ชื่อ Secret Buddy
            </p>
          </div>
          <span className="font-display-en text-sm font-semibold italic text-primary">
            From Santa&apos;s Workshop to Your Team
          </span>
        </div>

        <ol className="relative mt-8 grid gap-6 md:grid-cols-3 md:gap-7">
          {JOURNEY_STOPS.map((stop, index) => (
            <li
              key={stop.step}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/15 bg-[#0D1E31]/85 p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_36px_-12px_rgba(4,10,20,0.75)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${stop.accentClass}`}
                    >
                      {stop.step}
                    </span>
                    <p className="font-display-en mt-2.5 text-sm font-semibold italic text-primary/90">
                      {stop.enTitle}
                    </p>
                  </div>
                  <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
                    {stop.illustration}
                  </div>
                </div>

                <h3 className="thai-keep mt-3 text-lg font-bold leading-snug text-snow-white">
                  {stop.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {stop.description}
                </p>
              </div>

              {index < JOURNEY_STOPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="mt-5 flex items-center gap-2 border-t border-white/10 pt-3 text-xs font-semibold text-primary/80"
                >
                  <span>ขั้นตอนถัดไป</span>
                  <span>→</span>
                </div>
              )}
              {index === JOURNEY_STOPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="mt-5 flex items-center gap-2 border-t border-white/10 pt-3 text-xs font-semibold text-emerald-300"
                >
                  <span>✨ พร้อมลุ้นความเซอร์ไพรส์!</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
