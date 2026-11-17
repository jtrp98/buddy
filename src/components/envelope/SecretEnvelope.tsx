"use client";

import {
  useCallback,
  useEffect,
  useId,
  useReducer,
  useRef,
  type AnimationEvent,
  type ReactNode,
} from "react";
import { RotateCcw } from "lucide-react";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { ChristmasSeal } from "@/components/vintage/ChristmasSeal";
import { Ornament } from "@/components/vintage/Ornament";
import { Postmark } from "@/components/vintage/Postmark";

type EnvelopeState = "sealed" | "pressing" | "opening" | "open" | "closing";

type EnvelopeAction =
  | { type: "PRESS_START" }
  | { type: "PRESS_CANCEL" }
  | { type: "OPEN_START" }
  | { type: "OPEN_INSTANT" }
  | { type: "OPEN_DONE" }
  | { type: "CLOSE_START" }
  | { type: "CLOSE_INSTANT" }
  | { type: "CLOSE_DONE" };

function envelopeReducer(state: EnvelopeState, action: EnvelopeAction): EnvelopeState {
  switch (action.type) {
    case "PRESS_START":
      return state === "sealed" ? "pressing" : state;
    case "PRESS_CANCEL":
      return state === "pressing" ? "sealed" : state;
    case "OPEN_START":
      return state === "sealed" || state === "pressing" ? "opening" : state;
    case "OPEN_INSTANT":
      return state === "sealed" || state === "pressing" ? "open" : state;
    case "OPEN_DONE":
      return state === "opening" ? "open" : state;
    case "CLOSE_START":
      return state === "open" ? "closing" : state;
    case "CLOSE_INSTANT":
      return state === "open" ? "sealed" : state;
    case "CLOSE_DONE":
      return state === "closing" ? "sealed" : state;
    default:
      return state;
  }
}

interface SecretEnvelopeProps {
  recipientLabel: string;
  hintText?: string;
  openButtonAriaLabel?: string;
  closeLabel?: string;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  className?: string;
  children: ReactNode;
}

/**
 * Interactive 1950s wax-sealed Christmas envelope.
 * Handles wax crack, 3D flap turn, letter extraction, and reduced-motion crossfade.
 */
export function SecretEnvelope({
  recipientLabel,
  hintText = "ลองกดที่ตราครั่งเพื่อแกะผนึก",
  openButtonAriaLabel = "แกะผนึกขี้ผึ้งเพื่อเปิดอ่านจดหมาย",
  closeLabel = "พับซองกลับ",
  defaultOpen = false,
  onOpen,
  onClose,
  headingRef,
  className = "",
  children,
}: SecretEnvelopeProps) {
  const [state, dispatch] = useReducer(
    envelopeReducer,
    defaultOpen ? "open" : "sealed"
  );
  const { triggerStampSound, triggerChimeSound, triggerClickSound } =
    useFestiveAtmosphere();

  const sealBtnRef = useRef<HTMLButtonElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const pendingFocusRef = useRef<"open" | "close" | null>(null);
  const letterId = useId();
  const waxGradId = useId().replace(/:/g, "");

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Restore / transfer focus AFTER React commits the enabled DOM state
  useEffect(() => {
    if (state === "open" && pendingFocusRef.current === "open") {
      pendingFocusRef.current = null;
      headingRef?.current?.focus({ preventScroll: true });
    } else if (state === "sealed" && pendingFocusRef.current === "close") {
      pendingFocusRef.current = null;
      sealBtnRef.current?.focus({ preventScroll: true });
    }
  }, [state, headingRef]);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finishOpen = useCallback(() => {
    clearTimers();
    pendingFocusRef.current = "open";
    dispatch({ type: "OPEN_DONE" });
    onOpen?.();
  }, [clearTimers, onOpen]);

  const finishClose = useCallback(() => {
    clearTimers();
    pendingFocusRef.current = "close";
    dispatch({ type: "CLOSE_DONE" });
    onClose?.();
  }, [clearTimers, onClose]);

  const handleOpen = useCallback(() => {
    if (state !== "sealed" && state !== "pressing") return;
    clearTimers();
    triggerStampSound();

    if (prefersReducedMotion()) {
      triggerChimeSound();
      pendingFocusRef.current = "open";
      dispatch({ type: "OPEN_INSTANT" });
      onOpen?.();
      return;
    }

    dispatch({ type: "OPEN_START" });
    timersRef.current.push(window.setTimeout(() => triggerChimeSound(), 1100));
    timersRef.current.push(window.setTimeout(finishOpen, 1720));
  }, [
    clearTimers,
    finishOpen,
    onOpen,
    state,
    triggerChimeSound,
    triggerStampSound,
  ]);

  const handleClose = useCallback(() => {
    if (state !== "open") return;
    clearTimers();
    triggerClickSound();

    if (prefersReducedMotion()) {
      pendingFocusRef.current = "close";
      dispatch({ type: "CLOSE_INSTANT" });
      onClose?.();
      return;
    }

    dispatch({ type: "CLOSE_START" });
    timersRef.current.push(window.setTimeout(() => triggerStampSound(), 800));
    timersRef.current.push(window.setTimeout(finishClose, 1120));
  }, [
    clearTimers,
    finishClose,
    onClose,
    state,
    triggerClickSound,
    triggerStampSound,
  ]);

  const handleAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (state === "opening" && e.animationName === "envLetterUnfold") {
      finishOpen();
    } else if (state === "closing" && e.animationName === "envSealRestamp") {
      finishClose();
    }
  };

  const isOpen = state === "open";
  const isBusy = state === "opening" || state === "closing";
  const showHint = state === "sealed" || state === "pressing";

  return (
    <div
      className={`env-root select-none ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.preventDefault();
          handleClose();
        }
      }}
    >
      <div
        className="env-stage"
        data-state={state}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* Reserved Headroom (visible when sealed; letter rises into this space) */}
        <div
          aria-hidden={!showHint}
          className={`pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between px-1 pt-1 transition-opacity duration-200 ${
            showHint ? "opacity-100" : "opacity-0"
          }`}
          style={{ height: "var(--env-headroom)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="inline-block rounded-xs border border-pine/45 bg-pine-wash/75 px-2 py-0.5 font-type text-[9px] tracking-[0.16em] text-pine uppercase">
              PAR AVION · AIR MAIL
            </span>
            <Ornament name="holly" className="h-6 w-9 text-pine/65" />
          </div>

          <div className="flex flex-col items-center pb-3 text-center">
            <span className="font-script text-lg font-bold text-xmas-red @[360px]:text-xl">
              {hintText}
            </span>
            <svg
              viewBox="0 0 28 24"
              aria-hidden="true"
              className="mt-0.5 h-5 w-6 text-xmas-red/80"
            >
              <path
                d="M14 2c-1 6 0 12 0 18m0 0-4-4m4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Physical Envelope Body */}
        <div className="env-shell">
          <div aria-hidden="true" className="env-shadow" />
          <div aria-hidden="true" className="env-back" />

          {/* Letter Sheet inside pocket */}
          <div
            id={letterId}
            aria-hidden={!isOpen}
            inert={!isOpen ? true : undefined}
            className="env-letter"
          >
            {children}
          </div>

          {/* Envelope Front Pocket (Left, Right, Bottom Flaps + Back Postal Details) */}
          <div className="env-pocket">
            <div className="env-pocket-left" />
            <div className="env-pocket-right" />
            <div className="env-pocket-bottom" />
            <div className="env-pocket-border" />

            {/* Back-of-envelope 1950s postal stamps & addressee slip */}
            <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
              <div className="flex items-center gap-2">
                <ChristmasSeal
                  tone="pine"
                  year="1955"
                  className="-rotate-3 scale-[0.82] origin-bottom-left"
                />
                <div className="rounded-xs border border-ink/20 bg-paper/90 px-2 py-1 shadow-xs">
                  <span className="block font-type text-[7.5px] tracking-[0.14em] text-ink-soft uppercase">
                    TO / ถึง
                  </span>
                  <span className="block max-w-[130px] truncate font-serif text-[11px] font-bold text-ink">
                    {recipientLabel}
                  </span>
                </div>
              </div>

              <Postmark
                city="NORTH POLE"
                date="24 DEC"
                subtext="RECEIVED"
                wavyLines={false}
                tone="ink"
                size="sm"
                className="rotate-6 opacity-55"
              />
            </div>
          </div>

          {/* Hinged Top Flap & Interactive Wax Seal Button */}
          <div className="env-flap">
            <div aria-hidden="true" className="env-flap-front" />
            <div aria-hidden="true" className="env-flap-back" />

            <div className="env-seal-anchor">
              <button
                ref={sealBtnRef}
                type="button"
                disabled={isBusy || isOpen}
                aria-expanded={isOpen}
                aria-controls={letterId}
                aria-label={openButtonAriaLabel}
                onPointerDown={() => {
                  if (!isBusy && !isOpen) dispatch({ type: "PRESS_START" });
                }}
                onPointerLeave={() => dispatch({ type: "PRESS_CANCEL" })}
                onPointerCancel={() => dispatch({ type: "PRESS_CANCEL" })}
                onClick={handleOpen}
                className="env-seal-btn focus-visible:outline-2 focus-visible:outline-gold-ink focus-visible:outline-offset-4 disabled:cursor-default"
              >
                {/* Left & Right Wax Halves (separate cleanly when cracked) */}
                <svg
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                  className="pointer-events-none h-full w-full drop-shadow-[0_3px_5px_rgba(40,22,18,0.42)]"
                >
                  <defs>
                    <radialGradient id={waxGradId} cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#b83b3d" />
                      <stop offset="55%" stopColor="#8e2527" />
                      <stop offset="100%" stopColor="#581315" />
                    </radialGradient>
                  </defs>

                  <g className="env-seal-half-left">
                    <path
                      d="M32 3c5.6 0 9.4 2.4 13.7 4.2 4.1 1.7 8.4 3.5 11 7.2 2.7 3.8 2.8 8.3 3.9 12.6 1 4.1 2.2 8.2.4 12.2-1.7 3.8-4.7 6.5-7.4 9.7-2.9 3.4-5.4 7.7-9.7 9.4-4.2 1.6-8.8.4-13.2.5-4.3.1-8.7 1.3-12.5-.6-4-2-6.1-6.2-8.7-9.7-2.4-3.3-5.8-6.4-6.4-10.5-.7-4.5 1.8-8.7 2.8-13.1.9-4.1.6-8.8 3.2-12.1 2.6-3.4 7-4.3 10.9-5.9C23.9 5 27.6 3 32 3Z"
                      fill={`url(#${waxGradId})`}
                      stroke="#581315"
                      strokeWidth="1"
                    />
                    <circle cx="32" cy="32" r="20" fill="none" stroke="#581315" strokeWidth="1.4" opacity="0.65" />
                    <circle cx="32" cy="32" r="18.5" fill="none" stroke="#c85c5e" strokeWidth="0.9" opacity="0.45" />
                  </g>

                  <g className="env-seal-half-right">
                    <path
                      d="M32 3c5.6 0 9.4 2.4 13.7 4.2 4.1 1.7 8.4 3.5 11 7.2 2.7 3.8 2.8 8.3 3.9 12.6 1 4.1 2.2 8.2.4 12.2-1.7 3.8-4.7 6.5-7.4 9.7-2.9 3.4-5.4 7.7-9.7 9.4-4.2 1.6-8.8.4-13.2.5-4.3.1-8.7 1.3-12.5-.6-4-2-6.1-6.2-8.7-9.7-2.4-3.3-5.8-6.4-6.4-10.5-.7-4.5 1.8-8.7 2.8-13.1.9-4.1.6-8.8 3.2-12.1 2.6-3.4 7-4.3 10.9-5.9C23.9 5 27.6 3 32 3Z"
                      fill={`url(#${waxGradId})`}
                      stroke="#581315"
                      strokeWidth="1"
                    />
                    <circle cx="32" cy="32" r="20" fill="none" stroke="#581315" strokeWidth="1.4" opacity="0.65" />
                    <circle cx="32" cy="32" r="18.5" fill="none" stroke="#c85c5e" strokeWidth="0.9" opacity="0.45" />
                  </g>

                  {/* Embossed North Pole Star + SB Monogram */}
                  <text
                    x="32"
                    y="37"
                    textAnchor="middle"
                    fill="#f3e7cf"
                    fontSize="13"
                    fontWeight="700"
                    letterSpacing="1.2"
                    opacity="0.9"
                    className="font-serif"
                  >
                    SB
                  </text>

                  {/* Jagged crack path animated on break */}
                  <path
                    d="M33 4 L29 19 L35 31 L28 45 L35 60"
                    fill="none"
                    stroke="#330b0d"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="env-crack-path"
                  />
                </svg>

                {/* Single subtle wax highlight sweep on hover */}
                <span aria-hidden="true" className="env-wax-sheen" />
              </button>
            </div>
          </div>
        </div>

        {/* Fixed-height bottom control slot (zero layout shift between sealed & open) */}
        <div className="mt-4 flex min-h-[44px] items-center justify-center">
          {isOpen ? (
            <button
              type="button"
              onClick={handleClose}
              className="analog-btn thai-keep inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded bg-cream px-4 py-2 text-xs font-bold text-ink hover:bg-paper"
            >
              <RotateCcw className="h-3.5 w-3.5 text-xmas-red" />
              <span>{closeLabel}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleOpen}
              className="thai-keep inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded px-3 py-2 font-serif text-xs font-semibold text-ink-soft underline decoration-gold-ink/60 decoration-dashed underline-offset-4 transition hover:text-xmas-red disabled:opacity-60"
            >
              <span>{isBusy ? "กำลังเปิดซอง..." : "หรือคลิกที่นี่เพื่อแกะผนึกจดหมาย"}</span>
            </button>
          )}
        </div>

        {/* Screen-reader live state announcement */}
        <p className="sr-only" aria-live="polite">
          {state === "open"
            ? "เปิดซองจดหมาย Secret Buddy เรียบร้อยแล้ว"
            : state === "sealed"
              ? "ซองจดหมายถูกปิดผนึก"
              : ""}
        </p>
      </div>
    </div>
  );
}
