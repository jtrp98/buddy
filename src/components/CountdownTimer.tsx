"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetIso: string;
  onExpire?: () => void;
}

function calcRemaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
}

function FlipDigitTile({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex min-w-[2.1rem] items-center justify-center overflow-hidden rounded-xs border border-gold-ink/60 bg-ink px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums text-paper shadow-[0_2px_0_rgba(142,37,39,0.5)]">
        <span className="relative z-10">{value}</span>
        {/* Split-flap hinge line */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-[1px] bg-black/50"
        />
      </div>
      <span className="mt-0.5 text-[9px] font-bold text-ink-soft">{unit}</span>
    </div>
  );
}

export function CountdownTimer({ targetIso, onExpire }: CountdownTimerProps) {
  const targetMs = new Date(targetIso).getTime();
  const [remaining, setRemaining] = useState<{
    diff: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const expiredTriggeredRef = useRef(false);

  useEffect(() => {
    expiredTriggeredRef.current = false;
    const tick = () => {
      const next = calcRemaining(targetMs);
      setRemaining(next);
      if (next.diff === 0 && !expiredTriggeredRef.current) {
        expiredTriggeredRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetMs, onExpire]);

  if (!remaining) {
    return null;
  }

  if (remaining.diff === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded border border-ink/25 bg-cream px-3 py-1 font-serif text-xs font-bold text-ink-soft">
        <Clock className="h-3.5 w-3.5" />
        หมดเวลาเปิดรับสมัครแล้ว
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      aria-label="เวลานับถอยหลังก่อนปิดรับสมัคร"
      className="inline-flex items-center gap-2 rounded border border-gold-ink/40 bg-paper px-3 py-1.5 shadow-paper-pressed"
    >
      <div className="flex items-center gap-1 text-[11px] font-bold text-xmas-red">
        <Clock className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">ปิดรับใน</span>
      </div>
      <div className="flex items-start gap-1">
        {remaining.days > 0 && (
          <>
            <FlipDigitTile value={pad(remaining.days)} unit="วัน" />
            <span className="pt-0.5 font-mono text-xs font-bold text-ink">:</span>
          </>
        )}
        <FlipDigitTile value={pad(remaining.hours)} unit="ชม." />
        <span className="pt-0.5 font-mono text-xs font-bold text-ink">:</span>
        <FlipDigitTile value={pad(remaining.minutes)} unit="นาที" />
        <span className="pt-0.5 font-mono text-xs font-bold text-ink">:</span>
        <FlipDigitTile value={pad(remaining.seconds)} unit="วิ." />
      </div>
    </div>
  );
}
