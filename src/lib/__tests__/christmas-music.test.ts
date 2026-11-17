import { describe, expect, it } from "vitest";
import {
  CHRISTMAS_POP_PLAYLIST,
  getNextTrackIndex,
  noteToFreq,
} from "@/lib/christmas-music";

describe("christmas-music", () => {
  it("contains multiple Public Domain pop arrangements with unique IDs", () => {
    expect(CHRISTMAS_POP_PLAYLIST.length).toBeGreaterThanOrEqual(4);
    const ids = new Set(CHRISTMAS_POP_PLAYLIST.map((t) => t.id));
    expect(ids.size).toBe(CHRISTMAS_POP_PLAYLIST.length);
  });

  it("validates melody notes, bars, and frequencies for every track", () => {
    for (const track of CHRISTMAS_POP_PLAYLIST) {
      expect(track.title.length).toBeGreaterThan(0);
      expect(track.bpm).toBeGreaterThanOrEqual(100);
      expect(track.bpm).toBeLessThanOrEqual(160);
      expect(track.totalSteps % 8).toBe(0);
      expect(track.bars.length).toBe(track.totalSteps / 8);
      expect(track.melody.length).toBeGreaterThan(10);

      for (const item of track.melody) {
        expect(item.step).toBeGreaterThanOrEqual(0);
        expect(item.step).toBeLessThan(track.totalSteps);
        expect(item.duration).toBeGreaterThan(0);
        expect(noteToFreq(item.note)).toBeGreaterThan(50);
      }

      for (const bar of track.bars) {
        expect(noteToFreq(bar.bass)).toBeGreaterThan(50);
        expect(bar.chord.length).toBeGreaterThanOrEqual(3);
        for (const chordNote of bar.chord) {
          expect(noteToFreq(chordNote)).toBeGreaterThan(50);
        }
      }
    }
  });

  it("cycles through all tracks and wraps around with getNextTrackIndex", () => {
    const total = CHRISTMAS_POP_PLAYLIST.length;
    for (let i = 0; i < total - 1; i++) {
      expect(getNextTrackIndex(i, total)).toBe(i + 1);
    }
    expect(getNextTrackIndex(total - 1, total)).toBe(0);
  });
});
