import { prisma } from "@/lib/db";
import { extractBearerToken, jsonNoStore } from "@/lib/api-response";
import { findMemberByToken, isGuessWindowOpen } from "@/lib/member-auth";
import { decryptReceiverId } from "@/lib/crypto";
import { buddyGuessSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token" }, 401);
  }

  const me = await findMemberByToken(token);
  if (!me) {
    return jsonNoStore({ error: "ลิงก์ไม่ถูกต้องหรือยังไม่ได้ยืนยันอีเมล" }, 404);
  }

  const isOpen = isGuessWindowOpen(me.group);

  const [members, myGuess] = await Promise.all([
    prisma.member.findMany({
      where: {
        groupId: me.group.id,
        emailVerifiedAt: { not: null },
        id: { not: me.id },
      },
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true },
    }),
    prisma.buddyGuess.findUnique({
      where: {
        groupId_guesserMemberId: {
          groupId: me.group.id,
          guesserMemberId: me.id,
        },
      },
      select: { guessedGiverId: true, updatedAt: true },
    }),
  ]);

  let completedResult: {
    actualGiverName: string | null;
    isCorrect: boolean;
    totalGuesses: number;
    correctCount: number;
  } | null = null;

  if (me.group.status === "COMPLETED") {
    const [assignments, allGuesses, allMembers] = await Promise.all([
      prisma.assignment.findMany({
        where: { groupId: me.group.id },
        select: { giverMemberId: true, encryptedReceiverId: true },
      }),
      prisma.buddyGuess.findMany({
        where: { groupId: me.group.id },
        select: { guesserMemberId: true, guessedGiverId: true },
      }),
      prisma.member.findMany({
        where: { groupId: me.group.id, emailVerifiedAt: { not: null } },
        select: { id: true, displayName: true },
      }),
    ]);

    const nameById = new Map(allMembers.map((m) => [m.id, m.displayName]));
    const trueGiverByReceiver = new Map<string, string>();
    for (const a of assignments) {
      try {
        const rid = decryptReceiverId(me.group.id, a.encryptedReceiverId);
        trueGiverByReceiver.set(rid, a.giverMemberId);
      } catch {
        // ignore
      }
    }

    const myTrueGiverId = trueGiverByReceiver.get(me.id) ?? null;
    let correctCount = 0;
    for (const g of allGuesses) {
      if (trueGiverByReceiver.get(g.guesserMemberId) === g.guessedGiverId) {
        correctCount++;
      }
    }

    completedResult = {
      actualGiverName: myTrueGiverId ? (nameById.get(myTrueGiverId) ?? null) : null,
      isCorrect: Boolean(myGuess && myTrueGiverId && myGuess.guessedGiverId === myTrueGiverId),
      totalGuesses: allGuesses.length,
      correctCount,
    };
  }

  return jsonNoStore({
    status: me.group.status,
    revealAt: me.group.revealAt,
    guessOpen: me.group.guessOpen,
    isOpen,
    candidates: members,
    myGuess: myGuess
      ? {
          guessedGiverId: myGuess.guessedGiverId,
          updatedAt: myGuess.updatedAt,
        }
      : null,
    completedResult,
  });
}

export async function POST(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token" }, 401);
  }

  const me = await findMemberByToken(token);
  if (!me) {
    return jsonNoStore({ error: "ลิงก์ไม่ถูกต้องหรือยังไม่ได้ยืนยันอีเมล" }, 404);
  }

  if (!isGuessWindowOpen(me.group)) {
    return jsonNoStore(
      { error: "ยังไม่เปิดให้โหวตทายบัดดี้ (เปิดโหวต 24 ชั่วโมงก่อนเฉลย จนกว่าจะจบกิจกรรม)" },
      409
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = buddyGuessSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore(
      { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
      400
    );
  }

  const { guessedGiverId } = parsed.data;
  if (guessedGiverId === me.id) {
    return jsonNoStore({ error: "ไม่สามารถทายตัวเองได้" }, 400);
  }

  const candidate = await prisma.member.findFirst({
    where: {
      id: guessedGiverId,
      groupId: me.group.id,
      emailVerifiedAt: { not: null },
    },
    select: { id: true, displayName: true },
  });

  if (!candidate) {
    return jsonNoStore({ error: "ไม่พบสมาชิกที่เลือกในกลุ่มนี้" }, 404);
  }

  const saved = await prisma.buddyGuess.upsert({
    where: {
      groupId_guesserMemberId: {
        groupId: me.group.id,
        guesserMemberId: me.id,
      },
    },
    create: {
      groupId: me.group.id,
      guesserMemberId: me.id,
      guessedGiverId: candidate.id,
    },
    update: {
      guessedGiverId: candidate.id,
    },
    select: { guessedGiverId: true, updatedAt: true },
  });

  return jsonNoStore({ ok: true, myGuess: saved });
}
