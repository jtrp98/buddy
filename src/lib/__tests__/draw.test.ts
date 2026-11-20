import { describe, expect, it } from "vitest";
import { assertValidDerangement, generateDerangement } from "../derangement";

describe("Draw Engine (Sattolo Derangement)", () => {
  it("throws when fewer than 2 members are provided", () => {
    expect(() => generateDerangement([])).toThrow();
    expect(() => generateDerangement(["m1"])).toThrow();
  });

  it("handles n = 2 correctly without self-assignment", () => {
    const pairings = generateDerangement(["a", "b"]);
    expect(pairings).toEqual([
      { giverId: "a", receiverId: "b" },
      { giverId: "b", receiverId: "a" },
    ]);
  });

  it.each([3, 5, 10, 25, 100])(
    "produces valid 1-to-1 derangement with no self-draws or 2-cycles for n=%i",
    (n) => {
      const ids = Array.from({ length: n }, (_, i) => `member_${i + 1}`);
      for (let trial = 0; trial < 20; trial++) {
        const pairings = generateDerangement(ids);
        assertValidDerangement(ids, pairings);

        const map = new Map(pairings.map((p) => [p.giverId, p.receiverId]));
        // Verify full single cycle (no 2-person mutual pairs for n >= 3)
        let current = ids[0];
        const visited = new Set<string>();
        for (let step = 0; step < n; step++) {
          expect(visited.has(current)).toBe(false);
          visited.add(current);
          current = map.get(current)!;
        }
        expect(current).toBe(ids[0]);
        expect(visited.size).toBe(n);
      }
    }
  );

  it("respects mutual exclusion pairs when drawing", () => {
    const ids = ["a", "b", "c", "d", "e", "f"];
    const exclusions = [
      ["a", "b"],
      ["c", "d"],
    ] as const;

    for (let trial = 0; trial < 30; trial++) {
      const pairings = generateDerangement(ids, exclusions);
      assertValidDerangement(ids, pairings, exclusions);
      for (const p of pairings) {
        expect(
          (p.giverId === "a" && p.receiverId === "b") ||
            (p.giverId === "b" && p.receiverId === "a") ||
            (p.giverId === "c" && p.receiverId === "d") ||
            (p.giverId === "d" && p.receiverId === "c")
        ).toBe(false);
      }
    }
  });

  it("falls back to non-single-cycle derangement when exclusions force 2-cycles", () => {
    // With 4 members and (a,c), (a,d), (b,c), (b,d) excluded -> wait:
    // If (a,c), (b,d), (a,d), (b,c) excluded, only (a<->b) and (c<->d) are valid!
    const ids = ["a", "b", "c", "d"];
    const exclusions = [
      ["a", "c"],
      ["a", "d"],
      ["b", "c"],
      ["b", "d"],
    ] as const;
    const pairings = generateDerangement(ids, exclusions);
    assertValidDerangement(ids, pairings, exclusions);
  });

  it("throws a clear error when exclusions make any derangement impossible", () => {
    const ids = ["a", "b", "c"];
    const exclusions = [
      ["a", "b"],
      ["a", "c"],
    ] as const;
    expect(() => generateDerangement(ids, exclusions)).toThrow(/ห้ามจับคู่/);
  });
});
