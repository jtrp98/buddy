"use client";

import { memo, useMemo, type CSSProperties } from "react";
import type { TreeLightMode } from "@/lib/join-scene";
import { gridToPaths } from "./pixelGrid";

/* -------------------------------------------------------------------------- */
/* 1. Cozy Pixel Cabin with glowing windows & rising chimney smoke            */
/* -------------------------------------------------------------------------- */

const CABIN_W = 36;
const CABIN_H = 26;

// 36 cols × 26 rows
const CABIN_GRID = [
  ".........................CC.........",
  "........................CCCC........",
  "........................SSSS........",
  "................SS......BBBB........",
  "...............SSSS.....BBBB........",
  "..............SSSSSS....BBBB........",
  ".............SSSSSSSS...BBBB........",
  "............SSSSSSSSSS..BBBB........",
  "...........SSssWWssSSSS.BBBB........",
  "..........SSssWWWWssSSSSBBBB........",
  ".........SSssWWWWWWssSSSSSSSS.......",
  "........SSssWWWWWWWWssSSSSSSSS......",
  ".......SSssWWsGGGGsWWssSSSSSSSS.....",
  "......SSssWWsGRRRRGWsWssSSSSSSSS....",
  ".....SSsWWWWWWWWWWWWWWWWWWsssSSSS...",
  "......KBBBBBBBBBBBBBBBBBBBBBBBBK....",
  "......KBbYYYYbBBDDDDDDbBBYYYYbBK....",
  "......KBYGYYGYBBDGGGGDBBYGYYGYBK....",
  "......KBYYYYYYBBDGRRGDBBYYYYYYBK....",
  "......KBBBBBBBBBDGGGGDBBBBBBBBBK....",
  "......KBbBBBBbBBDDDDKDBBbBBBBbBK....",
  "......KBBBBBBBBBDDDDDDBBBBBBBBBK....",
  "......KBBBBBBBBBDDDDDDBBBBBBBBBK....",
  ".....ssBBBBBBBBbDDDDDDbBBBBBBBBss...",
  "....sssssSSSSSSSDDDDDDSSSSSSSSssss..",
  ".....ssssssssssssssssssssssssssss...",
];

const CABIN_PALETTE: Record<string, string> = {
  S: "#d5e7f5",
  s: "#8fb3d1",
  C: "#694127",
  B: "#4e2f1e",
  b: "#351e12",
  W: "#6d452c",
  D: "#3d2315",
  Y: "#ffd67a",
  G: "#2a6e4a",
  R: "#d23a40",
  K: "#1a2238",
};

const CABIN_PATHS = gridToPaths(CABIN_GRID, CABIN_PALETTE, "#1a2238");

export const PixelCabin = memo(function PixelCabin({
  px,
  className = "",
  style,
}: {
  px: number;
  className?: string;
  style?: CSSProperties;
}) {
  const w = CABIN_W * px;
  const h = CABIN_H * px;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ width: w, height: h, ...style }}
    >
      {/* Warm window light spill on the snowbank */}
      <span
        className="glow-pulse pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: w * 1.4,
          height: h * 0.75,
          background:
            "radial-gradient(ellipse, rgba(255,204,102,0.28) 0%, rgba(255,168,76,0.08) 52%, transparent 75%)",
        }}
      />

      {/* Animated pixel chimney smoke puffs */}
      <div
        className="pointer-events-none absolute"
        style={{ left: 25 * px, top: -px * 3 }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="px-smoke-puff absolute block rounded-[1px] bg-[#cfe0ef]/65"
            style={
              {
                width: px * (i === 2 ? 3 : 2),
                height: px * 2,
                left: i * px,
                "--smoke-delay": `${i * 1.15}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${CABIN_W} ${CABIN_H}`}
        shapeRendering="crispEdges"
        className="relative block h-full w-full [image-rendering:pixelated]"
      >
        {CABIN_PATHS.map((p) => (
          <path key={p.color} d={p.d} fill={p.color} />
        ))}
      </svg>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* 2. Victorian Pixel Lamppost (clickable to toggle/pulse festoon lights)     */
/* -------------------------------------------------------------------------- */

const LAMP_W = 10;
const LAMP_H = 32;

// 10 cols × 32 rows
const LAMP_GRID = [
  "....SS....",
  "...SSSS...",
  "..KKKKKK..",
  "..KYYYYK..",
  "..KYWWYK..",
  "..KYYYYK..",
  "..KYYYYK..",
  "...KKKK...",
  "....II....",
  "...IIII...",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "....II....",
  "...IIII...",
  "...IIII...",
  "..IIIIII..",
  "..IIIIII..",
  ".ssssssss.",
  "..SSSSSS..",
];

const LAMP_ON_PALETTE: Record<string, string> = {
  S: "#cfe4f5",
  s: "#7fa5c7",
  K: "#1a2238",
  I: "#2d3c56",
  Y: "#ffcf66",
  W: "#fff6cc",
};

const LAMP_DIM_PALETTE: Record<string, string> = {
  ...LAMP_ON_PALETTE,
  Y: "#5b6d85",
  W: "#8ea2bd",
};

const LAMP_ON_PATHS = gridToPaths(LAMP_GRID, LAMP_ON_PALETTE, "#1a2238");
const LAMP_DIM_PATHS = gridToPaths(LAMP_GRID, LAMP_DIM_PALETTE, "#1a2238");

export const PixelLamppost = memo(function PixelLamppost({
  px,
  lit,
  onToggle,
  side,
  className = "",
  style,
}: {
  px: number;
  lit: boolean;
  onToggle?: () => void;
  side: "left" | "right";
  className?: string;
  style?: CSSProperties;
}) {
  const w = LAMP_W * px;
  const h = LAMP_H * px;
  const paths = lit ? LAMP_ON_PATHS : LAMP_DIM_PATHS;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`โคมไฟลานหมู่บ้านฝั่ง${side === "left" ? "ซ้าย" : "ขวา"} — แตะเพื่อเปิดหรือปิดไฟประดับ`}
      title="แตะเพื่อสลับไฟสายรุ้ง"
      className={`group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      style={{ width: w, height: h, ...style }}
    >
      {/* Warm lantern halo */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-500 ${
          lit ? "opacity-100" : "opacity-15"
        }`}
        style={{
          top: 4.5 * px,
          width: w * 4.2,
          height: w * 4.2,
          background:
            "radial-gradient(circle, rgba(255,220,125,0.45) 0%, rgba(255,178,76,0.16) 44%, transparent 72%)",
        }}
      />

      {/* Warm snow light pool beneath the post */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 -bottom-2 -translate-x-1/2 rounded-full transition-opacity duration-500 ${
          lit ? "opacity-90" : "opacity-10"
        }`}
        style={{
          width: w * 4.8,
          height: px * 10,
          background:
            "radial-gradient(ellipse, rgba(255,208,108,0.34) 0%, rgba(255,170,74,0.12) 55%, transparent 75%)",
        }}
      />

      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${LAMP_W} ${LAMP_H}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="relative block h-full w-full transition-transform duration-150 group-hover:scale-105 [image-rendering:pixelated]"
      >
        {paths.map((p) => (
          <path key={p.color} d={p.d} fill={p.color} />
        ))}
      </svg>
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/* 3. Festoon String Lights linking Left Lamp -> Tree -> Right Lamp           */
/* -------------------------------------------------------------------------- */

export const FestoonStringLights = memo(function FestoonStringLights({
  width,
  leftX,
  rightX,
  lampTopY,
  treeAnchorY,
  lit,
  lightMode,
  px,
}: {
  width: number;
  leftX: number;
  rightX: number;
  lampTopY: number;
  treeAnchorY: number;
  lit: boolean;
  lightMode: TreeLightMode;
  px: number;
}) {
  const centerX = width / 2;
  const spans = useMemo(() => {
    const buildArc = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      sag: number,
      count: number
    ) => {
      const cx = (x1 + x2) / 2;
      const cy = Math.max(y1, y2) + sag;
      const points = Array.from({ length: count }, (_, idx) => {
        const t = (idx + 1) / (count + 1);
        const omt = 1 - t;
        const bx = omt * omt * x1 + 2 * omt * t * cx + t * t * x2;
        const by = omt * omt * y1 + 2 * omt * t * cy + t * t * y2;
        return { x: Math.round(bx), y: Math.round(by), idx };
      });
      return {
        d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
        points,
      };
    };
    return [
      buildArc(leftX, lampTopY, centerX - px * 4, treeAnchorY, 26, 7),
      buildArc(centerX + px * 4, treeAnchorY, rightX, lampTopY, 26, 7),
    ];
  }, [leftX, rightX, lampTopY, treeAnchorY, centerX, px]);

  const warmColors = ["#ffe599", "#ff8e7a", "#ffd166", "#8ed6ff"];
  const auroraColors = ["#7ef2c8", "#a8f5ff", "#b9a6ff", "#ffe7a8"];
  const palette =
    lightMode === "aurora"
      ? auroraColors
      : lightMode === "candle"
        ? ["#ffd27a", "#ffbe59"]
        : warmColors;

  return (
    <svg
      width={width}
      height={Math.max(lampTopY, treeAnchorY) + 60}
      viewBox={`0 0 ${width} ${Math.max(lampTopY, treeAnchorY) + 60}`}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 overflow-visible"
      data-lit={lit}
      data-light-mode={lightMode}
    >
      {spans.map((arc, si) => (
        <g key={si}>
          <path d={arc.d} fill="none" stroke="#18243b" strokeWidth={1.6} opacity={0.85} />
          {arc.points.map((pt, bi) => {
            const color = palette[(bi + si * 3) % palette.length];
            return (
              <g
                key={bi}
                className="pt-festoon-bulb"
                style={{ "--pt-delay": `${((bi + si * 2) * 0.35) % 2.4}s` } as CSSProperties}
              >
                {lit && (
                  <circle cx={pt.x} cy={pt.y + px} r={px * 2.8} fill={color} opacity={0.22} />
                )}
                <rect
                  x={pt.x - Math.floor(px / 2)}
                  y={pt.y + 1}
                  width={px}
                  height={px}
                  fill={lit ? color : "#32455c"}
                />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
});

/* -------------------------------------------------------------------------- */
/* 4. Interactive Pixel Snowman                                               */
/* -------------------------------------------------------------------------- */

const SNOWMAN_W = 16;
const SNOWMAN_H = 22;

// 16 cols × 22 rows
const SNOWMAN_GRID = [
  "......KKKK......",
  ".....KHHHHK.....",
  ".....KHHHHK.....",
  ".....KRRRRK.....",
  "....KKKKKKKK....",
  ".....KSSSSK.....",
  "....KSEESEEK....",
  "....KSsOOOsK....",
  ".....KSSSSK.....",
  "....KKFFFFKK....",
  "..KK.KFFFFK.KK..",
  ".A..KSSSSSSK..A.",
  "A..KSSsKKsSSK..A",
  "...KSSsSSsSSK...",
  "...KSSsKKsSSK...",
  "...KSSSSSSSSK...",
  "..KSSsSSSSsSSK..",
  "..KSSsSSSSsSSK..",
  "..KSSssssssSSK..",
  "...KssssssssK...",
  "....KKKKKKKK....",
  "................",
];

const SNOWMAN_PALETTE: Record<string, string> = {
  K: "#1a2238",
  H: "#262d42",
  R: "#d23a40",
  S: "#e8f3fc",
  s: "#9fc1de",
  E: "#1a2238",
  O: "#f28533",
  F: "#e5484d",
  A: "#6e472c",
};

const SNOWMAN_PATHS = gridToPaths(SNOWMAN_GRID, SNOWMAN_PALETTE, "#1a2238");

export const PixelSnowman = memo(function PixelSnowman({
  px,
  wiggling,
  onClick,
  className = "",
  style,
}: {
  px: number;
  wiggling: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}) {
  const w = SNOWMAN_W * px;
  const h = SNOWMAN_H * px;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="ตุ๊กตาหิมะ — แตะเพื่อทักทาย"
      title="แตะตุ๊กตาหิมะดูสิ!"
      data-wiggle={wiggling}
      className={`px-snowman group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
      style={{ width: w, height: h, ...style }}
    >
      {wiggling && (
        <span
          aria-hidden="true"
          className="pb-speech-pop pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-white/25 bg-[#132238]/95 px-2 py-0.5 text-xs shadow-lg"
        >
          ❄️
        </span>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-[50%] bg-[#07111e]/45"
        style={{ width: w * 0.78, height: px * 2 }}
      />
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${SNOWMAN_W} ${SNOWMAN_H}`}
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="px-snowman-svg relative block h-full w-full transition-transform duration-150 group-hover:scale-105 [image-rendering:pixelated]"
      >
        {SNOWMAN_PATHS.map((p) => (
          <path key={p.color} d={p.d} fill={p.color} />
        ))}
      </svg>
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/* 5. Snow-Capped Wooden Fence & Frosted Pine Shrubs                          */
/* -------------------------------------------------------------------------- */

const FENCE_W = 20;
const FENCE_H = 11;

// 20 cols × 11 rows
const FENCE_GRID = [
  "..SS........SS......",
  ".KWWK......KWWK.....",
  ".KWWK......KWWK.....",
  "KWWWWWWWWWWWWWWWWWW.",
  "KBBBBBBBBBBBBBBBBBB.",
  ".KWWK......KWWK.....",
  "KWWWWWWWWWWWWWWWWWW.",
  "KBBBBBBBBBBBBBBBBBB.",
  ".KWWK......KWWK.....",
  ".KBBK......KBBK.....",
  "ssKKss....ssKKss....",
];

const FENCE_PATHS = gridToPaths(
  FENCE_GRID,
  {
    S: "#d5e7f5",
    s: "#6b93b8",
    W: "#6d452c",
    B: "#4b2d1c",
    K: "#1a2238",
  },
  "#1a2238"
);

const SHRUB_W = 14;
const SHRUB_H = 10;

// 14 cols × 10 rows
const SHRUB_GRID = [
  ".....SSSS.....",
  "....SSGGSS....",
  "...SSGGGGSS...",
  "..SGGGGGGGGS..",
  ".SSGGGgGGGGSS.",
  ".GGGGggGGGGGG.",
  "KGGGgggggGGGGK",
  "Kggg00gg00gggK",
  ".K0000000000K.",
  "..ssssssssss..",
];

const SHRUB_PATHS = gridToPaths(
  SHRUB_GRID,
  {
    S: "#cfe4f5",
    s: "#6b93b8",
    G: "#286e4c",
    g: "#184732",
    "0": "#0e2b20",
    K: "#1a2238",
  },
  "#1a2238"
);

export const PixelFenceAndShrubs = memo(function PixelFenceAndShrubs({
  px,
  side,
  className = "",
  style,
}: {
  px: number;
  side: "left" | "right";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex items-end gap-1 select-none ${
        side === "right" ? "-scale-x-100" : ""
      } ${className}`}
      style={style}
    >
      <svg
        width={SHRUB_W * px}
        height={SHRUB_H * px}
        viewBox={`0 0 ${SHRUB_W} ${SHRUB_H}`}
        shapeRendering="crispEdges"
        className="block [image-rendering:pixelated]"
      >
        {SHRUB_PATHS.map((p) => (
          <path key={p.color} d={p.d} fill={p.color} />
        ))}
      </svg>
      <svg
        width={FENCE_W * px}
        height={FENCE_H * px}
        viewBox={`0 0 ${FENCE_W} ${FENCE_H}`}
        shapeRendering="crispEdges"
        className="block [image-rendering:pixelated]"
      >
        {FENCE_PATHS.map((p) => (
          <path key={p.color} d={p.d} fill={p.color} />
        ))}
      </svg>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* 6. Dynamic Pixel Gift Pile (0..10 boxes around the tree roots)             */
/* -------------------------------------------------------------------------- */

interface GiftBoxSpec {
  w: number;
  h: number;
  dx: number;
  dy: number;
  paths: { color: string; d: string }[];
}

const GIFT_CONFIGS: {
  dx: number;
  dy: number;
  grid: string[];
  body: string;
  shade: string;
  ribbon: string;
}[] = [
  {
    dx: -24,
    dy: 1,
    body: "#d23a40",
    shade: "#942126",
    ribbon: "#ffd66b",
    grid: [
      "..RR.RR..",
      ".KBBBBBK.",
      ".KBRBRBK.",
      ".KRRRRRK.",
      ".KBBbBBK.",
      ".KbBbBbK.",
      ".KKKKKKK.",
    ],
  },
  {
    dx: 16,
    dy: 2,
    body: "#2f8a5b",
    shade: "#1c593a",
    ribbon: "#ff8c7a",
    grid: [
      "..RR.RR..",
      ".KBBBBBK.",
      ".KBRBRBK.",
      ".KRRRRRK.",
      ".KBBbBBK.",
      ".KbBbBbK.",
      ".KKKKKKK.",
    ],
  },
  {
    dx: -12,
    dy: 4,
    body: "#3b6fb6",
    shade: "#244778",
    ribbon: "#fff3cc",
    grid: [
      "...RR.RR...",
      ".KBBBBBBBK.",
      ".KBBBRBBBK.",
      ".KRRRRRRRK.",
      ".KBBBbBBBK.",
      ".KbbBbBbbK.",
      ".KKKKKKKKK.",
    ],
  },
  {
    dx: 7,
    dy: 4,
    body: "#d9a03a",
    shade: "#9c6d1d",
    ribbon: "#d23a40",
    grid: [
      "..R.R..",
      ".KBBBK.",
      ".KBRBK.",
      ".KRRRK.",
      ".KBbBK.",
      ".KKKKK.",
    ],
  },
  {
    dx: -33,
    dy: 3,
    body: "#7a4fa8",
    shade: "#4e2f70",
    ribbon: "#ffd66b",
    grid: [
      "..R.R..",
      ".KBBBK.",
      ".KBRBK.",
      ".KRRRK.",
      ".KBbBK.",
      ".KKKKK.",
    ],
  },
  {
    dx: 27,
    dy: 3,
    body: "#c7426b",
    shade: "#852442",
    ribbon: "#fff3cc",
    grid: [
      "..RR.RR..",
      ".KBBBBBK.",
      ".KBRBRBK.",
      ".KRRRRRK.",
      ".KBBbBBK.",
      ".KKKKKKK.",
    ],
  },
  {
    dx: -19,
    dy: -4,
    body: "#2a9d9a",
    shade: "#186361",
    ribbon: "#ffd66b",
    grid: [
      "..R.R..",
      ".KBBBK.",
      ".KBRBK.",
      ".KRRRK.",
      ".KBbBK.",
      ".KKKKK.",
    ],
  },
  {
    dx: 20,
    dy: -4,
    body: "#d23a40",
    shade: "#942126",
    ribbon: "#a8e6cf",
    grid: [
      "..R.R..",
      ".KBBBK.",
      ".KBRBK.",
      ".KRRRK.",
      ".KBbBK.",
      ".KKKKK.",
    ],
  },
  {
    dx: -2,
    dy: 5,
    body: "#e88838",
    shade: "#a65817",
    ribbon: "#fff3cc",
    grid: [
      "..RR.RR..",
      ".KBBBBBK.",
      ".KBRBRBK.",
      ".KRRRRRK.",
      ".KBBbBBK.",
      ".KKKKKKK.",
    ],
  },
  {
    dx: 34,
    dy: 4,
    body: "#3b6fb6",
    shade: "#244778",
    ribbon: "#ffd66b",
    grid: [
      "..R.R..",
      ".KBBBK.",
      ".KBRBK.",
      ".KRRRK.",
      ".KBbBK.",
      ".KKKKK.",
    ],
  },
];

const GIFT_BOXES: GiftBoxSpec[] = GIFT_CONFIGS.map((cfg) => ({
  w: cfg.grid[0].length,
  h: cfg.grid.length,
  dx: cfg.dx,
  dy: cfg.dy,
  paths: gridToPaths(
    cfg.grid,
    {
      B: cfg.body,
      b: cfg.shade,
      R: cfg.ribbon,
      K: "#1a2238",
    },
    "#1a2238"
  ),
}));

export const PixelGiftPile = memo(function PixelGiftPile({
  count,
  px,
  centerX,
  treeBottomY,
  zIndex,
}: {
  count: number;
  px: number;
  centerX: number;
  treeBottomY: number;
  zIndex: number;
}) {
  if (count <= 0) return null;
  const shown = GIFT_BOXES.slice(0, Math.min(GIFT_BOXES.length, count));

  return (
    <div aria-hidden="true" className="pointer-events-none">
      {shown.map((box, i) => (
        <svg
          key={i}
          width={box.w * px}
          height={box.h * px}
          viewBox={`0 0 ${box.w} ${box.h}`}
          shapeRendering="crispEdges"
          className="px-gift-box absolute [image-rendering:pixelated]"
          style={
            {
              left: Math.round(centerX + box.dx * px - (box.w * px) / 2),
              top: Math.round(treeBottomY + box.dy * px - box.h * px),
              zIndex: zIndex + (box.dy > 0 ? 4 : 1),
              "--gift-delay": `${i * 75}ms`,
            } as CSSProperties
          }
        >
          {box.paths.map((p) => (
            <path key={p.color} d={p.d} fill={p.color} />
          ))}
        </svg>
      ))}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* 7. Cozy Pixel Picnic / Cocoa Table with Warm Candle & Benches              */
/* -------------------------------------------------------------------------- */

export const PICNIC_TABLE_W = 24;
export const PICNIC_TABLE_H = 13;

// 24 cols × 13 rows
const PICNIC_TABLE_GRID = [
  "...........YY...........",
  ".......m...WW...m.......",
  ".......CC..WW..CC.......",
  ".....SSSSSSSSSSSSSS.....",
  "....KWWWWWWWWWWWWWWK....",
  "....KBBBBBBBBBBBBBBK....",
  "SSSS...KBBK..KBBK...SSSS",
  "KWWWWK.KBBK..KBBK.KWWWWK",
  "KBBBBK.KBBK..KBBK.KBBBBK",
  "..KBBK.KBBK..KBBK.KBBK..",
  "..KBBK.KBBK..KBBK.KBBK..",
  ".sKKKKsKKKKssKKKKsKKKKs.",
  "........................",
];

const PICNIC_TABLE_PATHS = gridToPaths(
  PICNIC_TABLE_GRID,
  {
    Y: "#ffe478",
    m: "#dbeeff",
    C: "#d23a40",
    W: "#7a4c30",
    B: "#4e2f1d",
    S: "#d5e7f5",
    s: "#6b93b8",
    K: "#1a2238",
  },
  "#1a2238"
);

export const PixelPicnicTable = memo(function PixelPicnicTable({
  px,
  className = "",
  style,
}: {
  px: number;
  className?: string;
  style?: CSSProperties;
}) {
  const w = PICNIC_TABLE_W * px;
  const h = PICNIC_TABLE_H * px;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ width: w, height: h, ...style }}
    >
      {/* Warm candle glow over the tabletop */}
      <span
        className="glow-pulse pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          top: px * 2,
          width: w * 0.9,
          height: h * 1.4,
          background:
            "radial-gradient(ellipse, rgba(255,214,116,0.38) 0%, rgba(255,168,76,0.12) 48%, transparent 74%)",
        }}
      />
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${PICNIC_TABLE_W} ${PICNIC_TABLE_H}`}
        shapeRendering="crispEdges"
        className="relative block h-full w-full [image-rendering:pixelated]"
      >
        {PICNIC_TABLE_PATHS.map((p) => (
          <path key={p.color} d={p.d} fill={p.color} />
        ))}
      </svg>
    </div>
  );
});
