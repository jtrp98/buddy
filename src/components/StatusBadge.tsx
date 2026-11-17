import { CheckCircle2, Clock, FileEdit, Loader2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const STATUS_UI: Record<
  string,
  { label: string; className: string; icon: ReactNode }
> = {
  DRAFT: {
    label: "ฉบับร่าง (ยังไม่เปิดรับสมัคร)",
    className: "border-border bg-surface-elevated text-text-secondary",
    icon: <FileEdit className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  OPEN: {
    label: "เปิดรับสมัคร",
    className: "border-success/50 bg-success-bg text-success",
    icon: <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  DRAWING: {
    label: "กำลังดำเนินการสุ่ม",
    className: "border-primary/60 bg-warning-bg text-primary",
    icon: <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />,
  },
  ACTIVE: {
    label: "จับคู่สำเร็จแล้ว",
    className: "border-primary/60 bg-primary/12 text-primary",
    icon: <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  COMPLETED: {
    label: "ปิดกิจกรรมแล้ว",
    className: "border-border bg-surface-elevated text-text-primary",
    icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />,
  },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_UI[status] ?? STATUS_UI.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide motion-reduce:[&_svg]:animate-none ${meta.className}`}
    >
      {meta.icon}
      <span>{meta.label}</span>
    </span>
  );
}
