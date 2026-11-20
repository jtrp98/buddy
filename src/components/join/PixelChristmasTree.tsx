"use client";

import { memo, useMemo, type CSSProperties } from "react";
import type { TreeLightMode } from "@/lib/join-scene";
import { r1, seededRandom } from "@/lib/prng";
import { gridToPaths } from "./pixelGrid";

export const PIXEL_TREE_W = 55;
export const PIXEL_TREE_H = 76;

interface TierSpec {
  top: number;
  bottom: number;
  minHalf: number;
  maxHalf: number;
  scallops: number;
}

const TIERS: TierSpec[] = [
  { top: 9, bottom: 20, minHalf: 0, maxHalf: 8, scallops: 3 },
  { top: 17, bottom: 31, minHalf: 2, maxHalf: 13, scallops: 4 },
  { top: 27, bottom: 43, minHalf: 4, maxHalf: 18, scallops: 5 },
  { top: 38, bottom: 54, minHalf: 6, maxHalf: 22, scallops: 6 },
  { top: 49, bottom: 66, minHalf: 8, maxHalf: 26, scallops: 7 },
];

const CX = 27;

interface BulbSpec {
  x: number;
  y: number;
  warm: string;
  aurora: string;
  twinkleDelay: string;
}

interface TreeArtwork {
  foliagePaths: { color: string; d: string }[];
  snowPaths: { color: string; d: string }[];
  garlandPaths: { color: string; d: string }[];
  ornamentPaths: { color: string; d: string }[];
  starPaths: { color: string; d: string }[];
  bulbs: BulbSpec[];
}

function buildTreeArtwork(): TreeArtwork {
  const rand = seededRandom(20261225);
  const foliage: string[][] = Array.from({ length: PIXEL_TREE_H }, () =>
    Array(PIXEL_TREE_W).fill(".")
  );
  const snow: string[][] = Array.from({ length: PIXEL_TREE_H }, () =>
    Array(PIXEL_TREE_W).fill(".")
  );
  const garland: string[][] = Array.from({ length: PIXEL_TREE_H }, () =>
    Array(PIXEL_TREE_W).fill(".")
  );
  const ornaments: string[][] = Array.from({ length: PIXEL_TREE_H }, () =>
    Array(PIXEL_TREE_W).fill(".")
  );

  // Trunk (rows 64..72)
  for (let y = 64; y <= 72; y++) {
    for (let x = CX - 3; x <= CX + 3; x++) {
      foliage[y][x] = x === CX - 3 ? "u" : x >= CX + 1 ? "t" : "T";
    }
  }
  // Root snow mound (rows 71..74)
  for (let y = 71; y <= 74; y++) {
    const hw = 7 + (y - 71) * 2;
    for (let x = CX - hw; x <= CX + hw; x++) {
      if (y === 74 && Math.abs(x - CX) > hw - 2) continue;
      foliage[y][x] = y === 71 || x > CX + 2 ? "S" : "s";
    }
  }

  // Paint 5 scalloped pine tiers from bottom to top so upper tiers cast shadow on lower ones
  for (let ti = TIERS.length - 1; ti >= 0; ti--) {
    const t = TIERS[ti];
    const h = t.bottom - t.top;
    for (let y = t.top; y <= t.bottom; y++) {
      const f = (y - t.top) / h;
      const half = t.minHalf + (t.maxHalf - t.minHalf) * Math.pow(f, 0.92);
      for (let x = 0; x < PIXEL_TREE_W; x++) {
        const dx = x - CX;
        const absDx = Math.abs(dx);
        const scallop =
          f > 0.72 ? Math.cos((dx / Math.max(1, half)) * Math.PI * t.scallops) * 1.15 : 0;
        if (absDx > half + scallop * 0.45) continue;

        // Edge / underside shadow vs upper highlight
        const isBottomEdge = y >= t.bottom - 1;
        const isShadowBand = ti < TIERS.length - 1 && y >= t.bottom - 2;
        const n = rand();
        let shade = "2";
        if (isBottomEdge || isShadowBand) {
          shade = n < 0.7 ? "0" : "1";
        } else if (dx > half * 0.35 || f < 0.32) {
          shade = n < 0.55 ? "3" : "2";
        } else if (dx < -half * 0.45) {
          shade = n < 0.65 ? "1" : "0";
        } else {
          shade = n < 0.25 ? "3" : n < 0.75 ? "2" : "1";
        }
        foliage[y][x] = shade;

        // Snow tufts along outer scalloped tips & top crown
        const nearTip = absDx >= half - 1.5 && f > 0.55 && f < 0.92;
        const upperSlope = f < 0.28 && absDx <= half && dx >= -1;
        if ((nearTip && rand() < 0.68) || (upperSlope && ti <= 2 && rand() < 0.52)) {
          snow[y][x] = dx >= 0 || f < 0.2 ? "W" : "w";
        }
      }
    }
  }

  // Draped garlands on tiers 1..4
  for (let ti = 1; ti < TIERS.length; ti++) {
    const t = TIERS[ti];
    const yMid = Math.round((t.top + t.bottom) * 0.54);
    const half = Math.round(t.maxHalf * 0.72);
    for (let dx = -half; dx <= half; dx++) {
      const sag = Math.round(Math.cos((dx / half) * (Math.PI / 2)) * 2.4);
      const tilt = ti % 2 === 0 ? Math.round(dx * 0.14) : -Math.round(dx * 0.14);
      const gx = CX + dx;
      const gy = yMid + sag + tilt;
      if (foliage[gy]?.[gx] && foliage[gy][gx] !== ".") {
        garland[gy][gx] = (dx + ti) % 3 === 0 ? "d" : "D";
      }
    }
  }

  // Baubles (ornaments)
  const baubleCoords: [number, number, string][] = [
    [CX - 2, 16, "R"],
    [CX + 3, 18, "Y"],
    [CX - 5, 24, "B"],
    [CX + 5, 26, "R"],
    [CX, 28, "Y"],
    [CX - 9, 34, "Y"],
    [CX + 2, 36, "R"],
    [CX + 10, 35, "B"],
    [CX - 4, 41, "B"],
    [CX - 13, 46, "R"],
    [CX + 7, 45, "Y"],
    [CX + 14, 48, "R"],
    [CX - 8, 52, "Y"],
    [CX + 1, 53, "B"],
    [CX - 16, 58, "B"],
    [CX + 11, 58, "Y"],
    [CX + 18, 60, "R"],
    [CX - 5, 61, "R"],
  ];
  for (const [bx, by, col] of baubleCoords) {
    if (ornaments[by]?.[bx]) ornaments[by][bx] = col;
    if (ornaments[by + 1]?.[bx]) ornaments[by + 1][bx] = col.toLowerCase();
  }

  // Pixel bulbs (22 glowing points)
  const warmPalette = ["#ffe7a8", "#ff8d7a", "#ffd266", "#8fd3ff", "#ffe7a8", "#ffae52"];
  const auroraPalette = ["#7ef2c8", "#a8f5ff", "#ffe7a8", "#b9a6ff", "#6de3b8", "#e8fbff"];
  const bulbCoords: [number, number][] = [
    [CX, 13],
    [CX - 3, 19],
    [CX + 4, 21],
    [CX - 7, 27],
    [CX + 1, 25],
    [CX + 8, 28],
    [CX - 11, 35],
    [CX - 3, 33],
    [CX + 5, 34],
    [CX + 12, 38],
    [CX - 14, 44],
    [CX - 6, 46],
    [CX + 3, 44],
    [CX + 11, 47],
    [CX + 16, 51],
    [CX - 19, 55],
    [CX - 11, 57],
    [CX - 2, 56],
    [CX + 6, 58],
    [CX + 14, 59],
    [CX - 15, 62],
    [CX + 19, 62],
  ];
  const bulbs: BulbSpec[] = bulbCoords.map(([x, y], i) => ({
    x,
    y,
    warm: warmPalette[i % warmPalette.length],
    aurora: auroraPalette[i % auroraPalette.length],
    twinkleDelay: `${r1((i * 0.37) % 2.8)}s`,
  }));

  // Top 9×9 pixel star (centered at CX = 27, y = 1..8)
  const starGrid = Array.from({ length: PIXEL_TREE_H }, () => Array(PIXEL_TREE_W).fill("."));
  const starRows: [number, string][] = [
    [1, "....G...."],
    [2, "....G...."],
    [3, "...GgG..."],
    [4, "GGGGWGGGG"],
    [5, ".GGWWWGg."],
    [6, "..GGGGG.."],
    [7, ".GGg.gGG."],
    [8, "Gg.....gG"],
  ];
  for (const [ry, pattern] of starRows) {
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== ".") starGrid[ry][CX - 4 + i] = pattern[i];
    }
  }

  return {
    foliagePaths: gridToPaths(
      foliage.map((r) => r.join("")),
      {
        "0": "#0c271f",
        "1": "#143d30",
        "2": "#1e5b44",
        "3": "#2d7d59",
        u: "#2f1b0f",
        T: "#4a2d1b",
        t: "#694127",
        s: "#476a8c",
        S: "#8bb2d4",
      }
    ),
    snowPaths: gridToPaths(
      snow.map((r) => r.join("")),
      {
        w: "#7ba4c7",
        W: "#cfe4f5",
      }
    ),
    garlandPaths: gridToPaths(
      garland.map((r) => r.join("")),
      {
        D: "#b88a32",
        d: "#f5d47a",
      }
    ),
    ornamentPaths: gridToPaths(
      ornaments.map((r) => r.join("")),
      {
        R: "#e5484d",
        r: "#9e2328",
        Y: "#ffd266",
        y: "#b88624",
        B: "#78c2f0",
        b: "#3b76a8",
      }
    ),
    starPaths: gridToPaths(
      starGrid.map((r) => r.join("")),
      {
        W: "#fff8d6",
        G: "#ffd25a",
        g: "#c98b24",
      }
    ),
    bulbs,
  };
}

const TREE_ART = buildTreeArtwork();

export interface PixelChristmasTreeProps {
  stage: number;
  lightMode: TreeLightMode;
  celebrating?: boolean;
  px: number;
  onCycleLightMode?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Crisp 16-bit pixel Christmas tree for JoinScene with HD-2D warm light halos,
 * 5 progression stages, and interactive light-mode cycling.
 */
export const PixelChristmasTree = memo(function PixelChristmasTree({
  stage,
  lightMode,
  celebrating = false,
  px,
  onCycleLightMode,
  className = "",
  style,
}: PixelChristmasTreeProps) {
  const w = PIXEL_TREE_W * px;
  const h = PIXEL_TREE_H * px;
  const decorated = stage >= 1;
  const lit = stage >= 2;
  const starLit = stage >= 4;
  const full = stage >= 5;

  const paletteBulbs = useMemo(
    () =>
      TREE_ART.bulbs.map((b) => ({
        ...b,
        color: lightMode === "aurora" ? b.aurora : lightMode === "candle" ? "#ffcf70" : b.warm,
      })),
    [lightMode]
  );

  return (
    <button
      type="button"
      onClick={onCycleLightMode}
      aria-label="ต้นคริสต์มาสของกลุ่ม — แตะเพื่อเปลี่ยนโหมดไฟ"
      title="แตะเพื่อเปลี่ยนโหมดไฟต้นคริสต์มาส"
      className={`pixel-tree group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${className}`}
      data-stage={stage}
      data-decorated={decorated}
      data-lit={lit}
      data-star={starLit}
      data-full={full}
      data-light-mode={lightMode}
      data-celebrating={celebrating}
      style={{ width: w, height: h, ...style }}
    >
      {/* Soft HD-2D warm canopy halo behind the pixel tree */}
      <span
        aria-hidden="true"
        className="pt-aura pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-700"
        style={{
          width: w * 1.55,
          height: h * 1.1,
          background:
            lightMode === "aurora"
              ? "radial-gradient(circle, rgba(110,235,195,0.28) 0%, rgba(125,180,255,0.12) 45%, transparent 72%)"
              : lightMode === "candle"
                ? "radial-gradient(circle, rgba(255,192,92,0.22) 0%, rgba(255,150,60,0.08) 45%, transparent 70%)"
                : "radial-gradient(circle, rgba(255,214,120,0.34) 0%, rgba(255,176,84,0.14) 48%, transparent 72%)",
        }}
      />

      {/* Top star soft halo (stage 4+) */}
      <span
        aria-hidden="true"
        className="pt-star-halo pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-700"
        style={{
          top: `${(4.5 / PIXEL_TREE_H) * 100}%`,
          width: w * 0.72,
          height: w * 0.72,
          background:
            "radial-gradient(circle, rgba(255,244,184,0.65) 0%, rgba(255,205,92,0.25) 38%, transparent 70%)",
        }}
      />

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${PIXEL_TREE_W} ${PIXEL_TREE_H}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="relative block h-full w-full overflow-visible [image-rendering:pixelated]"
      >
        {/* Evergreen silhouette & trunk */}
        <g>
          {TREE_ART.foliagePaths.map((p) => (
            <path key={p.color} d={p.d} fill={p.color} />
          ))}
        </g>

        {/* Snow caps on boughs (stage >= 1) */}
        <g className="pt-decor">
          {TREE_ART.snowPaths.map((p) => (
            <path key={p.color} d={p.d} fill={p.color} />
          ))}
        </g>

        {/* Garland strands (stage >= 2) */}
        <g className="pt-lit">
          {TREE_ART.garlandPaths.map((p) => (
            <path key={p.color} d={p.d} fill={p.color} />
          ))}
        </g>

        {/* Baubles (stage >= 1) */}
        <g className="pt-decor">
          {TREE_ART.ornamentPaths.map((p) => (
            <path key={p.color} d={p.d} fill={p.color} />
          ))}
        </g>

        {/* Topper star (dim until stage 4, bright gold at stage 4+) */}
        <g className="pt-star">
          {TREE_ART.starPaths.map((p) => (
            <path key={p.color} d={p.d} fill={p.color} />
          ))}
        </g>

        {/* Pixel bulbs + soft HD-2D light blooms */}
        <g className="pt-bulbs">
          {paletteBulbs.map((b, i) => (
            <g
              key={i}
              className="pt-bulb"
              style={{ "--pt-delay": b.twinkleDelay } as CSSProperties}
            >
              <circle
                cx={b.x + 0.5}
                cy={b.y + 0.5}
                r={2.8}
                fill={b.color}
                className="pt-bulb-glow"
              />
              <rect
                x={b.x}
                y={b.y}
                width={1}
                height={1}
                fill={lit ? b.color : "#29463c"}
                className="pt-bulb-core"
              />
            </g>
          ))}
        </g>

        {/* Extra celebratory shimmer pixels at stage 5 */}
        {full && (
          <g className="pt-shimmer">
            {[
              [21, 14],
              [34, 23],
              [17, 37],
              [38, 41],
              [13, 53],
              [42, 56],
            ].map(([sx, sy], i) => (
              <rect
                key={i}
                x={sx}
                y={sy}
                width={1}
                height={1}
                fill="#fff6cc"
                className="pt-sparkle-px"
                style={{ "--pt-delay": `${(i * 0.45) % 2.4}s` } as CSSProperties}
              />
            ))}
          </g>
        )}
      </svg>
    </button>
  );
});
