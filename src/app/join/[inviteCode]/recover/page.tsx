import { Suspense } from "react";
import { RecoverForm } from "@/components/RecoverForm";

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
        <div className="mx-auto max-w-md px-4 py-12">
          <div className="analog-card h-48 animate-pulse rounded-md" />
        </div>
      }
    >
      <RecoverWithParams params={params} />
    </Suspense>
  );
}
