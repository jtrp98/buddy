import { PostageStamp } from "@/components/AnalogPrimitives";
import { Ornament, type OrnamentName } from "@/components/vintage/Ornament";

const JOURNEY_STOPS: ReadonlyArray<{
  step: string;
  title: string;
  description: string;
  vignette: Extract<OrnamentName, "quill" | "letters" | "mailbox">;
  toneClass: string;
  stampRingClass: string;
}> = [
  {
    step: "01",
    title: "ตั้งกลุ่มและงบของขวัญ",
    description:
      "เลือกงบตายตัว งบแบบช่วง งบขั้นต่ำ หรือไม่จำกัดงบ พร้อมตั้งเวลาปิดรับสมัครเวลาไทย",
    vignette: "quill",
    toneClass: "text-xmas-red border-xmas-red/45",
    stampRingClass: "border-xmas-red text-xmas-red bg-paper",
  },
  {
    step: "02",
    title: "แชร์ลิงก์ให้เพื่อนลงทะเบียน",
    description:
      "เพื่อนกรอก Buddy Profile เลือกความชอบ สี อาหาร สิ่งที่แพ้ และ Wish List แล้วกดยืนยันอีเมล",
    vignette: "letters",
    toneClass: "text-gold-ink border-gold-ink/45",
    stampRingClass: "border-gold-ink text-gold-ink bg-paper",
  },
  {
    step: "03",
    title: "สุ่มและส่งซองลับทางอีเมล",
    description:
      "สมาชิกกดลิงก์ส่วนตัวจากอีเมลเพื่อแกะผนึกดู Buddy ของตัวเองได้ทันทีแบบเป็นความลับ",
    vignette: "mailbox",
    toneClass: "text-pine border-pine/45",
    stampRingClass: "border-pine text-pine bg-paper",
  },
];

/**
 * Three-stop North Pole postal journey explaining the workflow.
 * Horizontal airmail route on desktop/tablet; clean left-rail timeline on mobile.
 */
export function LetterJourney() {
  return (
    <section className="mx-auto mt-14 max-w-5xl px-4">
      <div className="analog-card printed-double-rule rounded-md p-6 sm:p-10">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-rule pb-6">
          <div>
            <span className="font-type text-[11px] tracking-[0.18em] text-pine uppercase">
              HOW IT WORKS · 3 STOPS
            </span>
            <h2 className="thai-keep letterpress mt-1 font-display text-2xl leading-[1.35] text-ink sm:text-3xl">
              เส้นทางของจดหมายจากขั้วโลกเหนือ
            </h2>
          </div>
          <PostageStamp
            topText="SANTA"
            mainText="3 STEPS"
            bottomText="READY"
            tone="green"
            vignette="horn"
          />
        </div>

        {/* Desktop & Tablet Horizontal Route */}
        <div className="relative z-10 mt-9 hidden md:block">
          {/* Dashed airmail connector line linking the 3 stamp stations */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-11 right-[16%] left-[16%] border-t-2 border-dashed border-xmas-red/35"
          />

          <div className="grid grid-cols-3 gap-7">
            {JOURNEY_STOPS.map((stop) => (
              <div key={stop.step} className="relative flex flex-col items-center text-center">
                {/* Perforated Station Stamp */}
                <div className="relative">
                  <div className="stamp-shadow">
                    <div className="stamp-perforated bg-paper p-[6px]">
                      <div
                        className={`flex h-20 w-24 items-center justify-center border ${stop.toneClass}`}
                      >
                        <Ornament name={stop.vignette} className="h-12 w-12" />
                      </div>
                    </div>
                  </div>
                  {/* Circular Stop Postmark */}
                  <span
                    className={`absolute -top-2.5 -right-3 flex h-10 w-10 rotate-6 items-center justify-center rounded-full border-2 border-dashed font-type text-[11px] font-bold shadow-xs ${stop.stampRingClass}`}
                  >
                    {stop.step}
                  </span>
                </div>

                <h3 className="thai-keep mt-5 font-serif text-lg font-bold leading-[1.45] text-ink">
                  {stop.title}
                </h3>
                <p className="mt-2 text-sm leading-[1.75] text-ink-soft">
                  {stop.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Left-Rail Postal Route */}
        <div className="relative z-10 mt-7 space-y-6 md:hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-8 bottom-10 left-[41px] border-l-2 border-dashed border-xmas-red/35"
          />

          {JOURNEY_STOPS.map((stop) => (
            <div key={stop.step} className="relative flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="stamp-shadow">
                  <div className="stamp-perforated bg-paper p-[5px]">
                    <div
                      className={`flex h-16 w-[74px] items-center justify-center border ${stop.toneClass}`}
                    >
                      <Ornament name={stop.vignette} className="h-9 w-9" />
                    </div>
                  </div>
                </div>
                <span
                  className={`absolute -top-2 -right-2 flex h-7 w-7 rotate-6 items-center justify-center rounded-full border border-dashed font-type text-[10px] font-bold ${stop.stampRingClass}`}
                >
                  {stop.step}
                </span>
              </div>

              <div className="pt-0.5">
                <h3 className="thai-keep font-serif text-base font-bold leading-[1.45] text-ink">
                  {stop.title}
                </h3>
                <p className="mt-1 text-sm leading-[1.7] text-ink-soft">
                  {stop.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
