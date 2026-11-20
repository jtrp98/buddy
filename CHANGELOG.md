# Changelog

All notable changes to **Secret Buddy** are documented in this file.

## [0.2.0] - 2026-11-20

### Added
- **Exclusion Rules (กติกาห้ามจับคู่):** กำหนดคู่สมาชิกที่ห้ามจับได้กันเองในหน้า Admin พร้อมอัลกอริทึมสุ่มแบบมีเงื่อนไข
- **Shareable Invite Card & QR Code:** สร้างโปสเตอร์เชิญสไตล์ North Pole Post พร้อม QR Code และดาวน์โหลดเป็น PNG
- **Wish List Links & Secret Gift Notes:** แนบลิงก์ของที่อยากได้สูงสุด 5 ลิงก์ และสมุดโน้ตลับของซานต้าที่เข้ารหัส AES-256-GCM
- **Dual-Mode Anonymous Member Chat (`/chat`):** รองรับทั้งห้องปั่นรวม (1-to-Many) และแชตลับส่วนตัว (1-to-1) พร้อม Visibility-aware Polling, Idle Auto-Pause 6 นาที และอีเมลแจ้งเตือน Cooldown 6 ชั่วโมง
- **Guess My Buddy:** เปิดโหวตทายบัดดี้ 24 ชม. ก่อนเฉลยจนจบงาน พร้อมหน้า Leaderboard ขึ้นจอใหญ่สำหรับ Admin
- **Release Badge & Changelog Modal:** แสดงเลขเวอร์ชันและรายการอัปเดตบน Navbar

## [0.1.0] - 2026-11-19

### Added
- ระบบจัดกิจกรรม Secret Buddy แบบ No-Account Join Flow และเข้ารหัสผลจับคู่ด้วย AES-256-GCM
- ฉาก 8-bit `JoinScene` ที่ต้นคริสต์มาสเติบโตตามจำนวนผู้เข้าร่วม พร้อมเพลงและเสียง Web Audio API
- หน้าเปิดซอง/แกะของขวัญ `MagicalGiftReveal`, ระบบกู้คืนลิงก์, และระบบ Superadmin
