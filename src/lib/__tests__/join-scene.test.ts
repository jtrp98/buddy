import { describe, expect, it } from "vitest";
import {
  CELEBRATION_THRESHOLD,
  ambientEmoji,
  buddyCodename,
  buddyGreeting,
  buildSlots,
  entranceOffset,
  giftCountForMembers,
  newlyUnlockedStage,
  pickChatPair,
  seedJitter,
  shouldCelebrate,
  treeStage,
} from "@/lib/join-scene";
import { buddyLook, buildFrame, FRAME_NAMES, SPRITE_H, SPRITE_W } from "@/components/join/pixelSprites";

describe("treeStage", () => {
  it("maps participant counts to milestones 0..5", () => {
    expect(treeStage(0)).toBe(0);
    expect([1, 2, 3, 4, 5].map(treeStage)).toEqual([1, 2, 3, 4, 5]);
  });

  it("stays fully decorated beyond five participants", () => {
    expect(treeStage(6)).toBe(5);
    expect(treeStage(12)).toBe(5);
    expect(treeStage(500)).toBe(5);
  });

  it("handles bad input", () => {
    expect(treeStage(-3)).toBe(0);
    expect(treeStage(Number.NaN)).toBe(0);
  });
});

describe("shouldCelebrate", () => {
  it("unlocks exactly at five", () => {
    expect(CELEBRATION_THRESHOLD).toBe(5);
    expect(shouldCelebrate(4, 5)).toBe(true);
    expect(shouldCelebrate(3, 6)).toBe(true);
  });

  it("does not replay on first load or after the milestone", () => {
    expect(shouldCelebrate(null, 5)).toBe(false);
    expect(shouldCelebrate(null, 9)).toBe(false);
    expect(shouldCelebrate(5, 6)).toBe(false);
    expect(shouldCelebrate(7, 8)).toBe(false);
  });

  it("does not trigger below five", () => {
    expect(shouldCelebrate(2, 4)).toBe(false);
  });
});

describe("newlyUnlockedStage", () => {
  it("reports the stage reached during the session", () => {
    expect(newlyUnlockedStage(null, 3)).toBeNull();
    expect(newlyUnlockedStage(1, 2)).toBe(2);
    expect(newlyUnlockedStage(3, 4)).toBe(4);
    expect(newlyUnlockedStage(5, 6)).toBeNull();
    expect(newlyUnlockedStage(4, 4)).toBeNull();
  });
});

describe("buildSlots", () => {
  const desktop = {
    width: 1100,
    groundTop: 380,
    groundBottom: 474,
    treeHalfWidth: 150,
    spriteWidth: 50,
    rows: 3,
  };
  const mobile = { width: 360, groundTop: 260, groundBottom: 334, treeHalfWidth: 92, spriteWidth: 32, rows: 2 };

  it("provides room for large groups on desktop and a useful number on mobile", () => {
    expect(buildSlots(desktop).length).toBeGreaterThanOrEqual(30);
    expect(buildSlots(mobile).length).toBeGreaterThanOrEqual(10);
  });

  it("keeps every spot inside the scene and on the ground", () => {
    for (const m of [desktop, mobile]) {
      for (const s of buildSlots(m)) {
        expect(s.x).toBeGreaterThan(0);
        expect(s.x).toBeLessThan(m.width);
        expect(s.y).toBeGreaterThanOrEqual(m.groundTop);
        expect(s.y).toBeLessThanOrEqual(m.groundBottom);
      }
    }
  });

  it("does not stack characters on top of each other", () => {
    const slots = buildSlots(desktop);
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const same = Math.abs(slots[i].x - slots[j].x) < 1 && Math.abs(slots[i].y - slots[j].y) < 1;
        expect(same).toBe(false);
      }
    }
  });

  it("is deterministic", () => {
    expect(buildSlots(desktop)).toEqual(buildSlots(desktop));
  });
});

describe("characters", () => {
  it("gives the same look to the same seed and varies across seeds", () => {
    expect(buddyLook("abc123")).toEqual(buddyLook("abc123"));
    const looks = new Set(
      Array.from({ length: 40 }, (_, i) => JSON.stringify(buddyLook(`seed-${i}`)))
    );
    expect(looks.size).toBeGreaterThan(30);
  });

  it("builds consistently sized, outlined frames", () => {
    const look = buddyLook("seed-7");
    for (const f of FRAME_NAMES) {
      const grid = buildFrame(look, f);
      expect(grid).toHaveLength(SPRITE_H);
      grid.forEach((row) => expect(row).toHaveLength(SPRITE_W));
      expect(grid.join("")).toContain("K");
    }
  });

  it("jitters a little and deterministically", () => {
    const a = seedJitter("x1", 40);
    expect(seedJitter("x1", 40)).toEqual(a);
    expect(Math.abs(a.dx)).toBeLessThanOrEqual(40 * 0.16 + 0.001);
  });

  it("walks newcomers in from the nearest edge", () => {
    expect(entranceOffset(100, 1000)).toBeLessThan(0);
    expect(entranceOffset(900, 1000)).toBeGreaterThan(0);
  });

  it("assigns winter hats and held props deterministically across seeds", () => {
    const hats = new Set(Array.from({ length: 60 }, (_, i) => buddyLook(`hat-${i}`).hat));
    const props = new Set(Array.from({ length: 60 }, (_, i) => buddyLook(`prop-${i}`).prop));
    expect(hats.size).toBeGreaterThanOrEqual(5);
    expect(props.size).toBeGreaterThanOrEqual(4);
  });
});

describe("village scene helpers", () => {
  it("scales gift boxes from 0 up to 10 based on participant count", () => {
    expect(giftCountForMembers(0)).toBe(0);
    expect(giftCountForMembers(2)).toBe(0);
    expect(giftCountForMembers(3)).toBe(3);
    expect(giftCountForMembers(6)).toBe(6);
    expect(giftCountForMembers(25)).toBe(10);
  });

  it("generates deterministic anonymous codenames, greetings, and emojis", () => {
    expect(buddyCodename("seed-a")).toBe(buddyCodename("seed-a"));
    expect(buddyCodename("seed-a")).toMatch(/#\d{2}$/);
    const g0 = buddyGreeting("seed-a", 0);
    const g1 = buddyGreeting("seed-a", 1);
    expect(g0.length).toBeGreaterThan(0);
    expect(g1).not.toBe(g0);
    expect(ambientEmoji("seed-a", 4).length).toBeGreaterThan(0);
  });

  it("finds nearby pairs for ambient chat when multiple buddies are present", () => {
    const slots = buildSlots({
      width: 1100,
      groundTop: 380,
      groundBottom: 474,
      treeHalfWidth: 120,
      spriteWidth: 50,
      rows: 3,
    });
    expect(pickChatPair(slots, 1, () => 0)).toBeNull();
    const pair = pickChatPair(slots, 12, () => 0.25);
    expect(pair).not.toBeNull();
    if (pair) {
      expect(pair[0]).not.toBe(pair[1]);
      expect(pair[0]).toBeLessThan(12);
      expect(pair[1]).toBeLessThan(12);
    }
  });
});
