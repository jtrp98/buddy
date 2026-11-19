import { prisma } from "@/lib/db";
import { extractBearerToken, jsonNoStore } from "@/lib/api-response";
import {
  computeReceiverHmac,
  generateRawToken,
  hashToken,
  sanitizeLogError,
} from "@/lib/crypto";
import { formatBudget } from "@/lib/budget";
import { sendMail } from "@/lib/email/mailer";
import { buildBuddyProfileUpdatedEmail } from "@/lib/email/templates";
import { memberProfileUpdateSchema, normalizeNullableText } from "@/lib/validation";
import { ensureGroupUpToDate } from "@/lib/cron";
import { getAppBaseUrl } from "@/lib/url";

export async function GET(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token สำหรับเข้าถึงข้อมูลส่วนตัว" }, 401);
  }

  const member = await prisma.member.findUnique({
    where: { manageTokenHash: hashToken(token) },
    include: {
      group: {
        select: {
          id: true,
          title: true,
          description: true,
          inviteCode: true,
          budgetType: true,
          budgetMin: true,
          budgetMax: true,
          registrationClosesAt: true,
          revealAt: true,
          status: true,
        },
      },
    },
  });

  if (!member) {
    return jsonNoStore({ error: "ลิงก์ไม่ถูกต้องหรือถูกยกเลิกแล้ว" }, 404);
  }

  await ensureGroupUpToDate(member.group.id, getAppBaseUrl(req));

  const latestGroup = await prisma.group.findUnique({
    where: { id: member.group.id },
    select: {
      id: true,
      title: true,
      description: true,
      inviteCode: true,
      budgetType: true,
      budgetMin: true,
      budgetMax: true,
      registrationClosesAt: true,
      revealAt: true,
      status: true,
    },
  });

  const groupInfo = latestGroup ?? member.group;
  const canEdit = groupInfo.status !== "COMPLETED";

  return jsonNoStore({
    profile: {
      displayName: member.displayName,
      email: member.email,
      interests: member.interests,
      interestOther: member.interestOther,
      favoriteColor: member.favoriteColor,
      favoriteFoodDrink: member.favoriteFoodDrink,
      hobbies: member.hobbies,
      giftStyle: member.giftStyle,
      dislikes: member.dislikes,
      allergies: member.allergies,
      wishList: member.wishList,
      noteToBuddy: member.noteToBuddy,
    },
    group: groupInfo,
    canEdit,
  });
}

export async function PATCH(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token สำหรับเข้าถึงข้อมูลส่วนตัว" }, 401);
  }

  const member = await prisma.member.findUnique({
    where: { manageTokenHash: hashToken(token) },
    include: { group: true },
  });

  if (!member) {
    return jsonNoStore({ error: "ลิงก์ไม่ถูกต้องหรือถูกยกเลิกแล้ว" }, 404);
  }

  if (member.group.status === "COMPLETED") {
    return jsonNoStore(
      { error: "กิจกรรมนี้จบลงแล้ว ไม่สามารถแก้ไขข้อมูลได้" },
      409
    );
  }

  try {
    const body = await req.json();
    const parsed = memberProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const data = parsed.data;
    const isPreDraw = member.group.status === "OPEN" || member.group.status === "DRAFT";

    if (
      isPreDraw &&
      data.displayName &&
      data.displayName.toLowerCase() !== member.displayName.toLowerCase()
    ) {
      const duplicateNameMember = await prisma.member.findFirst({
        where: {
          groupId: member.groupId,
          id: { not: member.id },
          displayName: { equals: data.displayName, mode: "insensitive" },
        },
        select: { id: true },
      });

      if (duplicateNameMember) {
        return jsonNoStore(
          {
            error:
              "ชื่อเล่นนี้มีผู้ลงทะเบียนในกลุ่มนี้แล้ว กรุณาใช้ชื่ออื่น (เช่น เติมชื่อจริงหรือนามสกุลย่อ)",
          },
          409
        );
      }
    }

    const nextInterestOther = data.interests.includes("other")
      ? normalizeNullableText(data.interestOther)
      : null;
    const nextFavoriteColor = normalizeNullableText(data.favoriteColor);
    const nextFavoriteFoodDrink = normalizeNullableText(data.favoriteFoodDrink);
    const nextHobbies = normalizeNullableText(data.hobbies);
    const nextGiftStyle = normalizeNullableText(data.giftStyle);
    const nextDislikes = normalizeNullableText(data.dislikes);
    const nextAllergies = normalizeNullableText(data.allergies);
    const nextWishList = normalizeNullableText(data.wishList);
    const nextNoteToBuddy = normalizeNullableText(data.noteToBuddy);

    const sameInterests =
      member.interests.length === data.interests.length &&
      member.interests.every((val, idx) => val === data.interests[idx]);

    const hasProfileChanged =
      !sameInterests ||
      member.interestOther !== nextInterestOther ||
      member.favoriteColor !== nextFavoriteColor ||
      member.favoriteFoodDrink !== nextFavoriteFoodDrink ||
      member.hobbies !== nextHobbies ||
      member.giftStyle !== nextGiftStyle ||
      member.dislikes !== nextDislikes ||
      member.allergies !== nextAllergies ||
      member.wishList !== nextWishList ||
      member.noteToBuddy !== nextNoteToBuddy;

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        ...(isPreDraw && data.displayName ? { displayName: data.displayName } : {}),
        interests: data.interests,
        interestOther: nextInterestOther,
        favoriteColor: nextFavoriteColor,
        favoriteFoodDrink: nextFavoriteFoodDrink,
        hobbies: nextHobbies,
        giftStyle: nextGiftStyle,
        dislikes: nextDislikes,
        allergies: nextAllergies,
        wishList: nextWishList,
        noteToBuddy: nextNoteToBuddy,
      },
      select: {
        displayName: true,
        email: true,
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

    let notifiedSanta = false;
    if (member.group.status === "ACTIVE" && hasProfileChanged) {
      try {
        const receiverHmac = computeReceiverHmac(member.group.id, member.id);
        const assignment = await prisma.assignment.findUnique({
          where: {
            groupId_receiverHmac: {
              groupId: member.group.id,
              receiverHmac,
            },
          },
          include: {
            giver: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        });

        if (assignment?.giver) {
          const baseUrl = getAppBaseUrl(req).replace(/\/+$/, "");
          const rawResultToken = generateRawToken();
          await prisma.member.update({
            where: { id: assignment.giver.id },
            data: { resultTokenHash: hashToken(rawResultToken) },
          });

          const resultUrl = `${baseUrl}/buddy?token=${encodeURIComponent(rawResultToken)}`;
          const budgetText = formatBudget(
            member.group.budgetType,
            member.group.budgetMin,
            member.group.budgetMax
          );

          const mail = buildBuddyProfileUpdatedEmail({
            memberName: assignment.giver.displayName,
            groupTitle: member.group.title,
            budgetText,
            buddy: updated,
            resultUrl,
          });

          await sendMail({
            to: assignment.giver.email,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          });

          await prisma.emailLog.create({
            data: {
              groupId: member.group.id,
              memberId: assignment.giver.id,
              type: "RESULT_NOTIFICATION",
              status: "SENT",
              attempts: 1,
              sentAt: new Date(),
            },
          });
          notifiedSanta = true;
        }
      } catch (err) {
        // Non-fatal: profile is already saved even if notification email fails
        void sanitizeLogError(err);
      }
    }

    return jsonNoStore({ ok: true, profile: updated, notifiedSanta });
  } catch {
    return jsonNoStore({ error: "ไม่สามารถบันทึกข้อมูลได้" }, 500);
  }
}
