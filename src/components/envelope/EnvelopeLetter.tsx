import type { RefObject } from "react";
import { Ornament } from "@/components/vintage/Ornament";

export interface EnvelopeLetterRow {
  label: string;
  value: string;
}

interface EnvelopeLetterProps {
  letterhead?: string;
  salutation: string;
  intro?: string;
  buddyName: string;
  rows: EnvelopeLetterRow[];
  confidentialText?: string;
  signature?: string;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}

/**
 * Folded 1950s North Pole postal letter rendered inside SecretEnvelope.
 * Top `.env-letter-crest` unfolds upward while `.env-letter-sheet` holds the reveal.
 */
export function EnvelopeLetter({
  letterhead = "NORTH POLE POST · SECRET BUDDY",
  salutation,
  intro = "คุณได้รับมอบหมายให้เป็น Secret Buddy ของ",
  buddyName,
  rows,
  confidentialText = "ลับเฉพาะ · CONFIDENTIAL",
  signature = "Head Postmaster",
  headingRef,
}: EnvelopeLetterProps) {
  return (
    <div className="relative h-full w-full text-left text-ink">
      {/* Upper folded letterhead crest (unfolds open as letter rises) */}
      <div className="env-letter-crest">
        <div className="flex items-center justify-between gap-1.5">
          <span className="truncate font-type text-[7.5px] tracking-[0.11em] text-xmas-red uppercase @[350px]:text-[9.5px] @[350px]:tracking-[0.15em]">
            {letterhead}
          </span>
          <Ornament name="star" className="h-3.5 w-3.5 shrink-0 text-gold-ink" />
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="truncate font-script text-base font-bold leading-snug text-ink @[350px]:text-lg">
            {salutation}
          </span>
          <span className="shrink-0 font-type text-[8px] tracking-[0.1em] text-ink-soft">
            NO. 1955-DEC
          </span>
        </div>
      </div>

      {/* Main letter sheet */}
      <div className="env-letter-sheet flex flex-col justify-between">
        <div>
          <p className="text-[11px] leading-snug text-ink-soft @[350px]:text-xs">
            {intro}
          </p>

          <h3
            ref={headingRef}
            tabIndex={-1}
            className="thai-keep letterpress mt-1 font-display text-lg leading-[1.25] text-xmas-red focus:outline-none @[340px]:text-xl @[400px]:text-2xl"
          >
            {buddyName}
          </h3>

          <div className="mt-1.5 space-y-1 @[350px]:mt-2 @[350px]:space-y-1.5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-1.5 text-[10.5px] leading-snug @[350px]:text-xs"
              >
                <span className="shrink-0 font-serif font-bold text-ink">
                  {row.label}
                </span>
                <span aria-hidden="true" className="dotted-leader min-w-[0.75rem]" />
                <span className="max-w-[70%] text-right font-medium text-ink-soft">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom rubber stamp & script signature (stays clear of pocket notch) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="inline-block -rotate-2 rounded-xs border border-xmas-red/65 px-1.5 py-0.5 font-type text-[7.5px] tracking-[0.12em] text-xmas-red uppercase @[350px]:text-[8px]">
            {confidentialText}
          </span>
          <span className="shrink-0 font-script text-sm font-bold text-pine @[350px]:text-base">
            — {signature}
          </span>
        </div>
      </div>
    </div>
  );
}
