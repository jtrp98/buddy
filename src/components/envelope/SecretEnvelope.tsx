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
import { MailOpen, RotateCcw } from "lucide-react";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { ChristmasSeal } from "@/components/vintage/ChristmasSeal";
import { Ornament } from "@/components/vintage/Ornament";
import { Postmark } from "@/components/vintage/Postmark";
import { christmasButtonClass } from "@/components/ui/buttonStyles";

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
  openButtonLabel?: string;
  openButtonAriaLabel?: string;
  closeLabel?: string;
  defaultOpen?: boolean;
  openSignal?: number;
  onOpen?: () => void;
  onClose?: () => void;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  className?: string;
  children: ReactNode;
}

/**
 * Accessible wax-sealed Christmas envelope.
 * Handles wax crack, 3D flap turn, letter extraction, and reduced-motion crossfade.
 */
export function SecretEnvelope({
  recipientLabel,
  hintText = "กดที่ตราครั่งเพื่อแกะผนึก",
  openButtonLabel = "เปิดซองจดหมายลับ",
  openButtonAriaLabel = "แกะผนึกขี้ผึ้งเพื่อเปิดอ่านจดหมาย",
  closeLabel = "พับซองกลับ",
  defaultOpen = false,
  openSignal = 0,
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
  const prevSignalRef = useRef(openSignal);
  const letterId = useId();
  const waxGradId = useId().replace(/:/g, "");

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

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

  useEffect(() => {
    if (openSignal !== prevSignalRef.current) {
      prevSignalRef.current = openSignal;
      if (state === "sealed" || state === "pressing") {
        handleOpen();
      } else if (state === "open") {
        headingRef?.current?.focus({ preventScroll: true });
      }
    }
  }, [openSignal, state, handleOpen, headingRef]);

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
            <span className="inline-block rounded-md border border-primary/40 bg-surface px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
              PAR AVION · NORTH POLE
            </span>
            <Ornament name="holly" className="h-6 w-9 text-primary/80" />
          </div>

          <div className="flex flex-col items-center pb-3 text-center">
            <span className="font-script text-xl font-bold text-primary @[360px]:text-2xl">
              {hintText}
            </span>
            <svg
              viewBox="0 0 28 24"
              aria-hidden="true"
              className="mt-0.5 h-5 w-6 text-primary"
            >
              <path
                d="M14 2c-1 6 0 12 0 18m0 0-4-4m4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
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

          {/* Envelope Front Pocket */}
          <div className="env-pocket">
            <div className="env-pocket-left" />
            <div className="env-pocket-right" />
            <div className="env-pocket-bottom" />
            <div className="env-pocket-border" />

            {/* Envelope postal stamps & addressee slip (dark forest ink on warm parchment) */}
            <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
              <div className="flex items-center gap-2">
                <ChristmasSeal
                  tone="pine"
                  year="2026"
                  className="-rotate-2 scale-[0.8] origin-bottom-left"
                />
                <div className="rounded-md border border-[#102119]/25 bg-[#fffdf6]/95 px-2.5 py-1 shadow-xs">
                  <span className="block text-[9px] font-bold tracking-[0.12em] text-[#2e4a40] uppercase">
                    TO / ถึง
                  </span>
                  <span className="block max-w-[140px] truncate text-xs font-bold text-[#102119]">
                    {recipientLabel}
                  </span>
                </div>
              </div>

              <Postmark
                city="NORTH POLE"
                date="25 DEC"
                subtext="SECRET"
                wavyLines={false}
                tone="ink"
                size="sm"
                className="rotate-6 opacity-50"
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
                className="env-seal-btn focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 disabled:cursor-default"
              >
                <svg
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                  className="pointer-events-none h-full w-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                >
                  <defs>
                    <radialGradient id={waxGradId} cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#d63b4b" />
                      <stop offset="55%" stopColor="#b42332" />
                      <stop offset="100%" stopColor="#6b111b" />
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
                    <circle cx="32" cy="32" r="18.5" fill="none" stroke="#ff8c8c" strokeWidth="0.9" opacity="0.45" />
                  </g>

                  <g className="env-seal-half-right">
                    <path
                      d="M32 3c5.6 0 9.4 2.4 13.7 4.2 4.1 1.7 8.4 3.5 11 7.2 2.7 3.8 2.8 8.3 3.9 12.6 1 4.1 2.2 8.2.4 12.2-1.7 3.8-4.7 6.5-7.4 9.7-2.9 3.4-5.4 7.7-9.7 9.4-4.2 1.6-8.8.4-13.2.5-4.3.1-8.7 1.3-12.5-.6-4-2-6.1-6.2-8.7-9.7-2.4-3.3-5.8-6.4-6.4-10.5-.7-4.5 1.8-8.7 2.8-13.1.9-4.1.6-8.8 3.2-12.1 2.6-3.4 7-4.3 10.9-5.9C23.9 5 27.6 3 32 3Z"
                      fill={`url(#${waxGradId})`}
                      stroke="#581315"
                      strokeWidth="1"
                    />
                    <circle cx="32" cy="32" r="20" fill="none" stroke="#581315" strokeWidth="1.4" opacity="0.65" />
                    <circle cx="32" cy="32" r="18.5" fill="none" stroke="#ff8c8c" strokeWidth="0.9" opacity="0.45" />
                  </g>

                  <text
                    x="32"
                    y="37"
                    textAnchor="middle"
                    fill="#FFFDF6"
                    fontSize="13"
                    fontWeight="700"
                    letterSpacing="1.2"
                  >
                    SB
                  </text>

                  <path
                    d="M33 4 L29 19 L35 31 L28 45 L35 60"
                    fill="none"
                    stroke="#2b070a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="env-crack-path"
                  />
                </svg>

                <span aria-hidden="true" className="env-wax-sheen" />
              </button>
            </div>
          </div>
        </div>

        {/* Accessible Primary Button Control below envelope */}
        <div className="mt-6 flex min-h-[48px] items-center justify-center">
          {isOpen ? (
            <button
              type="button"
              onClick={handleClose}
              className={christmasButtonClass("secondary", "md", "whitespace-nowrap")}
            >
              <RotateCcw className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>{closeLabel}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleOpen}
              className={christmasButtonClass("gold", "md", "whitespace-nowrap")}
            >
              <MailOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{isBusy ? "กำลังเปิดซอง..." : openButtonLabel}</span>
            </button>
          )}
        </div>

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
