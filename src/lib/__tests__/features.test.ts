import { describe, expect, it } from "vitest";
import { decryptText, encryptText } from "../crypto";
import { getAnonymousPersona } from "../codename";
import {
  buddyGuessSchema,
  chatMessageSchema,
  exclusionPairSchema,
  secretNoteSchema,
  wishListLinkSchema,
} from "../validation";

describe("New Features Utilities & Validation", () => {
  it("encrypts and decrypts arbitrary secret notes bound to groupId", () => {
    const note = "ซื้อแก้วเก็บความเย็นสีดำ งบ 450 บาท";
    const encrypted = encryptText("group_99", note);
    expect(encrypted).not.toContain("450");
    expect(decryptText("group_99", encrypted)).toBe(note);
    expect(() => decryptText("group_other", encrypted)).toThrow();
  });

  it("generates deterministic anonymous personas per group and member", () => {
    const p1 = getAnonymousPersona("g1", "m1");
    const p2 = getAnonymousPersona("g1", "m1");
    const p3 = getAnonymousPersona("g1", "m2");
    expect(p1).toEqual(p2);
    expect(p1.codename).toMatch(/#\d{2}$/);
    expect(p1.avatarSeed).not.toBe(p3.avatarSeed);
  });

  it("validates wishListLinkSchema and rejects unsafe protocols", () => {
    expect(
      wishListLinkSchema.safeParse({
        title: "แก้วเก็บความเย็น",
        url: "https://example.com/item/1",
      }).success
    ).toBe(true);

    expect(
      wishListLinkSchema.safeParse({
        title: "XSS",
        url: "javascript:alert(1)",
      }).success
    ).toBe(false);
  });

  it("validates exclusionPairSchema, chatMessageSchema, secretNoteSchema, and buddyGuessSchema", () => {
    expect(
      exclusionPairSchema.safeParse({ memberAId: "a", memberBId: "a" }).success
    ).toBe(false);
    expect(
      exclusionPairSchema.safeParse({ memberAId: "a", memberBId: "b" }).success
    ).toBe(true);

    expect(
      chatMessageSchema.safeParse({
        targetMemberId: "m1",
        mode: "PUBLIC_ROOM",
        content: "สวัสดีปีใหม่!",
      }).success
    ).toBe(true);
    expect(
      chatMessageSchema.safeParse({
        targetMemberId: "m1",
        mode: "PUBLIC_ROOM",
        content: "   ",
      }).success
    ).toBe(false);

    expect(secretNoteSchema.safeParse({ note: "ไอเดียของขวัญ" }).success).toBe(true);
    expect(buddyGuessSchema.safeParse({ guessedGiverId: "m2" }).success).toBe(true);
  });
});
