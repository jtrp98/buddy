import { hashString, seededRandom } from "@/lib/prng";
import { gridToPaths, padAndOutlineGrid } from "./pixelGrid";

export { gridToPaths };

/**
 * 8-bit participant sprites for the Join page & avatars.
 *
 * Each buddy is a 12×16 palette-indexed pixel grid (plus an automatic 1px
 * twilight-navy outline → 14×18). The look — skin, hair style, coat, scarf,
 * hat, held winter prop, boots — is derived deterministically from the
 * participant's anonymous seed, so the same person always looks the same on
 * every device without exposing who they are.
 */

export type FrameName = "idle" | "walkA" | "walkB" | "waveA" | "waveB" | "jump" | "sit";
export const FRAME_NAMES: FrameName[] = ["idle", "walkA", "walkB", "waveA", "waveB", "jump", "sit"];

export const SPRITE_W = 14;
export const SPRITE_H = 18;

// Legend: . empty · H hair · S skin · E eye · R blush · C coat · c coat shade · W trim
//         F scarf · f scarf shade · P trousers · B boots · T hat · t hat band · O pompom
//         X santa red · A wood/antler · M prop main · m prop glow/accent
const BASE: string[] = [
  "............",
  "............",
  "...HHHHHH...",
  "..HHHHHHHH..",
  "..HSSSSSSH..",
  "..SSESSESS..",
  "..SRSSSSRS..",
  "...SSSSSS...",
  "..FFFFFFFF..",
  ".CCCFfCCCCC.",
  "SCCCFfWCCCcS",
  ".cCCCCWCCCc.",
  "..WWWWWWWW..",
  "..PPP..PPP..",
  "..PPP..PPP..",
  ".BBBB..BBBB.",
];

type Patch = [row: number, col: number, ch: string];

function applyRows(grid: string[], rows: Record<number, string>): string[] {
  return grid.map((line, i) => rows[i] ?? line);
}

function applyPatches(grid: string[], patches: Patch[]): string[] {
  const g = grid.map((l) => l.split(""));
  for (const [r, c, ch] of patches) {
    if (g[r] && c >= 0 && c < g[r].length) g[r][c] = ch;
  }
  return g.map((l) => l.join(""));
}

function overlay(grid: string[], layer: string[]): string[] {
  return grid.map((line, r) => {
    const over = layer[r];
    if (!over) return line;
    return line
      .split("")
      .map((ch, c) => (over[c] && over[c] !== "." ? over[c] : ch))
      .join("");
  });
}

const FRAME_BUILDERS: Record<FrameName, (g: string[]) => string[]> = {
  idle: (g) => g,
  walkA: (g) =>
    applyRows(g, {
      13: "...PP..PP...",
      14: "..PP....PP..",
      15: ".BBB....BBB.",
    }),
  walkB: (g) =>
    applyRows(g, {
      13: "...PPPPPP...",
      14: "....PPPP....",
      15: "...BBBBBB...",
    }),
  waveA: (g) =>
    applyPatches(g, [
      [10, 11, "."],
      [10, 10, "c"],
      [5, 11, "S"],
      [6, 11, "C"],
      [7, 11, "C"],
      [8, 11, "C"],
      [9, 11, "C"],
    ]),
  waveB: (g) =>
    applyPatches(g, [
      [10, 11, "."],
      [10, 10, "c"],
      [4, 11, "S"],
      [5, 11, "S"],
      [6, 11, "C"],
      [7, 11, "C"],
      [8, 11, "C"],
      [9, 11, "C"],
    ]),
  jump: (g) =>
    applyPatches(
      applyRows(g, {
        13: "..PPPPPPPP..",
        14: "..BBB..BBB..",
        15: "............",
      }),
      [
        [10, 0, "."],
        [10, 11, "."],
        [10, 1, "C"],
        [10, 10, "c"],
        [5, 0, "S"],
        [6, 0, "C"],
        [7, 0, "C"],
        [8, 0, "C"],
        [9, 0, "C"],
        [5, 11, "S"],
        [6, 11, "C"],
        [7, 11, "C"],
        [8, 11, "C"],
        [9, 11, "C"],
      ]
    ),
  sit: (g) =>
    applyRows(g, {
      12: "..WWWWWWWW..",
      13: "..PPPPPPPP..",
      14: ".BBBB..BBBB.",
      15: "............",
    }),
};

export type HairStyle = "short" | "long" | "bun" | "spiky";
export type HatStyle = "beanie" | "santa" | "earmuffs" | "antlers" | "trapper" | "none";
export type BuddyProp = "none" | "cocoa" | "lantern" | "gift" | "candy";

const HAIR_PATCHES: Record<HairStyle, Patch[]> = {
  short: [],
  long: [
    [4, 1, "H"],
    [5, 1, "H"],
    [6, 1, "H"],
    [7, 1, "H"],
    [7, 2, "H"],
    [4, 10, "H"],
    [5, 10, "H"],
    [6, 10, "H"],
    [7, 10, "H"],
    [7, 9, "H"],
  ],
  bun: [
    [0, 5, "H"],
    [0, 6, "H"],
    [1, 4, "H"],
    [1, 5, "H"],
    [1, 6, "H"],
    [1, 7, "H"],
  ],
  spiky: [
    [1, 3, "H"],
    [1, 5, "H"],
    [1, 7, "H"],
    [1, 8, "H"],
  ],
};

const HAT_LAYERS: Record<HatStyle, string[]> = {
  none: [],
  beanie: [
    ".....OO.....",
    "....TTTT....",
    "...TTTTTT...",
    "..tttttttt..",
  ],
  santa: [
    ".......XXXO.",
    "....XXXX..O.",
    "...XXXXXX...",
    "..WWWWWWWW..",
  ],
  earmuffs: [
    "............",
    "...TTTTTT...",
    "..T......T..",
    ".T........T.",
    ".O........O.",
    ".O........O.",
  ],
  antlers: [
    ".A........A.",
    ".AA......AA.",
    "..A.XXXX.A..",
    "............",
  ],
  trapper: [
    "............",
    "...TTTTTT...",
    "..TTTTTTTT..",
    "..WWWWWWWW..",
    ".T........T.",
    ".W........W.",
  ],
};

const PROP_PATCHES: Record<BuddyProp, Patch[]> = {
  none: [],
  cocoa: [
    [8, 0, "m"],
    [9, 0, "W"],
    [10, 0, "M"],
    [11, 0, "M"],
    [10, 1, "S"],
  ],
  lantern: [
    [10, 0, "S"],
    [11, 0, "A"],
    [12, 0, "m"],
    [13, 0, "A"],
  ],
  gift: [
    [9, 0, "m"],
    [10, 0, "M"],
    [10, 1, "m"],
    [11, 0, "M"],
    [11, 1, "M"],
    [9, 1, "S"],
  ],
  candy: [
    [7, 0, "M"],
    [7, 1, "W"],
    [8, 0, "W"],
    [9, 0, "M"],
    [10, 0, "S"],
    [11, 0, "W"],
    [12, 0, "M"],
  ],
};

const SKINS = ["#f7d7bb", "#ecb994", "#cf956b", "#9a6542", "#6e4529"];
const HAIRS = ["#3a2418", "#6b3d1f", "#d9a441", "#1d1b22", "#a3492a", "#e7e0cf"];
const COATS: [string, string][] = [
  ["#c5343b", "#8a1f26"],
  ["#2f8a5b", "#1d5c3c"],
  ["#3b6fb6", "#244a80"],
  ["#7a4fa8", "#523274"],
  ["#d9a03a", "#a87525"],
  ["#2a9d9a", "#1b6c6a"],
  ["#b23f74", "#7a274d"],
  ["#2c4a7a", "#1b2e50"],
];
const SCARVES: [string, string][] = [
  ["#f3d27a", "#c9a24a"],
  ["#f8fafc", "#c7d3db"],
  ["#e5484d", "#a72f33"],
  ["#4fbf7f", "#2f8a5b"],
  ["#7ad3c0", "#3f9f8c"],
  ["#ff9f6b", "#d26c3b"],
];
const HATS: [string, string, string][] = [
  ["#e5484d", "#a72f33", "#f8fafc"],
  ["#2f8a5b", "#1d5c3c", "#f8fafc"],
  ["#f3d27a", "#c9a24a", "#ffffff"],
  ["#3b6fb6", "#244a80", "#f8fafc"],
  ["#7a4fa8", "#523274", "#f3d27a"],
];
const PROP_PALETTES: [string, string][] = [
  ["#d23a40", "#ffe7a8"],
  ["#2f8a5b", "#ffd27a"],
  ["#3b6fb6", "#ffe7a8"],
  ["#d9a03a", "#fff3d1"],
];
const TROUSERS = ["#2b2f3a", "#3d3328", "#24324a", "#3a2a3f"];
const BOOTS = ["#5a3a24", "#2a1e18", "#7a2b2b", "#2f3a2f"];
const HAIR_STYLES: HairStyle[] = ["short", "long", "bun", "spiky", "short", "long"];
const HAT_STYLES: HatStyle[] = ["beanie", "santa", "earmuffs", "antlers", "trapper", "none", "beanie", "santa"];
const PROPS: BuddyProp[] = ["none", "cocoa", "lantern", "gift", "candy", "none", "cocoa", "lantern"];

export const OUTLINE = "#1a2238";

export interface BuddyLook {
  hair: HairStyle;
  hat: HatStyle;
  prop: BuddyProp;
  palette: Record<string, string>;
}

function pick<T>(list: T[], rand: () => number): T {
  return list[Math.floor(rand() * list.length) % list.length];
}

/** Deterministic appearance for a participant seed. */
export function buddyLook(seed: string): BuddyLook {
  const rand = seededRandom(hashString(seed));
  const skin = pick(SKINS, rand);
  const hair = pick(HAIRS, rand);
  const coat = pick(COATS, rand);
  let scarf = pick(SCARVES, rand);
  const hat = pick(HATS, rand);
  const hairStyle = pick(HAIR_STYLES, rand);
  const hatStyle = pick(HAT_STYLES, rand);
  const prop = pick(PROPS, rand);
  const propColor = pick(PROP_PALETTES, rand);
  // Avoid a scarf that disappears into a same-colour coat.
  if (scarf[0] === coat[0]) scarf = SCARVES[(SCARVES.indexOf(scarf) + 1) % SCARVES.length];
  return {
    hair: hairStyle,
    hat: hatStyle,
    prop,
    palette: {
      H: hair,
      S: skin,
      E: OUTLINE,
      R: "#f08f8f",
      C: coat[0],
      c: coat[1],
      W: "#f8fafc",
      F: scarf[0],
      f: scarf[1],
      P: pick(TROUSERS, rand),
      B: pick(BOOTS, rand),
      T: hat[0],
      t: hat[1],
      O: hat[2],
      X: "#d23a40",
      A: "#8b5a36",
      M: propColor[0],
      m: propColor[1],
    },
  };
}

/** Builds the grid for one frame, with hair, hat, and held prop applied, padded + outlined (14×18). */
export function buildFrame(look: BuddyLook, frame: FrameName): string[] {
  let g = FRAME_BUILDERS[frame](BASE);
  g = applyPatches(g, HAIR_PATCHES[look.hair]);
  g = overlay(g, HAT_LAYERS[look.hat]);
  if (look.prop !== "none" && (frame === "idle" || frame === "walkA" || frame === "walkB" || frame === "sit")) {
    g = applyPatches(g, PROP_PATCHES[look.prop]);
  }
  return padAndOutlineGrid(g, SPRITE_W, "K");
}

const cache = new Map<string, Record<FrameName, { color: string; d: string }[]>>();

/** All frames for a seed, ready to render (memoised). */
export function spriteFrames(seed: string) {
  const hit = cache.get(seed);
  if (hit) return hit;
  const look = buddyLook(seed);
  const frames = Object.fromEntries(
    FRAME_NAMES.map((f) => [f, gridToPaths(buildFrame(look, f), look.palette, OUTLINE)])
  ) as Record<FrameName, { color: string; d: string }[]>;
  if (cache.size > 400) cache.clear();
  cache.set(seed, frames);
  return frames;
}
