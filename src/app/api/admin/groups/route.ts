import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";
import { generateInviteCode } from "@/lib/crypto";
import { bangkokLocalInputToUtc } from "@/lib/timezone";
import { createGroupSchema, normalizeNullableText } from "@/lib/validation";
import { ensureGroupUpToDate } from "@/lib/cron";
import { getAppBaseUrl } from "@/lib/url";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const baseUrl = getAppBaseUrl(req);
  const dueGroups = await prisma.group.findMany({
    where: {
      adminId: session.adminId,
      status: "OPEN",
      registrationClosesAt: { lte: new Date() },
      drawError: null,
    },
    select: { id: true },
  });

  for (const g of dueGroups) {
    await ensureGroupUpToDate(g.id, baseUrl);
  }

  const groups = await prisma.group.findMany({
    where: { adminId: session.adminId },
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        select: {
          id: true,
          emailVerifiedAt: true,
        },
      },
      emailLogs: {
        where: { type: "RESULT_NOTIFICATION" },
        select: { status: true },
      },
    },
  });

  const payload = groups.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    inviteCode: g.inviteCode,
    budgetType: g.budgetType,
    budgetMin: g.budgetMin,
    budgetMax: g.budgetMax,
    registrationClosesAt: g.registrationClosesAt,
    revealAt: g.revealAt,
    status: g.status,
    drawError: g.drawError,
    drawnAt: g.drawnAt,
    createdAt: g.createdAt,
    totalMembers: g.members.length,
    verifiedMembers: g.members.filter((m) => m.emailVerifiedAt !== null).length,
    emailSummary: {
      sent: g.emailLogs.filter((l) => l.status === "SENT").length,
      failed: g.emailLogs.filter((l) => l.status === "FAILED").length,
      pending: g.emailLogs.filter((l) => l.status === "PENDING").length,
    },
  }));

  return jsonNoStore({ groups: payload });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  try {
    const body = await req.json();
    const parsed = createGroupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const data = parsed.data;
    const closesAt = bangkokLocalInputToUtc(data.registrationClosesAt);
    if (data.publishNow && closesAt.getTime() <= Date.now()) {
      return jsonNoStore(
        { error: "เวลาปิดรับสมัครต้องเป็นเวลาในอนาคต" },
        400
      );
    }

    const revealAt = data.revealAt?.trim()
      ? bangkokLocalInputToUtc(data.revealAt)
      : null;

    let inviteCode = generateInviteCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await prisma.group.findUnique({ where: { inviteCode }, select: { id: true } });
      if (!exists) break;
      inviteCode = generateInviteCode();
    }

    const group = await prisma.group.create({
      data: {
        adminId: session.adminId,
        title: data.title,
        description: normalizeNullableText(data.description),
        inviteCode,
        budgetType: data.budgetType,
        budgetMin: data.budgetType === "UNLIMITED" ? null : (data.budgetMin ?? null),
        budgetMax: data.budgetType === "RANGE" ? (data.budgetMax ?? null) : null,
        registrationClosesAt: closesAt,
        revealAt,
        status: data.publishNow ? "OPEN" : "DRAFT",
      },
    });

    return jsonNoStore({ group }, 201);
  } catch (err) {
    return jsonNoStore(
      { error: err instanceof Error ? err.message : "ไม่สามารถสร้างกลุ่มได้" },
      400
    );
  }
}
