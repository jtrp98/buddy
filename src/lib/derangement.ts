import crypto from "node:crypto";

export interface Pairing {
  giverId: string;
  receiverId: string;
}

export type ExclusionPair = readonly [string, string];

function edgeKey(a: string, b: string): string {
  return `${a}\0${b}`;
}

function buildBlockedSet(exclusions?: readonly ExclusionPair[]): Set<string> {
  const blocked = new Set<string>();
  if (!exclusions) return blocked;
  for (const [a, b] of exclusions) {
    if (a !== b) {
      blocked.add(edgeKey(a, b));
      blocked.add(edgeKey(b, a));
    }
  }
  return blocked;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function findConstrainedCycle(
  memberIds: string[],
  blocked: Set<string>,
  maxSteps = 50_000
): Pairing[] | null {
  const n = memberIds.length;
  const start = memberIds[0];
  const visited = new Set<string>([start]);
  const path: string[] = [start];
  let steps = 0;

  function dfs(current: string): boolean {
    if (++steps > maxSteps) return false;
    if (path.length === n) {
      return !blocked.has(edgeKey(current, start));
    }

    const candidates = memberIds.filter(
      (id) => !visited.has(id) && !blocked.has(edgeKey(current, id))
    );
    shuffleInPlace(candidates);

    for (const next of candidates) {
      visited.add(next);
      path.push(next);
      if (dfs(next)) return true;
      path.pop();
      visited.delete(next);
    }
    return false;
  }

  if (!dfs(start)) return null;

  return path.map((giverId, idx) => ({
    giverId,
    receiverId: path[(idx + 1) % n],
  }));
}

function findConstrainedMatching(
  memberIds: string[],
  blocked: Set<string>,
  maxSteps = 50_000
): Pairing[] | null {
  const n = memberIds.length;
  const allowedByGiver = new Map<string, string[]>();
  for (const g of memberIds) {
    const allowed = memberIds.filter((r) => r !== g && !blocked.has(edgeKey(g, r)));
    if (allowed.length === 0) return null;
    allowedByGiver.set(g, allowed);
  }

  // Order givers with fewest valid choices first (MRV) for fast backtracking
  const givers = [...memberIds].sort(
    (a, b) => allowedByGiver.get(a)!.length - allowedByGiver.get(b)!.length
  );
  const usedReceivers = new Set<string>();
  const result = new Map<string, string>();
  let steps = 0;

  function dfs(idx: number): boolean {
    if (++steps > maxSteps) return false;
    if (idx === n) return true;

    const giver = givers[idx];
    const candidates = allowedByGiver
      .get(giver)!
      .filter((r) => !usedReceivers.has(r));
    shuffleInPlace(candidates);

    for (const receiver of candidates) {
      usedReceivers.add(receiver);
      result.set(giver, receiver);
      if (dfs(idx + 1)) return true;
      result.delete(giver);
      usedReceivers.delete(receiver);
    }
    return false;
  }

  if (!dfs(0)) return null;

  return memberIds.map((giverId) => ({
    giverId,
    receiverId: result.get(giverId)!,
  }));
}

/**
 * Generates a derangement using Sattolo's algorithm + CSPRNG (crypto.randomInt),
 * or randomized backtracking when exclusion rules are provided.
 * Guarantees:
 * - Every member gives to exactly 1 other member
 * - Every member receives from exactly 1 other member
 * - No member draws themselves
 * - No excluded pair is matched
 * - When no exclusions are set and n >= 3, guarantees a single-cycle derangement
 */
export function generateDerangement(
  memberIds: string[],
  exclusions?: readonly ExclusionPair[]
): Pairing[] {
  const n = memberIds.length;
  if (n < 2) {
    throw new Error("ต้องมีสมาชิกที่ยืนยันอีเมลอย่างน้อย 2 คนจึงจะสุ่มจับคู่ได้");
  }

  const blocked = buildBlockedSet(exclusions);

  let pairings: Pairing[];
  if (blocked.size === 0) {
    const receivers = [...memberIds];
    for (let i = n - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i); // 0 <= j < i
      const tmp = receivers[i];
      receivers[i] = receivers[j];
      receivers[j] = tmp;
    }
    pairings = memberIds.map((giverId, idx) => ({
      giverId,
      receiverId: receivers[idx],
    }));
  } else {
    const cycle = findConstrainedCycle(memberIds, blocked);
    const matched = cycle ?? findConstrainedMatching(memberIds, blocked);
    if (!matched) {
      throw new Error(
        "เงื่อนไขห้ามจับคู่เข้มงวดเกินไป ไม่สามารถสุ่มจับคู่ที่ถูกต้องได้ กรุณาลดคู่ห้ามจับบางคู่"
      );
    }
    pairings = matched;
  }

  assertValidDerangement(memberIds, pairings, exclusions);
  return pairings;
}

export function assertValidDerangement(
  memberIds: string[],
  pairings: Pairing[],
  exclusions?: readonly ExclusionPair[]
): void {
  const n = memberIds.length;
  if (pairings.length !== n) {
    throw new Error("จำนวนคู่ที่สุ่มได้ไม่ตรงกับจำนวนสมาชิก");
  }

  const blocked = buildBlockedSet(exclusions);
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
    if (blocked.has(edgeKey(pair.giverId, pair.receiverId))) {
      throw new Error("พบคู่ต้องห้ามตามกติกาในผลสุ่ม");
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
