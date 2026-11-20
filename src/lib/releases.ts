export interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const CURRENT_VERSION = "0.2.0";

export const RELEASES: ReleaseEntry[] = [
  {
    version: "0.2.0",
    date: "2026-11-20",
    title: "ปั่นเพื่อน ทายบัดดี้ & การ์ดเชิญ QR Code",
    highlights: [
      "Exclusion Rules: Admin กำหนดคู่ที่ห้ามจับได้กันเอง (เช่น แฟน/ทีมเดียวกัน)",
      "Shareable Invite Card & QR Code: สร้างโปสเตอร์เชิญพร้อม QR Code และดาวน์โหลดเป็น PNG",
      "Wish List Links & Secret Notes: แนบลิงก์สินค้าที่อยากได้สูงสุด 5 ลิงก์ + สมุดโน้ตลับเข้ารหัสสำหรับซานต้า",
      "Dual-Mode Secret Chat (/chat): มีทั้งห้องปั่นรวม (1-to-Many) และแชตลับส่วนตัว (1-to-1) พร้อมเมลแจ้งเตือน Cooldown 6 ชม.",
      "Guess My Buddy: เปิดโหวตทายบัดดี้ 24 ชม. ก่อนเฉลย พร้อม Leaderboard ขึ้นจอใหญ่เมื่อจบงาน",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-11-19",
    title: "เปิดตัว Secret Buddy — North Pole Post",
    highlights: [
      "No-Account Member Flow: เข้าร่วมผ่านลิงก์เชิญ ยืนยันอีเมล และแก้ไข Wish List ได้ตลอดเวลา",
      "Cryptographic Privacy: เข้ารหัสผลจับคู่ด้วย AES-256-GCM แม้แต่ Admin ก็ไม่เห็นผล",
      "Cozy Analog & 8-bit UI: ฉากต้นคริสต์มาส 8-bit, หิมะ, สายไฟ, เพลง Web Audio API และแกะซองลับ",
      "Superadmin Overview: จัดการหลายกลุ่มและตรวจสอบปัญหาการส่งอีเมล",
    ],
  },
];
