import { prisma } from "./db";
import {
  computeReceiverHmac,
  decryptReceiverId,
  encryptReceiverId,
  generateRawToken,
  hashToken,
  sanitizeLogError,
} from "./crypto";
import { formatBudget } from "./budget";
import { sendMail } from "./email/mailer";
import { buildResultNotificationEmail, type BuddyEmailProfile } from "./email/templates";
import { assertValidDerangement, generateDerangement, type Pairing } from "./derangement";
import { getAppBaseUrl } from "./url";

export { assertValidDerangement, generateDerangement, type Pairing };

export type DrawExecutionResult =
  | { outcome: "DRAWN"; count: number; sent: number; failed: number }
  | { outcome: "INSUFFICIENT_MEMBERS"; verifiedCount: number; message: string }
  | { outcome: "SKIPPED"; reason: string }
  | { outcome: "ERROR"; message: string };

export async function executeGroupDraw(
  groupId: string,
  options?: { forceClose?: boolean; baseUrl?: string }
): Promise<DrawExecutionResult> {
  const now = new Date();
  const forceClose = Boolean(options?.forceClose);

  // Atomic lock: only one caller can transition OPEN -> DRAWING
  const locked = await prisma.group.updateMany({
    where: {
      id: groupId,
      status: "OPEN",
      ...(forceClose ? {} : { registrationClosesAt: { lte: now } }),
    },
    data: {
      status: "DRAWING",
      drawError: null,
    },
  });

  if (locked.count === 0) {
    return {
      outcome: "SKIPPED",
      reason: "กลุ่มไม่ได้อยู่ในสถานะเปิดรับสมัคร หรือยังไม่ถึงเวลาปิดรับสมัคร",
    };
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: { emailVerifiedAt: { not: null } },
          select: { id: true },
        },
      },
    });

    if (!group) {
      return { outcome: "ERROR", message: "ไม่พบข้อมูลกลุ่ม" };
    }

    const verifiedIds = group.members.map((m) => m.id);
    if (verifiedIds.length < 2) {
      const msg =
        "ไม่สามารถสุ่มจับคู่ได้ เนื่องจากมีสมาชิกที่ยืนยันอีเมลแล้วน้อยกว่า 2 คน (กรุณาขยายเวลาปิดรับสมัคร หรือรอสมาชิกยืนยันอีเมลเพิ่ม)";
      await prisma.group.update({
        where: { id: groupId },
        data: {
          status: "OPEN",
          drawError: msg,
        },
      });
      return {
        outcome: "INSUFFICIENT_MEMBERS",
        verifiedCount: verifiedIds.length,
        message: msg,
      };
    }

    const pairings = generateDerangement(verifiedIds);

    await prisma.$transaction(async (tx) => {
      // Defensive guard: refuse if assignments already exist for this group
      const existingCount = await tx.assignment.count({ where: { groupId } });
      if (existingCount > 0) {
        throw new Error("กลุ่มนี้มีการบันทึกผลจับคู่ไว้แล้ว");
      }

      await tx.assignment.createMany({
        data: pairings.map((p) => ({
          groupId,
          giverMemberId: p.giverId,
          receiverHmac: computeReceiverHmac(groupId, p.receiverId),
          encryptedReceiverId: encryptReceiverId(groupId, p.receiverId),
        })),
      });

      await tx.emailLog.createMany({
        data: verifiedIds.map((memberId) => ({
          groupId,
          memberId,
          type: "RESULT_NOTIFICATION",
          status: "PENDING",
          attempts: 0,
        })),
      });

      await tx.group.update({
        where: { id: groupId },
        data: {
          status: "ACTIVE",
          drawnAt: new Date(),
          drawError: null,
        },
      });
    });

    const dispatch = await dispatchResultEmailsForGroup(groupId, {
      baseUrl: options?.baseUrl,
      statuses: ["PENDING"],
    });

    return {
      outcome: "DRAWN",
      count: pairings.length,
      sent: dispatch.sent,
      failed: dispatch.failed,
    };
  } catch (error) {
    const safeMsg = sanitizeLogError(error);
    await prisma.group
      .update({
        where: { id: groupId, status: "DRAWING" },
        data: {
          status: "OPEN",
          drawError: `เกิดข้อผิดพลาดระหว่างการสุ่มจับคู่: ${safeMsg}`,
        },
      })
      .catch(() => {});
    return { outcome: "ERROR", message: safeMsg };
  }
}

export async function dispatchResultEmailsForGroup(
  groupId: string,
  options?: {
    baseUrl?: string;
    statuses?: Array<"PENDING" | "FAILED">;
    memberIds?: string[];
  }
): Promise<{ sent: number; failed: number }> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      title: true,
      budgetType: true,
      budgetMin: true,
      budgetMax: true,
      status: true,
    },
  });

  if (!group || (group.status !== "ACTIVE" && group.status !== "COMPLETED")) {
    return { sent: 0, failed: 0 };
  }

  const targetStatuses = options?.statuses ?? ["PENDING", "FAILED"];

  const logs = await prisma.emailLog.findMany({
    where: {
      groupId,
      type: "RESULT_NOTIFICATION",
      status: { in: targetStatuses },
      ...(options?.memberIds?.length ? { memberId: { in: options.memberIds } } : {}),
    },
    include: {
      member: {
        select: {
          id: true,
          displayName: true,
          email: true,
          givenAssignment: {
            select: {
              encryptedReceiverId: true,
            },
          },
        },
      },
    },
  });

  const groupMembers = await prisma.member.findMany({
    where: { groupId },
    select: {
      id: true,
      displayName: true,
      interests: true,
      interestOther: true,
      favoriteColor: true,
      favoriteFoodDrink: true,
      hobbies: true,
      giftStyle: true,
      dislikes: true,
      allergies: true,
      wishList: true,
      noteToBuddy: true,
    },
  });
  const memberProfileMap = new Map<string, BuddyEmailProfile>(
    groupMembers.map((m) => [m.id, m])
  );

  const baseUrl = (options?.baseUrl || getAppBaseUrl()).replace(/\/+$/, "");
  const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);

  let sent = 0;
  let failed = 0;

  for (const log of logs) {
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const resultUrl = `${baseUrl}/buddy?token=${encodeURIComponent(rawToken)}`;

    const rawManageToken = generateRawToken();
    const manageTokenHash = hashToken(rawManageToken);
    const manageUrl = `${baseUrl}/me/profile?token=${encodeURIComponent(rawManageToken)}`;

    let buddyProfile: BuddyEmailProfile | undefined;
    if (log.member.givenAssignment?.encryptedReceiverId) {
      try {
        const receiverId = decryptReceiverId(
          group.id,
          log.member.givenAssignment.encryptedReceiverId
        );
        buddyProfile = memberProfileMap.get(receiverId);
      } catch {
        buddyProfile = undefined;
      }
    }

    try {
      await prisma.member.update({
        where: { id: log.member.id },
        data: {
          resultTokenHash: tokenHash,
          manageTokenHash,
        },
      });

      const mail = buildResultNotificationEmail({
        memberName: log.member.displayName,
        groupTitle: group.title,
        budgetText,
        resultUrl,
        buddy: buddyProfile,
        manageUrl,
      });

      await sendMail({
        to: log.member.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });

      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          attempts: { increment: 1 },
          lastError: null,
          sentAt: new Date(),
        },
      });
      sent++;
    } catch (error) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
          lastError: sanitizeLogError(error),
        },
      });
      failed++;
    }
  }

  return { sent, failed };
}

export async function resendGroupResultEmails(
  groupId: string,
  options?: { baseUrl?: string; memberId?: string }
): Promise<{ sent: number; failed: number }> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { status: true },
  });

  if (!group || (group.status !== "ACTIVE" && group.status !== "COMPLETED")) {
    throw new Error("สามารถส่งอีเมลซ้ำได้เฉพาะกลุ่มที่สุ่มจับคู่แล้วเท่านั้น");
  }

  if (options?.memberId) {
    const existingLog = await prisma.emailLog.findFirst({
      where: {
        groupId,
        memberId: options.memberId,
        type: "RESULT_NOTIFICATION",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!existingLog) {
      await prisma.emailLog.create({
        data: {
          groupId,
          memberId: options.memberId,
          type: "RESULT_NOTIFICATION",
          status: "PENDING",
          attempts: 0,
        },
      });
    } else if (existingLog.status === "SENT") {
      // Allow explicit single-member resend by resetting log status to PENDING (rotates token, never re-draws)
      await prisma.emailLog.update({
        where: { id: existingLog.id },
        data: { status: "PENDING" },
      });
    }

    return dispatchResultEmailsForGroup(groupId, {
      baseUrl: options.baseUrl,
      statuses: ["PENDING", "FAILED"],
      memberIds: [options.memberId],
    });
  }

  return dispatchResultEmailsForGroup(groupId, {
    baseUrl: options?.baseUrl,
    statuses: ["PENDING", "FAILED"],
  });
}
