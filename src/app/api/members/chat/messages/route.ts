import { prisma } from "@/lib/db";
import { extractBearerToken, jsonNoStore } from "@/lib/api-response";
import { findMemberByToken } from "@/lib/member-auth";
import { getAnonymousPersona } from "@/lib/codename";
import { participantSeed } from "@/lib/participant-seed";

const PUBLIC_VISITOR_KEY = "__PUBLIC__";

export async function GET(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token สำหรับอ่านแชต" }, 401);
  }

  const me = await findMemberByToken(token);
  if (!me) {
    return jsonNoStore({ error: "ลิงก์ไม่ถูกต้องหรือยังไม่ได้ยืนยันอีเมล" }, 404);
  }

  const url = new URL(req.url);
  const targetMemberId = url.searchParams.get("targetMemberId")?.trim();
  const mode = url.searchParams.get("mode") === "PRIVATE_DM" ? "PRIVATE_DM" : "PUBLIC_ROOM";
  const visitorKeyParam = url.searchParams.get("visitorKey")?.trim();

  if (!targetMemberId) {
    return jsonNoStore({ error: "กรุณาระบุ targetMemberId" }, 400);
  }

  const targetMember = await prisma.member.findFirst({
    where: {
      id: targetMemberId,
      groupId: me.group.id,
      emailVerifiedAt: { not: null },
    },
    select: { id: true, displayName: true },
  });

  if (!targetMember) {
    return jsonNoStore({ error: "ไม่พบสมาชิกที่ระบุในกลุ่มนี้" }, 404);
  }

  const visitorKey =
    mode === "PUBLIC_ROOM"
      ? PUBLIC_VISITOR_KEY
      : targetMember.id === me.id
        ? visitorKeyParam || ""
        : me.id;

  if (mode === "PRIVATE_DM" && !visitorKey) {
    return jsonNoStore({ messages: [] });
  }

  const thread = await prisma.secretThread.findUnique({
    where: {
      groupId_targetMemberId_mode_visitorKey: {
        groupId: me.group.id,
        targetMemberId: targetMember.id,
        mode,
        visitorKey,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 150,
        select: {
          id: true,
          senderMemberId: true,
          content: true,
          createdAt: true,
        },
      },
    },
  });

  if (!thread) {
    return jsonNoStore({ threadId: null, messages: [] });
  }

  if (
    thread.mode === "PRIVATE_DM" &&
    thread.targetMemberId !== me.id &&
    thread.visitorMemberId !== me.id
  ) {
    return jsonNoStore({ error: "ไม่มีสิทธิ์เข้าถึงห้องสนทนานี้" }, 403);
  }

  const messages = thread.messages.map((m) => {
    const isOwner = m.senderMemberId === targetMember.id;
    const isMine = m.senderMemberId === me.id;
    const persona = getAnonymousPersona(me.group.id, m.senderMemberId);
    return {
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      isMine,
      isOwner,
      senderLabel: isOwner ? `${targetMember.displayName} (เจ้าของห้อง)` : persona.codename,
      avatarSeed: isOwner ? participantSeed(targetMember.id) : persona.avatarSeed,
    };
  });

  return jsonNoStore({
    threadId: thread.id,
    messages,
  });
}
