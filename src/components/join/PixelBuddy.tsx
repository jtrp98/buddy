"use client";

import { memo, type CSSProperties, type MouseEvent } from "react";
import { buddyCodename } from "@/lib/join-scene";
import { SPRITE_H, SPRITE_W, spriteFrames, type FrameName } from "./pixelSprites";

export type BuddyAction = "idle" | "walk" | "wave" | "jump" | "turn" | "sit";

const FRAME_CLASS: Record<FrameName, string> = {
  idle: "pb-idle",
  walkA: "pb-walk-a",
  walkB: "pb-walk-b",
  waveA: "pb-wave-a",
  waveB: "pb-wave-b",
  jump: "pb-jump",
  sit: "pb-sit",
};

export interface PixelBuddyProps {
  seed: string;
  x: number;
  y: number;
  /** Size of one sprite pixel in CSS px (integers keep the pixels crisp). */
  px: number;
  action: BuddyAction;
  flip?: boolean;
  offsetX?: number;
  walkMs?: number;
  isWalking?: boolean;
  entering?: boolean;
  enterFrom?: number;
  pending?: boolean;
  isYou?: boolean;
  welcome?: string | null;
  speech?: string | null;
  emoji?: string | null;
  zIndex?: number;
  bobDelay?: number;
  onSelect?: (seed: string, clientX: number, clientY: number) => void;
}

/** One interactive 8-bit participant character, positioned by its feet (x, y). */
export const PixelBuddy = memo(function PixelBuddy({
  seed,
  x,
  y,
  px,
  action,
  flip = false,
  offsetX = 0,
  walkMs = 0,
  isWalking = false,
  entering = false,
  enterFrom = 0,
  pending = false,
  isYou = false,
  welcome = null,
  speech = null,
  emoji = null,
  zIndex,
  bobDelay = 0,
  onSelect,
}: PixelBuddyProps) {
  const frames = spriteFrames(seed);
  const codename = buddyCodename(seed);
  const w = SPRITE_W * px;
  const h = SPRITE_H * px;
  const shownAction = entering || isWalking ? "walk" : action;
  const facingLeft = entering ? enterFrom > 0 : flip;
  const statusLabel = isYou ? "คุณ" : pending ? "รอยืนยันอีเมล" : "ยืนยันแล้ว";

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onSelect?.(seed, e.clientX, e.clientY);
  };

  return (
    <div
      className="pixel-buddy"
      data-action={shownAction}
      data-flip={facingLeft}
      data-walking={isWalking}
      data-entering={entering}
      data-has-speech={Boolean(speech)}
      style={
        {
          left: `${x}px`,
          top: `${y}px`,
          zIndex: speech ? (zIndex ?? 0) + 1500 : zIndex,
          "--px": `${px}px`,
          "--walk-x": `${offsetX}px`,
          "--walk-ms": `${walkMs}ms`,
          "--enter-from": `${enterFrom}px`,
          "--bob-delay": `${bobDelay}s`,
        } as CSSProperties
      }
    >
      <div className="pb-enter">
        <div className="relative">
          {/* Bubbles & status tags float cleanly above the head */}
          <div
            className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
            style={{ bottom: `${h + px * (shownAction === "jump" || speech ? 6 : 3)}px` }}
          >
            {speech ? (
              <div className="pb-speech-pop relative rounded-xl border border-primary/55 bg-[#0f1d32]/95 px-2.5 py-1.5 text-center text-ivory shadow-[0_12px_28px_-6px_rgba(0,0,0,0.75)] backdrop-blur-sm">
                <p className="text-[11px] font-semibold whitespace-nowrap text-ivory sm:text-xs">
                  {speech}
                </p>
                <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] whitespace-nowrap text-ivory/70">
                  <span>{codename}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      isYou
                        ? "font-bold text-primary"
                        : pending
                          ? "text-amber-300"
                          : "text-emerald-300"
                    }
                  >
                    {statusLabel}
                  </span>
                </p>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-primary/55 bg-[#0f1d32]"
                />
              </div>
            ) : welcome ? (
              <span className="pb-welcome rounded-lg border border-ink/15 bg-ivory px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-ink shadow-md">
                {welcome}
              </span>
            ) : emoji ? (
              <span className="pb-speech-pop rounded-full border border-white/20 bg-[#12233b]/95 px-2 py-0.5 text-xs shadow-md">
                {emoji}
              </span>
            ) : (
              <>
                {isYou && (
                  <span className="rounded-full border border-primary/40 bg-primary px-2 py-px text-[10px] font-bold whitespace-nowrap text-primary-foreground shadow">
                    คุณ
                  </span>
                )}
                {pending && (
                  <span
                    title="รอยืนยันอีเมล"
                    className="flex h-4 w-5 items-center justify-center rounded-md border border-ink/15 bg-ivory/95 shadow"
                  >
                    <svg viewBox="0 0 10 7" className="h-2 w-3" aria-hidden="true">
                      <rect
                        x="0.5"
                        y="0.5"
                        width="9"
                        height="6"
                        rx="0.8"
                        fill="#fff8e7"
                        stroke="#8f6d22"
                      />
                      <path
                        d="M0.8 1 5 4l4.2-3"
                        fill="none"
                        stroke="#b3262e"
                        strokeWidth="0.9"
                      />
                    </svg>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Interactive character button */}
          <button
            type="button"
            onClick={handleClick}
            aria-label={`${codename} (${statusLabel}) — แตะเพื่อทักทาย`}
            className="group relative block cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {/* Subtle warm highlight ring under feet when selected, hovered, or isYou */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%] transition-opacity duration-200 ${
                speech || isYou ? "opacity-100" : "opacity-0 group-hover:opacity-80"
              }`}
              style={{
                width: w * 0.95,
                height: px * 3,
                bottom: -px * 1.3,
                background:
                  "radial-gradient(ellipse, rgba(255,214,112,0.55) 0%, rgba(255,214,112,0.12) 60%, transparent 78%)",
              }}
            />

            {/* Soft contact shadow on moonlit snow */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-[#07111e]/55"
              style={{ width: w * 0.72, height: px * 2, bottom: -px }}
            />

            {/* Fading snow footprints when walking or entering */}
            {(isWalking || entering) && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 flex gap-1.5"
                style={{
                  bottom: -px,
                  transform: facingLeft ? "translateX(4px)" : "translateX(-120%)",
                }}
              >
                <span
                  className="pb-footprint block bg-[#0c1c30]/55"
                  style={{ width: px * 2, height: px, animationDelay: "0ms" }}
                />
                <span
                  className="pb-footprint block bg-[#0c1c30]/40"
                  style={{ width: px * 2, height: px, animationDelay: "220ms" }}
                />
              </span>
            )}

            {/* Cold winter breath puff */}
            {shownAction === "idle" && !speech && (
              <span
                aria-hidden="true"
                className="pb-breath pointer-events-none absolute rounded-[1px] bg-[#dbeeff]/55"
                style={{
                  width: px * 1.5,
                  height: px,
                  bottom: h * 0.62,
                  left: facingLeft ? -px : w - px * 0.5,
                  animationDelay: `${(bobDelay * 2.3) % 4}s`,
                }}
              />
            )}

            <div className="transition-transform duration-150 group-hover:-translate-y-0.5">
              <div className="pb-facing relative">
                <div className="pb-body">
                  <svg
                    width={w}
                    height={h}
                    viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`}
                    aria-hidden="true"
                  >
                    {(Object.keys(frames) as FrameName[]).map((f) => (
                      <g key={f} className={`pb-frame ${FRAME_CLASS[f]}`}>
                        {frames[f].map((p) => (
                          <path key={p.color} d={p.d} fill={p.color} />
                        ))}
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
});
