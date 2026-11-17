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
 * High-contrast ivory postal letter rendered inside SecretEnvelope.
 * Uses dark evergreen ink (#102119) and Christmas red (#B42332) on #FFFDF6 ivory paper.
 */
export function EnvelopeLetter({
  letterhead = "NORTH POLE POST · SECRET BUDDY",
  salutation,
  intro = "คุณได้รับมอบหมายให้เป็น Secret Buddy ของ",
  buddyName,
  rows,
  confidentialText = "ลับเฉพาะ · CONFIDENTIAL",
  signature = "North Pole Post",
  headingRef,
}: EnvelopeLetterProps) {
  return (
    <div className="relative h-full w-full text-left text-[#102119]">
      {/* Upper folded letterhead crest */}
      <div className="env-letter-crest">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold tracking-[0.12em] text-[#B42332] uppercase @[350px]:text-xs">
            {letterhead}
          </span>
          <Ornament name="star" className="h-4 w-4 shrink-0 text-[#9c7210]" />
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <span className="truncate font-script text-lg font-bold leading-snug text-[#102119] @[350px]:text-xl">
            {salutation}
          </span>
          <span className="shrink-0 text-[10px] font-semibold tracking-wider text-[#2e4a40]">
            SECRET DISPATCH
          </span>
        </div>
      </div>

      {/* Main letter sheet */}
      <div className="env-letter-sheet flex flex-col justify-between">
        <div>
          <p className="text-xs leading-snug font-medium text-[#2e4a40] @[350px]:text-sm">
            {intro}
          </p>

          <h3
            ref={headingRef}
            tabIndex={-1}
            className="thai-keep mt-1 text-lg font-bold leading-tight text-[#B42332] focus:outline-none @[340px]:text-xl @[400px]:text-2xl"
          >
            {buddyName}
          </h3>

          <div className="mt-2 space-y-1.5">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-1.5 text-xs leading-snug @[350px]:text-[13px]"
              >
                <span className="shrink-0 font-bold text-[#102119]">
                  {row.label}
                </span>
                <span aria-hidden="true" className="dotted-leader min-w-[0.75rem]" />
                <span className="max-w-[72%] text-right font-semibold leading-snug text-[#1e3d32]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stamp & signature */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="inline-block rounded border border-[#B42332]/70 bg-[#B42332]/10 px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-[#8f1926] uppercase">
            {confidentialText}
          </span>
          <span className="shrink-0 font-script text-base font-bold text-[#123229]">
            — {signature}
          </span>
        </div>
      </div>
    </div>
  );
}
