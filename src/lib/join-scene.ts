import { hashString } from "@/lib/prng";

/**
 * Pure logic for the Join page Christmas scene: tree progression, the five-person
 * celebration trigger and where each participant character stands.
 * Kept free of React/DOM so it can be unit tested.
 */

/** Visual milestone only — never used for matching or registration rules. */
export const CELEBRATION_THRESHOLD = 5;

export const TREE_MILESTONES = [
  { count: 1, label: "ต้นคริสต์มาส", en: "Christmas begins" },
  { count: 2, label: "ไฟประดับ", en: "Christmas lights" },
  { count: 3, label: "ของขวัญ", en: "Christmas gifts" },
  { count: 4, label: "ดาวเรืองแสง", en: "Glowing star" },
  { count: 5, label: "ฉลองคริสต์มาส", en: "Christmas celebration" },
] as const;

/** 0 = nobody yet, 1..5 = milestones; stays at 5 beyond five participants. */
export function treeStage(count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.min(CELEBRATION_THRESHOLD, Math.floor(count));
}

/**
 * Celebrate only when we *watch* the count cross the threshold in this session
 * (a poll or the visitor's own registration). Loading a page that is already at
 * five or more shows the finished tree quietly instead of replaying the party.
 */
export function shouldCelebrate(previous: number | null, next: number): boolean {
  return previous !== null && previous < CELEBRATION_THRESHOLD && next >= CELEBRATION_THRESHOLD;
}

/** Stage reached when going from `previous` to `next` (null when nothing new unlocked). */
export function newlyUnlockedStage(previous: number | null, next: number): number | null {
  if (previous === null) return null;
  const a = treeStage(previous);
  const b = treeStage(next);
  return b > a ? b : null;
}

export interface SceneMetrics {
  width: number;
  /** Top of the band of snowy ground characters stand on (px). */
  groundTop: number;
  /** Bottom of that band (px). */
  groundBottom: number;
  /** Half the width of the tree (px) — characters stand beside it, not inside it. */
  treeHalfWidth: number;
  /** Rendered sprite width at the front row (px). */
  spriteWidth: number;
  /** Number of depth rows (2 on small screens, 3 on wide ones). */
  rows: number;
}

export interface Slot {
  x: number;
  y: number;
  /** 0 = back row … rows-1 = front row */
  row: number;
}

/** All available standing spots, ordered from "closest to the tree" outward. */
export function buildSlots(m: SceneMetrics): Slot[] {
  const rows = Math.max(1, m.rows);
  const center = m.width / 2;
  const margin = Math.max(10, m.spriteWidth * 0.35);
  const bandH = Math.max(0, m.groundBottom - m.groundTop);
  const perSide: { row: number; xs: number[] }[] = [];
  const centerSlots: Slot[] = [];

  for (let row = 0; row < rows; row++) {
    const depth = rows === 1 ? 1 : row / (rows - 1);
    const y = m.groundTop + bandH * ((row + 0.6) / (rows + 0.2));
    const spacing = m.spriteWidth * (1.22 + depth * 0.22);
    // Back rows stand beside the branches; the front row can come closer (in front of the gifts).
    // Rows are staggered by half a step so people in different rows don't line up.
    const stagger = (rows - 1 - row) % 2 === 1 ? spacing * 0.5 : 0;
    const clear = m.treeHalfWidth * (row === rows - 1 ? 0.62 : 0.95) + spacing * 0.5 + stagger;
    const available = center - margin - clear;
    const count = Math.max(0, Math.floor(available / spacing) + 1);
    const xs: number[] = [];
    for (let k = 0; k < count; k++) {
      const offset = clear + k * spacing;
      if (offset > center - margin) break;
      xs.push(offset);
    }
    perSide.push({ row, xs });

    if (row === rows - 1) {
      // Spots directly in front of the tree, used only once the sides are full.
      const inner = Math.floor((clear * 2) / spacing);
      for (let k = 0; k < inner; k++) {
        const x = center - clear + spacing * (k + 0.5) + (clear * 2 - inner * spacing) / 2;
        centerSlots.push({ x, y: y + bandH * 0.08, row });
      }
    }
  }

  const slots: Slot[] = [];
  const maxK = Math.max(0, ...perSide.map((p) => p.xs.length));
  for (let k = 0; k < maxK; k++) {
    // Front row first so the earliest buddies are the most visible.
    for (let i = perSide.length - 1; i >= 0; i--) {
      const p = perSide[i];
      const off = p.xs[k];
      if (off === undefined) continue;
      const y = m.groundTop + bandH * ((p.row + 0.6) / (rows + 0.2));
      const leftFirst = (k + p.row) % 2 === 0;
      const a = { x: center - off, y, row: p.row };
      const b = { x: center + off, y, row: p.row };
      slots.push(...(leftFirst ? [a, b] : [b, a]));
    }
  }
  return [...slots, ...centerSlots];
}

/** Small, stable per-person jitter so the crowd doesn't look like a grid. */
export function seedJitter(seed: string, spacing: number): { dx: number; dy: number } {
  const h = hashString(seed);
  const dx = (((h & 0xff) / 255) - 0.5) * spacing * 0.32;
  const dy = ((((h >>> 8) & 0xff) / 255) - 0.5) * 6;
  return { dx, dy };
}

/** Horizontal offset a newcomer walks in from: the nearest edge of the scene. */
export function entranceOffset(x: number, width: number): number {
  return x < width / 2 ? -(x + 48) : width - x + 48;
}

/** Whether a given person likes to stroll around (about a quarter of them). */
export function isStroller(seed: string): boolean {
  return hashString(`${seed}:stroll`) % 4 === 0;
}
