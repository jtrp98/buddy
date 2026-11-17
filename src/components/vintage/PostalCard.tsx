import type { ReactNode } from "react";
import { Postmark } from "@/components/vintage/Postmark";

interface PostalCardProps {
  cardNumber: string;
  kicker?: string;
  icon: ReactNode;
  title: ReactNode;
  description: string;
  tone?: "red" | "pine" | "gold";
  showPostmark?: boolean;
  className?: string;
}

/**
 * High-contrast Christmas feature card with refined 3D medallion depth and gold foil accents.
 */
export function PostalCard({
  cardNumber,
  kicker = "NORTH POLE",
  icon,
  title,
  description,
  tone = "gold",
  showPostmark = false,
  className = "",
}: PostalCardProps) {
  const medallionTone = {
    red: "border-christmas-red-light/45 bg-gradient-to-br from-christmas-red/35 to-christmas-red/15 text-christmas-red-light shadow-[0_6px_16px_rgba(198,40,56,0.25)]",
    pine: "border-emerald-400/40 bg-gradient-to-br from-evergreen-light/70 to-evergreen/90 text-emerald-200 shadow-[0_6px_16px_rgba(18,61,50,0.35)]",
    gold: "border-primary/45 bg-gradient-to-br from-primary/25 to-primary/10 text-primary shadow-[0_6px_16px_rgba(232,196,122,0.2)]",
  }[tone];

  return (
    <article
      className={`christmas-card relative overflow-hidden rounded-2xl p-6 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_36px_-12px_rgba(4,10,20,0.75)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${className}`}
    >
      {showPostmark && (
        <Postmark
          city="NORTH POLE"
          date="25 DEC"
          subtext="REGISTERED"
          wavyLines={false}
          tone="gold"
          size="sm"
          className="pointer-events-none absolute top-3 right-3 -rotate-12 opacity-15"
        />
      )}

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="block text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
              {kicker}
            </span>
            <span className="font-display-en mt-1 block text-2xl font-bold leading-none text-text-secondary">
              {cardNumber}
            </span>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${medallionTone}`}
          >
            {icon}
          </div>
        </div>

        <div className="gold-foil-rule my-4" />

        <h3 className="thai-keep text-lg font-bold leading-snug text-snow-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
    </article>
  );
}
