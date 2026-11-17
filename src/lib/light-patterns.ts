/**
 * Light-show patterns for the navbar Christmas lights, like the 8-mode
 * controller on a real string of lights. Pure functions: given a bulb index,
 * the string length and the current tick, say whether that bulb is lit.
 */

export const LIGHT_PATTERNS = [
  "twinkle",
  "alternate",
  "chase",
  "fill",
  "colors",
  "wave",
  "sparkle",
] as const;

export type LightPattern = (typeof LIGHT_PATTERNS)[number] | "party";

/** One tick of the light controller, in ms. */
export const TICK_MS = 140;
/** How long each pattern runs before the controller moves to the next one. */
export const PATTERN_TICKS = 52;
/** Number of bulb colours repeating along the string. */
export const COLOR_COUNT = 5;

/** Cheap deterministic noise in [0, 1) for a (bulb, tick) pair. */
export function noise(i: number, step: number): number {
  let h = Math.imul(i + 1, 374761393) ^ Math.imul(step + 7, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function isLit(pattern: LightPattern, i: number, n: number, step: number): boolean {
  const color = i % COLOR_COUNT;
  switch (pattern) {
    case "twinkle":
      // Mostly on, a gentle random flicker.
      return noise(i, Math.floor(step / 2)) > 0.12;
    case "alternate":
      // Odd / even bulbs swap back and forth.
      return (i + Math.floor(step / 4)) % 2 === 0;
    case "chase": {
      // Pairs of lit bulbs running along the string.
      const k = (((i - Math.floor(step / 1.5)) % 4) + 4) % 4;
      return k < 2;
    }
    case "fill": {
      // Light up one by one from the left, then go dark one by one.
      const cycle = Math.max(1, n) * 2;
      const k = step % cycle;
      return k < n ? i <= k : i > k - n;
    }
    case "colors": {
      // Two colours at a time, rotating through the palette.
      const a = Math.floor(step / 7) % COLOR_COUNT;
      return color === a || color === (a + 2) % COLOR_COUNT;
    }
    case "wave":
      // Soft bands of light rolling along.
      return Math.sin(i * 0.55 - step * 0.32) > -0.15;
    case "sparkle":
      // All on, with quick random flashes off.
      return noise(i, step) > 0.3;
    case "party":
      // Fast and random.
      return noise(i, step * 3) > 0.45;
  }
}

/** The pattern the controller is on at a given tick. */
export function patternAt(step: number): LightPattern {
  return LIGHT_PATTERNS[Math.floor(step / PATTERN_TICKS) % LIGHT_PATTERNS.length];
}

/**
 * A click sends a ripple of light outwards from the clicked bulb.
 * Returns true while the ripple front is passing bulb i (elapsed in ms).
 */
export function inRipple(i: number, origin: number, elapsedMs: number): boolean {
  const front = elapsedMs / 55;
  const d = Math.abs(i - origin);
  return d <= front && d > front - 2.5;
}
