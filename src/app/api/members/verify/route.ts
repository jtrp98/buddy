import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonNoStore } from "@/lib/api-response";
import { generateRawToken, hashToken, sanitizeLogError } from "@/lib/crypto";
import { sendMail } from "@/lib/email/mailer";
import { buildManageProfileEmail } from "@/lib/email/templates";
import { getAppBaseUrl } from "@/lib/url";

const verifySchema = z.object({
  token: z.string().min(10, "ลิงก์ยืนยันไม่ถูกต้อง"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore({ error: "ลิงก์ยืนยันไม่ถูกต้อง" }, 400);
    }

    const tokenHash = hashToken(parsed.data.token);
    const member = await prisma.member.findUnique({
      where: { verifyTokenHash: tokenHash },
      include: { group: true },
    });

    if (!member) {
      return jsonNoStore(
        { error: "ลิงก์ยืนยันไม่ถูกต้อง หรือถูกใช้งานไปแล้ว" },
        404
      );
    }

    if (
      !member.verifyTokenExpiresAt ||
      member.verifyTokenExpiresAt.getTime() < Date.now()
    ) {
      return jsonNoStore(
        { error: "ลิงก์ยืนยันหมดอายุแล้ว กรุณาลงทะเบียนใหม่หรือขอลิงก์ใหม่" },
        410
      );
    }

    if (
      member.group.status !== "OPEN" ||
      Date.now() >= member.group.registrationClosesAt.getTime()
    ) {
      return jsonNoStore(
        {
          error:
            "ขออภัย กิจกรรมนี้ปิดรับสมัครและสิ้นสุดช่วงลงทะเบียนแล้วก่อนที่คุณจะยืนยันอีเมล",
        },
        409
      );
    }

    const rawManageToken = generateRawToken();
    const manageTokenHash = hashToken(rawManageToken);

    await prisma.$transaction([
      prisma.member.update({
        where: { id: member.id },
        data: {
          emailVerifiedAt: new Date(),
          verifyTokenHash: null,
          verifyTokenExpiresAt: null,
          manageTokenHash,
        },
      }),
      prisma.group.update({
        where: { id: member.groupId },
        data: { drawError: null },
      }),
    ]);

    const baseUrl = getAppBaseUrl(req);
    const manageUrl = `${baseUrl}/me/profile?token=${encodeURIComponent(rawManageToken)}`;
    const mail = buildManageProfileEmail({
      memberName: member.displayName,
      groupTitle: member.group.title,
      manageUrl,
    });

    try {
      await sendMail({
        to: member.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      await prisma.emailLog.create({
        data: {
          groupId: member.groupId,
          memberId: member.id,
          type: "MANAGE_LINK",
          status: "SENT",
          attempts: 1,
          sentAt: new Date(),
        },
      });
    } catch (err) {
      await prisma.emailLog.create({
        data: {
          groupId: member.groupId,
          memberId: member.id,
          type: "MANAGE_LINK",
          status: "FAILED",
          attempts: 1,
          lastError: sanitizeLogError(err),
        },
      });
    }

    return jsonNoStore({
      ok: true,
      displayName: member.displayName,
      groupTitle: member.group.title,
      inviteCode: member.group.inviteCode,
      manageToken: rawManageToken,
    });
  } catch {
    return jsonNoStore({ error: "ไม่สามารถยืนยันอีเมลได้ กรุณาลองใหม่" }, 500);
  }
}
