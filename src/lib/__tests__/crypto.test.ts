import { describe, expect, it } from "vitest";
import {
  computeReceiverHmac,
  decryptReceiverId,
  encryptReceiverId,
  generateInviteCode,
  generateRawToken,
  hashToken,
  sanitizeLogError,
} from "../crypto";

describe("Crypto & Secrecy Utilities", () => {
  it("generates unique raw tokens and deterministic SHA-256 hashes", () => {
    const t1 = generateRawToken();
    const t2 = generateRawToken();
    expect(t1).not.toBe(t2);
    expect(t1.length).toBeGreaterThanOrEqual(32);
    expect(hashToken(t1)).toBe(hashToken(t1));
    expect(hashToken(t1)).not.toBe(t1);
    expect(hashToken(t1)).not.toBe(hashToken(t2));
  });

  it("generates URL-safe 10-char invite codes", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[a-z0-9]{10}$/);
  });

  it("encrypts and decrypts receiverId bound to groupId AAD", () => {
    const encrypted = encryptReceiverId("group_1", "member_42");
    expect(encrypted).not.toContain("member_42");
    expect(decryptReceiverId("group_1", encrypted)).toBe("member_42");

    // Cross-group AAD tampering must fail
    expect(() => decryptReceiverId("group_2", encrypted)).toThrow();

    // Ciphertext tampering must fail
    const parts = encrypted.split(".");
    const tampered = `${parts[0]}.${parts[1]}.AAAA`;
    expect(() => decryptReceiverId("group_1", tampered)).toThrow();
  });

  it("computes consistent group-scoped receiver HMACs", () => {
    const h1 = computeReceiverHmac("g1", "m1");
    const h2 = computeReceiverHmac("g1", "m1");
    const h3 = computeReceiverHmac("g2", "m1");
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
  });

  it("sanitizes tokens and URLs from error logs", () => {
    const msg = sanitizeLogError(
      new Error("Failed sending https://app.example.com/buddy?token=abc123_XYZ")
    );
    expect(msg).not.toContain("abc123_XYZ");
    expect(msg).toContain("[URL_REDACTED]");
  });
});
