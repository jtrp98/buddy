import crypto from "node:crypto";

export interface Pairing {
  giverId: string;
  receiverId: string;
}

/**
 * Generates a single-cycle derangement using Sattolo's algorithm + CSPRNG (crypto.randomInt).
 * Guarantees:
 * - Every member gives to exactly 1 other member
 * - Every member receives from exactly 1 other member
 * - No member draws themselves
 * - For n >= 3, no 2-person mutual swap occurs
 */
export function generateDerangement(memberIds: string[]): Pairing[] {
  const n = memberIds.length;
  if (n < 2) {
    throw new Error("ต้องมีสมาชิกที่ยืนยันอีเมลอย่างน้อย 2 คนจึงจะสุ่มจับคู่ได้");
  }

  const receivers = [...memberIds];
  for (let i = n - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i); // 0 <= j < i
    const tmp = receivers[i];
    receivers[i] = receivers[j];
    receivers[j] = tmp;
  }

  const pairings: Pairing[] = memberIds.map((giverId, idx) => ({
    giverId,
    receiverId: receivers[idx],
  }));

  assertValidDerangement(memberIds, pairings);
  return pairings;
}

export function assertValidDerangement(memberIds: string[], pairings: Pairing[]): void {
  const n = memberIds.length;
  if (pairings.length !== n) {
    throw new Error("จำนวนคู่ที่สุ่มได้ไม่ตรงกับจำนวนสมาชิก");
  }

  const expected = new Set(memberIds);
  const givers = new Set<string>();
  const receivers = new Set<string>();

  for (const pair of pairings) {
    if (!expected.has(pair.giverId) || !expected.has(pair.receiverId)) {
      throw new Error("พบรายชื่อสมาชิกไม่ถูกต้องในผลสุ่ม");
    }
    if (pair.giverId === pair.receiverId) {
      throw new Error("พบสมาชิกจับได้ตัวเองในผลสุ่ม");
    }
    if (givers.has(pair.giverId)) {
      throw new Error("พบผู้ให้ซ้ำกันในผลสุ่ม");
    }
    if (receivers.has(pair.receiverId)) {
      throw new Error("พบผู้รับซ้ำกันในผลสุ่ม");
    }
    givers.add(pair.giverId);
    receivers.add(pair.receiverId);
  }

  if (givers.size !== n || receivers.size !== n) {
    throw new Error("ผลสุ่มไม่ครบทุกคน");
  }
}
