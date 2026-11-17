import { Suspense } from "react";
import type { Metadata } from "next";
import { RecoverForm } from "@/components/RecoverForm";
import { LoadingState, PageContainer } from "@/components/ui/ChristmasUI";

export const metadata: Metadata = {
  title: { absolute: "ขอลิงก์ส่วนตัวใหม่ · Secret Buddy" },
  robots: { index: false, follow: false },
};

async function RecoverWithParams({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;
  return <RecoverForm initialInviteCode={inviteCode} />;
}

export default function GroupRecoverPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PageContainer size="sm">
          <LoadingState label="กำลังโหลดแบบฟอร์มขอลิงก์..." rows={3} />
        </PageContainer>
      }
    >
      <RecoverWithParams params={params} />
    </Suspense>
  );
}
