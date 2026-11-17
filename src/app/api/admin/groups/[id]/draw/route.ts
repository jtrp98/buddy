import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";
import { executeGroupDraw } from "@/lib/draw";
import { getAppBaseUrl } from "@/lib/url";

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

  if (group.status === "ACTIVE" || group.status === "COMPLETED") {
    return jsonNoStore(
      { error: "กลุ่มนี้สุ่มจับคู่เรียบร้อยแล้ว ไม่สามารถสุ่มซ้ำได้" },
      409
    );
  }

  if (group.status === "DRAFT") {
    return jsonNoStore(
      { error: "กรุณาเปิดรับสมัคร (Open) ก่อนทำการสุ่มจับคู่" },
      400
    );
  }

  if (group.status === "DRAWING") {
    return jsonNoStore(
      { error: "ระบบกำลังประมวลผลการสุ่มอยู่ กรุณารอสักครู่" },
      409
    );
  }

  const result = await executeGroupDraw(id, {
    forceClose: true,
    baseUrl: getAppBaseUrl(req),
  });

  if (result.outcome === "INSUFFICIENT_MEMBERS") {
    return jsonNoStore({ error: result.message, result }, 400);
  }

  if (result.outcome === "SKIPPED") {
    return jsonNoStore({ error: result.reason, result }, 409);
  }

  if (result.outcome === "ERROR") {
    return jsonNoStore({ error: result.message, result }, 500);
  }

  return jsonNoStore({ result });
}
