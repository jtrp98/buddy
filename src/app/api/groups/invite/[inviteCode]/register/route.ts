import { prisma } from "@/lib/db";
import { jsonNoStore } from "@/lib/api-response";
import { ensureGroupUpToDate } from "@/lib/cron";
import { generateRawToken, hashToken, sanitizeLogError } from "@/lib/crypto";
import { formatBudget } from "@/lib/budget";
import { sendMail } from "@/lib/email/mailer";
import { buildVerifyEmail } from "@/lib/email/templates";
import { getAppBaseUrl } from "@/lib/url";
import { memberRegisterSchema, normalizeNullableText } from "@/lib/validation";
import { participantSeed } from "@/lib/participant-seed";

type RouteContext = { params: Promise<{ inviteCode: string }> };

export async function POST(req: Request, context: RouteContext) {
  const { inviteCode } = await context.params;
  const baseUrl = getAppBaseUrl(req);

  const found = await prisma.group.findUnique({
    where: { inviteCode },
    select: { id: true },
  });

  if (!found) {
    return jsonNoStore({ error: "ไม่พบกิจกรรมจากลิงก์เชิญนี้" }, 404);
  }

  await ensureGroupUpToDate(found.id, baseUrl);

  const group = await prisma.group.findUnique({
    where: { id: found.id },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกิจกรรมนี้" }, 404);
  }

  if (group.status !== "OPEN" || Date.now() >= group.registrationClosesAt.getTime()) {
    return jsonNoStore(
      { error: "กิจกรรมนี้ปิดรับสมัครแล้ว ไม่สามารถลงทะเบียนใหม่ได้" },
      409
    );
  }

  try {
    const body = await req.json();
    const parsed = memberRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const data = parsed.data;
    const existingMember = await prisma.member.findUnique({
      where: {
        groupId_email: {
          groupId: group.id,
          email: data.email,
        },
      },
    });

    if (existingMember?.emailVerifiedAt) {
      return jsonNoStore(
        {
          error:
            "อีเมลนี้ลงทะเบียนและยืนยันตัวตนในกลุ่มนี้แล้ว หากต้องการแก้ไขข้อมูลความชอบ กรุณาใช้เมนู 'ขอลิงก์ส่วนตัวใหม่'",
        },
        409
      );
    }

    const duplicateNameMember = await prisma.member.findFirst({
      where: {
        groupId: group.id,
        displayName: { equals: data.displayName, mode: "insensitive" },
        ...(existingMember ? { id: { not: existingMember.id } } : {}),
      },
      select: { id: true, emailVerifiedAt: true },
    });

    if (duplicateNameMember) {
      return jsonNoStore(
        {
          error: duplicateNameMember.emailVerifiedAt
            ? "ชื่อเล่นนี้มีผู้ลงทะเบียนในกลุ่มนี้แล้ว กรุณาใช้ชื่ออื่น (เช่น เติมชื่อจริงหรือนามสกุลย่อ)"
            : "ชื่อเล่นนี้ถูกใช้ลงทะเบียนไว้แล้ว (รอยืนยันอีเมล) หากคุณพิมพ์อีเมลผิด กรุณาติดต่อผู้ดูแลกลุ่มเพื่อลบรายการเดิมออก หรือใช้ชื่ออื่น",
        },
        409
      );
    }

    const rawVerifyToken = generateRawToken();
    const verifyTokenHash = hashToken(rawVerifyToken);
    const verifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const profileFields = {
      displayName: data.displayName,
      interests: data.interests,
      interestOther: data.interests.includes("other")
        ? normalizeNullableText(data.interestOther)
        : null,
      favoriteColor: normalizeNullableText(data.favoriteColor),
      favoriteFoodDrink: normalizeNullableText(data.favoriteFoodDrink),
      hobbies: normalizeNullableText(data.hobbies),
      giftStyle: normalizeNullableText(data.giftStyle),
      dislikes: normalizeNullableText(data.dislikes),
      allergies: normalizeNullableText(data.allergies),
      wishList: normalizeNullableText(data.wishList),
      noteToBuddy: normalizeNullableText(data.noteToBuddy),
      verifyTokenHash,
      verifyTokenExpiresAt,
    };

    const member = existingMember
      ? await prisma.member.update({
          where: { id: existingMember.id },
          data: profileFields,
        })
      : await prisma.member.create({
          data: {
            groupId: group.id,
            email: data.email,
            ...profileFields,
          },
        });

    const verifyUrl = `${baseUrl}/verify?token=${encodeURIComponent(rawVerifyToken)}`;
    const budgetText = formatBudget(group.budgetType, group.budgetMin, group.budgetMax);
    const mail = buildVerifyEmail({
      memberName: member.displayName,
      groupTitle: group.title,
      budgetText,
      verifyUrl,
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
          groupId: group.id,
          memberId: member.id,
          type: "VERIFY_EMAIL",
          status: "SENT",
          attempts: 1,
          sentAt: new Date(),
        },
      });
    } catch (mailError) {
      await prisma.emailLog.create({
        data: {
          groupId: group.id,
          memberId: member.id,
          type: "VERIFY_EMAIL",
          status: "FAILED",
          attempts: 1,
          lastError: sanitizeLogError(mailError),
        },
      });
      return jsonNoStore(
        {
          error:
            "บันทึกข้อมูลแล้ว แต่ไม่สามารถส่งอีเมลยืนยันได้ในขณะนี้ กรุณาลองกดส่งอีกครั้งหรือติดต่อ Admin",
        },
        502
      );
    }

    return jsonNoStore(
      {
        ok: true,
        participantSeed: participantSeed(member.id),
        message:
          "ลงทะเบียนเบื้องต้นเรียบร้อยแล้ว! กรุณาเปิดอีเมลของคุณเพื่อกดยืนยันตัวตนก่อนเวลาปิดรับสมัคร",
      },
      201
    );
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: unknown }).code === "P2002"
    ) {
      return jsonNoStore(
        { error: "อีเมลนี้มีการลงทะเบียนในกลุ่มนี้อยู่แล้ว กรุณาลองใหม่อีกครั้ง" },
        409
      );
    }
    return jsonNoStore({ error: "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่" }, 500);
  }
}
