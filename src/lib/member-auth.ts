import { prisma } from "./db";
import { hashToken } from "./crypto";

/**
 * Resolves a verified member from either a manageToken or a resultToken.
 */
export async function findMemberByToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  return prisma.member.findFirst({
    where: {
      OR: [{ manageTokenHash: tokenHash }, { resultTokenHash: tokenHash }],
      emailVerifiedAt: { not: null },
    },
    include: {
      group: {
        select: {
          id: true,
          title: true,
          inviteCode: true,
          status: true,
          revealAt: true,
          guessOpen: true,
        },
      },
    },
  });
}

export function isGuessWindowOpen(group: {
  status: string;
  revealAt: Date | null;
  guessOpen: boolean;
}): boolean {
  if (group.status !== "ACTIVE") return false;
  if (group.guessOpen) return true;
  if (!group.revealAt) return false;
  const openAt = group.revealAt.getTime() - 24 * 60 * 60 * 1000;
  return Date.now() >= openAt;
}
