import { prisma } from "@/lib/db";
import {
  buildAdminSessionCookieOptions,
  signAdminToken,
  verifyPassword,
} from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";
import { jsonNoStore } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const { email, password } = parsed.data;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return jsonNoStore({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return jsonNoStore({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    const token = await signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    const res = jsonNoStore({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
      },
    });
    res.cookies.set(buildAdminSessionCookieOptions(token));
    return res;
  } catch {
    return jsonNoStore({ error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่" }, 500);
  }
}
