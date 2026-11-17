import { Suspense } from "react";
import { connection } from "next/server";
import { getDefaultCloseInput } from "@/lib/timezone";
import { NewGroupForm } from "./NewGroupForm";

async function NewGroupFormWithDefaultTime() {
  await connection();
  const defaultCloseAt = getDefaultCloseInput(3);
  return <NewGroupForm defaultCloseAt={defaultCloseAt} />;
}

export default function NewGroupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="analog-card h-64 animate-pulse rounded-3xl" />
        </div>
      }
    >
      <NewGroupFormWithDefaultTime />
    </Suspense>
  );
}
