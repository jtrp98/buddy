"use client";

import { useId, type ReactNode } from "react";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { Ornament, type OrnamentName } from "@/components/vintage/Ornament";

/**
 * Diagonal 1950s airmail border ribbon (christmas red / paper / pine green).
 */
export function CandyStripeBar({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`candy-stripe-bar h-2 w-full ${className}`} />;
}

/**
 * Gummed kraft paper stationery tape pinned to archival card corners.
 * Preserves component name & API for compatibility across pages.
 */
export function WashiTape({
  tone = "red",
  className = "",
}: {
  tone?: "red" | "green" | "gold";
  className?: string;
}) {
  const tintClass = {
    red: "bg-xmas-red/18 border-xmas-red/30",
    green: "bg-pine/18 border-pine/30",
    gold: "bg-kraft/85 border-ink/20",
  }[tone];

  return (
    <span
      aria-hidden="true"
      className={`gummed-tape pointer-events-none inline-block h-3.5 w-14 rounded-[1px] ${tintClass} ${className}`}
    />
  );
}

/**
 * Tactile SVG melted wax seal badge for step marks, cards, and envelopes.
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
    red: { hi: "#b83b3d", mid: "#8e2527", rim: "#5a1416", text: "text-paper" },
    green: { hi: "#295a4f", mid: "#193c34", rim: "#0c201b", text: "text-paper" },
    gold: { hi: "#d8bc82", mid: "#b59659", rim: "#7a5f2a", text: "text-ink" },
  }[tone];

  const sizeClass = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
  }[size];

  return (
    <span
      className={`relative inline-flex shrink-0 select-none items-center justify-center drop-shadow-[0_2px_4px_rgba(70,53,44,0.34)] ${sizeClass} ${stops.text} ${className}`}
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
        {/* Organic hand-poured melted wax silhouette */}
        <path
          d="M32 3c5.6 0 9.4 2.4 13.7 4.2 4.1 1.7 8.4 3.5 11 7.2 2.7 3.8 2.8 8.3 3.9 12.6 1 4.1 2.2 8.2.4 12.2-1.7 3.8-4.7 6.5-7.4 9.7-2.9 3.4-5.4 7.7-9.7 9.4-4.2 1.6-8.8.4-13.2.5-4.3.1-8.7 1.3-12.5-.6-4-2-6.1-6.2-8.7-9.7-2.4-3.3-5.8-6.4-6.4-10.5-.7-4.5 1.8-8.7 2.8-13.1.9-4.1.6-8.8 3.2-12.1 2.6-3.4 7-4.3 10.9-5.9C23.9 5 27.6 3 32 3Z"
          fill={`url(#${gradId})`}
          stroke={stops.rim}
          strokeWidth="1"
        />
        {/* Recessed stamp inner ring */}
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
      <span className="relative z-10 flex items-center justify-center font-serif font-bold drop-shadow-[0_1px_0_rgba(0,0,0,0.28)]">
        {children}
      </span>
    </span>
  );
}

/**
 * Authentic 1950s perforated postage stamp with engraved line vignette.
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
      ? "border-xmas-red/60 text-xmas-red"
      : "border-pine/60 text-pine";

  return (
    <div className={`stamp-shadow inline-block select-none ${className}`}>
      <div className="stamp-perforated bg-paper p-[5px]">
        <div
          className={`flex min-w-[78px] flex-col items-center justify-center border px-2.5 py-2 text-center ${color}`}
        >
          <span className="font-type text-[8px] font-bold tracking-[0.18em] uppercase opacity-85">
            {topText}
          </span>
          {vignette !== "none" && (
            <Ornament name={vignette} className="my-1 h-5 w-5 opacity-90" />
          )}
          <span className="my-0.5 font-serif text-sm font-bold leading-tight tracking-tight">
            {mainText}
          </span>
          <span className="font-type text-[7.5px] tracking-[0.14em] uppercase opacity-75">
            {bottomText}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Draped SVG garland of 1950s C9 bulbs seated cleanly below the sticky navbar.
 * Uses explicit downward Q swags, percentage-anchored luminous bulbs, and warm glow halos.
 */
export function FestiveStringLights() {
  const { festiveFx } = useFestiveAtmosphere();
  // Exact points on M0,3 Q125,20 250,3 Q375,20 500,3 Q625,20 750,3 Q875,20 1000,3
  // y(t) = 3 + 34 * t * (1 - t) for 250px swag segments
  const bulbs = [
    { left: "4.5%", y: 8.0, color: "#C93B3B", core: "#FFD9BA", glow: "rgba(225, 86, 72, 0.55)", delay: "0s" },
    { left: "12.5%", y: 11.5, color: "#E8B84B", core: "#FFF6D6", glow: "rgba(242, 198, 92, 0.6)", delay: "0.5s" },
    { left: "20.5%", y: 8.0, color: "#3D9275", core: "#D8F6E8", glow: "rgba(82, 178, 144, 0.5)", delay: "1.0s" },
    { left: "29.5%", y: 8.0, color: "#FFF5DC", core: "#FFE399", glow: "rgba(255, 240, 196, 0.65)", delay: "1.5s" },
    { left: "37.5%", y: 11.5, color: "#C93B3B", core: "#FFD9BA", glow: "rgba(225, 86, 72, 0.55)", delay: "0.3s" },
    { left: "45.5%", y: 8.0, color: "#3D9275", core: "#D8F6E8", glow: "rgba(82, 178, 144, 0.5)", delay: "0.9s" },
    { left: "54.5%", y: 8.0, color: "#E8B84B", core: "#FFF6D6", glow: "rgba(242, 198, 92, 0.6)", delay: "1.4s" },
    { left: "62.5%", y: 11.5, color: "#FFF5DC", core: "#FFE399", glow: "rgba(255, 240, 196, 0.65)", delay: "0.6s" },
    { left: "70.5%", y: 8.0, color: "#C93B3B", core: "#FFD9BA", glow: "rgba(225, 86, 72, 0.55)", delay: "1.1s" },
    { left: "79.5%", y: 8.0, color: "#3D9275", core: "#D8F6E8", glow: "rgba(82, 178, 144, 0.5)", delay: "0.2s" },
    { left: "87.5%", y: 11.5, color: "#E8B84B", core: "#FFF6D6", glow: "rgba(242, 198, 92, 0.6)", delay: "0.7s" },
    { left: "95.5%", y: 8.0, color: "#C93B3B", core: "#FFD9BA", glow: "rgba(225, 86, 72, 0.55)", delay: "1.3s" },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-9 w-full overflow-hidden bg-transparent leading-none"
    >
      <svg
        viewBox="0 0 1000 32"
        preserveAspectRatio="none"
        className="block h-8 w-full"
      >
        <path
          d="M0,3 Q125,20 250,3 Q375,20 500,3 Q625,20 750,3 Q875,20 1000,3"
          fill="none"
          stroke="#1D1512"
          strokeWidth="1.6"
          strokeOpacity="0.65"
        />
        <path
          d="M0,4 Q125,21 250,4 Q375,21 500,4 Q625,21 750,4 Q875,21 1000,4"
          fill="none"
          stroke="#D4B77A"
          strokeWidth="0.9"
          strokeOpacity="0.5"
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
            height: "22px",
            animationDelay: b.delay,
            filter: festiveFx ? `drop-shadow(0 0 6px ${b.glow})` : undefined,
          }}
        >
          {/* Brass socket cap */}
          <rect
            x="5.5"
            y="0"
            width="7"
            height="4.4"
            rx="1"
            fill="#B59659"
            stroke="#3B2B1B"
            strokeWidth="0.8"
          />
          {/* Vintage C9 teardrop glass bulb */}
          <path
            d="M9,4 C13.5,4 15,10 13.2,14.5 C11.8,18.2 10.2,21 9,21.5 C7.8,21 6.2,18.2 4.8,14.5 C3,10 4.5,4 9,4 Z"
            fill={b.color}
            stroke="#F3E7CF"
            strokeWidth="0.85"
            strokeOpacity="0.72"
          />
          {/* Luminous inner filament glint */}
          <ellipse
            cx="8.2"
            cy="11"
            rx="2.1"
            ry="3.8"
            fill={b.core}
            opacity="0.7"
          />
        </svg>
      ))}
    </div>
  );
}

/**
 * Tactile stationery switches for toggling snowfall/twinkle and analog SFX.
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
        className={`analog-btn inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded px-2.5 text-xs font-semibold sm:min-h-[38px] sm:min-w-0 sm:px-3 ${
          festiveFx
            ? "bg-amber-wash text-ink"
            : "bg-cream/80 text-ink-soft"
        }`}
      >
        <Sparkles className="h-4 w-4 shrink-0 text-gold-ink" />
        <span className="hidden md:inline">{festiveFx ? "หิมะ ON" : "หิมะ OFF"}</span>
      </button>

      <button
        type="button"
        onClick={toggleSound}
        title={soundEnabled ? "ปิดเสียงคลิกและกระดิ่ง" : "เปิดเสียงคลิกและกระดิ่ง Analog"}
        aria-label={soundEnabled ? "ปิดเสียงคลิกและกระดิ่ง" : "เปิดเสียงคลิกและกระดิ่ง Analog"}
        aria-pressed={soundEnabled}
        className={`analog-btn inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded px-2.5 text-xs font-semibold sm:min-h-[38px] sm:min-w-0 sm:px-3 ${
          soundEnabled
            ? "bg-pine-wash text-pine-deep"
            : "bg-cream/80 text-ink-soft"
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4 shrink-0 text-pine" />
        ) : (
          <VolumeX className="h-4 w-4 shrink-0" />
        )}
        <span className="hidden md:inline">{soundEnabled ? "เสียง ON" : "เสียง OFF"}</span>
      </button>
    </div>
  );
}
