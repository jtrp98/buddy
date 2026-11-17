"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    title: "สร้างปาร์ตี้",
    description: "ตั้งชื่อกิจกรรม งบของขวัญ และวันปิดรับสมัคร ใช้เวลาไม่ถึงนาที",
    color: "#e5484d",
  },
  {
    title: "ชวนเพื่อนมาที่ต้นไม้",
    description: "แชร์ลิงก์เชิญ เพื่อนกรอก Wish List และยืนยันอีเมล ไม่ต้องสมัครบัญชี",
    color: "#dcb75e",
  },
  {
    title: "จับคู่ลับ แล้วเปิดกล่อง",
    description: "ระบบสุ่มแบบไม่มีใครได้ตัวเอง ส่งลิงก์เปิดกล่องของขวัญลับให้ทุกคนทางอีเมล",
    color: "#7fd6a0",
  },
] as const;

/**
 * "How it works" told as three baubles hanging from one garland. Each bauble
 * lights up as it scrolls into view.
 */
export function HowItWorks() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLit(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-script text-2xl text-primary">สามขั้นตอนง่าย ๆ</p>
        <h2 id="how-title" className="thai-keep mt-1 text-3xl text-text-primary sm:text-4xl">
          จากลิงก์เชิญ สู่กล่องของขวัญลับ
        </h2>
      </div>

      <div ref={ref} className="relative mt-12" data-lit={lit}>
        {/* The garland the baubles hang from (desktop) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 80"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 hidden h-20 w-full md:block"
        >
          <path d="M0 10 Q 166 70 333 22 T 666 22 T 1000 10" fill="none" stroke="#1d4d3c" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M0 10 Q 166 70 333 22 T 666 22 T 1000 10"
            fill="none"
            stroke="#f3d27a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="0.1 9"
            className="transition-opacity duration-1000"
            style={{ opacity: lit ? 1 : 0.25 }}
          />
        </svg>

        <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col items-center text-center md:pt-6">
              <div
                aria-hidden="true"
                className="relative flex flex-col items-center transition-[filter,opacity] duration-1000"
                style={{
                  transitionDelay: `${i * 380}ms`,
                  opacity: lit ? 1 : 0.35,
                  filter: lit ? "none" : "saturate(0.15)",
                }}
              >
                <span className="hidden h-10 w-px bg-primary/50 md:block" style={{ height: i === 1 ? 16 : 40 }} />
                <span className="h-3 w-5 rounded-t-md bg-[linear-gradient(180deg,#f3d27a,#a9873a)]" />
                <span
                  className="gentle-sway ambient-motion relative flex h-24 w-24 items-center justify-center rounded-full font-display text-4xl text-white shadow-[inset_-10px_-14px_24px_rgba(0,0,0,0.35),inset_8px_8px_18px_rgba(255,255,255,0.35)]"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, #ffffffcc 0 8%, ${step.color} 26%, color-mix(in srgb, ${step.color} 55%, #000) 100%)`,
                    boxShadow: lit
                      ? `0 0 46px -6px ${step.color}, inset -10px -14px 24px rgba(0,0,0,0.35), inset 8px 8px 18px rgba(255,255,255,0.35)`
                      : undefined,
                    animationDelay: `${-i * 1.3}s`,
                  }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="thai-keep mt-6 font-display text-2xl text-text-primary">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-secondary sm:text-base">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
