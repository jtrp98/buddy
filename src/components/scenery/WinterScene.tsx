"use client";

import { useId } from "react";
import { r1, seededRandom } from "@/lib/prng";

/**
 * Painted winter night backdrops (SVG, 2.5D layering): sky, stars, moon,
 * distant hills, pine rows, a cabin with warm windows and snowy ground.
 * Purely decorative — always aria-hidden and pointer-events: none.
 */

const W = 1440;
const H = 600;

function pinePath(x: number, base: number, h: number, w: number) {
  // Three stacked tiers + a short trunk, as one silhouette path.
  const t = [
    [0, 0.42, 1],
    [0.22, 0.7, 0.78],
    [0.48, 1, 0.55],
  ];
  let d = "";
  for (const [topF, botF, widthF] of t) {
    const top = base - h + h * topF * 0.85;
    const bot = base - h * (1 - botF) * 0.85 - h * 0.15 + h * 0.15;
    const half = (w / 2) * widthF;
    d += `M ${r1(x)} ${r1(top)} L ${r1(x + half)} ${r1(bot)} L ${r1(x - half)} ${r1(bot)} Z `;
  }
  return d;
}

function pineRow(seed: number, baseY: number, minH: number, maxH: number, gap: number) {
  const rand = seededRandom(seed);
  let d = "";
  let x = -20;
  while (x < W + 40) {
    const h = minH + rand() * (maxH - minH);
    d += pinePath(x, baseY + rand() * 8, h, h * 0.62);
    x += gap * (0.6 + rand() * 0.8);
  }
  return d;
}

const STARS = (() => {
  const rand = seededRandom(7);
  return Array.from({ length: 70 }, (_, i) => ({
    x: r1(rand() * W),
    y: r1(rand() * 300),
    r: r1(0.6 + rand() * 1.3),
    o: r1(0.35 + rand() * 0.6),
    twinkle: i % 6 === 0,
    delay: r1(rand() * 4),
  }));
})();

const FAR_PINES = pineRow(11, 418, 40, 70, 34);
const MID_PINES = pineRow(23, 470, 70, 120, 58);
const SIDE_PINES_L = pineRow(31, 540, 140, 210, 70).split("Z").slice(0, 9).join("Z") + "Z";

export type WinterSceneVariant = "hero" | "join" | "auth" | "reveal" | "quiet";

export function WinterScene({
  variant = "hero",
  className = "",
  showMoon,
  showCabin,
  showAurora,
}: {
  variant?: WinterSceneVariant;
  className?: string;
  showMoon?: boolean;
  showCabin?: boolean;
  showAurora?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${uid}-${n}`;
  const moon = showMoon ?? (variant === "hero" || variant === "auth" || variant === "reveal");
  const cabin = showCabin ?? (variant === "hero" || variant === "auth");
  const aurora = showAurora ?? (variant === "hero" || variant === "reveal" || variant === "join");
  const ground = variant !== "quiet";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
    >
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081224" />
          <stop offset="0.55" stopColor="#10213a" />
          <stop offset="0.85" stopColor="#1a3a4c" />
          <stop offset="1" stopColor="#21485a" />
        </linearGradient>
        <radialGradient id={id("moonGlow")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff8e7" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff8e7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("aurora")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3fb68b" stopOpacity="0" />
          <stop offset="0.35" stopColor="#3fb68b" stopOpacity="0.22" />
          <stop offset="0.7" stopColor="#7ad3c0" stopOpacity="0.14" />
          <stop offset="1" stopColor="#7ad3c0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("hillFar")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c4c63" />
          <stop offset="1" stopColor="#1c3447" />
        </linearGradient>
        <linearGradient id={id("hillSnow")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7d9e3" />
          <stop offset="1" stopColor="#8faabb" />
        </linearGradient>
        <linearGradient id={id("ground")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f7f9" />
          <stop offset="0.6" stopColor="#d9e5ec" />
          <stop offset="1" stopColor="#b9cbd6" />
        </linearGradient>
        <radialGradient id={id("window")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb84d" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${id("sky")})`} />

      {aurora && (
        <path
          d="M -40 150 C 260 60 520 210 780 120 S 1220 40 1480 140 L 1480 210 C 1220 120 980 250 760 190 S 260 140 -40 230 Z"
          fill={`url(#${id("aurora")})`}
          className="glow-pulse"
          style={{ animationDuration: "9s" }}
        />
      )}

      <g>
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff8e7"
            opacity={s.o}
            className={s.twinkle ? "xmas-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}s`, animationDuration: "4.5s" } : undefined}
          />
        ))}
      </g>

      {moon && (
        <g>
          <circle cx={1170} cy={110} r={110} fill={`url(#${id("moonGlow")})`} />
          <circle cx={1170} cy={110} r={34} fill="#fdf3dc" />
          <circle cx={1158} cy={102} r={6} fill="#efe2c3" opacity={0.7} />
          <circle cx={1182} cy={122} r={4} fill="#efe2c3" opacity={0.6} />
        </g>
      )}

      {/* Distant mountains */}
      <path
        d="M 0 380 L 140 300 L 230 340 L 380 250 L 520 330 L 640 290 L 790 350 L 930 260 L 1080 330 L 1210 280 L 1340 330 L 1440 300 L 1440 600 L 0 600 Z"
        fill={`url(#${id("hillFar")})`}
        opacity={0.85}
      />
      <path
        d="M 380 250 L 418 272 L 400 278 L 385 268 L 362 282 L 350 268 Z M 930 260 L 968 282 L 948 288 L 932 276 L 912 290 L 900 278 Z"
        fill="#dbe7ee"
        opacity={0.55}
      />
      <path d={FAR_PINES} fill="#16303f" opacity={0.9} />

      {/* Moonlit snowy hills */}
      <path
        d="M 0 440 C 180 400 340 430 520 410 S 860 380 1040 420 S 1300 400 1440 420 L 1440 600 L 0 600 Z"
        fill={`url(#${id("hillSnow")})`}
      />
      <path d={MID_PINES} fill="#0f2b29" />

      {cabin && (
        <g transform="translate(1040 400)">
          <ellipse cx={40} cy={18} rx={90} ry={50} fill={`url(#${id("window")})`} opacity={0.5} className="glow-pulse" />
          <path d="M 0 30 L 0 -6 L 40 -34 L 80 -6 L 80 30 Z" fill="#2a1c17" />
          <path d="M -8 -2 L 40 -40 L 88 -2 L 82 2 L 40 -30 L -2 2 Z" fill="#eef4f7" />
          <rect x={58} y={-34} width={10} height={18} fill="#2a1c17" />
          <rect x={56} y={-38} width={14} height={5} fill="#eef4f7" />
          <rect x={12} y={4} width={16} height={14} rx={1.5} fill="#ffd27a" />
          <rect x={52} y={4} width={16} height={14} rx={1.5} fill="#ffc552" />
          <path d="M 20 4 V 18 M 12 11 H 28 M 60 4 V 18 M 52 11 H 68" stroke="#2a1c17" strokeWidth={1.4} />
        </g>
      )}

      {ground && (
        <>
          <path d={SIDE_PINES_L} fill="#0b241f" opacity={variant === "join" ? 0.95 : 0.8} />
          <path
            d="M 0 520 C 200 490 420 505 640 500 S 1080 486 1260 498 S 1400 505 1440 500 L 1440 600 L 0 600 Z"
            fill={`url(#${id("ground")})`}
          />
          <path
            d="M 0 548 C 260 536 520 552 760 546 S 1240 538 1440 550"
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.6}
            strokeWidth={2}
          />
        </>
      )}
    </svg>
  );
}

/**
 * Wavy snow drift that slowly accumulates (scaleY over ~60s) along the bottom
 * edge of a section. Decorative only; place it under content, never over controls.
 */
export function SnowDrift({ className = "", tone = "snow" }: { className?: string; tone?: "snow" | "soft" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`snow-drift pointer-events-none block w-full select-none ${className}`}
    >
      <defs>
        <linearGradient id={`${uid}-d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone === "snow" ? "#f6f9fb" : "#dbe6ec"} />
          <stop offset="1" stopColor={tone === "snow" ? "#c9d8e1" : "#9fb6c3"} />
        </linearGradient>
      </defs>
      <path
        d="M 0 46 C 90 26 170 40 260 34 S 420 14 540 30 S 720 44 820 28 S 1010 12 1120 30 S 1320 40 1440 26 L 1440 80 L 0 80 Z"
        fill={`url(#${uid}-d)`}
      />
      <path
        d="M 0 46 C 90 26 170 40 260 34 S 420 14 540 30 S 720 44 820 28 S 1010 12 1120 30 S 1320 40 1440 26"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        strokeOpacity={0.8}
      />
    </svg>
  );
}

/** A dark pine treeline with snow — the shared "end of page" horizon above the footer. */
export function ForestEdge({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none relative h-28 w-full overflow-hidden sm:h-36 ${className}`}>
      <svg viewBox="0 0 1440 160" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <path d={pineRow(51, 150, 50, 95, 40)} fill="#0f2a26" opacity={0.75} />
        <path d={pineRow(67, 165, 80, 140, 72)} fill="#0b2420" />
      </svg>
      <SnowDrift className="absolute right-0 bottom-0 left-0 h-10 sm:h-12" />
    </div>
  );
}
