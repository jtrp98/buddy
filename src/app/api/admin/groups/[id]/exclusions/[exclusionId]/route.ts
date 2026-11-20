import { prisma } from "@/lib/db";
import { getAdminSession, groupAccessWhere } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string; exclusionId: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id, exclusionId } = await context.params;
  const group = await prisma.group.findFirst({
    where: groupAccessWhere(id, session),
    select: { id: true, status: true },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  if (group.status !== "DRAFT" && group.status !== "OPEN") {
    return jsonNoStore(
      { error: "ไม่สามารถแก้ไขกติกาห้ามจับคู่ได้หลังจากสุ่มจับคู่แล้ว" },
      409
    );
  }

  const deleted = await prisma.groupExclusion.deleteMany({
    where: { id: exclusionId, groupId: id },
  });

  if (deleted.count === 0) {
    return jsonNoStore({ error: "ไม่พบรายการกติกาห้ามจับคู่นี้" }, 404);
  }

  return jsonNoStore({ ok: true });
}
