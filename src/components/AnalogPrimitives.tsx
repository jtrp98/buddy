"use client";

import { useId, type ReactNode } from "react";
import { SkipForward, Snowflake, Volume2, VolumeX } from "lucide-react";
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
    gold: { hi: "#FAE09D", mid: "#dcb75e", rim: "#9D752A", text: "text-primary-foreground" },
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
 * Accessible switches for toggling snowfall/lights and sound effects + Christmas Pop music.
 */
export function FestiveToggleSwitches() {
  const {
    festiveFx,
    toggleFestiveFx,
    soundEnabled,
    toggleSound,
    currentTrack,
    nextTrack,
  } = useFestiveAtmosphere();

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

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleSound}
          title={
            soundEnabled
              ? `กำลังเล่น: ${currentTrack.title} · คลิกเพื่อปิดเพลงและเสียงเอฟเฟกต์`
              : "เปิดเพลงคริสต์มาสสากลป๊อปและเสียงเอฟเฟกต์"
          }
          aria-label={
            soundEnabled
              ? `ปิดเพลงคริสต์มาสและเสียงเอฟเฟกต์ (กำลังเล่น ${currentTrack.title})`
              : "เปิดเพลงคริสต์มาสสากลป๊อปและเสียงเอฟเฟกต์"
          }
          aria-pressed={soundEnabled}
          className={`analog-btn inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border px-2.5 text-xs font-semibold sm:px-3 ${
            soundEnabled
              ? "border-success/50 bg-success-bg text-success"
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

        {soundEnabled && (
          <button
            type="button"
            onClick={nextTrack}
            title={`เปลี่ยนเพลงคริสต์มาสถัดไป (ตอนนี้: ${currentTrack.title})`}
            aria-label={`เปลี่ยนเพลงคริสต์มาสถัดไป (ตอนนี้: ${currentTrack.title})`}
            className="analog-btn inline-flex min-h-[40px] min-w-[36px] shrink-0 items-center justify-center rounded-xl border border-success/40 bg-surface-elevated/90 px-2 text-xs font-semibold text-success hover:border-success/70"
          >
            <SkipForward className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
