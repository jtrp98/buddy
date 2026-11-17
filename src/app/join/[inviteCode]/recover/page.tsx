import { Suspense } from "react";
import { RecoverForm } from "@/components/RecoverForm";
import { LoadingState, PageContainer } from "@/components/ui/ChristmasUI";

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
