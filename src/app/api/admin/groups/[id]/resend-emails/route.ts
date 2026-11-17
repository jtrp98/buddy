import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";
import { resendGroupResultEmails } from "@/lib/draw";
import { getAppBaseUrl } from "@/lib/url";

const resendSchema = z.object({
  memberId: z.string().min(1).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id } = await context.params;
  const group = await prisma.group.findFirst({
    where: { id, adminId: session.adminId },
    select: { id: true, status: true },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  if (group.status !== "ACTIVE" && group.status !== "COMPLETED") {
    return jsonNoStore(
      { error: "สามารถส่งอีเมลซ้ำได้เฉพาะกิจกรรมที่สุ่มจับคู่แล้วเท่านั้น" },
      409
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = resendSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
  }

  if (parsed.data.memberId) {
    const member = await prisma.member.findFirst({
      where: {
        id: parsed.data.memberId,
        groupId: id,
        emailVerifiedAt: { not: null },
      },
      select: { id: true },
    });
    if (!member) {
      return jsonNoStore({ error: "ไม่พบสมาชิกที่ยืนยันอีเมลแล้วในกลุ่มนี้" }, 404);
    }
  }

  const result = await resendGroupResultEmails(id, {
    baseUrl: getAppBaseUrl(req),
    memberId: parsed.data.memberId,
  });

  return jsonNoStore({ result });
}
