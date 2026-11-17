import { Check, Gift, MailCheck, Sparkles, Ticket } from "lucide-react";

type JourneyMode = "participant" | "admin";

interface ChristmasJourneyProps {
  mode: JourneyMode;
  currentStep: 1 | 2 | 3 | 4;
  className?: string;
}

const PARTICIPANT_STEPS = [
  { step: 1, label: "รับการ์ดเชิญ", icon: Ticket },
  { step: 2, label: "กรอก Wish List", icon: Gift },
  { step: 3, label: "ยืนยันอีเมล", icon: MailCheck },
  { step: 4, label: "เปิดกล่อง Secret Buddy", icon: Sparkles },
] as const;

const ADMIN_STEPS = [
  { step: 1, label: "สร้างปาร์ตี้", icon: Ticket },
  { step: 2, label: "เปิดรับสมัคร", icon: MailCheck },
  { step: 3, label: "จับคู่ลับแล้ว", icon: Sparkles },
  { step: 4, label: "จบกิจกรรม", icon: Gift },
] as const;

/**
 * Light gamification Christmas Journey stepper showing current milestone progress.
 */
export function ChristmasJourney({
  mode,
  currentStep,
  className = "",
}: ChristmasJourneyProps) {
  const steps = mode === "participant" ? PARTICIPANT_STEPS : ADMIN_STEPS;

  return (
    <nav
      aria-label="ความคืบหน้ากิจกรรม Secret Buddy"
      className={`rounded-2xl border border-border bg-surface/70 p-3 sm:p-3.5 ${className}`}
    >
      <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {steps.map((item) => {
          const Icon = item.icon;
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <li
              key={item.step}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                isCurrent
                  ? "border-primary bg-primary/12 text-text-primary"
                  : isCompleted
                    ? "border-success/35 bg-success-bg text-text-primary"
                    : "border-transparent bg-transparent text-text-muted"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-success/60 bg-success/20 text-success"
                      : "border-border bg-surface-elevated text-text-muted"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                ) : (
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold tracking-wider uppercase opacity-75">
                  STEP {item.step}
                </span>
                <span className="thai-keep block truncate text-xs font-bold">
                  {item.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
