"use client";

import { useId } from "react";

/** Small page vignettes for the auth & utility pages (same 2.5D SVG language as the tree). */

/** A cabin door with a wreath and a glowing lantern — "welcome back" (login). */
export function LanternDoor({ className = "h-40 w-auto" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" className={`select-none ${className}`}>
      <defs>
        <linearGradient id={id("wood")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a3b22" />
          <stop offset="1" stopColor="#4a2214" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("snow")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfdde6" />
        </linearGradient>
      </defs>
      <ellipse cx={100} cy={206} rx={92} ry={12} fill={`url(#${id("snow")})`} />
      <rect x={42} y={34} width={116} height={170} rx={6} fill="#2a1712" />
      <path d="M 52 204 V 70 Q 100 30 148 70 V 204 Z" fill={`url(#${id("wood")})`} />
      {[70, 90, 110, 130].map((x) => (
        <line key={x} x1={x} y1={60} x2={x} y2={204} stroke="#3a1a10" strokeWidth={1.2} opacity={0.6} />
      ))}
      <circle cx={136} cy={140} r={4} fill="#dcb75e" />
      {/* wreath */}
      <circle cx={100} cy={100} r={22} fill="none" stroke="#1f6443" strokeWidth={11} />
      <circle cx={100} cy={100} r={22} fill="none" stroke="#2f8a5b" strokeWidth={5} strokeDasharray="4 5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle
          key={a}
          cx={100 + 22 * Math.cos((a * Math.PI) / 180)}
          cy={100 + 22 * Math.sin((a * Math.PI) / 180)}
          r={3}
          fill="#e5484d"
        />
      ))}
      <path d="M 92 120 l 8 -6 l 8 6 l -3 14 l -5 -8 l -5 8 Z" fill="#b3262e" />
      {/* lantern */}
      <circle cx={30} cy={110} r={36} fill={`url(#${id("glow")})`} className="glow-pulse" />
      <line x1={30} y1={70} x2={30} y2={88} stroke="#3a2a20" strokeWidth={2} />
      <rect x={20} y={88} width={20} height={6} rx={2} fill="#2b2b2b" />
      <rect x={22} y={94} width={16} height={26} rx={3} fill="#ffd27a" stroke="#2b2b2b" strokeWidth={2} />
      <rect x={20} y={120} width={20} height={5} rx={2} fill="#2b2b2b" />
      {/* snow on the frame */}
      <path d="M 38 36 Q 60 26 100 30 T 162 36 Q 140 44 100 40 T 38 36 Z" fill="#f4f8fa" />
    </svg>
  );
}

/** A snow globe with a tiny tree and a golden key inside — "recover your link". */
export function SnowGlobeKey({ className = "h-40 w-auto" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${uid}-${n}`;
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" className={`select-none ${className}`}>
      <defs>
        <radialGradient id={id("glass")} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.4" stopColor="#a8d4e6" stopOpacity="0.18" />
          <stop offset="1" stopColor="#1a3a4c" stopOpacity="0.45" />
        </radialGradient>
        <linearGradient id={id("base")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a1f26" />
          <stop offset="1" stopColor="#4e1015" />
        </linearGradient>
        <linearGradient id={id("key")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0b8" />
          <stop offset="1" stopColor="#b8892d" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <circle cx={100} cy={92} r={70} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id("clip")})`}>
        <rect x={20} y={10} width={160} height={160} fill="#16304a" />
        <ellipse cx={100} cy={150} rx={80} ry={22} fill="#e9f1f5" />
        <path d="M 62 140 L 74 112 L 68 112 L 78 92 L 72 92 L 82 74 L 92 92 L 86 92 L 96 112 L 90 112 L 102 140 Z" fill="#1d5c3c" />
        <g transform="rotate(-24 128 112)">
          <circle cx={128} cy={96} r={11} fill="none" stroke={`url(#${id("key")})`} strokeWidth={5} />
          <rect x={125.5} y={106} width={5} height={32} rx={2} fill={`url(#${id("key")})`} />
          <rect x={130} y={124} width={8} height={4} fill={`url(#${id("key")})`} />
          <rect x={130} y={131} width={6} height={4} fill={`url(#${id("key")})`} />
        </g>
        {[[50, 50], [140, 40], [80, 30], [120, 70], [60, 90], [150, 100], [100, 60]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2} fill="#fff" opacity={0.85} className="xmas-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </g>
      <circle cx={100} cy={92} r={70} fill={`url(#${id("glass")})`} stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      <path d="M 62 52 Q 72 36 92 30" fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
      <path d="M 44 168 Q 100 150 156 168 L 166 204 Q 100 216 34 204 Z" fill={`url(#${id("base")})`} />
      <path d="M 40 184 Q 100 196 160 184" fill="none" stroke="#dcb75e" strokeWidth={2.5} />
    </svg>
  );
}
