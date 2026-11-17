/**
 * Snow that settles along the bottom edge of the screen.
 *
 * The pile is a height map: one column every COL_W px. Landing flakes deposit
 * a small mound spread over neighbouring columns; growth slows as a column
 * approaches the cap, and a light relaxation pass keeps the surface soft.
 * Pure data + math so it can be unit tested; drawing lives in SnowCanvas.
 */

export const COL_W = 6;

/** Total area of the base 7-column landing mound (weights 0.2…1…0.2). */
const BASE_SPREAD_SUM = 3.8;

/** The pile can grow up to this share of the screen height (it clears on scroll). */
export const PILE_MAX_SHARE = 0.15;

/** Deposits are tuned for a 30px pile; taller caps scale them up so filling takes a similar time. */
const BASE_CAP = 30;

export interface SnowPile {
  heights: Float32Array;
  maxHeight: number;
  /** Multiplier applied to every deposit. */
  gain: number;
  /** Bell-shaped weights of one landing mound (wider for taller piles). */
  spread: Float32Array;
}

/** Cosine bell of 2*half+1 columns, scaled so its area grows with the pile's gain. */
function makeSpread(gain: number): Float32Array {
  const half = Math.max(3, Math.round(3 * Math.sqrt(gain)));
  const w = new Float32Array(half * 2 + 1);
  let sum = 0;
  for (let k = -half; k <= half; k++) {
    const v = 0.5 + 0.5 * Math.cos((Math.PI * k) / (half + 1));
    w[k + half] = v;
    sum += v;
  }
  const scale = (BASE_SPREAD_SUM * gain) / sum;
  for (let i = 0; i < w.length; i++) w[i] *= scale;
  return w;
}

export function pileMaxHeight(viewportHeight: number): number {
  return Math.max(12, Math.round(viewportHeight * PILE_MAX_SHARE));
}

export function createPile(viewportWidth: number, viewportHeight: number): SnowPile {
  const cols = Math.ceil(viewportWidth / COL_W) + 2;
  const maxHeight = pileMaxHeight(viewportHeight);
  const gain = maxHeight / BASE_CAP;
  return { heights: new Float32Array(cols), maxHeight, gain, spread: makeSpread(gain) };
}

/** Surface height (px) under a given x position. */
export function heightAt(pile: SnowPile, x: number): number {
  const i = Math.round(x / COL_W);
  if (i < 0 || i >= pile.heights.length) return 0;
  return pile.heights[i];
}

/** A flake of radius r landed at x: add a soft mound that saturates near the cap. */
export function deposit(pile: SnowPile, x: number, r: number): void {
  const center = Math.round(x / COL_W);
  // Tuned to the flake sizes in SnowCanvas so the pile fills in a few minutes.
  const amount = 0.5 + r * 1.0;
  const half = (pile.spread.length - 1) / 2;
  for (let k = 0; k < pile.spread.length; k++) {
    const i = center + k - half;
    if (i < 0 || i >= pile.heights.length) continue;
    const h = pile.heights[i];
    const room = Math.max(0, 1 - h / pile.maxHeight);
    pile.heights[i] = Math.min(pile.maxHeight, h + amount * pile.spread[k] * room);
  }
}

/** One smoothing pass: each column eases toward its neighbours' average. */
export function relax(pile: SnowPile, strength = 0.08): void {
  const h = pile.heights;
  const n = h.length;
  if (n < 3) return;
  let prev = h[0];
  for (let i = 1; i < n - 1; i++) {
    const cur = h[i];
    const avg = (prev + h[i + 1]) / 2;
    h[i] = cur + (avg - cur) * strength;
    prev = cur;
  }
}

/** Shrink the whole pile (used while it slides away after a scroll). */
export function melt(pile: SnowPile, factor: number): void {
  const h = pile.heights;
  for (let i = 0; i < h.length; i++) {
    h[i] = h[i] * factor < 0.2 ? 0 : h[i] * factor;
  }
}

export function totalSnow(pile: SnowPile): number {
  let sum = 0;
  for (let i = 0; i < pile.heights.length; i++) sum += pile.heights[i];
  return sum;
}
