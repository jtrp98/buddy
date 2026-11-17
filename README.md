# 🎁 Secret Buddy — North Pole Post & Holiday Gift Exchange

เว็บแอปพลิเคชันสำหรับจัดกิจกรรมจับคู่ **Secret Buddy / Secret Santa** ในสไตล์ **Analog Holiday Post** ที่เก็บความลับได้จริง — แม้แต่ Admin ก็ไม่สามารถเปิดดูผลการจับคู่ของสมาชิกได้

## จุดเด่นของระบบ

- **No-Account Member Flow**: สมาชิกเข้าร่วมผ่านลิงก์เชิญ (`/join/[inviteCode]`), กรอก Buddy Profile และ Wish List, แล้วยืนยันตัวตนผ่านอีเมลโดยไม่ต้องสมัครสมาชิก
- **Cryptographic Privacy**: ผลจับคู่ถูกเข้ารหัสด้วย AES-256-GCM (`ASSIGNMENT_ENCRYPTION_KEY`) และ Admin Dashboard จะแสดงเฉพาะรายชื่อผู้เข้าร่วมและสถานะการส่งอีเมลเท่านั้น
- **Fair Derangement Draw**: สุ่มจับคู่แบบ 1-to-1 ไม่จับได้ตัวเอง พร้อม database transaction lock ป้องกันการสุ่มซ้ำ
- **Flexible Draw Trigger**: Admin กดปิดรับสมัครและสุ่มทันทีได้ตลอดเวลา หรือให้ระบบสุ่มให้อัตโนมัติเมื่อเปิดหน้าเว็บหลังครบกำหนดเวลาปิดรับสมัคร (`ensureGroupUpToDate`)
- **Cozy Analog Christmas UI**: ตกแต่งสไตล์การ์ดกระดาษครีม ปุ่ม keycap ตราประทับยาง นาฬิกา flip-clock สายไฟคริสต์มาส สวิตช์หิมะ/เสียง Web Audio API และขั้นตอนแกะผนึกขี้ผึ้งก่อนดู Buddy

---

## การพัฒนาบนเครื่อง Local

1. ติดตั้ง dependencies:
   ```bash
   npm install
   ```
2. คัดลอกไฟล์ `.env.example` เป็น `.env` และตั้งค่า `DATABASE_URL`, `AUTH_SECRET`, `ASSIGNMENT_ENCRYPTION_KEY`:
   ```bash
   cp .env.example .env
   ```
3. ซิงก์ Prisma schema กับ PostgreSQL และรัน dev server:
   ```bash
   npm run db:push
   npm run dev
   ```
4. ในโหมด Development หากยังไม่ได้ตั้งค่า SMTP/Resend อีเมลทั้งหมดจะถูกบันทึกไว้ที่ `/dev/outbox` สำหรับทดสอบได้ทันที

---

## การ Deploy บน Vercel

1. **Import Repository**: นำเข้า repository นี้จาก GitHub เข้าสู่ Vercel Dashboard
2. **ตั้งค่า Environment Variables** (สำหรับ Production / Preview):
   - `DATABASE_URL`: PostgreSQL Connection String (แนะนำ Neon Pooled URL ที่มี `?sslmode=require`)
   - `AUTH_SECRET`: ค่าสุ่ม 32-byte hex สำหรับลงนาม Admin JWT cookie
   - `ASSIGNMENT_ENCRYPTION_KEY`: ค่าสุ่ม 32-byte hex สำหรับเข้ารหัสผลจับคู่ Buddy
   - *(ไม่บังคับ)* `APP_URL`: URL สำรองกรณีเรียกงานที่ไม่มี HTTP Request Host (โดยปกติระบบจะสร้างลิงก์ในอีเมลตามโดเมนที่เข้าใช้งานจริงให้อัตโนมัติ)
   - **ตั้งค่าการส่งอีเมล (เลือกอย่างใดอย่างหนึ่ง)**:
     - **Gmail SMTP**: `SMTP_HOST="smtp.gmail.com"`, `SMTP_PORT="465"`, `SMTP_USER`, `SMTP_PASS` (App Password), `EMAIL_FROM`
     - **Resend API**: `RESEND_API_KEY`, `EMAIL_FROM`
   - *(ไม่บังคับ)* `CRON_SECRET`: ใช้เฉพาะกรณีต้องการเรียก `/api/cron/process-draws` จากภายนอก
3. **ซิงก์ Database Schema**: รันคำสั่งต่อไปนี้โดยชี้ `DATABASE_URL` ไปยังฐานข้อมูล Production:
   ```bash
   npm run db:push
   ```
4. **Deploy**: กด Deploy บน Vercel (ระบบจะรัน `prisma generate && next build` ให้อัตโนมัติ)

---

## คำสั่งที่มีให้ใช้งาน

- `npm run dev` — เปิด Next.js dev server
- `npm run build` — `prisma generate && next build`
- `npm test` — รันชุดทดสอบ Vitest
- `npm run lint` — ตรวจสอบโค้ดด้วย ESLint
- `npm run db:push` — ซิงก์ `prisma/schema.prisma` กับ PostgreSQL
