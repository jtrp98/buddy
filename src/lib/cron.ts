import { prisma } from "./db";
import { executeGroupDraw } from "./draw";

export async function ensureGroupUpToDate(groupId: string, baseUrl?: string): Promise<void> {
  const now = new Date();
  const dueGroup = await prisma.group.findFirst({
    where: {
      id: groupId,
      status: "OPEN",
      registrationClosesAt: { lte: now },
      drawError: null,
    },
    select: { id: true },
  });

  if (dueGroup) {
    await executeGroupDraw(dueGroup.id, { forceClose: false, baseUrl });
  }
}

export async function processDueGroupDraws(baseUrl?: string): Promise<{
  processed: number;
  drawn: number;
  insufficient: number;
  errors: number;
}> {
  const now = new Date();
  const dueGroups = await prisma.group.findMany({
    where: {
      status: "OPEN",
      registrationClosesAt: { lte: now },
      drawError: null,
    },
    select: { id: true },
    take: 50,
  });

  let drawn = 0;
  let insufficient = 0;
  let errors = 0;

  for (const group of dueGroups) {
    const result = await executeGroupDraw(group.id, { forceClose: false, baseUrl });
    if (result.outcome === "DRAWN") drawn++;
    else if (result.outcome === "INSUFFICIENT_MEMBERS") insufficient++;
    else if (result.outcome === "ERROR") errors++;
  }

  return {
    processed: dueGroups.length,
    drawn,
    insufficient,
    errors,
  };
}
