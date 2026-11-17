"use client";

import { memo, type CSSProperties } from "react";
import { SPRITE_H, SPRITE_W, spriteFrames, type FrameName } from "./pixelSprites";

export type BuddyAction = "idle" | "walk" | "wave" | "jump" | "turn";

const FRAME_CLASS: Record<FrameName, string> = {
  idle: "pb-idle",
  walkA: "pb-walk-a",
  walkB: "pb-walk-b",
  waveA: "pb-wave-a",
  waveB: "pb-wave-b",
  jump: "pb-jump",
};

export interface PixelBuddyProps {
  seed: string;
  x: number;
  y: number;
  /** Size of one sprite pixel in CSS px (integers keep the pixels crisp). */
  px: number;
  action: BuddyAction;
  flip?: boolean;
  stroll?: boolean;
  entering?: boolean;
  enterFrom?: number;
  pending?: boolean;
  isYou?: boolean;
  welcome?: string | null;
  zIndex?: number;
  bobDelay?: number;
}

/** One 8-bit participant character, absolutely positioned by its feet (x, y). */
export const PixelBuddy = memo(function PixelBuddy({
  seed,
  x,
  y,
  px,
  action,
  flip = false,
  stroll = false,
  entering = false,
  enterFrom = 0,
  pending = false,
  isYou = false,
  welcome = null,
  zIndex,
  bobDelay = 0,
}: PixelBuddyProps) {
  const frames = spriteFrames(seed);
  const w = SPRITE_W * px;
  const h = SPRITE_H * px;
  const shownAction = entering ? "walk" : action;

  return (
    <div
      className="pixel-buddy"
      data-action={shownAction}
      data-flip={entering ? enterFrom > 0 : flip}
      data-stroll={stroll && !entering}
      data-entering={entering}
      style={
        {
          left: `${x}px`,
          top: `${y}px`,
          zIndex,
          "--px": `${px}px`,
          "--enter-from": `${enterFrom}px`,
          "--bob-delay": `${bobDelay}s`,
          "--stroll": `${Math.round(px * 5)}px`,
          "--stroll-dur": `${9 + (bobDelay % 1) * 6}s`,
          "--stroll-delay": `-${bobDelay * 3}s`,
        } as CSSProperties
      }
    >
      <div className="pb-enter">
        <div className="pb-stroll relative">
          {/* Labels float above the head */}
          <div
            className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
            style={{ bottom: `${h + px * 2}px` }}
          >
            {welcome && (
              <span className="pb-welcome absolute bottom-0 left-1/2 rounded-lg border border-ink/15 bg-ivory px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-ink shadow-md">
                {welcome}
              </span>
            )}
            {!welcome && isYou && (
              <span className="rounded-full bg-primary px-2 py-px text-[10px] font-bold whitespace-nowrap text-primary-foreground shadow">
                คุณ
              </span>
            )}
            {!welcome && pending && (
              <span
                title="รอยืนยันอีเมล"
                className="flex h-4 w-5 items-center justify-center rounded-md border border-ink/15 bg-ivory/95 shadow"
              >
                <svg viewBox="0 0 10 7" className="h-2 w-3" aria-hidden="true">
                  <rect x="0.5" y="0.5" width="9" height="6" rx="0.8" fill="#fff8e7" stroke="#8f6d22" />
                  <path d="M0.8 1 5 4l4.2-3" fill="none" stroke="#b3262e" strokeWidth="0.9" />
                </svg>
              </span>
            )}
          </div>

          <div className="pb-stroll-face">
            <div className="pb-facing relative">
              {/* soft contact shadow */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-[#0b1d22]/30"
                style={{ width: w * 0.7, height: px * 2, bottom: -px }}
              />
              <div className="pb-body">
                <svg width={w} height={h} viewBox={`0 0 ${SPRITE_W} ${SPRITE_H}`} aria-hidden="true">
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
        </div>
      </div>
    </div>
  );
});
