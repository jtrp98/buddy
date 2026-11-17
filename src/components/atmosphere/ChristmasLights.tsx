"use client";

import { useEffect, useRef, useState } from "react";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { COLOR_COUNT, TICK_MS, inRipple, isLit, patternAt } from "@/lib/light-patterns";

/** Bulb colours: glass when off, glass when lit, the hot filament centre, and the halo. */
const COLORS = [
  { off: "#5a1c20", on: "#ff4b47", hot: "#ffd2c4", halo: "255,80,70" },
  { off: "#163f2a", on: "#2fd27a", hot: "#d6ffe6", halo: "70,225,135" },
  { off: "#5a4413", on: "#ffbf2e", hot: "#fff4c7", halo: "255,195,70" },
  { off: "#16284d", on: "#4a90ff", hot: "#dbe8ff", halo: "90,150,255" },
  { off: "#5a2a45", on: "#ff6fb5", hot: "#ffe0f0", halo: "255,110,180" },
] as const;

// Round globe bulb hanging from a small socket.
const GLASS_CX = 10;
const GLASS_CY = 18.5;
const GLASS_R = 9.2;

interface BulbPos {
  x: number;
  y: number;
  angle: number;
}

/**
 * Lay the wire out in drooping swags, then hang bulbs at an even spacing along
 * the whole string (independent of where the swags start and end).
 */
function layout(width: number) {
  const narrow = width < 640;
  const spacing = narrow ? 58 : 82;
  const swagW = narrow ? 150 : 230;
  const sag = narrow ? 8 : 11;
  const swags = Math.max(2, Math.round(width / swagW));
  const segW = width / swags;
  const top = 3;
  let d = `M 0 ${top}`;
  for (let s = 0; s < swags; s++) {
    const x0 = s * segW;
    d += ` Q ${x0 + segW / 2} ${top + sag * 2} ${x0 + segW} ${top}`;
  }
  const count = Math.max(1, Math.floor(width / spacing));
  const gap = width / count;
  const bulbs: BulbPos[] = [];
  for (let k = 0; k < count; k++) {
    const x = gap * (k + 0.5);
    const t = (x % segW) / segW;
    const y = top + 4 * sag * t * (1 - t);
    const slope = (4 * sag * (1 - 2 * t)) / segW;
    bulbs.push({ x, y, angle: ((Math.atan(slope) * 180) / Math.PI) * 0.55 });
  }
  return { d, bulbs };
}

/**
 * A real string of Christmas lights under the navbar. A little controller cycles
 * through light shows (twinkle, alternate, chase, fill, colours, wave, sparkle).
 * Hover a bulb to make it swing; click one to send a ripple of light along the
 * string; click quickly five times for a short party.
 */
export function ChristmasLights() {
  const { festiveFx, boostSnow, triggerClickSound, triggerChimeSound } = useFestiveAtmosphere();
  const reducedMotion = usePrefersReducedMotion();
  const stripRef = useRef<HTMLDivElement | null>(null);
  const bulbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rippleRef = useRef<{ origin: number; t0: number } | null>(null);
  const partyUntilRef = useRef(0);
  const clicksRef = useRef<number[]>([]);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { d, bulbs } = width > 0 ? layout(width) : { d: "", bulbs: [] as BulbPos[] };
  const count = bulbs.length;
  const animate = festiveFx && !reducedMotion;

  // The light controller: one interval drives every bulb by writing data-on directly.
  useEffect(() => {
    const els = bulbRefs.current.slice(0, count);
    if (!animate) {
      els.forEach((el) => el?.setAttribute("data-on", "1"));
      return;
    }
    let step = 0;
    const tick = () => {
      if (document.hidden) return;
      const now = performance.now();
      const party = now < partyUntilRef.current;
      const pattern = party ? "party" : patternAt(step);
      const ripple = rippleRef.current;
      const rippleElapsed = ripple ? now - ripple.t0 : Infinity;
      if (ripple && rippleElapsed > 2200) rippleRef.current = null;
      els.forEach((el, i) => {
        if (!el) return;
        let on = isLit(pattern, i, count, step);
        if (ripple && rippleElapsed < 2200) {
          on = inRipple(i, ripple.origin, rippleElapsed) || (i === ripple.origin && rippleElapsed < 900);
        }
        el.setAttribute("data-on", on ? "1" : "0");
      });
      stripRef.current?.setAttribute("data-party", party ? "1" : "0");
      step++;
    };
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [animate, count]);

  // `now` is the click event's timeStamp (same clock as performance.now()).
  const handleBulbClick = (i: number, now: number) => {
    if (!animate) return;
    rippleRef.current = { origin: i, t0: now };
    clicksRef.current = [...clicksRef.current.filter((t) => now - t < 2500), now];
    if (clicksRef.current.length >= 5) {
      clicksRef.current = [];
      partyUntilRef.current = now + 3600;
      rippleRef.current = null;
      boostSnow(3600);
      triggerChimeSound();
    } else {
      triggerClickSound();
    }
  };

  return (
    <div
      ref={stripRef}
      aria-hidden="true"
      data-animate={animate ? "1" : "0"}
      className="xl-strip pointer-events-none relative h-12 w-full select-none"
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          {COLORS.map((c, ci) => (
            <radialGradient key={ci} id={`xl-on-${ci}`} cx="45%" cy="62%" r="55%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.22" stopColor={c.hot} />
              <stop offset="0.62" stopColor={c.on} />
              <stop offset="1" stopColor={c.off} />
            </radialGradient>
          ))}
          <linearGradient id="xl-socket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0d2a1c" />
            <stop offset="0.45" stopColor="#2b5a3e" />
            <stop offset="1" stopColor="#0a1f15" />
          </linearGradient>
        </defs>
      </svg>

      {d && (
        <svg width={width} height={48} className="absolute inset-x-0 top-0 overflow-visible">
          <path d={d} fill="none" stroke="#06150e" strokeWidth={2.4} strokeLinecap="round" />
          <path d={d} fill="none" stroke="#1d4a32" strokeWidth={1} strokeLinecap="round" strokeDasharray="3 3" />
        </svg>
      )}

      {bulbs.map((b, i) => {
        const c = COLORS[i % COLOR_COUNT];
        return (
          <div
            key={i}
            ref={(el) => {
              bulbRefs.current[i] = el;
            }}
            data-on="1"
            onClick={(e) => handleBulbClick(i, e.timeStamp)}
            className="xl-bulb pointer-events-auto absolute cursor-pointer"
            style={
              {
                left: b.x,
                top: b.y - 1,
                "--rot": `${b.angle}deg`,
                "--halo": c.halo,
                animationDelay: `${-(i % 7) * 0.6}s`,
              } as React.CSSProperties
            }
          >
            <span className="xl-halo" />
            <svg viewBox="0 0 20 28" className="xl-svg">
              {/* socket */}
              <rect x="6.6" y="0" width="6.8" height="9.5" rx="1.4" fill="url(#xl-socket)" />
              <path d="M6.6 3.2 H13.4 M6.6 6 H13.4" stroke="#06150e" strokeWidth="0.7" opacity="0.7" />
              {/* glass: dark when off, the lit version fades in on top */}
              <circle cx={GLASS_CX} cy={GLASS_CY} r={GLASS_R} fill={c.off} />
              <circle cx={GLASS_CX} cy={GLASS_CY} r={GLASS_R} fill={`url(#xl-on-${i % COLOR_COUNT})`} className="xl-lit" />
              {/* reflections */}
              <path d="M5 16.5 A 6 6 0 0 1 9 12.6" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="13.2" cy="22.2" r="1.1" fill="#fff" opacity="0.3" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
