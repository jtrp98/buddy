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
      <div className="relative flex min-w-[2.4rem] items-center justify-center overflow-hidden rounded-lg border border-primary/50 bg-[#091526] px-2 py-1 font-mono text-xs font-bold tabular-nums text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_10px_rgba(4,10,20,0.4)]">
        <span className="relative z-10">{value}</span>
      </div>
      <span className="mt-0.5 text-[10px] font-semibold text-text-secondary">{unit}</span>
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
      <span className="inline-flex items-center gap-1.5 rounded-full border border-christmas-red-light/50 bg-[#45111C]/85 px-3 py-1 text-xs font-semibold text-[#FFE8EC]">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>หมดเวลาเปิดรับสมัครแล้ว</span>
      </span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      aria-label="เวลานับถอยหลังก่อนปิดรับสมัคร"
      className="inline-flex flex-wrap items-center gap-2.5 rounded-2xl border border-primary/40 bg-[#0E2034]/90 px-3.5 py-2 shadow-sm"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>ปิดรับใน</span>
      </div>
      <div className="flex items-start gap-1.5">
        {remaining.days > 0 && (
          <>
            <FlipDigitTile value={pad(remaining.days)} unit="วัน" />
            <span className="pt-1 font-mono text-xs font-bold text-text-secondary">:</span>
          </>
        )}
        <FlipDigitTile value={pad(remaining.hours)} unit="ชม." />
        <span className="pt-1 font-mono text-xs font-bold text-text-secondary">:</span>
        <FlipDigitTile value={pad(remaining.minutes)} unit="นาที" />
        <span className="pt-1 font-mono text-xs font-bold text-text-secondary">:</span>
        <FlipDigitTile value={pad(remaining.seconds)} unit="วิ." />
      </div>
    </div>
  );
}
