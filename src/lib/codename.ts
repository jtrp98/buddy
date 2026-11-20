import { buddyCodename } from "@/lib/join-scene";
import { participantSeed } from "@/lib/participant-seed";

/**
 * Generates a deterministic anonymous codename + avatar seed for a member
 * across both the Christmas village scene and the secret chat, without
 * exposing their real memberId or name.
 */
export function getAnonymousPersona(groupId: string, memberId: string): {
  codename: string;
  avatarSeed: string;
} {
  void groupId;
  const avatarSeed = participantSeed(memberId);
  return {
    codename: buddyCodename(avatarSeed),
    avatarSeed,
  };
}
