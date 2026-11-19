import { describe, expect, it } from "vitest";
import {
  memberProfileUpdateSchema,
  memberRegisterSchema,
  normalizeDisplayName,
} from "../validation";

describe("normalizeDisplayName", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeDisplayName("  ใหม่  ")).toBe("ใหม่");
  });

  it("collapses consecutive internal spaces into a single space", () => {
    expect(normalizeDisplayName("  พี่   ต้น   คริสต์มาส ")).toBe("พี่ ต้น คริสต์มาส");
    expect(normalizeDisplayName("Sandy\t\tLee")).toBe("Sandy Lee");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(normalizeDisplayName("   \t\n  ")).toBe("");
  });
});

describe("memberRegisterSchema", () => {
  it("normalizes displayName and email", () => {
    const parsed = memberRegisterSchema.safeParse({
      displayName: "  พี่   ต้น  ",
      email: "  PiyaPorn@Gmail.COM ",
      interests: ["snacks"],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.displayName).toBe("พี่ ต้น");
      expect(parsed.data.email).toBe("piyaporn@gmail.com");
    }
  });

  it("rejects whitespace-only displayName", () => {
    const parsed = memberRegisterSchema.safeParse({
      displayName: "   ",
      email: "test@example.com",
      interests: ["snacks"],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("memberProfileUpdateSchema", () => {
  it("normalizes optional displayName when provided", () => {
    const parsed = memberProfileUpdateSchema.safeParse({
      displayName: "  ใหม่   จ้า ",
      interests: ["snacks"],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.displayName).toBe("ใหม่ จ้า");
    }
  });

  it("allows omitting displayName", () => {
    const parsed = memberProfileUpdateSchema.safeParse({
      interests: ["snacks"],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.displayName).toBeUndefined();
    }
  });
});
