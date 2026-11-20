import { prisma } from "@/lib/db";
import { extractBearerToken, jsonNoStore } from "@/lib/api-response";
import { decryptReceiverId, decryptText, encryptText, hashToken } from "@/lib/crypto";
import { parseWishListLinks, secretNoteSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token สำหรับดูผล Buddy" }, 401);
  }

  const giver = await prisma.member.findUnique({
    where: { resultTokenHash: hashToken(token) },
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
          revealAt: true,
          status: true,
        },
      },
      givenAssignment: true,
    },
  });

  if (!giver) {
    return jsonNoStore(
      { error: "ลิงก์ดูผลไม่ถูกต้อง หรือถูกยกเลิกเพราะมีการออกลิงก์ใหม่แล้ว" },
      404
    );
  }

  if (giver.group.status !== "ACTIVE" && giver.group.status !== "COMPLETED") {
    return jsonNoStore(
      { error: "กิจกรรมนี้ยังไม่พร้อมแสดงผลการจับคู่" },
      409
    );
  }

  if (!giver.givenAssignment) {
    return jsonNoStore({ error: "ไม่พบข้อมูลการจับคู่ของคุณ" }, 404);
  }

  let receiverId: string;
  try {
    receiverId = decryptReceiverId(
      giver.group.id,
      giver.givenAssignment.encryptedReceiverId
    );
  } catch {
    return jsonNoStore({ error: "ไม่สามารถถอดรหัสข้อมูล Buddy ได้" }, 500);
  }

  // Only select receiver's displayName and Buddy Profile — never email, never incoming giver
  const buddy = await prisma.member.findUnique({
    where: { id: receiverId },
    select: {
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
      wishListLinks: true,
      noteToBuddy: true,
    },
  });

  if (!buddy) {
    return jsonNoStore({ error: "ไม่พบข้อมูล Buddy ของคุณ" }, 404);
  }

  let secretNote = "";
  if (giver.givenAssignment.encryptedSecretNote) {
    try {
      secretNote = decryptText(
        giver.group.id,
        giver.givenAssignment.encryptedSecretNote
      );
    } catch {
      secretNote = "";
    }
  }

  return jsonNoStore({
    viewerName: giver.displayName,
    group: giver.group,
    buddy: {
      ...buddy,
      wishListLinks: parseWishListLinks(buddy.wishListLinks),
    },
    secretNote,
  });
}

export async function PATCH(req: Request) {
  const token = extractBearerToken(req);
  if (!token) {
    return jsonNoStore({ error: "ไม่พบ Token สำหรับดูผล Buddy" }, 401);
  }

  const giver = await prisma.member.findUnique({
    where: { resultTokenHash: hashToken(token) },
    include: {
      group: { select: { id: true, status: true } },
      givenAssignment: { select: { id: true } },
    },
  });

  if (!giver || !giver.givenAssignment) {
    return jsonNoStore({ error: "ไม่พบข้อมูลการจับคู่ของคุณ" }, 404);
  }

  if (giver.group.status !== "ACTIVE" && giver.group.status !== "COMPLETED") {
    return jsonNoStore({ error: "กิจกรรมนี้ยังไม่เปิดให้บันทึกโน้ต" }, 409);
  }

  const body = await req.json().catch(() => null);
  const parsed = secretNoteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonNoStore(
      { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
      400
    );
  }

  const rawNote = parsed.data.note?.trim() ?? "";
  const encryptedSecretNote = rawNote ? encryptText(giver.group.id, rawNote) : null;

  await prisma.assignment.update({
    where: { id: giver.givenAssignment.id },
    data: { encryptedSecretNote },
  });

  return jsonNoStore({ ok: true, secretNote: rawNote });
}
