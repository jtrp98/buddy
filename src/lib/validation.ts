import { z } from "zod";
import { BUDDY_INTEREST_OPTIONS } from "./constants";

const VALID_INTEREST_KEYS = new Set<string>(BUDDY_INTEREST_OPTIONS.map((i) => i.key));

export const adminRegisterSchema = z.object({
  name: z.string().trim().min(2, "กรุณาระบุชื่อผู้ดูแลอย่างน้อย 2 ตัวอักษร").max(80),
  email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง").max(160),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .max(128, "รหัสผ่านยาวเกินไป"),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const budgetSchema = z
  .object({
    budgetType: z.enum(["FIXED", "RANGE", "MIN", "UNLIMITED"]),
    budgetMin: z.number().int().min(0, "งบประมาณต้องไม่ติดลบ").max(1_000_000).nullable().optional(),
    budgetMax: z.number().int().min(0, "งบประมาณต้องไม่ติดลบ").max(1_000_000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.budgetType === "FIXED" || data.budgetType === "MIN") {
      if (data.budgetMin == null || data.budgetMin <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["budgetMin"],
          message: "กรุณาระบุจำนวนเงินงบประมาณ (มากกว่า 0 บาท)",
        });
      }
    }
    if (data.budgetType === "RANGE") {
      if (data.budgetMin == null || data.budgetMax == null) {
        ctx.addIssue({
          code: "custom",
          path: ["budgetMin"],
          message: "กรุณาระบุงบประมาณต่ำสุดและสูงสุด",
        });
      } else if (data.budgetMin <= 0 || data.budgetMax < data.budgetMin) {
        ctx.addIssue({
          code: "custom",
          path: ["budgetMax"],
          message: "งบสูงสุดต้องมากกว่าหรือเท่ากับงบต่ำสุด",
        });
      }
    }
  });

export const createGroupSchema = z
  .object({
    title: z.string().trim().min(2, "กรุณาตั้งชื่อกิจกรรม").max(120),
    description: z.string().trim().max(1000).optional().nullable(),
    budgetType: z.enum(["FIXED", "RANGE", "MIN", "UNLIMITED"]),
    budgetMin: z.number().int().min(0).max(1_000_000).nullable().optional(),
    budgetMax: z.number().int().min(0).max(1_000_000).nullable().optional(),
    registrationClosesAt: z.string().min(1, "กรุณากำหนดวันและเวลาปิดรับสมัคร"),
    revealAt: z.string().optional().nullable(),
    publishNow: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    const budgetCheck = budgetSchema.safeParse({
      budgetType: data.budgetType,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
    });
    if (!budgetCheck.success) {
      for (const issue of budgetCheck.error.issues) {
        ctx.addIssue({
          code: "custom",
          path: issue.path,
          message: issue.message,
        });
      }
    }
  });

export const updateGroupSchema = z.object({
  title: z.string().trim().min(2, "กรุณาตั้งชื่อกิจกรรม").max(120).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  budgetType: z.enum(["FIXED", "RANGE", "MIN", "UNLIMITED"]).optional(),
  budgetMin: z.number().int().min(0).max(1_000_000).nullable().optional(),
  budgetMax: z.number().int().min(0).max(1_000_000).nullable().optional(),
  registrationClosesAt: z.string().optional(),
  revealAt: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "OPEN", "ACTIVE", "COMPLETED"]).optional(),
});

export const buddyProfileSchema = z.object({
  interests: z
    .array(z.string())
    .min(1, "กรุณาเลือกความชอบอย่างน้อย 1 อย่าง")
    .refine(
      (arr) => arr.every((k) => VALID_INTEREST_KEYS.has(k)),
      "หมวดหมู่ความชอบไม่ถูกต้อง"
    ),
  interestOther: z.string().trim().max(200).optional().nullable(),
  favoriteColor: z.string().trim().max(100).optional().nullable(),
  favoriteFoodDrink: z.string().trim().max(200).optional().nullable(),
  hobbies: z.string().trim().max(300).optional().nullable(),
  giftStyle: z.string().trim().max(200).optional().nullable(),
  dislikes: z.string().trim().max(300).optional().nullable(),
  allergies: z.string().trim().max(300).optional().nullable(),
  wishList: z.string().trim().max(600).optional().nullable(),
  noteToBuddy: z.string().trim().max(600).optional().nullable(),
});

export const memberRegisterSchema = buddyProfileSchema.extend({
  displayName: z.string().trim().min(1, "กรุณากรอกชื่อ / ชื่อเล่น").max(80),
  email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง").max(160),
});

export const memberProfileUpdateSchema = buddyProfileSchema.extend({
  displayName: z.string().trim().min(1, "กรุณากรอกชื่อ / ชื่อเล่น").max(80).optional(),
});

export const recoverLinkSchema = z.object({
  inviteCode: z.string().trim().min(1, "กรุณาระบุรหัสกลุ่ม"),
  email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง"),
});

export function normalizeNullableText(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
