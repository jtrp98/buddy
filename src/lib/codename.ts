import crypto from "node:crypto";

const FESTIVE_ADJECTIVES = [
  "เอลฟ์หิมะ",
  "เรนเดียร์จมูกแดง",
  "ตุ๊กตาหิมะ",
  "คุกกี้ขิง",
  "กระดิ่งเงิน",
  "ดาวเหนือ",
  "นกฮูกหิมะ",
  "เพนกวินขี้เล่น",
  "ลูกกวาดไม้เท้า",
  "กวางน้อย",
  "ถุงเท้าคริสต์มาส",
  "ภูตน้ำแข็ง",
  "แมวเหมียวผ้าพันคอ",
  "หมีขั้วโลก",
  "ซานต้าฝึกหัด",
  "เทียนหอมอุ่น",
];

/**
 * Generates a deterministic anonymous codename + avatar seed for a member
 * within a group's secret chat, without exposing their real memberId or name.
 */
export function getAnonymousPersona(groupId: string, memberId: string): {
  codename: string;
  avatarSeed: string;
} {
  const hash = crypto
    .createHash("sha256")
    .update(`secret-chat-persona:${groupId}:${memberId}`)
    .digest();

  const adjIdx = hash.readUInt16BE(0) % FESTIVE_ADJECTIVES.length;
  const num = (hash.readUInt16BE(2) % 89) + 10; // 10..98

  return {
    codename: `${FESTIVE_ADJECTIVES[adjIdx]} #${num}`,
    avatarSeed: hash.subarray(4, 16).toString("hex"),
  };
}
