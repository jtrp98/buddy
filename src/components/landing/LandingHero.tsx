"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { christmasButtonClass } from "@/components/ui/buttonStyles";
import { r1, seededRandom } from "@/lib/prng";

/*
 * Landing hero, composed as one picture:
 *   clean night sky behind the copy  →  moon  →  a low distant ridge
 *   →  a snowy hill rising on the right  →  the lit tree standing on it,
 *   with warm light spilling onto the snow, framed by a few dark pines.
 * Nothing decorative sits behind the text. Layers are separate so the tree
 * always stands exactly on the hilltop at every screen width.
 */

const STARS = (() => {
  const rand = seededRandom(31);
  return Array.from({ length: 64 }, (_, i) => ({
    x: r1(rand() * 1440),
    y: r1(rand() * 520),
    r: r1(0.5 + rand() * 1.1),
    o: r1(0.3 + rand() * 0.55),
    twinkle: i % 7 === 0,
    delay: r1(rand() * 5),
  }));
})();

/** Background pines: the same tree illustration, undecorated and dimmed for distance. */
function Pine({ className = "" }: { className?: string }) {
  return <ChristmasTree stage={0} ground={false} star={false} className={`w-auto brightness-[0.55] saturate-[0.75] ${className}`} />;
}

export function LandingHero() {
  const ref = useRef<HTMLElement | null>(null);

  // Very gentle pointer parallax on desktop (sky drifts one way, the tree the other).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", String((e.clientX - r.left) / r.width - 0.5));
        el.style.setProperty("--my", String((e.clientY - r.top) / r.height - 0.5));
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);

  const drift = (depth: number): CSSProperties => ({
    translate: `calc(var(--mx, 0) * ${depth}px) calc(var(--my, 0) * ${depth * 0.5}px)`,
    transition: "translate 700ms var(--ease-soft)",
  });

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#060f20_0%,#0b1a31_40%,#132a44_75%,#1b3a52_100%)] lg:min-h-[min(780px,94vh)]"
    >
      {/* Stars */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMin slice"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        style={drift(-5)}
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff8e7"
            opacity={s.o}
            className={s.twinkle ? "xmas-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}s`, animationDuration: "5s" } : undefined}
          />
        ))}
      </svg>

      {/* Moon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[9%] right-[9%] -z-10 hidden h-16 w-16 rounded-full bg-[radial-gradient(circle_at_38%_36%,#fffdf6,#f4e6c4_70%)] shadow-[0_0_70px_26px_rgba(255,240,205,0.13)] sm:block lg:right-[13%] lg:h-20 lg:w-20"
        style={drift(-8)}
      />

      {/* Ground — phones: hill centred under the tree */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[200px] w-full lg:hidden"
      >
        <defs>
          <linearGradient id="hero-snow-m" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3f7fa" />
            <stop offset="1" stopColor="#c5d5df" />
          </linearGradient>
        </defs>
        <path d="M0 96 C 60 70 110 92 170 74 S 290 66 400 88 L 400 200 L 0 200 Z" fill="#17304a" />
        <path d="M0 150 C 80 146 140 140 200 140 S 330 148 400 152 L 400 200 L 0 200 Z" fill="url(#hero-snow-m)" />
      </svg>

      {/* Ground — desktop: distant ridge, shadowed hill, and the bright hill the tree stands on */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-[300px] w-full lg:block"
      >
        <defs>
          <linearGradient id="hero-snow-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4f8fb" />
            <stop offset="1" stopColor="#c3d3de" />
          </linearGradient>
          <linearGradient id="hero-shade-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5d7a91" />
            <stop offset="1" stopColor="#3f5a70" />
          </linearGradient>
        </defs>
        <path
          d="M0 120 C 120 96 220 112 330 92 S 560 70 700 96 S 980 64 1120 84 S 1340 70 1440 90 L 1440 300 L 0 300 Z"
          fill="#132a42"
        />
        <path d="M0 212 C 260 196 520 200 760 178 S 1160 150 1440 176 L 1440 300 L 0 300 Z" fill="url(#hero-shade-d)" opacity="0.7" />
        <path d="M0 262 C 300 256 640 252 860 238 C 960 230 1000 226 1022 226 C 1110 226 1240 240 1440 248 L 1440 300 L 0 300 Z" fill="url(#hero-snow-d)" />
      </svg>

      {/* Framing pines (edges only, never behind the text) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10">
        <Pine className="absolute bottom-[34px] left-[-18px] h-28 w-auto lg:hidden" />
        <Pine className="absolute right-[-14px] bottom-[30px] h-32 w-auto lg:hidden" />
        <Pine className="absolute right-[3%] bottom-[44px] hidden h-56 w-auto lg:block" />
        <Pine className="absolute right-[10%] bottom-[56px] hidden h-36 w-auto opacity-90 lg:block" />
        <Pine className="absolute left-[56%] bottom-[60px] hidden h-24 w-auto opacity-70 lg:block" />
      </div>

      {/* The tree, standing on the hilltop, with lantern light pooling on the snow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[48px] left-1/2 -z-10 aspect-[300/350] h-[300px] -translate-x-1/2 sm:bottom-[46px] sm:h-[350px] lg:bottom-[52px] lg:left-[71%] lg:h-[min(540px,64vh)]"
      >
        <div className="absolute bottom-[-4%] left-1/2 h-[16%] w-[150%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,206,120,0.42),rgba(255,206,120,0.12)_45%,transparent_70%)]" />
        <div className="relative h-full w-full" style={drift(9)}>
          <ChristmasTree stage={5} ground={false} className="h-full w-full" />
        </div>
      </div>

      {/* Soft fade from the snowfield into the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(13,24,41,0.55)_55%,var(--color-background)_100%)]"
      />

      {/* Copy */}
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-[380px] sm:px-6 sm:pb-[430px] lg:pt-24 lg:pb-56">
        <div className="max-w-xl">
          <p className="rise-in font-script text-2xl text-primary sm:text-3xl">คริสต์มาสนี้ ส่งความลับดี ๆ ให้กัน</p>
          <h1
            id="hero-title"
            className="rise-in thai-keep mt-3 text-4xl leading-[1.15] text-text-primary sm:text-5xl lg:text-6xl"
            style={{ "--rise-delay": "80ms" } as CSSProperties}
          >
            แลกของขวัญแบบลับ ๆ
            <span className="mt-1 block text-primary">กับ Secret Buddy</span>
          </h1>
          <p
            className="rise-in mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg"
            style={{ "--rise-delay": "160ms" } as CSSProperties}
          >
            สร้างปาร์ตี้ แชร์ลิงก์ให้ทุกคนเขียน Wish List แล้วลุ้นเปิดกล่องของขวัญลับไปพร้อมกัน
            ผลจับคู่ถูกเข้ารหัส แม้แต่ผู้จัดก็ไม่รู้ว่าใครได้ใคร
          </p>
          <p
            className="rise-in mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted"
            style={{ "--rise-delay": "200ms" } as CSSProperties}
          >
            <span>เล่นได้ทุกกลุ่ม</span>
            {["เพื่อนสนิท", "ครอบครัว", "ห้องเรียน", "ชมรม", "ที่ทำงาน"].map((g) => (
              <span key={g} className="rounded-full border border-white/12 px-2.5 py-0.5 text-text-secondary">
                {g}
              </span>
            ))}
          </p>

          <div
            className="rise-in mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ "--rise-delay": "240ms" } as CSSProperties}
          >
            <Link href="/admin/register" className={christmasButtonClass("primary", "lg", "w-full sm:w-auto")}>
              <Gift className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>สร้างกิจกรรมฟรี</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
            <a href="#reveal-preview" className={christmasButtonClass("secondary", "lg", "w-full sm:w-auto")}>
              ลองเปิดกล่องตัวอย่าง
            </a>
          </div>

          <p
            className="rise-in mt-7 text-sm text-text-muted"
            style={{ "--rise-delay": "320ms" } as CSSProperties}
          >
            เป็นผู้จัดอยู่แล้ว?{" "}
            <Link href="/admin/login" className="font-semibold text-text-secondary underline decoration-white/25 underline-offset-4 hover:text-text-primary">
              เข้าสู่ระบบ
            </Link>
            <span aria-hidden="true" className="mx-2.5 text-text-muted/60">·</span>
            <Link href="/recover" className="font-semibold text-text-secondary underline decoration-white/25 underline-offset-4 hover:text-text-primary">
              ขอลิงก์ส่วนตัวใหม่
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
