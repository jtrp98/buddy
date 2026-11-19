import { prisma } from "@/lib/db";
import { getAdminSession, groupAccessWhere } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";

type RouteContext = { params: Promise<{ id: string; memberId: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id, memberId } = await context.params;

  const group = await prisma.group.findFirst({
    where: groupAccessWhere(id, session),
    select: { id: true, status: true },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  if (group.status === "DRAWING") {
    return jsonNoStore(
      { error: "กำลังประมวลผลการสุ่มจับคู่ กรุณารอสักครู่" },
      409
    );
  }

  const member = await prisma.member.findFirst({
    where: { id: memberId, groupId: group.id },
    select: {
      id: true,
      emailVerifiedAt: true,
      givenAssignment: { select: { id: true } },
    },
  });

  if (!member) {
    return jsonNoStore({ error: "ไม่พบสมาชิกคนนี้ในกลุ่ม" }, 404);
  }

  const isDrawn = group.status === "ACTIVE" || group.status === "COMPLETED";
  if (isDrawn && (member.emailVerifiedAt !== null || member.givenAssignment !== null)) {
    return jsonNoStore(
      { error: "ไม่สามารถลบสมาชิกที่เข้าร่วมสุ่มจับคู่แล้วได้" },
      409
    );
  }

  await prisma.member.delete({
    where: { id: member.id },
  });

  return jsonNoStore({ ok: true, deletedMemberId: member.id });
}
