import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";
import { decryptReceiverId } from "@/lib/crypto";
import { participantSeed } from "@/lib/participant-seed";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  if (!session.isSuperAdmin) {
    return jsonNoStore({ error: "เฉพาะ Superadmin เท่านั้นที่สามารถดูผลการจับคู่ได้" }, 403);
  }

  const { id } = await context.params;
  const group = await prisma.group.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      drawnAt: true,
      members: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      assignments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          giverMemberId: true,
          encryptedReceiverId: true,
        },
      },
    },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  if (group.status !== "ACTIVE" && group.status !== "COMPLETED") {
    return jsonNoStore(
      { error: "กลุ่มนี้ยังไม่ได้สุ่มจับคู่" },
      409
    );
  }

  const memberMap = new Map(
    group.members.map((m) => [
      m.id,
      {
        id: m.id,
        displayName: m.displayName,
        email: m.email,
        participantSeed: participantSeed(m.id),
      },
    ])
  );

  const pairings = group.assignments
    .map((assignment) => {
      const giver = memberMap.get(assignment.giverMemberId) ?? null;
      let receiver = null;
      try {
        const receiverId = decryptReceiverId(group.id, assignment.encryptedReceiverId);
        receiver = memberMap.get(receiverId) ?? null;
      } catch {
        receiver = null;
      }
      return {
        id: assignment.id,
        giver,
        receiver,
      };
    })
    .sort((a, b) =>
      (a.giver?.displayName ?? "").localeCompare(b.giver?.displayName ?? "", "th")
    );

  return jsonNoStore({
    groupId: group.id,
    drawnAt: group.drawnAt,
    pairings,
  });
}
