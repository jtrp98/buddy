import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatBudget } from "@/lib/budget";
import { formatThaiDateTime } from "@/lib/timezone";
import { previewCard } from "@/lib/site";

/**
 * Link preview for an invite link: "คุณได้รับเชิญ: {group}", with the budget,
 * closing date and how many people have joined. Only information anyone with
 * the link already sees on the page — never member names or emails.
 * Read-only: it does not trigger draws or emails.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}): Promise<Metadata> {
  const { inviteCode } = await params;
  const generic: Metadata = {
    title: { absolute: "ลิงก์เชิญ Secret Buddy" },
    description: "กดลิงก์เพื่อเขียน Wish List และร่วมแลกของขวัญแบบลับ ๆ ไม่ต้องสมัครบัญชี",
    robots: { index: false, follow: false },
    ...previewCard("ลิงก์เชิญ Secret Buddy", "กดลิงก์เพื่อเขียน Wish List และร่วมแลกของขวัญแบบลับ ๆ ไม่ต้องสมัครบัญชี"),
  };

  try {
    const group = await prisma.group.findUnique({
      where: { inviteCode },
      select: {
        title: true,
        budgetType: true,
        budgetMin: true,
        budgetMax: true,
        registrationClosesAt: true,
        status: true,
        _count: { select: { members: true } },
      },
    });
    if (!group) return generic;

    const accepting = group.status === "OPEN" && group.registrationClosesAt.getTime() > Date.now();
    const joined = group._count.members;
    const title = `คุณได้รับเชิญ: ${group.title}`;
    const facts = [
      `งบของขวัญ ${formatBudget(group.budgetType, group.budgetMin, group.budgetMax)}`,
      accepting ? `ปิดรับสมัคร ${formatThaiDateTime(group.registrationClosesAt)}` : "ปิดรับสมัครแล้ว",
      joined > 0 ? `ตอบรับแล้ว ${joined} คน` : null,
    ].filter(Boolean);
    const description = `${facts.join(" · ")} — กดลิงก์เพื่อเขียน Wish List และร่วมแลกของขวัญแบบลับ ๆ ไม่ต้องสมัครบัญชี`;

    return {
      title: { absolute: title },
      description,
      robots: { index: false, follow: false },
      ...previewCard(title, description),
    };
  } catch {
    return generic;
  }
}

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
