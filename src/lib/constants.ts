export const BUDDY_INTEREST_OPTIONS = [
  { key: "snacks", label: "ของกิน / ขนม" },
  { key: "coffee_tea", label: "กาแฟ / ชา / เครื่องดื่ม" },
  { key: "books", label: "หนังสือ" },
  { key: "stationery", label: "เครื่องเขียน" },
  { key: "tech", label: "อุปกรณ์ไอที" },
  { key: "plants", label: "ต้นไม้" },
  { key: "plushies", label: "ตุ๊กตา / ของน่ารัก" },
  { key: "skincare", label: "สกินแคร์" },
  { key: "daily_use", label: "ของใช้ในชีวิตประจำวัน" },
  { key: "other", label: "อื่น ๆ" },
] as const;

export type BuddyInterestKey = (typeof BUDDY_INTEREST_OPTIONS)[number]["key"];

export const GROUP_STATUS_META = {
  DRAFT: {
    label: "Draft — กำลังตั้งค่า",
    shortLabel: "Draft",
    description: "กำลังตั้งค่ากลุ่ม ยังไม่เปิดรับสมัคร",
    badgeClass: "bg-cream text-ink-soft border-ink-soft",
  },
  OPEN: {
    label: "Open — เปิดรับสมัคร",
    shortLabel: "Open",
    description: "กำลังเปิดให้สมาชิกเข้าร่วมและกรอก Buddy Profile",
    badgeClass: "bg-pine-wash text-pine-deep border-pine",
  },
  DRAWING: {
    label: "Drawing — กำลังสุ่มจับคู่",
    shortLabel: "Drawing",
    description: "ระบบกำลังประมวลผลการสุ่มจับคู่",
    badgeClass: "bg-amber-wash text-amber-ink border-amber-ink/50",
  },
  ACTIVE: {
    label: "Active — สุ่มเรียบร้อย",
    shortLabel: "Active",
    description: "สุ่มจับคู่เรียบร้อยและเปิดให้สมาชิกดูผล Buddy แล้ว",
    badgeClass: "bg-red-wash text-xmas-red-deep border-xmas-red",
  },
  COMPLETED: {
    label: "Completed — จบกิจกรรม",
    shortLabel: "Completed",
    description: "กิจกรรมเสร็จสิ้นเรียบร้อยแล้ว",
    badgeClass: "bg-plum-wash text-plum border-plum",
  },
} as const;

export function getInterestLabel(key: string): string {
  const found = BUDDY_INTEREST_OPTIONS.find((item) => item.key === key);
  return found ? found.label : key;
}
