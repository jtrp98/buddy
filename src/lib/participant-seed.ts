import { hashToken } from "@/lib/crypto";

/**
 * Public, anonymous identifier for a member's Join-page character.
 * A truncated SHA-256 of the internal id with a fixed namespace: stable per
 * member, but it cannot be turned back into the id, name or email.
 */
export function participantSeed(memberId: string): string {
  return hashToken(`buddy-character:${memberId}`).slice(0, 12);
}
