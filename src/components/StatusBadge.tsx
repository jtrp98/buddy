import { GROUP_STATUS_META } from "@/lib/constants";

export function StatusBadge({ status }: { status: keyof typeof GROUP_STATUS_META | string }) {
  const meta =
    GROUP_STATUS_META[status as keyof typeof GROUP_STATUS_META] ?? GROUP_STATUS_META.DRAFT;

  return (
    <span
      className={`inline-flex -rotate-1 items-center gap-1.5 rounded-md border-2 border-dashed px-2.5 py-1 text-xs font-bold tracking-wide shadow-[1px_1px_0_rgba(42,31,27,0.2)] ${meta.badgeClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-85" />
      <span>{meta.label}</span>
    </span>
  );
}
