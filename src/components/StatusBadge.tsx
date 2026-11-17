import { CheckCircle2, Clock, FileEdit, Loader2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const STATUS_UI: Record<
  string,
  { label: string; className: string; icon: ReactNode }
> = {
  DRAFT: {
    label: "ฉบับร่าง (ยังไม่เปิดรับสมัคร)",
    className: "border-white/25 bg-[#162C42] text-text-secondary",
    icon: <FileEdit className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  OPEN: {
    label: "เปิดรับสมัคร",
    className: "border-emerald-400/50 bg-evergreen/90 text-emerald-100",
    icon: <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  DRAWING: {
    label: "กำลังดำเนินการสุ่ม",
    className: "border-primary/60 bg-amber-950/75 text-primary",
    icon: <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />,
  },
  ACTIVE: {
    label: "จับคู่สำเร็จแล้ว",
    className: "border-primary/60 bg-[#2E1E0B]/85 text-primary",
    icon: <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  COMPLETED: {
    label: "ปิดกิจกรรมแล้ว",
    className: "border-ice-blue/35 bg-[#173049] text-snow-white",
    icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />,
  },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_UI[status] ?? STATUS_UI.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-xs ${meta.className}`}
    >
      {meta.icon}
      <span>{meta.label}</span>
    </span>
  );
}
