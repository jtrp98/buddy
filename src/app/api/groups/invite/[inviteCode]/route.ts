import { prisma } from "@/lib/db";
import { jsonNoStore } from "@/lib/api-response";
import { ensureGroupUpToDate } from "@/lib/cron";
import { getAppBaseUrl } from "@/lib/url";
import { participantSeed } from "@/lib/participant-seed";

type RouteContext = { params: Promise<{ inviteCode: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { inviteCode } = await context.params;
  const existing = await prisma.group.findUnique({
    where: { inviteCode },
    select: { id: true },
  });

  if (!existing) {
    return jsonNoStore({ error: "ไม่พบกิจกรรมจากลิงก์เชิญนี้" }, 404);
  }

  await ensureGroupUpToDate(existing.id, getAppBaseUrl(req));

  const group = await prisma.group.findUnique({
    where: { id: existing.id },
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
      members: {
        select: { id: true, displayName: true, emailVerifiedAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!group) {
    return jsonNoStore({ error: "ไม่พบกิจกรรมนี้" }, 404);
  }

  const now = Date.now();
  const isAcceptingRegistrations =
    group.status === "OPEN" && now < group.registrationClosesAt.getTime();

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
      totalMembers: group.members.length,
      verifiedMembers: group.members.filter((m) => m.emailVerifiedAt !== null).length,
      isAcceptingRegistrations,
      // Anonymous, one per registered member, oldest first — powers the Join page
      // characters. A one-way hash: no ids, names or emails leave the server.
      participants: group.members.map((m) => ({
        seed: participantSeed(m.id),
        verified: m.emailVerifiedAt !== null,
      })),
      // Sorted alphabetically by displayName with no seed/id so names cannot be
      // correlated with the anonymous village characters.
      registeredMembers: [...group.members]
        .sort((a, b) => a.displayName.localeCompare(b.displayName, "th"))
        .map((m) => ({
          displayName: m.displayName,
          verified: m.emailVerifiedAt !== null,
        })),
    },
  });
}
