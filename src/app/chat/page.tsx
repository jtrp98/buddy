"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { SecretMemberChat } from "@/components/chat/SecretMemberChat";
import { SnowGlobeKey } from "@/components/scenery/Vignettes";
import {
  EmptyState,
  LoadingState,
  PageContainer,
  christmasButtonClass,
} from "@/components/ui/ChristmasUI";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <EmptyState
        icon={<SnowGlobeKey className="h-32 w-auto" />}
        title="ไม่พบลิงก์เข้าห้องแชตลับ"
        description="กรุณาเข้าห้องแชตผ่านลิงก์ส่วนตัวของคุณในอีเมล หรือขอลิงก์ใหม่ทางอีเมล"
        action={
          <Link href="/recover" className={christmasButtonClass("primary", "md")}>
            <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>ขอลิงก์ส่วนตัวใหม่ทางอีเมล</span>
          </Link>
        }
      />
    );
  }

  return <SecretMemberChat token={token} />;
}

export default function ChatPage() {
  return (
    <PageContainer size="lg">
      <Suspense fallback={<LoadingState label="กำลังโหลดห้องแชต..." rows={4} />}>
        <ChatPageContent />
      </Suspense>
    </PageContainer>
  );
}
