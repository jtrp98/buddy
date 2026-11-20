import { prisma } from "@/lib/db";
import { extractBearerToken, jsonNoStore } from "@/lib/api-response";
import { findMemberByToken } from "@/lib/member-auth";
import { getAnonymousPersona } from "@/lib/codename";
import { chatMessageSchema } from "@/lib/validation";
import { sendMail } from "@/lib/email/mailer";
import { buildChatNotificationEmail } from "@/lib/email/templates";
import { getAppBaseUrl } from "@/lib/url";
import { sanitizeLogError } from "@/lib/crypto";

const PUBLIC_VISITOR_KEY = "__PUBLIC__";
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const RATE_LIMIT_MS = 3000;

export async function GET(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token สำหรับเข้าใช้งานแชต" }, 401);
  }

  const me = await findMemberByToken(token);
  if (!me) {
    return jsonNoStore({ error: "ลิงก์ไม่ถูกต้องหรือยังไม่ได้ยืนยันอีเมล" }, 404);
  }

  const [members, threads] = await Promise.all([
    prisma.member.findMany({
      where: { groupId: me.group.id, emailVerifiedAt: { not: null } },
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true },
    }),
    prisma.secretThread.findMany({
      where: {
        groupId: me.group.id,
        OR: [
          { mode: "PRIVATE_DM", targetMemberId: me.id },
          { mode: "PRIVATE_DM", visitorMemberId: me.id },
          { mode: "PUBLIC_ROOM" },
        ],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        targetMember: { select: { id: true, displayName: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true },
        },
        _count: { select: { messages: true } },
      },
    }),
  ]);

  const myPersona = getAnonymousPersona(me.group.id, me.id);

  const inboxDmThreads = threads
    .filter((t) => t.mode === "PRIVATE_DM" && t.targetMemberId === me.id && t.visitorMemberId)
    .map((t) => {
      const visitorPersona = getAnonymousPersona(me.group.id, t.visitorMemberId!);
      return {
        id: t.id,
        visitorKey: t.visitorKey,
        visitorCodename: visitorPersona.codename,
        visitorAvatarSeed: visitorPersona.avatarSeed,
        messageCount: t._count.messages,
        lastMessage: t.messages[0]?.content ?? null,
        updatedAt: t.updatedAt,
      };
    });

  const publicRoomSummary = new Map<string, { messageCount: number; lastMessage: string | null }>();
  for (const t of threads) {
    if (t.mode === "PUBLIC_ROOM") {
      publicRoomSummary.set(t.targetMemberId, {
        messageCount: t._count.messages,
        lastMessage: t.messages[0]?.content ?? null,
      });
    }
  }

  return jsonNoStore({
    me: {
      id: me.id,
      displayName: me.displayName,
      codename: myPersona.codename,
      avatarSeed: myPersona.avatarSeed,
    },
    group: {
      id: me.group.id,
      title: me.group.title,
      status: me.group.status,
    },
    members: members.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      publicMessageCount: publicRoomSummary.get(m.id)?.messageCount ?? 0,
      publicLastMessage: publicRoomSummary.get(m.id)?.lastMessage ?? null,
    })),
    // Sorted by anonymous seed hash so the array order cannot be correlated with real display names.
    villageParticipants: members
      .map((m) => ({
        seed: getAnonymousPersona(me.group.id, m.id).avatarSeed,
        verified: true,
      }))
      .sort((a, b) => a.seed.localeCompare(b.seed)),
    inboxDmThreads,
  });
}

export async function POST(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token สำหรับส่งข้อความ" }, 401);
  }

  const me = await findMemberByToken(token);
  if (!me) {
    return jsonNoStore({ error: "ลิงก์ไม่ถูกต้องหรือยังไม่ได้ยืนยันอีเมล" }, 404);
  }

  if (me.group.status === "COMPLETED") {
    return jsonNoStore({ error: "กิจกรรมนี้จบลงแล้ว ไม่สามารถส่งข้อความเพิ่มได้" }, 409);
  }

  const body = await req.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore(
      { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
      400
    );
  }

  const { targetMemberId, mode, visitorKey: requestedVisitorKey, content } = parsed.data;

  // Verify target member belongs to the same group
  const targetMember = await prisma.member.findFirst({
    where: {
      id: targetMemberId,
      groupId: me.group.id,
      emailVerifiedAt: { not: null },
    },
    select: { id: true, displayName: true, email: true },
  });

  if (!targetMember) {
    return jsonNoStore({ error: "ไม่พบสมาชิกปลายทางในกลุ่มนี้" }, 404);
  }

  // Basic per-member rate limit (3 seconds)
  const latestByMe = await prisma.secretMessage.findFirst({
    where: {
      senderMemberId: me.id,
      thread: { groupId: me.group.id },
    },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (latestByMe && Date.now() - latestByMe.createdAt.getTime() < RATE_LIMIT_MS) {
    return jsonNoStore({ error: "ส่งข้อความเร็วเกินไป กรุณารอสักครู่" }, 429);
  }

  let effectiveVisitorId: string | null = null;
  let effectiveVisitorKey = PUBLIC_VISITOR_KEY;

  if (mode === "PRIVATE_DM") {
    if (targetMember.id === me.id) {
      // Target owner replying to an existing DM thread
      if (!requestedVisitorKey || requestedVisitorKey === PUBLIC_VISITOR_KEY) {
        return jsonNoStore({ error: "กรุณาเลือกห้องสนทนาที่ต้องการตอบกลับ" }, 400);
      }
      effectiveVisitorId = requestedVisitorKey;
      effectiveVisitorKey = requestedVisitorKey;
    } else {
      effectiveVisitorId = me.id;
      effectiveVisitorKey = me.id;
    }
  }

  const thread = await prisma.secretThread.upsert({
    where: {
      groupId_targetMemberId_mode_visitorKey: {
        groupId: me.group.id,
        targetMemberId: targetMember.id,
        mode,
        visitorKey: effectiveVisitorKey,
      },
    },
    create: {
      groupId: me.group.id,
      targetMemberId: targetMember.id,
      visitorMemberId: effectiveVisitorId,
      visitorKey: effectiveVisitorKey,
      mode,
    },
    update: {},
    select: { id: true },
  });

  const message = await prisma.secretMessage.create({
    data: {
      threadId: thread.id,
      senderMemberId: me.id,
      content,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });

  await prisma.secretThread.update({
    where: { id: thread.id },
    data: { updatedAt: new Date() },
  });

  // Notify room owner by email with a 6-hour cooldown when someone else writes in their room/DM
  if (targetMember.id !== me.id) {
    const sixHoursAgo = new Date(Date.now() - SIX_HOURS_MS);
    const claimed = await prisma.member.updateMany({
      where: {
        id: targetMember.id,
        OR: [
          { lastChatNotifiedAt: null },
          { lastChatNotifiedAt: { lte: sixHoursAgo } },
        ],
      },
      data: { lastChatNotifiedAt: new Date() },
    });

    if (claimed.count > 0) {
      const senderPersona = getAnonymousPersona(me.group.id, me.id);
      const baseUrl = getAppBaseUrl(req);
      const chatUrl = `${baseUrl}/join/${encodeURIComponent(me.group.inviteCode)}/recover`;
      const mail = buildChatNotificationEmail({
        memberName: targetMember.displayName,
        groupTitle: me.group.title,
        senderCodename: senderPersona.codename,
        modeLabel: mode === "PUBLIC_ROOM" ? "ห้องปั่นรวมของคุณ" : "แชตลับ 1-ต่อ-1",
        chatUrl,
      });

      try {
        await sendMail({
          to: targetMember.email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        });
        await prisma.emailLog.create({
          data: {
            groupId: me.group.id,
            memberId: targetMember.id,
            type: "CHAT_NOTIFICATION",
            status: "SENT",
            attempts: 1,
            sentAt: new Date(),
          },
        });
      } catch (err) {
        await prisma.emailLog
          .create({
            data: {
              groupId: me.group.id,
              memberId: targetMember.id,
              type: "CHAT_NOTIFICATION",
              status: "FAILED",
              attempts: 1,
              lastError: sanitizeLogError(err),
            },
          })
          .catch(() => {});
      }
    }
  }

  const persona = getAnonymousPersona(me.group.id, me.id);
  const isOwner = mode === "PRIVATE_DM" && targetMember.id === me.id;

  return jsonNoStore(
    {
      threadId: thread.id,
      message: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        isMine: true,
        isOwner,
        senderLabel: isOwner ? `${targetMember.displayName} (เจ้าของห้อง)` : persona.codename,
        avatarSeed: isOwner ? "room-owner" : persona.avatarSeed,
      },
    },
    201
  );
}
