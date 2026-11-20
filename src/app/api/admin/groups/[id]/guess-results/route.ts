import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminSession, groupAccessWhere } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";
import { decryptReceiverId } from "@/lib/crypto";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id } = await context.params;
  const group = await prisma.group.findFirst({
    where: groupAccessWhere(id, session),
    include: {
      members: {
        where: { emailVerifiedAt: { not: null } },
        select: { id: true, displayName: true },
      },
      assignments: {
        select: { giverMemberId: true, encryptedReceiverId: true },
      },
      buddyGuesses: {
        select: { guesserMemberId: true, guessedGiverId: true },
      },
    },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  if (group.status !== "COMPLETED") {
    return jsonNoStore(
      { error: "ผลทายบัดดี้จะเปิดดูได้เมื่อกิจกรรมจบ (COMPLETED) แล้วเท่านั้น" },
      409
    );
  }

  const nameById = new Map(group.members.map((m) => [m.id, m.displayName]));
  const trueGiverByReceiver = new Map<string, string>();

  for (const a of group.assignments) {
    try {
      const receiverId = decryptReceiverId(group.id, a.encryptedReceiverId);
      trueGiverByReceiver.set(receiverId, a.giverMemberId);
    } catch {
      return jsonNoStore({ error: "ไม่สามารถถอดรหัสผลจับคู่ได้" }, 500);
    }
  }

  const guessByGuesser = new Map(
    group.buddyGuesses.map((g) => [g.guesserMemberId, g.guessedGiverId])
  );

  const guesses = group.buddyGuesses.map((g) => {
    const actualGiverId = trueGiverByReceiver.get(g.guesserMemberId) ?? null;
    const isCorrect = actualGiverId !== null && g.guessedGiverId === actualGiverId;
    return {
      guesserId: g.guesserMemberId,
      guesserName: nameById.get(g.guesserMemberId) ?? "ไม่ทราบชื่อ",
      guessedName: nameById.get(g.guessedGiverId) ?? "ไม่ทราบชื่อ",
      actualGiverName: actualGiverId ? (nameById.get(actualGiverId) ?? "ไม่ทราบชื่อ") : "-",
      isCorrect,
    };
  });

  const undetectedSantas: Array<{ id: string; displayName: string; receiverName: string }> = [];
  for (const [receiverId, giverId] of trueGiverByReceiver.entries()) {
    const guessedId = guessByGuesser.get(receiverId);
    if (guessedId !== giverId) {
      undetectedSantas.push({
        id: giverId,
        displayName: nameById.get(giverId) ?? "ไม่ทราบชื่อ",
        receiverName: nameById.get(receiverId) ?? "ไม่ทราบชื่อ",
      });
    }
  }

  const correctCount = guesses.filter((g) => g.isCorrect).length;

  return jsonNoStore({
    summary: {
      totalMembers: group.members.length,
      totalGuesses: guesses.length,
      correctCount,
    },
    guesses,
    undetectedSantas,
  });
}

const toggleSchema = z.object({
  guessOpen: z.boolean(),
});

export async function PATCH(req: Request, context: RouteContext) {
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

  if (group.status !== "ACTIVE") {
    return jsonNoStore(
      { error: "สามารถเปิด/ปิดรอบทายบัดดี้ได้เฉพาะกลุ่มที่สุ่มจับคู่แล้ว (ACTIVE)" },
      409
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
  }

  const updated = await prisma.group.update({
    where: { id },
    data: { guessOpen: parsed.data.guessOpen },
    select: { guessOpen: true },
  });

  return jsonNoStore({ guessOpen: updated.guessOpen });
}
