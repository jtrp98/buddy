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
      className={`rounded-2xl border border-primary/25 bg-[#0D1E31]/85 p-3.5 sm:p-4 ${className}`}
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
                  ? "border-primary bg-primary/15 text-text-primary shadow-[0_0_16px_rgba(232,196,122,0.16)]"
                  : isCompleted
                    ? "border-emerald-400/40 bg-evergreen/65 text-emerald-100"
                    : "border-white/10 bg-background/45 text-text-muted"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                      ? "border-emerald-400/60 bg-emerald-500/25 text-emerald-200"
                      : "border-white/15 bg-surface text-text-muted"
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
