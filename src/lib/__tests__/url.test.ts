import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAppBaseUrl } from "../url";

describe("getAppBaseUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.APP_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("uses the incoming request domain even when APP_URL is set to localhost:3000", () => {
    process.env.APP_URL = "http://localhost:3000";

    const req = new Request("http://localhost:3000/api/members/recover", {
      headers: {
        "x-forwarded-host": "buddy.example.com",
        "x-forwarded-proto": "https",
      },
    });

    expect(getAppBaseUrl(req)).toBe("https://buddy.example.com");
  });

  it("uses the first value from comma-separated proxy headers", () => {
    const req = new Request("http://internal:3000/api/test", {
      headers: {
        "x-forwarded-host": "preview.buddy.app, proxy.internal",
        "x-forwarded-proto": "https, http",
      },
    });

    expect(getAppBaseUrl(req)).toBe("https://preview.buddy.app");
  });

  it("preserves HTTP protocol for direct LAN or localhost access without x-forwarded-proto", () => {
    const lanReq = new Request("http://192.168.1.50:3000/api/test", {
      headers: { host: "192.168.1.50:3000" },
    });
    expect(getAppBaseUrl(lanReq)).toBe("http://192.168.1.50:3000");

    const localReq = new Request("http://localhost:3000/api/test", {
      headers: { host: "localhost:3000" },
    });
    expect(getAppBaseUrl(localReq)).toBe("http://localhost:3000");
  });

  it("uses host header when x-forwarded-host is absent", () => {
    const req = new Request("https://secret-buddy.co.th/api/test", {
      headers: { host: "secret-buddy.co.th" },
    });

    expect(getAppBaseUrl(req)).toBe("https://secret-buddy.co.th");
  });

  it("defaults proxy host without x-forwarded-proto to https for non-local domains", () => {
    const req = new Request("http://127.0.0.1:3000/api/test", {
      headers: { "x-forwarded-host": "buddy.example.com" },
    });

    expect(getAppBaseUrl(req)).toBe("https://buddy.example.com");
  });

  it("ignores malformed x-forwarded-host values and falls back safely", () => {
    const req = new Request("https://valid.example.com/api/test", {
      headers: {
        "x-forwarded-host": "evil.com/phish",
        host: "valid.example.com",
      },
    });

    expect(getAppBaseUrl(req)).toBe("https://valid.example.com");
  });

  it("falls back to APP_URL, then VERCEL_PROJECT_PRODUCTION_URL, then VERCEL_URL, then localhost when req is omitted", () => {
    expect(getAppBaseUrl()).toBe("http://localhost:3000");

    process.env.VERCEL_URL = "preview-123.vercel.app";
    expect(getAppBaseUrl()).toBe("https://preview-123.vercel.app");

    process.env.VERCEL_PROJECT_PRODUCTION_URL = "prod.vercel.app";
    expect(getAppBaseUrl()).toBe("https://prod.vercel.app");

    process.env.APP_URL = "https://custom.example.com/";
    expect(getAppBaseUrl()).toBe("https://custom.example.com");
  });
});
