import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer {
  const raw = process.env.ASSIGNMENT_ENCRYPTION_KEY?.trim();
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, "hex");
  }
  if (raw && raw.length >= 32) {
    return crypto.createHash("sha256").update(raw).digest();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("ASSIGNMENT_ENCRYPTION_KEY must be configured in production");
  }
  const fallbackSeed = process.env.AUTH_SECRET || "dev-secret-buddy-encryption-key";
  return crypto.createHash("sha256").update(fallbackSeed).digest();
}

export function generateRawToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("base64url");
}

export function generateInviteCode(): string {
  // URL-safe 10-character code (avoiding ambiguous characters)
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return code;
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function computeReceiverHmac(groupId: string, receiverMemberId: string): string {
  const key = getEncryptionKey();
  return crypto
    .createHmac("sha256", key)
    .update(`${groupId}:${receiverMemberId}`)
    .digest("hex");
}

export function encryptText(aad: string, plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptText(aad: string, payload: string): string {
  const parts = payload.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload");
  }
  const [ivStr, tagStr, cipherStr] = parts;
  const iv = Buffer.from(ivStr, "base64url");
  const authTag = Buffer.from(tagStr, "base64url");
  const encrypted = Buffer.from(cipherStr, "base64url");

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function encryptReceiverId(groupId: string, receiverMemberId: string): string {
  return encryptText(groupId, receiverMemberId);
}

export function decryptReceiverId(groupId: string, payload: string): string {
  return decryptText(groupId, payload);
}

export function sanitizeLogError(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

  // Strip any query parameters or potential tokens from URLs before persisting logs
  return raw
    .replace(/token=[A-Za-z0-9\-_]+/gi, "token=[REDACTED]")
    .replace(/https?:\/\/[^\s]+/gi, "[URL_REDACTED]")
    .slice(0, 300);
}
