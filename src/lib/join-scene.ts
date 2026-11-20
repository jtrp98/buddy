import { hashString } from "@/lib/prng";

/**
 * Pure logic for the Join page Christmas scene: tree progression, the five-person
 * celebration trigger, organic plaza clustering, and anonymous buddy reactions.
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

export type TreeLightMode = "warm" | "twinkle" | "aurora" | "candle";

export const TREE_LIGHT_MODES: { id: TreeLightMode; label: string }[] = [
  { id: "warm", label: "ไฟอุ่น" },
  { id: "twinkle", label: "ระยิบระยับ" },
  { id: "aurora", label: "แสงเหนือ" },
  { id: "candle", label: "แสงเทียน" },
];

/** 0 = nobody yet, 1..5 = milestones; stays at 5 beyond five participants. */
export function treeStage(count: number): number {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.min(CELEBRATION_THRESHOLD, Math.floor(count));
}

/**
 * Number of pixel gift boxes piled beneath the tree (unlocks at stage 3 and
 * grows gently up to 10 as more members join).
 */
export function giftCountForMembers(total: number): number {
  if (!Number.isFinite(total) || total < 3) return 0;
  return Math.min(10, Math.max(3, Math.floor(total)));
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
  /** Natural facing direction toward the tree / plaza focal point. */
  flip?: boolean;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * All available standing spots, arranged in cozy organic arcs around the
 * Christmas tree and flanking village landmarks, ordered closest-to-center first.
 */
export function buildSlots(m: SceneMetrics): Slot[] {
  const rows = Math.max(1, m.rows);
  const center = m.width / 2;
  const margin = Math.max(12, m.spriteWidth * 0.42);
  const bandH = Math.max(0, m.groundBottom - m.groundTop);
  const perSide: { row: number; xs: number[] }[] = [];
  const centerSlots: Slot[] = [];

  for (let row = 0; row < rows; row++) {
    const depth = rows === 1 ? 1 : row / (rows - 1);
    const spacing = m.spriteWidth * (1.16 + depth * 0.18);
    // Give each row a distinct horizontal phase so buddies interleave cleanly without blocking faces behind them.
    const stagger = rows > 1 ? ((rows - 1 - row) / rows) * spacing : 0;
    const clear = m.treeHalfWidth * (row === rows - 1 ? 0.72 : 0.96) + spacing * 0.45 + stagger;
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
      // Spots directly in front of the gift pile, used once side rings fill up.
      const inner = Math.floor((clear * 1.9) / spacing);
      const baseY = m.groundTop + bandH * ((row + 0.66) / (rows + 0.25));
      for (let k = 0; k < inner; k++) {
        const x = center - clear + spacing * (k + 0.5) + (clear * 2 - inner * spacing) / 2;
        if (x > margin && x < m.width - margin) {
          centerSlots.push({
            x,
            y: clamp(baseY + (k % 2 === 0 ? 3 : -2), m.groundTop, m.groundBottom),
            row,
            flip: x > center,
          });
        }
      }
    }
  }

  const slots: Slot[] = [];
  const maxK = Math.max(0, ...perSide.map((p) => p.xs.length));
  for (let k = 0; k < maxK; k++) {
    // Front & middle arcs first so early participants frame the glowing tree.
    for (let i = perSide.length - 1; i >= 0; i--) {
      const p = perSide[i];
      const off = p.xs[k];
      if (off === undefined) continue;
      const baseY = m.groundTop + bandH * ((p.row + 0.56) / (rows + 0.24));
      // Gentle curved plaza arc: subtle wave without pushing rows into each other.
      const arcWave = Math.sin(k * 1.15 + p.row * 0.9) * Math.min(5, bandH * 0.05);
      const yLeft = clamp(baseY + arcWave, m.groundTop, m.groundBottom);
      const yRight = clamp(baseY - arcWave * 0.65, m.groundTop, m.groundBottom);
      const leftFirst = (k + p.row) % 2 === 0;
      const a: Slot = { x: center - off, y: yLeft, row: p.row, flip: false };
      const b: Slot = { x: center + off, y: yRight, row: p.row, flip: true };
      slots.push(...(leftFirst ? [a, b] : [b, a]));
    }
  }
  return [...slots, ...centerSlots];
}

/** Small, stable per-person jitter so the crowd doesn't look like a grid. */
export function seedJitter(seed: string, spacing: number): { dx: number; dy: number } {
  const h = hashString(seed);
  const dx = (((h & 0xff) / 255) - 0.5) * spacing * 0.2;
  const dy = ((((h >>> 8) & 0xff) / 255) - 0.5) * 4;
  return { dx, dy };
}

/** Horizontal offset a newcomer walks in from: the nearest edge of the scene. */
export function entranceOffset(x: number, width: number): number {
  return x < width / 2 ? -(x + 48) : width - x + 48;
}

/** Whether a given person likes to stroll around (about a third of them). */
export function isStroller(seed: string): boolean {
  return hashString(`${seed}:stroll`) % 3 === 0;
}

const CODENAME_TITLES = [
  "เอลฟ์หิมะ",
  "เรนเดียร์น้อย",
  "นกฮูกหิมะ",
  "เพนกวินผ้าพันคอ",
  "หมีขั้วโลก",
  "กวางน้อยดาวเหนือ",
  "คุกกี้ขิง",
  "กระดิ่งเงิน",
  "แมวเหมียวหิมะ",
  "ซานต้าฝึกหัด",
  "ภูตน้ำแข็ง",
  "ลูกกวาดไม้เท้า",
] as const;

/** Client-safe deterministic anonymous Thai holiday codename for a scene seed. */
export function buddyCodename(seed: string): string {
  const h = hashString(`${seed}:codename`);
  const title = CODENAME_TITLES[h % CODENAME_TITLES.length];
  const tag = (hashString(`${seed}:num`) % 89) + 10;
  return `${title} #${tag}`;
}

const BUDDY_GREETINGS = [
  "สุขสันต์วันคริสต์มาส!",
  "รอลุ้นจับฉลากไม่ไหวแล้ว!",
  "คืนนี้หิมะตกสวยจังเลย",
  "โกโก้อุ่นๆ สักแก้วมั้ย?",
  "แอบเตรียมของขวัญไว้แล้วนะ",
  "ต้นคริสต์มาสสว่างจัง!",
  "ใครจะได้เป็นบัดดี้เราน้า~",
  "อากาศหนาวแต่อบอุ่นใจ!",
] as const;

/** Deterministic Thai greeting that cycles warmly as a buddy is tapped. */
export function buddyGreeting(seed: string, clickCount = 0): string {
  const base = hashString(`${seed}:greet`);
  const idx = (base + Math.max(0, Math.floor(clickCount))) % BUDDY_GREETINGS.length;
  return BUDDY_GREETINGS[idx];
}

const AMBIENT_EMOJIS = ["☕", "🎁", "❄️", "🎵", "✨", "❤️"] as const;

/** Deterministic festive emoji reaction for ambient idle / pair-chat moments. */
export function ambientEmoji(seed: string, tick: number): string {
  const h = hashString(`${seed}:${tick}:emoji`);
  return AMBIENT_EMOJIS[h % AMBIENT_EMOJIS.length];
}

/**
 * Picks two nearby visible buddies (same or adjacent depth row, within 120px horizontally)
 * so they can turn toward each other and exchange festive emoji reactions.
 */
export function pickChatPair(
  slots: Slot[],
  visibleCount: number,
  rand: () => number
): [number, number] | null {
  const limit = Math.min(visibleCount, slots.length);
  if (limit < 2) return null;

  const pairs: [number, number][] = [];
  for (let i = 0; i < limit; i++) {
    for (let j = i + 1; j < limit; j++) {
      const a = slots[i];
      const b = slots[j];
      if (Math.abs(a.row - b.row) <= 1 && Math.abs(a.x - b.x) <= 120 && Math.abs(a.x - b.x) >= 18) {
        pairs.push([i, j]);
      }
    }
  }
  if (pairs.length === 0) return null;
  return pairs[Math.floor(rand() * pairs.length) % pairs.length];
}
