"use client";

import { useId, type CSSProperties } from "react";
import { r1, seededRandom } from "@/lib/prng";

/**
 * The Secret Buddy Christmas tree — a layered, lit SVG illustration.
 *
 * `stage` drives how decorated it is (used by the Join page progression):
 *   0 bare tree · 1 baubles + snow · 2 lights on · 3 gifts · 4 glowing star · 5 fully decorated
 * Everything is toggled with data-attributes + CSS transitions (see styles/scenery.css),
 * so stage changes animate smoothly without re-mounting anything.
 */

const CX = 150;

interface Tier {
  top: number;
  bottom: number;
  w: number;
  scallops: number;
}

const TIERS: Tier[] = [
  { top: 44, bottom: 102, w: 42, scallops: 4 },
  { top: 72, bottom: 148, w: 68, scallops: 5 },
  { top: 108, bottom: 198, w: 94, scallops: 6 },
  { top: 150, bottom: 252, w: 118, scallops: 7 },
  { top: 196, bottom: 308, w: 140, scallops: 8 },
];

interface Scallop {
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
}

interface TierGeometry {
  d: string;
  scallops: Scallop[];
}

function buildTier(t: Tier, rand: () => number): TierGeometry {
  const h = t.bottom - t.top;
  const step = (2 * t.w) / t.scallops;
  const scallops: Scallop[] = [];
  let d = `M ${CX} ${t.top} Q ${r1(CX + t.w * 0.36)} ${r1(t.top + h * 0.6)} ${CX + t.w} ${t.bottom}`;
  let prevY = t.bottom;
  for (let i = 0; i < t.scallops; i++) {
    const x1 = CX + t.w - step * i;
    const x2 = x1 - step;
    const depth = 8 + rand() * 5;
    const y2 = i === t.scallops - 1 ? t.bottom : t.bottom - 3 - rand() * 3;
    const s = { x1: r1(x1), y1: r1(prevY), cx: r1((x1 + x2) / 2), cy: r1(t.bottom + depth), x2: r1(x2), y2: r1(y2) };
    scallops.push(s);
    d += ` Q ${s.cx} ${s.cy} ${s.x2} ${s.y2}`;
    prevY = y2;
  }
  d += ` Q ${r1(CX - t.w * 0.36)} ${r1(t.top + h * 0.6)} ${CX} ${t.top} Z`;
  return { d, scallops };
}

/** Half-width of a tier at a given fraction of its height (concave cone). */
function halfWidthAt(t: Tier, f: number) {
  return t.w * Math.pow(f, 1.12);
}

interface Bulb {
  x: number;
  y: number;
  color: string;
  delay: number;
  twinkle: number;
}

interface Swag {
  d: string;
  bulbs: Bulb[];
}

const BULB_COLORS = ["#ffe7a8", "#ffc552", "#ffe7a8", "#ff6f61", "#ffe7a8", "#ffc552", "#ffe7a8", "#9fd0ff"];
const UNIQUE_BULB_COLORS = Array.from(new Set(BULB_COLORS));

function quad(p0: number, p1: number, p2: number, t: number) {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}

function buildSwags(rand: () => number): Swag[] {
  const swags: Swag[] = [];
  let bulbIndex = 0;
  TIERS.forEach((t, ti) => {
    const fractions = ti >= 3 ? [0.4, 0.8] : ti >= 1 ? [0.72] : [0.7];
    fractions.forEach((f, fi) => {
      const h = t.bottom - t.top;
      const half = halfWidthAt(t, f) * 0.92;
      const tilt = (ti + fi) % 2 === 0 ? 1 : -1;
      const yL = t.top + h * f - tilt * 4;
      const yR = t.top + h * f + tilt * 4;
      const sag = 12 + half * 0.08;
      const x0 = CX - half;
      const x2 = CX + half;
      const cyCtrl = (yL + yR) / 2 + sag;
      const d = `M ${r1(x0)} ${r1(yL)} Q ${CX} ${r1(cyCtrl)} ${r1(x2)} ${r1(yR)}`;
      const count = Math.max(3, Math.round((half * 2) / 15));
      const bulbs: Bulb[] = [];
      for (let i = 0; i < count; i++) {
        const tt = (i + 0.5) / count;
        bulbs.push({
          x: r1(quad(x0, CX, x2, tt)),
          y: r1(quad(yL, cyCtrl, yR, tt)),
          color: BULB_COLORS[bulbIndex % BULB_COLORS.length],
          delay: bulbIndex * 35,
          twinkle: r1(2.6 + rand() * 2.4),
        });
        bulbIndex++;
      }
      swags.push({ d, bulbs });
    });
  });
  return swags;
}

interface Ornament {
  x: number;
  y: number;
  r: number;
  color: "red" | "gold" | "ivory";
  full: boolean;
  sway: boolean;
}

function buildOrnaments(rand: () => number): Ornament[] {
  const out: Ornament[] = [];
  const colors: Ornament["color"][] = ["red", "gold", "ivory", "red", "gold"];
  let n = 0;
  TIERS.forEach((t, ti) => {
    const perTier = 1 + ti;
    for (let i = 0; i < perTier + 1; i++) {
      const f = 0.45 + rand() * 0.45;
      const h = t.bottom - t.top;
      const half = halfWidthAt(t, f) * 0.78;
      const x = CX - half + ((i + 0.5) / (perTier + 1)) * half * 2 + (rand() - 0.5) * 8;
      out.push({
        x: r1(x),
        y: r1(t.top + h * f),
        r: r1(4.4 + rand() * 1.8 + ti * 0.25),
        color: colors[n % colors.length],
        full: i % 2 === 1,
        sway: n % 3 === 0,
      });
      n++;
    }
  });
  return out;
}

interface Needle {
  d: string;
  light: boolean;
}

function buildNeedles(rand: () => number): Needle[] {
  const out: Needle[] = [];
  TIERS.forEach((t) => {
    const h = t.bottom - t.top;
    for (let i = 0; i < 7; i++) {
      const f = 0.3 + rand() * 0.6;
      const half = halfWidthAt(t, f);
      const light = i < 4;
      const x = light ? CX - half * (0.25 + rand() * 0.6) : CX + half * (0.2 + rand() * 0.6);
      const y = t.top + h * f;
      const dx = light ? 9 : -9;
      out.push({ d: `M ${r1(x)} ${r1(y)} q ${dx / 2} ${r1(2 + rand() * 2)} ${dx} ${r1(1 + rand() * 3)}`, light });
    }
  });
  return out;
}

function starPath(cx: number, cy: number, R: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${r1(cx + rad * Math.cos(a))},${r1(cy + rad * Math.sin(a))}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

const SPARKLE = "M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6 Z";

// Geometry is generated once per module load from a fixed seed (identical on server and client).
const RAND = seededRandom(1225);
const TIER_GEOMETRY = TIERS.map((t) => buildTier(t, RAND));
const SWAGS = buildSwags(RAND);
const ORNAMENTS = buildOrnaments(RAND);
const NEEDLES = buildNeedles(RAND);
const STAR = starPath(CX, 30, 19, 8);
const SPARKLES = [
  [96, 92], [206, 120], [70, 196], [232, 214], [112, 262], [196, 286], [150, 140], [58, 280],
].map(([x, y], i) => ({ x, y, delay: i * 420 }));

const GARLANDS = TIERS.slice(1).map((t, i) => {
  const h = t.bottom - t.top;
  const f = 0.56;
  const half = halfWidthAt(t, f) * 0.95;
  const dir = i % 2 === 0 ? 1 : -1;
  const yA = t.top + h * (f - 0.12);
  const yB = t.top + h * (f + 0.12);
  return `M ${r1(CX - half * dir)} ${r1(yA)} Q ${CX} ${r1((yA + yB) / 2 + 10)} ${r1(CX + half * dir)} ${r1(yB)}`;
});

const ORNAMENT_FILL: Record<Ornament["color"], [string, string]> = {
  red: ["#ff8579", "#9c1d24"],
  gold: ["#fff0b8", "#b8892d"],
  ivory: ["#ffffff", "#c9c2ae"],
};

interface Gift {
  x: number;
  y: number;
  w: number;
  h: number;
  box: [string, string];
  ribbon: string;
  delay: number;
}

const GIFTS: Gift[] = [
  { x: 62, y: 300, w: 50, h: 40, box: ["#c5343b", "#84191f"], ribbon: "#f1d27e", delay: 0 },
  { x: 108, y: 316, w: 30, h: 24, box: ["#fff3d9", "#d9c7a0"], ribbon: "#b3262e", delay: 160 },
  { x: 176, y: 306, w: 46, h: 34, box: ["#1f6a4a", "#0f3b2a"], ribbon: "#f1d27e", delay: 300 },
  { x: 218, y: 318, w: 30, h: 22, box: ["#e9c46a", "#a9873a"], ribbon: "#b3262e", delay: 440 },
];

export interface ChristmasTreeProps {
  stage?: number;
  celebrating?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Show the soft snow mound under the tree (off when a scene already has ground). */
  ground?: boolean;
  /** Hide the topper star (for plain background pines). */
  star?: boolean;
  title?: string;
}

export function ChristmasTree({
  stage = 5,
  celebrating = false,
  className = "",
  style,
  ground = true,
  star = true,
  title,
}: ChristmasTreeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = Math.max(0, Math.min(5, Math.floor(stage)));
  const id = (name: string) => `${uid}-${name}`;

  return (
    <svg
      viewBox="0 0 300 350"
      overflow="visible"
      className={`xmas-tree select-none ${className}`}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-stage={s}
      data-decorated={s >= 1}
      data-lit={s >= 2}
      data-gifts={s >= 3}
      data-star={s >= 4}
      data-full={s >= 5}
      data-celebrating={celebrating}
    >
      <defs>
        <linearGradient id={id("needles")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f8455" />
          <stop offset="0.38" stopColor="#1e6443" />
          <stop offset="0.72" stopColor="#134a33" />
          <stop offset="1" stopColor="#0b3324" />
        </linearGradient>
        <linearGradient id={id("depth")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#02140c" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={id("trunk")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a4a2a" />
          <stop offset="1" stopColor="#3f2414" />
        </linearGradient>
        <radialGradient id={id("aura")} cx="50%" cy="55%" r="50%">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ffb84d" stopOpacity="0.14" />
          <stop offset="1" stopColor="#ffb84d" stopOpacity="0" />
        </radialGradient>
        {UNIQUE_BULB_COLORS.map((c, ci) => (
          <radialGradient key={c} id={id(`bulb-${ci}`)} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="0.25" stopColor={c} stopOpacity="0.6" />
            <stop offset="1" stopColor={c} stopOpacity="0" />
          </radialGradient>
        ))}
        <radialGradient id={id("halo")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#ffd27a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("star")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4c4" />
          <stop offset="0.5" stopColor="#f1c75a" />
          <stop offset="1" stopColor="#b8892d" />
        </linearGradient>
        <radialGradient id={id("snow")} cx="50%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfdde6" />
        </radialGradient>
        {(["red", "gold", "ivory"] as const).map((c) => (
          <radialGradient key={c} id={id(`orn-${c}`)} cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.18" stopColor={ORNAMENT_FILL[c][0]} />
            <stop offset="1" stopColor={ORNAMENT_FILL[c][1]} />
          </radialGradient>
        ))}
      </defs>

      {/* Warm aura behind the tree once the lights are on */}
      <ellipse className="tree-aura" cx={CX} cy={190} rx={185} ry={190} fill={`url(#${id("aura")})`} />

      {ground ? (
        <g>
          <ellipse cx={CX} cy={342} rx={160} ry={18} fill="rgba(3,12,10,0.35)" />
          <ellipse cx={CX} cy={336} rx={150} ry={16} fill={`url(#${id("snow")})`} />
        </g>
      ) : (
        <ellipse cx={CX} cy={336} rx={128} ry={11} fill="rgba(40,70,90,0.22)" />
      )}

      {/* Trunk */}
      <rect x={138} y={292} width={24} height={44} rx={4} fill={`url(#${id("trunk")})`} />

      {/* Tiers: drawn bottom-up so upper tiers overlap lower ones, each casting a soft shadow */}
      {TIER_GEOMETRY.map((g, i) => ({ g, i }))
        .reverse()
        .map(({ g, i }) => (
          <g key={i}>
            {i < TIER_GEOMETRY.length - 1 && (
              <path d={g.d} transform="translate(0 7)" fill="rgba(2,16,10,0.38)" />
            )}
            <path d={g.d} fill={`url(#${id("needles")})`} />
            <path d={g.d} fill={`url(#${id("depth")})`} />
            {NEEDLES.slice(i * 7, i * 7 + 7).map((n, ni) => (
              <path
                key={ni}
                d={n.d}
                fill="none"
                stroke={n.light ? "#4fa874" : "#06241a"}
                strokeOpacity={n.light ? 0.55 : 0.5}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            ))}
            {/* A light dusting of snow on some branch tips (moonlit left side only) */}
            {g.scallops.map((sc, si) =>
              (si + i) % 2 === 0 && sc.cx < CX + TIERS[i].w * 0.1 ? (
                <path
                  key={si}
                  d={`M ${r1((sc.x1 + sc.cx) / 2)} ${r1((sc.y1 + sc.cy) / 2 - 3)} Q ${sc.cx} ${r1(sc.cy - 4)} ${r1((sc.x2 + sc.cx) / 2)} ${r1((sc.y2 + sc.cy) / 2 - 3)}`}
                  fill="none"
                  stroke="#eef4f7"
                  strokeOpacity={sc.cx < CX - TIERS[i].w * 0.3 ? 0.9 : 0.65}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
              ) : null
            )}
          </g>
        ))}

      {/* Gold bead garland (fully decorated) */}
      <g className="tree-full">
        {GARLANDS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#f3d27a"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeDasharray="0.1 5.4"
          />
        ))}
      </g>

      {/* Light strands */}
      <g className="tree-lights">
        {SWAGS.map((swag, i) => (
          <g key={i}>
            <path d={swag.d} fill="none" stroke="#0a1a12" strokeOpacity={0.7} strokeWidth={0.9} />
            {swag.bulbs.map((b, bi) => (
              <g key={bi} style={{ "--d": `${b.delay}ms`, "--on": b.color } as CSSProperties}>
                <g className="tree-bulb-glow">
                  <circle
                    className="tree-bulb-twinkle"
                    cx={b.x}
                    cy={b.y}
                    r={9}
                    fill={`url(#${id(`bulb-${UNIQUE_BULB_COLORS.indexOf(b.color)}`)})`}
                    style={{ animationDuration: `${b.twinkle}s`, animationDelay: `-${b.delay * 3}ms` }}
                  />
                </g>
                <circle className="tree-bulb-core" cx={b.x} cy={b.y} r={2.5} />
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* Baubles: a few from the start, more once fully decorated */}
      {ORNAMENTS.map((o, i) => (
        <g key={i} className={o.full ? "tree-full" : "tree-decor"}>
          <g className={o.sway ? "gentle-sway ambient-motion" : undefined} style={{ animationDelay: `-${i * 0.7}s` }}>
            <line x1={o.x} y1={o.y - o.r - 4} x2={o.x} y2={o.y - o.r} stroke="#d8c08a" strokeWidth={0.8} />
            <rect x={o.x - 1.6} y={o.y - o.r - 1.6} width={3.2} height={2.4} rx={0.6} fill="#d6b45e" />
            <circle cx={o.x} cy={o.y} r={o.r} fill={`url(#${id(`orn-${o.color}`)})`} />
          </g>
        </g>
      ))}

      {/* Twinkling sparkles (fully decorated) */}
      <g className="tree-full">
        {SPARKLES.map((sp, i) => (
          <path
            key={i}
            d={SPARKLE}
            transform={`translate(${sp.x} ${sp.y})`}
            fill="#fff6d6"
            className="xmas-twinkle"
            style={{ animationDelay: `${sp.delay}ms` }}
          />
        ))}
      </g>

      {/* Gifts beneath the tree */}
      <g className="tree-gifts">
        {GIFTS.map((g, i) => (
          <g key={i} style={{ "--d": `${g.delay}ms` } as CSSProperties}>
            <ellipse cx={g.x + g.w / 2} cy={g.y + g.h} rx={g.w * 0.6} ry={3.5} fill="rgba(3,12,10,0.3)" />
            <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={2.5} fill={g.box[0]} />
            <rect x={g.x + g.w * 0.62} y={g.y} width={g.w * 0.38} height={g.h} fill={g.box[1]} opacity={0.55} />
            <rect x={g.x - 2} y={g.y - 5} width={g.w + 4} height={8} rx={2} fill={g.box[0]} />
            <rect x={g.x - 2} y={g.y - 5} width={g.w + 4} height={8} rx={2} fill="#fff" opacity={0.12} />
            <rect x={g.x + g.w / 2 - 3} y={g.y - 5} width={6} height={g.h + 5} fill={g.ribbon} />
            <path
              d={`M ${g.x + g.w / 2} ${g.y - 5} c -10 -10 -16 -2 -9 3 Z M ${g.x + g.w / 2} ${g.y - 5} c 10 -10 16 -2 9 3 Z`}
              fill={g.ribbon}
            />
            <circle cx={g.x + g.w / 2} cy={g.y - 5} r={2.4} fill={g.ribbon} />
          </g>
        ))}
      </g>

      {/* Star: present by default, glows from stage 4 */}
      {star && (
      <>
      <g className="tree-star-halo">
        <circle cx={CX} cy={30} r={46} fill={`url(#${id("halo")})`} className="glow-pulse" />
        <g className="tree-star-rays">
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M ${CX} 30 L ${CX - 1.6} ${30 - 44} L ${CX} ${30 - 58} L ${CX + 1.6} ${30 - 44} Z`}
              fill="#fff1c4"
              opacity={0.35}
              transform={`rotate(${i * 45} ${CX} 30)`}
            />
          ))}
        </g>
      </g>
      <path d={STAR} fill="#8c7440" stroke="#5e4c25" strokeWidth={1} />
      <path d={STAR} fill={`url(#${id("star")})`} className="tree-star-bright" />
      </>
      )}
    </svg>
  );
}
