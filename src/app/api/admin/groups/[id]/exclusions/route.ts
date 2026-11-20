import { prisma } from "@/lib/db";
import { getAdminSession, groupAccessWhere } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";
import { exclusionPairSchema } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id } = await context.params;
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

  try {
    const body = await req.json();
    const parsed = exclusionPairSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const [a, b] =
      parsed.data.memberAId < parsed.data.memberBId
        ? [parsed.data.memberAId, parsed.data.memberBId]
        : [parsed.data.memberBId, parsed.data.memberAId];

    const members = await prisma.member.findMany({
      where: { groupId: id, id: { in: [a, b] } },
      select: { id: true },
    });

    if (members.length !== 2) {
      return jsonNoStore({ error: "ไม่พบสมาชิกที่ระบุในกลุ่มนี้" }, 404);
    }

    const existing = await prisma.groupExclusion.findUnique({
      where: {
        groupId_memberAId_memberBId: {
          groupId: id,
          memberAId: a,
          memberBId: b,
        },
      },
    });

    if (existing) {
      return jsonNoStore({ error: "คู่นี้ถูกกำหนดห้ามจับคู่ไว้แล้ว" }, 409);
    }

    const exclusion = await prisma.groupExclusion.create({
      data: {
        groupId: id,
        memberAId: a,
        memberBId: b,
      },
      select: {
        id: true,
        memberAId: true,
        memberBId: true,
      },
    });

    return jsonNoStore({ exclusion }, 201);
  } catch {
    return jsonNoStore({ error: "ไม่สามารถเพิ่มกติกาห้ามจับคู่ได้" }, 500);
  }
}
