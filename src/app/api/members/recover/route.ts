import { prisma } from "@/lib/db";
import { jsonNoStore } from "@/lib/api-response";
import { generateRawToken, hashToken, sanitizeLogError } from "@/lib/crypto";
import { formatBudget } from "@/lib/budget";
import { sendMail } from "@/lib/email/mailer";
import { buildRecoveryLinkEmail, buildVerifyEmail } from "@/lib/email/templates";
import { ensureGroupUpToDate } from "@/lib/cron";
import { getAppBaseUrl } from "@/lib/url";
import { recoverLinkSchema } from "@/lib/validation";

const GENERIC_RESPONSE = {
  ok: true,
  message:
    "หากอีเมลนี้ลงทะเบียนอยู่ในกิจกรรมดังกล่าว ระบบได้ส่งลิงก์ส่วนตัวใหม่ไปให้ทางอีเมลเรียบร้อยแล้ว (ลิงก์เดิมจะถูกยกเลิกโดยอัตโนมัติ)",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = recoverLinkSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const { inviteCode, email } = parsed.data;
    const baseUrl = getAppBaseUrl(req);

    const groupInitial = await prisma.group.findUnique({
      where: { inviteCode },
      select: { id: true },
    });

    if (!groupInitial) {
      return jsonNoStore(GENERIC_RESPONSE);
    }

    await ensureGroupUpToDate(groupInitial.id, baseUrl);

    const group = await prisma.group.findUnique({
      where: { id: groupInitial.id },
    });
    if (!group) {
      return jsonNoStore(GENERIC_RESPONSE);
    }

    const member = await prisma.member.findUnique({
      where: {
        groupId_email: {
          groupId: group.id,
          email,
        },
      },
    });

    if (!member) {
      return jsonNoStore(GENERIC_RESPONSE);
    }

    const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);

    // Case 1: Unverified member while group is still open -> resend verification link
    if (!member.emailVerifiedAt) {
      if (group.status === "OPEN" && Date.now() < group.registrationClosesAt.getTime()) {
        const rawVerify = generateRawToken();
        await prisma.member.update({
          where: { id: member.id },
          data: {
            verifyTokenHash: hashToken(rawVerify),
            verifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
        const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(rawVerify)}`;
        const mail = buildVerifyEmail({
          memberName: member.displayName,
          groupTitle: group.title,
          budgetText,
          verifyUrl,
        });
        try {
          await sendMail({ to: member.email, ...mail });
          await prisma.emailLog.create({
            data: {
              groupId: group.id,
              memberId: member.id,
              type: "VERIFY_EMAIL",
              status: "SENT",
              attempts: 1,
              sentAt: new Date(),
            },
          });
        } catch (err) {
          await prisma.emailLog.create({
            data: {
              groupId: group.id,
              memberId: member.id,
              type: "VERIFY_EMAIL",
              status: "FAILED",
              attempts: 1,
              lastError: sanitizeLogError(err),
            },
          });
        }
      }
      return jsonNoStore(GENERIC_RESPONSE);
    }

    // Case 2: Verified member & already drawn -> rotate resultTokenHash (and manageTokenHash if still ACTIVE)
    if (group.status === "ACTIVE" || group.status === "COMPLETED") {
      const rawResultToken = generateRawToken();
      const rawManageToken = group.status === "ACTIVE" ? generateRawToken() : null;
      await prisma.member.update({
        where: { id: member.id },
        data: {
          resultTokenHash: hashToken(rawResultToken),
          ...(rawManageToken ? { manageTokenHash: hashToken(rawManageToken) } : {}),
        },
      });

      const targetUrl = `${baseUrl}/buddy?token=${encodeURIComponent(rawResultToken)}`;
      const secondaryManageUrl = rawManageToken
        ? `${baseUrl}/me/profile?token=${encodeURIComponent(rawManageToken)}`
        : undefined;
      const mail = buildRecoveryLinkEmail({
        memberName: member.displayName,
        groupTitle: group.title,
        budgetText,
        targetUrl,
        isResultLink: true,
        secondaryManageUrl,
      });

      try {
        await sendMail({ to: member.email, ...mail });
        await prisma.emailLog.create({
          data: {
            groupId: group.id,
            memberId: member.id,
            type: "LINK_RECOVERY",
            status: "SENT",
            attempts: 1,
            sentAt: new Date(),
          },
        });
      } catch (err) {
        await prisma.emailLog.create({
          data: {
            groupId: group.id,
            memberId: member.id,
            type: "LINK_RECOVERY",
            status: "FAILED",
            attempts: 1,
            lastError: sanitizeLogError(err),
          },
        });
      }

      return jsonNoStore(GENERIC_RESPONSE);
    }

    // Case 3: Verified member & still OPEN/DRAFT -> rotate manageTokenHash
    if (group.status === "OPEN" || group.status === "DRAFT") {
      const rawManageToken = generateRawToken();
      await prisma.member.update({
        where: { id: member.id },
        data: { manageTokenHash: hashToken(rawManageToken) },
      });

      const targetUrl = `${baseUrl}/me/profile?token=${encodeURIComponent(rawManageToken)}`;
      const mail = buildRecoveryLinkEmail({
        memberName: member.displayName,
        groupTitle: group.title,
        budgetText,
        targetUrl,
        isResultLink: false,
      });

      try {
        await sendMail({ to: member.email, ...mail });
        await prisma.emailLog.create({
          data: {
            groupId: group.id,
            memberId: member.id,
            type: "LINK_RECOVERY",
            status: "SENT",
            attempts: 1,
            sentAt: new Date(),
          },
        });
      } catch (err) {
        await prisma.emailLog.create({
          data: {
            groupId: group.id,
            memberId: member.id,
            type: "LINK_RECOVERY",
            status: "FAILED",
            attempts: 1,
            lastError: sanitizeLogError(err),
          },
        });
      }
    }

    return jsonNoStore(GENERIC_RESPONSE);
  } catch {
    return jsonNoStore({ error: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่" }, 500);
  }
}
