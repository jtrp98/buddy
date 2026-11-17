import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { jsonNoStore } from "@/lib/api-response";
import { bangkokLocalInputToUtc } from "@/lib/timezone";
import { budgetSchema, normalizeNullableText, updateGroupSchema } from "@/lib/validation";
import { ensureGroupUpToDate } from "@/lib/cron";
import { getAppBaseUrl } from "@/lib/url";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id } = await context.params;
  const owned = await prisma.group.findFirst({
    where: { id, adminId: session.adminId },
    select: { id: true },
  });
  if (!owned) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  await ensureGroupUpToDate(id, getAppBaseUrl(req));

  // Strictly omit Assignment relations and raw/hashed tokens from Admin response
  const group = await prisma.group.findFirst({
    where: { id, adminId: session.adminId },
    include: {
      members: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          displayName: true,
          email: true,
          emailVerifiedAt: true,
          createdAt: true,
          emailLogs: {
            where: { type: "RESULT_NOTIFICATION" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              status: true,
              attempts: true,
              lastError: true,
              sentAt: true,
            },
          },
        },
      },
    },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  const members = group.members.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    email: m.email,
    verified: m.emailVerifiedAt !== null,
    emailVerifiedAt: m.emailVerifiedAt,
    createdAt: m.createdAt,
    resultEmail: m.emailLogs[0] ?? null,
  }));

  return jsonNoStore({
    group: {
      id: group.id,
      title: group.title,
      description: group.description,
      inviteCode: group.inviteCode,
      budgetType: group.budgetType,
      budgetMin: group.budgetMin,
      budgetMax: group.budgetMax,
      registrationClosesAt: group.registrationClosesAt,
      revealAt: group.revealAt,
      status: group.status,
      drawError: group.drawError,
      drawnAt: group.drawnAt,
      createdAt: group.createdAt,
    },
    members,
  });
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id } = await context.params;
  const existing = await prisma.group.findFirst({
    where: { id, adminId: session.adminId },
  });
  if (!existing) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  try {
    const body = await req.json();
    const parsed = updateGroupSchema.safeParse(body);
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" },
        400
      );
    }

    const input = parsed.data;

    if (existing.status === "DRAWING") {
      return jsonNoStore({ error: "กำลังประมวลผลการสุ่ม กรุณารอสักครู่" }, 409);
    }

    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) {
      updateData.description = normalizeNullableText(input.description);
    }
    if (input.revealAt !== undefined) {
      updateData.revealAt = input.revealAt?.trim()
        ? bangkokLocalInputToUtc(input.revealAt)
        : null;
    }

    const isPreDraw = existing.status === "DRAFT" || existing.status === "OPEN";

    if (input.budgetType !== undefined || input.budgetMin !== undefined || input.budgetMax !== undefined) {
      if (!isPreDraw) {
        return jsonNoStore(
          { error: "ไม่สามารถแก้ไขงบประมาณหลังจากสุ่มจับคู่แล้ว" },
          409
        );
      }
      const nextBudgetType = input.budgetType ?? existing.budgetType;
      const nextMin =
        nextBudgetType === "UNLIMITED"
          ? null
          : input.budgetMin !== undefined
            ? input.budgetMin
            : existing.budgetMin;
      const nextMax =
        nextBudgetType === "RANGE"
          ? input.budgetMax !== undefined
            ? input.budgetMax
            : existing.budgetMax
          : null;

      const check = budgetSchema.safeParse({
        budgetType: nextBudgetType,
        budgetMin: nextMin,
        budgetMax: nextMax,
      });
      if (!check.success) {
        return jsonNoStore(
          { error: check.error.issues[0]?.message || "งบประมาณไม่ถูกต้อง" },
          400
        );
      }

      updateData.budgetType = nextBudgetType;
      updateData.budgetMin = nextMin;
      updateData.budgetMax = nextMax;
    }

    if (input.registrationClosesAt !== undefined) {
      if (!isPreDraw) {
        return jsonNoStore(
          { error: "ไม่สามารถแก้ไขเวลาปิดรับสมัครหลังจากสุ่มจับคู่แล้ว" },
          409
        );
      }
      const closesAt = bangkokLocalInputToUtc(input.registrationClosesAt);
      updateData.registrationClosesAt = closesAt;
      if (closesAt.getTime() > Date.now()) {
        updateData.drawError = null;
      }
    }

    if (input.status !== undefined && input.status !== existing.status) {
      if (existing.status === "DRAFT" && input.status === "OPEN") {
        const targetClose =
          (updateData.registrationClosesAt as Date | undefined) ?? existing.registrationClosesAt;
        if (targetClose.getTime() <= Date.now()) {
          return jsonNoStore(
            { error: "กรุณาตั้งเวลาปิดรับสมัครเป็นเวลาในอนาคตก่อนเปิดรับสมัคร" },
            400
          );
        }
        updateData.status = "OPEN";
        updateData.drawError = null;
      } else if (existing.status === "ACTIVE" && input.status === "COMPLETED") {
        updateData.status = "COMPLETED";
      } else if (existing.status === "COMPLETED" && input.status === "ACTIVE") {
        updateData.status = "ACTIVE";
      } else {
        return jsonNoStore(
          { error: "ไม่สามารถเปลี่ยนสถานะกิจกรรมในลักษณะนี้ได้" },
          409
        );
      }
    }

    const updated = await prisma.group.update({
      where: { id: existing.id },
      data: updateData,
    });

    return jsonNoStore({ group: updated });
  } catch (err) {
    return jsonNoStore(
      { error: err instanceof Error ? err.message : "ไม่สามารถอัปเดตข้อมูลกลุ่มได้" },
      400
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return jsonNoStore({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  }

  const { id } = await context.params;
  const deleted = await prisma.group.deleteMany({
    where: { id, adminId: session.adminId },
  });

  if (deleted.count === 0) {
    return jsonNoStore({ error: "ไม่พบกลุ่มนี้" }, 404);
  }

  return jsonNoStore({ ok: true });
}
