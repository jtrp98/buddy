"use client";

import type { ReactNode } from "react";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";

/**
 * Diagonal airmail candy-cane ribbon bar (red / cream / pine green).
 */
export function CandyStripeBar({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`candy-stripe-bar h-2.5 w-full ${className}`} />;
}

/**
 * Masking / Washi tape strip pinned to card corners.
 */
export function WashiTape({
  tone = "red",
  className = "",
}: {
  tone?: "red" | "green" | "gold";
  className?: string;
}) {
  const toneStyles = {
    red: "bg-[#d94a3f]/85 border-[#2a1f1b]/25",
    green: "bg-[#266b51]/85 border-[#2a1f1b]/25",
    gold: "bg-[#e5b54f]/85 border-[#2a1f1b]/25",
  }[tone];

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-4 w-14 border shadow-xs backdrop-blur-[1px] ${toneStyles} ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,253,247,0.22) 0 4px, transparent 4px 8px)",
      }}
    />
  );
}

/**
 * Embossed holiday wax seal badge for step numbers or emblems.
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
  const palette = {
    red: "bg-[#c8322b] text-[#fff8ee] ring-[#9e221d]",
    green: "bg-[#1f5e46] text-[#fff8ee] ring-[#154231]",
    gold: "bg-[#d49a2a] text-[#2a1f1b] ring-[#a87518]",
  }[tone];

  const sizeClass = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  }[size];

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[#2a1f1b] font-bold shadow-[0_3px_0_#2a1f1b] ring-4 ring-inset ${palette} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Perforated North Pole postage stamp ornament.
 */
export function PostageStamp({
  topText = "NORTH POLE",
  mainText = "25 DEC",
  bottomText = "SECRET POST",
  tone = "red",
  className = "",
}: {
  topText?: string;
  mainText?: string;
  bottomText?: string;
  tone?: "red" | "green";
  className?: string;
}) {
  const color =
    tone === "red"
      ? "border-[#c8322b] text-[#9e221d] bg-[#fff8ef]"
      : "border-[#1f5e46] text-[#154231] bg-[#f4fbf7]";

  return (
    <div
      className={`inline-flex select-none flex-col items-center justify-center rounded-sm border-2 border-dashed px-3 py-2 text-center shadow-[2px_2px_0_rgba(42,31,27,0.2)] ${color} ${className}`}
    >
      <span className="font-mono text-[9px] font-bold tracking-[0.18em] uppercase opacity-80">
        {topText}
      </span>
      <span className="my-0.5 font-serif text-sm font-bold tracking-tight">{mainText}</span>
      <span className="font-mono text-[8px] font-semibold tracking-[0.14em] uppercase opacity-75">
        {bottomText}
      </span>
    </div>
  );
}

/**
 * Draped SVG string of Christmas fairy lights across the navbar bottom edge.
 */
export function FestiveStringLights() {
  const { festiveFx } = useFestiveAtmosphere();
  const bulbs = [
    { x: 40, y: 12, color: "#e0483e", delay: "0s" },
    { x: 110, y: 17, color: "#f2c14e", delay: "0.4s" },
    { x: 185, y: 13, color: "#2d8a64", delay: "0.8s" },
    { x: 260, y: 16, color: "#fff3d1", delay: "1.2s" },
    { x: 340, y: 12, color: "#e0483e", delay: "0.3s" },
    { x: 420, y: 17, color: "#2d8a64", delay: "0.9s" },
    { x: 500, y: 13, color: "#f2c14e", delay: "1.5s" },
    { x: 580, y: 17, color: "#fff3d1", delay: "0.5s" },
    { x: 660, y: 13, color: "#e0483e", delay: "1.1s" },
    { x: 740, y: 16, color: "#2d8a64", delay: "0.2s" },
    { x: 820, y: 12, color: "#f2c14e", delay: "0.7s" },
    { x: 900, y: 17, color: "#e0483e", delay: "1.3s" },
    { x: 970, y: 13, color: "#fff3d1", delay: "0.6s" },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none w-full overflow-hidden leading-none">
      <svg
        viewBox="0 0 1000 26"
        preserveAspectRatio="none"
        className="block h-5 w-full"
      >
        <path
          d="M0,4 Q125,22 250,6 T500,6 T750,6 T1000,4"
          fill="none"
          stroke="#2a1f1b"
          strokeWidth="1.6"
          strokeOpacity="0.65"
        />
        {bulbs.map((b, i) => (
          <g key={i} transform={`translate(${b.x}, ${b.y})`}>
            <rect x="-2.2" y="-5" width="4.4" height="4" rx="1" fill="#2a1f1b" />
            <ellipse
              cx="0"
              cy="3.2"
              rx="4.2"
              ry="5.6"
              fill={b.color}
              stroke="#2a1f1b"
              strokeWidth="1.2"
              className={festiveFx ? "fairy-bulb" : ""}
              style={{ animationDelay: b.delay }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * Analog brass switches for toggling Snow/Lights and Audio SFX.
 */
export function FestiveToggleSwitches() {
  const { festiveFx, toggleFestiveFx, soundEnabled, toggleSound } = useFestiveAtmosphere();

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <button
        type="button"
        onClick={toggleFestiveFx}
        title={festiveFx ? "ปิดหิมะและไฟกะพริบ" : "เปิดหิมะและไฟกะพริบ"}
        aria-label={festiveFx ? "ปิดหิมะและไฟกะพริบ" : "เปิดหิมะและไฟกะพริบ"}
        aria-pressed={festiveFx}
        className={`analog-btn inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-1.5 text-xs font-bold sm:px-2.5 ${
          festiveFx
            ? "bg-[#f6e3a8] text-[#2a1f1b]"
            : "bg-[#f3ead8] text-[#6e5a50]"
        }`}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="hidden md:inline">{festiveFx ? "หิมะ ON" : "หิมะ OFF"}</span>
      </button>

      <button
        type="button"
        onClick={toggleSound}
        title={soundEnabled ? "ปิดเสียงคลิกและกระดิ่ง" : "เปิดเสียงคลิกและกระดิ่ง Analog"}
        aria-label={soundEnabled ? "ปิดเสียงคลิกและกระดิ่ง" : "เปิดเสียงคลิกและกระดิ่ง Analog"}
        aria-pressed={soundEnabled}
        className={`analog-btn inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-1.5 text-xs font-bold sm:px-2.5 ${
          soundEnabled
            ? "bg-[#dff0e6] text-[#154231]"
            : "bg-[#f3ead8] text-[#6e5a50]"
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="h-3.5 w-3.5" />
        ) : (
          <VolumeX className="h-3.5 w-3.5" />
        )}
        <span className="hidden md:inline">{soundEnabled ? "เสียง ON" : "เสียง OFF"}</span>
      </button>
    </div>
  );
}
