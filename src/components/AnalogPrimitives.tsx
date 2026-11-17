"use client";

import { useId, type ReactNode } from "react";
import { Snowflake, Volume2, VolumeX } from "lucide-react";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { Ornament, type OrnamentName } from "@/components/vintage/Ornament";

/**
 * Diagonal festive holiday border ribbon (Christmas Red / Warm Snow / Evergreen).
 */
export function CandyStripeBar({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`candy-stripe-bar h-1.5 w-full ${className}`} />;
}

/**
 * Decorative postal tape accent.
 */
export function WashiTape({
  tone = "gold",
  className = "",
}: {
  tone?: "red" | "green" | "gold";
  className?: string;
}) {
  const tintClass = {
    red: "bg-christmas-red/85 border-white/25",
    green: "bg-evergreen/95 border-primary/40",
    gold: "bg-primary/85 border-primary-foreground/30",
  }[tone];

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-3 w-12 rounded-[2px] border shadow-sm ${tintClass} ${className}`}
    />
  );
}

/**
 * Tactile 3D SVG melted wax seal badge for step marks, cards, and envelopes.
 */
export function WaxSeal({
  children,
  tone = "red",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  tone?: "red" | "green" | "gold";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `wax-grad-${uid}`;

  const stops = {
    red: { hi: "#E44A58", mid: "#C62838", rim: "#72111C", text: "text-snow-white" },
    green: { hi: "#266D5A", mid: "#123D32", rim: "#09211B", text: "text-snow-white" },
    gold: { hi: "#FAE09D", mid: "#E8C47A", rim: "#9D752A", text: "text-primary-foreground" },
  }[tone];

  const sizeClass = {
    sm: "h-10 w-10 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  }[size];

  return (
    <span
      className={`relative inline-flex shrink-0 select-none items-center justify-center drop-shadow-[0_6px_12px_rgba(4,10,20,0.5)] ${sizeClass} ${stops.text} ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={stops.hi} />
            <stop offset="55%" stopColor={stops.mid} />
            <stop offset="100%" stopColor={stops.rim} />
          </radialGradient>
        </defs>
        <path
          d="M32 3c5.6 0 9.4 2.4 13.7 4.2 4.1 1.7 8.4 3.5 11 7.2 2.7 3.8 2.8 8.3 3.9 12.6 1 4.1 2.2 8.2.4 12.2-1.7 3.8-4.7 6.5-7.4 9.7-2.9 3.4-5.4 7.7-9.7 9.4-4.2 1.6-8.8.4-13.2.5-4.3.1-8.7 1.3-12.5-.6-4-2-6.1-6.2-8.7-9.7-2.4-3.3-5.8-6.4-6.4-10.5-.7-4.5 1.8-8.7 2.8-13.1.9-4.1.6-8.8 3.2-12.1 2.6-3.4 7-4.3 10.9-5.9C23.9 5 27.6 3 32 3Z"
          fill={`url(#${gradId})`}
          stroke={stops.rim}
          strokeWidth="1"
        />
        <circle
          cx="32"
          cy="32"
          r="20.5"
          fill="none"
          stroke={stops.rim}
          strokeWidth="1.4"
          opacity="0.7"
        />
        <circle
          cx="32"
          cy="32"
          r="19"
          fill="none"
          stroke={stops.hi}
          strokeWidth="0.9"
          opacity="0.55"
        />
      </svg>
      <span className="relative z-10 flex items-center justify-center font-bold">
        {children}
      </span>
    </span>
  );
}

/**
 * High-contrast perforated North Pole stamp badge.
 */
export function PostageStamp({
  topText = "NORTH POLE",
  mainText = "25 DEC",
  bottomText = "SECRET POST",
  tone = "red",
  vignette = "none",
  className = "",
}: {
  topText?: string;
  mainText?: string;
  bottomText?: string;
  tone?: "red" | "green";
  vignette?: Extract<OrnamentName, "tree" | "horn" | "star"> | "none";
  className?: string;
}) {
  const color =
    tone === "red"
      ? "border-christmas-red/75 text-christmas-red"
      : "border-evergreen/80 text-evergreen";

  return (
    <div className={`stamp-shadow inline-block select-none ${className}`}>
      <div className="stamp-perforated bg-snow-white p-[5px]">
        <div
          className={`flex min-w-[82px] flex-col items-center justify-center border px-2.5 py-2 text-center ${color}`}
        >
          <span className="text-[9px] font-bold tracking-[0.14em] uppercase">
            {topText}
          </span>
          {vignette !== "none" && (
            <Ornament name={vignette} className="my-1 h-5 w-5" />
          )}
          <span className="my-0.5 text-sm font-extrabold leading-tight tracking-tight">
            {mainText}
          </span>
          <span className="text-[8.5px] font-semibold tracking-[0.1em] uppercase opacity-90">
            {bottomText}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Draped SVG garland of warm glowing Christmas lights seated cleanly below the navbar.
 */
export function FestiveStringLights() {
  const { festiveFx } = useFestiveAtmosphere();
  const bulbs = [
    { left: "4.5%", y: 8.5, color: "#E8C47A", core: "#FFF9E6", glow: "rgba(232, 196, 122, 0.72)", delay: "0s" },
    { left: "12.5%", y: 12.5, color: "#D93546", core: "#FFD6DA", glow: "rgba(217, 53, 70, 0.65)", delay: "0.4s" },
    { left: "20.5%", y: 8.5, color: "#34D399", core: "#D8F6E8", glow: "rgba(52, 211, 153, 0.58)", delay: "0.9s" },
    { left: "29.5%", y: 8.5, color: "#DCEFF5", core: "#FFFFFF", glow: "rgba(220, 239, 245, 0.7)", delay: "1.4s" },
    { left: "37.5%", y: 12.5, color: "#E8C47A", core: "#FFF9E6", glow: "rgba(232, 196, 122, 0.72)", delay: "0.2s" },
    { left: "45.5%", y: 8.5, color: "#D93546", core: "#FFD6DA", glow: "rgba(217, 53, 70, 0.65)", delay: "0.8s" },
    { left: "54.5%", y: 8.5, color: "#34D399", core: "#D8F6E8", glow: "rgba(52, 211, 153, 0.58)", delay: "1.3s" },
    { left: "62.5%", y: 12.5, color: "#E8C47A", core: "#FFF9E6", glow: "rgba(232, 196, 122, 0.72)", delay: "0.5s" },
    { left: "70.5%", y: 8.5, color: "#DCEFF5", core: "#FFFFFF", glow: "rgba(220, 239, 245, 0.7)", delay: "1.0s" },
    { left: "79.5%", y: 8.5, color: "#D93546", core: "#FFD6DA", glow: "rgba(217, 53, 70, 0.65)", delay: "0.3s" },
    { left: "87.5%", y: 12.5, color: "#34D399", core: "#D8F6E8", glow: "rgba(52, 211, 153, 0.58)", delay: "0.7s" },
    { left: "95.5%", y: 8.5, color: "#E8C47A", core: "#FFF9E6", glow: "rgba(232, 196, 122, 0.72)", delay: "1.2s" },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-10 w-full overflow-hidden bg-transparent leading-none"
    >
      <svg
        viewBox="0 0 1000 32"
        preserveAspectRatio="none"
        className="block h-8 w-full"
      >
        <path
          d="M0,3 Q125,21 250,3 Q375,21 500,3 Q625,21 750,3 Q875,21 1000,3"
          fill="none"
          stroke="rgba(232, 196, 122, 0.32)"
          strokeWidth="1.5"
        />
      </svg>

      {bulbs.map((b, i) => (
        <svg
          key={i}
          viewBox="0 0 18 24"
          className={`absolute -translate-x-1/2 ${festiveFx ? "fairy-bulb" : ""}`}
          style={{
            left: b.left,
            top: `${b.y - 1}px`,
            width: "16px",
            height: "21px",
            animationDelay: b.delay,
            filter: festiveFx ? `drop-shadow(0 0 8px ${b.glow})` : undefined,
          }}
        >
          <rect
            x="5.5"
            y="0"
            width="7"
            height="4.4"
            rx="1"
            fill="#E8C47A"
            stroke="#101E2E"
            strokeWidth="0.8"
          />
          <path
            d="M9,4 C13.5,4 15,10 13.2,14.5 C11.8,18.2 10.2,21 9,21.5 C7.8,21 6.2,18.2 4.8,14.5 C3,10 4.5,4 9,4 Z"
            fill={b.color}
            stroke="rgba(255,249,240,0.75)"
            strokeWidth="0.85"
          />
          <ellipse
            cx="8.2"
            cy="11"
            rx="2.1"
            ry="3.8"
            fill={b.core}
            opacity="0.78"
          />
        </svg>
      ))}
    </div>
  );
}

/**
 * Accessible switches for toggling snowfall/lights and sound effects.
 */
export function FestiveToggleSwitches() {
  const { festiveFx, toggleFestiveFx, soundEnabled, toggleSound } = useFestiveAtmosphere();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleFestiveFx}
        title={festiveFx ? "ปิดหิมะและไฟประดับ" : "เปิดหิมะและไฟประดับ"}
        aria-label={festiveFx ? "ปิดหิมะและไฟประดับ" : "เปิดหิมะและไฟประดับ"}
        aria-pressed={festiveFx}
        className={`analog-btn inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 text-xs font-semibold sm:px-3 ${
          festiveFx
            ? "border-primary/50 bg-surface-elevated/90 text-primary shadow-[0_0_14px_rgba(232,196,122,0.18)]"
            : "border-border bg-surface text-text-secondary"
        }`}
      >
        <Snowflake
          className={`h-4 w-4 shrink-0 ${festiveFx ? "text-ice-blue" : ""}`}
          aria-hidden="true"
        />
        <span className="hidden md:inline">{festiveFx ? "หิมะ ON" : "หิมะ OFF"}</span>
      </button>

      <button
        type="button"
        onClick={toggleSound}
        title={soundEnabled ? "ปิดเสียงเอฟเฟกต์" : "เปิดเสียงเอฟเฟกต์"}
        aria-label={soundEnabled ? "ปิดเสียงเอฟเฟกต์" : "เปิดเสียงเอฟเฟกต์"}
        aria-pressed={soundEnabled}
        className={`analog-btn inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 text-xs font-semibold sm:px-3 ${
          soundEnabled
            ? "border-emerald-400/50 bg-evergreen/80 text-emerald-200"
            : "border-border bg-surface text-text-secondary"
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <VolumeX className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span className="hidden md:inline">{soundEnabled ? "เสียง ON" : "เสียง OFF"}</span>
      </button>
    </div>
  );
}
