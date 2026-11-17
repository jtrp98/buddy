import { Suspense } from "react";
import { connection } from "next/server";
import { getDefaultCloseInput } from "@/lib/timezone";
import { NewGroupForm } from "./NewGroupForm";
import { LoadingState, PageContainer } from "@/components/ui/ChristmasUI";

async function NewGroupFormWithDefaultTime() {
  await connection();
  const defaultCloseAt = getDefaultCloseInput(3);
  return <NewGroupForm defaultCloseAt={defaultCloseAt} />;
}

export default function NewGroupPage() {
  return (
    <Suspense
      fallback={
        <PageContainer size="md">
          <LoadingState label="กำลังเตรียมแบบฟอร์มสร้างกิจกรรม..." rows={4} />
        </PageContainer>
      }
    >
      <NewGroupFormWithDefaultTime />
    </Suspense>
  );
}
