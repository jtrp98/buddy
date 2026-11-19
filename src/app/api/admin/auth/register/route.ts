import { prisma } from "@/lib/db";
import {
  buildAdminSessionCookieOptions,
  hashPassword,
  signAdminToken,
} from "@/lib/auth";
import { adminRegisterSchema } from "@/lib/validation";
import { jsonNoStore } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return jsonNoStore({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, 409);
    }

    const passwordHash = await hashPassword(password);
    const admin = await prisma.admin.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, isSuperAdmin: true },
    });

    const token = await signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    const res = jsonNoStore({ admin }, 201);
    res.cookies.set(buildAdminSessionCookieOptions(token));
    return res;
  } catch {
    return jsonNoStore({ error: "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่" }, 500);
  }
}
