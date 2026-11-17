"use client";

import { useRef, useState } from "react";
import { Gift, RotateCcw } from "lucide-react";
import {
  InteractiveGiftBox3D,
  MagicalSparkleBurst,
} from "@/components/illustrations/ChristmasIllustrations";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

type Stage = "idle" | "untying" | "opening" | "open";

const SAMPLE = [
  { label: "งบประมาณ", value: "300–500 บาท" },
  { label: "สิ่งที่ชอบ", value: "กาแฟคั่วกลาง, ต้นไม้จิ๋ว" },
  { label: "Wish List", value: "แก้วเก็บความเย็นสีเขียวเข้ม หรือเมล็ดกาแฟดริป" },
  { label: "ควรหลีกเลี่ยง", value: "น้ำหอมกลิ่นแรง" },
] as const;

/** A try-it-yourself version of the Buddy reveal, with sample (not real) data. */
export function RevealPreview() {
  const { triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const [stage, setStage] = useState<Stage>("idle");
  const [burst, setBurst] = useState(false);
  const letterRef = useRef<HTMLHeadingElement | null>(null);

  const open = () => {
    triggerClickSound();
    if (stage === "open") {
      setStage("idle");
      return;
    }
    if (stage !== "idle") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStage("open");
      return;
    }
    setStage("untying");
    window.setTimeout(() => setStage("opening"), 300);
    window.setTimeout(() => {
      setStage("open");
      setBurst(true);
      triggerChimeSound();
      letterRef.current?.focus({ preventScroll: true });
    }, 900);
    window.setTimeout(() => setBurst(false), 2400);
  };

  const isOpen = stage === "open";

  return (
    <section
      id="reveal-preview"
      aria-labelledby="reveal-title"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6 sm:pt-32"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="font-script text-2xl text-primary">ช่วงเวลาที่ทุกคนรอ</p>
          <h2 id="reveal-title" className="thai-keep mt-1 text-3xl text-text-primary sm:text-4xl">
            แกะกล่อง แล้วรู้ว่าคุณต้องดูแลใคร
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-text-secondary">
            หลังจับคู่ ทุกคนได้ลิงก์ส่วนตัวทางอีเมล เปิดแล้วจะเจอกล่องของขวัญที่ซ่อนชื่อ Buddy พร้อม Wish List
            สิ่งที่ชอบ และสิ่งที่ควรหลีกเลี่ยง ลองกดกล่องข้าง ๆ ดูได้เลย
          </p>

          <div className="relative mt-8 flex flex-col items-center sm:items-start">
            <MagicalSparkleBurst active={burst} />
            <button
              type="button"
              onClick={open}
              aria-expanded={isOpen}
              aria-controls="reveal-sample-letter"
              className="group relative rounded-3xl p-2"
            >
              <span className="sr-only">{isOpen ? "ปิดกล่องตัวอย่าง" : "เปิดกล่องของขวัญตัวอย่าง"}</span>
              <span
                aria-hidden="true"
                className="absolute inset-6 -z-10 rounded-full bg-[radial-gradient(circle,rgba(255,210,122,0.35),transparent_70%)] blur-xl transition-opacity duration-700 group-hover:opacity-100"
                style={{ opacity: isOpen ? 1 : 0.5 }}
              />
              <InteractiveGiftBox3D
                tone="red"
                stage={stage}
                className="h-48 w-48 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-2deg] sm:h-56 sm:w-56"
              />
            </button>
            <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {isOpen ? (
                <>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> กดอีกครั้งเพื่อปิดกล่อง
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" aria-hidden="true" /> กดที่กล่องเพื่อเปิด
                </>
              )}
            </span>
          </div>
        </div>

        <div
          id="reveal-sample-letter"
          className={`theme-paper relative rounded-[1.6rem] p-7 transition-all duration-700 sm:p-10 ${
            isOpen ? "translate-y-0 rotate-0" : "translate-y-3 rotate-1"
          }`}
          aria-live="polite"
        >
          <div aria-hidden="true" className="paper-frame" />
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">ตัวอย่าง · Sample</p>
          <h3
            ref={letterRef}
            tabIndex={-1}
            className="mt-3 font-display text-2xl text-text-primary outline-none sm:text-3xl"
          >
            {isOpen ? "Buddy ของคุณคือ คุณต้น" : "Buddy ของคุณคือ ••••••"}
          </h3>
          <p className="mt-1 font-script text-xl text-christmas-red-light">ดูแลเขาดี ๆ นะ ซานต้าตัวจริง</p>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {SAMPLE.map((row) => (
              <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-3 py-3 text-sm">
                <dt className="font-semibold text-text-muted">{row.label}</dt>
                <dd className="text-text-primary">{isOpen ? row.value : "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-xs text-text-muted">ข้อมูลตัวอย่างเพื่อสาธิตเท่านั้น</p>
          {!isOpen && (
            <div
              aria-hidden="true"
              className="absolute top-6 right-6 flex h-14 w-14 rotate-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#d44a4f,#84191f)] text-[10px] font-bold text-ivory shadow-[0_4px_10px_rgba(132,25,31,0.45)]"
            >
              SECRET
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
