import { describe, expect, it } from "vitest";
import { LIGHT_PATTERNS, PATTERN_TICKS, inRipple, isLit, patternAt } from "@/lib/light-patterns";

const N = 24;
const litCount = (p: Parameters<typeof isLit>[0], step: number) =>
  Array.from({ length: N }, (_, i) => isLit(p, i, N, step)).filter(Boolean).length;

describe("light patterns", () => {
  it("cycles through every pattern, then repeats", () => {
    const seen = new Set(Array.from({ length: LIGHT_PATTERNS.length }, (_, k) => patternAt(k * PATTERN_TICKS)));
    expect(seen.size).toBe(LIGHT_PATTERNS.length);
    expect(patternAt(LIGHT_PATTERNS.length * PATTERN_TICKS)).toBe(LIGHT_PATTERNS[0]);
  });

  it("every pattern actually changes over time (lights switch on and off)", () => {
    for (const p of [...LIGHT_PATTERNS, "party" as const]) {
      const frames = Array.from({ length: 60 }, (_, step) =>
        Array.from({ length: N }, (_, i) => (isLit(p, i, N, step) ? 1 : 0)).join("")
      );
      expect(new Set(frames).size, p).toBeGreaterThan(1);
    }
  });

  it("never leaves the whole string dark for long", () => {
    for (const p of LIGHT_PATTERNS) {
      let darkRun = 0;
      for (let step = 0; step < 200; step++) {
        darkRun = litCount(p, step) === 0 ? darkRun + 1 : 0;
        expect(darkRun, p).toBeLessThan(3);
      }
    }
  });

  it("alternate swaps odd and even bulbs", () => {
    const a = Array.from({ length: 6 }, (_, i) => isLit("alternate", i, 6, 0));
    const b = Array.from({ length: 6 }, (_, i) => isLit("alternate", i, 6, 4));
    expect(a).toEqual([true, false, true, false, true, false]);
    expect(b).toEqual(a.map((v) => !v));
  });

  it("fill lights the whole string before emptying", () => {
    expect(litCount("fill", N - 1)).toBe(N);
    expect(litCount("fill", 0)).toBe(1);
    expect(litCount("fill", 2 * N - 1)).toBe(0);
  });

  it("a click ripple travels outwards from the clicked bulb", () => {
    expect(inRipple(10, 10, 0)).toBe(true);
    expect(inRipple(15, 10, 0)).toBe(false);
    expect(inRipple(15, 10, 55 * 5)).toBe(true);
    expect(inRipple(5, 10, 55 * 5)).toBe(true);
    expect(inRipple(10, 10, 55 * 5)).toBe(false);
  });
});
