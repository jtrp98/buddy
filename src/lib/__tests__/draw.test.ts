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
});
