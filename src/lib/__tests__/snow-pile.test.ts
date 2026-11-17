import { describe, expect, it } from "vitest";
import { COL_W, createPile, deposit, heightAt, melt, pileMaxHeight, relax, totalSnow } from "@/lib/snow-pile";

describe("snow pile", () => {
  it("starts empty and sized to the viewport", () => {
    const pile = createPile(1200, 900);
    expect(pile.heights.length).toBeGreaterThanOrEqual(1200 / COL_W);
    expect(totalSnow(pile)).toBe(0);
    expect(pile.maxHeight).toBe(pileMaxHeight(900));
  });

  it("caps the pile at 15% of the screen height", () => {
    expect(pileMaxHeight(900)).toBe(135);
    expect(pileMaxHeight(812)).toBe(122);
  });

  it("builds a mound where flakes land", () => {
    const pile = createPile(600, 800);
    deposit(pile, 300, 2);
    expect(heightAt(pile, 300)).toBeGreaterThan(0);
    expect(heightAt(pile, 300)).toBeGreaterThan(heightAt(pile, 300 + COL_W * 3));
    expect(heightAt(pile, 30)).toBe(0);
  });

  it("never grows past the cap, however long it snows", () => {
    const pile = createPile(600, 800);
    for (let i = 0; i < 5000; i++) deposit(pile, 300, 4.8);
    expect(Math.max(...pile.heights)).toBeLessThanOrEqual(pile.maxHeight);
    expect(heightAt(pile, 300)).toBeGreaterThan(pile.maxHeight * 0.9);
  });

  it("smooths into neighbouring columns", () => {
    const pile = createPile(600, 800);
    deposit(pile, 300, 3);
    const before = heightAt(pile, 300 + COL_W * 4);
    for (let i = 0; i < 30; i++) relax(pile);
    expect(heightAt(pile, 300 + COL_W * 4)).toBeGreaterThan(before);
  });

  it("melts away completely", () => {
    const pile = createPile(600, 800);
    for (let i = 0; i < 200; i++) deposit(pile, Math.random() * 600, 3);
    for (let i = 0; i < 60; i++) melt(pile, 0.84);
    expect(totalSnow(pile)).toBe(0);
  });

  it("ignores landings outside the screen", () => {
    const pile = createPile(300, 800);
    deposit(pile, -500, 3);
    deposit(pile, 5000, 3);
    expect(totalSnow(pile)).toBe(0);
    expect(heightAt(pile, -10)).toBe(0);
  });
});
