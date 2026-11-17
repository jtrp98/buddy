import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "sb_admin_session";

export interface AdminSession {
  adminId: string;
  email: string;
  name: string;
}

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be configured in production");
    }
    return new TextEncoder().encode("dev-secret-buddy-auth-key-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.adminId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      adminId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function buildAdminSessionCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function buildClearAdminCookieOptions() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}
