import type { ReactNode } from "react";
import { Postmark } from "@/components/vintage/Postmark";

interface PostalCardProps {
  cardNumber: string;
  kicker?: string;
  icon: ReactNode;
  title: ReactNode;
  description: string;
  tone?: "red" | "pine" | "gold";
  rotationClass?: string;
  showPostmark?: boolean;
  className?: string;
}

/**
 * 1950s printed postal index card with inset double-rule frame, engraved medallion,
 * perforated right stub, and optional faint cancellation mark.
 */
export function PostalCard({
  cardNumber,
  kicker = "POSTAL CARD",
  icon,
  title,
  description,
  tone = "pine",
  rotationClass = "",
  showPostmark = false,
  className = "",
}: PostalCardProps) {
  const medallionTone = {
    red: "border-xmas-red/45 bg-red-wash/70 text-xmas-red",
    pine: "border-pine/45 bg-pine-wash/70 text-pine",
    gold: "border-gold-ink/45 bg-amber-wash/75 text-gold-ink",
  }[tone];

  return (
    <article
      className={`analog-card printed-double-rule perforated-edge-right group relative rounded-sm p-6 pr-8 pt-6 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:rotate-0 hover:shadow-paper-lifted motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${rotationClass} ${className}`}
    >
      {showPostmark && (
        <Postmark
          city="NORTH POLE"
          date="25 DEC"
          subtext="REGISTERED"
          wavyLines={false}
          tone="ink"
          size="sm"
          className="pointer-events-none absolute top-3 right-5 -rotate-12 opacity-20"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="block font-type text-[10px] tracking-[0.2em] text-ink-soft uppercase">
              {kicker}
            </span>
            <span className="mt-0.5 block font-serif text-2xl italic font-bold leading-none text-gold-ink">
              {cardNumber}
            </span>
          </div>

          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-inner ${medallionTone}`}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-1 rounded-full border border-current opacity-35"
            />
            {icon}
          </div>
        </div>

        <div className="gold-foil-rule my-4" />

        <h2 className="thai-keep font-serif text-[17px] font-bold leading-[1.45] text-ink">
          {title}
        </h2>
        <p className="mt-2 text-[15px] leading-[1.75] text-ink-soft">
          {description}
        </p>
      </div>
    </article>
  );
}
