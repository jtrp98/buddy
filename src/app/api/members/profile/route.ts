import { prisma } from "@/lib/db";
import { extractBearerToken, jsonNoStore } from "@/lib/api-response";
import { hashToken } from "@/lib/crypto";
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

    const updated = await prisma.member.update({
      where: { id: member.id },
      data: {
        ...(isPreDraw && data.displayName ? { displayName: data.displayName } : {}),
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

    return jsonNoStore({ ok: true, profile: updated });
  } catch {
    return jsonNoStore({ error: "ไม่สามารถบันทึกข้อมูลได้" }, 500);
  }
}
