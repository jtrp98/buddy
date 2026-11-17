"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Sparkles, X } from "lucide-react";
import { ChristmasTree } from "@/components/scenery/ChristmasTree";
import { SnowDrift, WinterScene } from "@/components/scenery/WinterScene";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import {
  CELEBRATION_THRESHOLD,
  TREE_MILESTONES,
  buildSlots,
  entranceOffset,
  isStroller,
  newlyUnlockedStage,
  seedJitter,
  shouldCelebrate,
  treeStage,
} from "@/lib/join-scene";
import { SPRITE_W } from "./pixelSprites";
import { PixelBuddy, type BuddyAction } from "./PixelBuddy";

export interface SceneParticipant {
  seed: string;
  verified: boolean;
}

const ENTER_MS = 5600;
const CELEBRATION_MS = 5200;

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1 ? prev : { width, height }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

const SPARKS = Array.from({ length: 22 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  top: 6 + ((i * 53) % 62),
  delay: (i % 7) * 160,
  size: 10 + (i % 4) * 5,
  color: ["#ffe7a8", "#ffffff", "#ffc552", "#ff8f87"][i % 4],
}));

/**
 * The living Christmas scene on the Join page: a tree that grows more festive
 * with each registered participant, and one 8-bit buddy per participant.
 */
export function JoinScene({
  participants,
  total,
  mySeed,
  compact = false,
}: {
  participants: SceneParticipant[];
  total: number;
  mySeed: string | null;
  /** Shorter stage, used on the admin group page. */
  compact?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const { boostSnow, triggerChimeSound } = useFestiveAtmosphere();
  const [stageRef, size] = useElementSize<HTMLDivElement>();

  const stage = treeStage(total);
  const narrow = size.width < 640;

  // ---- Arrivals: seeds we have not seen since the first load walk in ----
  const seenRef = useRef<Set<string> | null>(null);
  const [entering, setEntering] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const seeds = participants.map((p) => p.seed);
    if (seenRef.current === null) {
      seenRef.current = new Set(seeds);
      return;
    }
    const fresh = seeds.filter((s) => !seenRef.current!.has(s));
    if (fresh.length === 0) return;
    fresh.forEach((s) => seenRef.current!.add(s));
    if (reducedMotion) return;
    setEntering((prev) => ({ ...prev, ...Object.fromEntries(fresh.map((s) => [s, true])) }));
    const t = window.setTimeout(() => {
      setEntering((prev) => {
        const next = { ...prev };
        fresh.forEach((s) => delete next[s]);
        return next;
      });
    }, ENTER_MS);
    return () => window.clearTimeout(t);
  }, [participants, reducedMotion]);

  // ---- Milestones & the five-person celebration ----
  const prevTotalRef = useRef<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = total;
    const unlocked = newlyUnlockedStage(prev, total);
    if (unlocked) {
      const m = TREE_MILESTONES[unlocked - 1];
      setAnnouncement(`ปลดล็อก ${m.label} แล้ว (${unlocked}/${CELEBRATION_THRESHOLD})`);
    }
    if (shouldCelebrate(prev, total)) {
      setCelebrating(true);
      triggerChimeSound();
      if (!reducedMotion) boostSnow(4500);
      const t = window.setTimeout(() => setCelebrating(false), CELEBRATION_MS);
      return () => window.clearTimeout(t);
    }
  }, [total, boostSnow, triggerChimeSound, reducedMotion]);

  // ---- Layout ----
  const height = size.height;
  const band = Math.round(height * 0.3);
  const groundTop = height - band;
  const treeBottom = groundTop + band * 0.42;
  const treeH = treeBottom * (narrow ? 0.8 : 0.88);
  const treeW = (treeH * 300) / 350;
  const pxFront = narrow ? 2 : 3;
  const maxVisible = narrow ? 16 : 30;

  const slots = useMemo(() => {
    if (!size.width || !height) return [];
    return buildSlots({
      width: size.width,
      groundTop: groundTop + band * 0.1,
      groundBottom: height - 6,
      treeHalfWidth: treeW / 2,
      spriteWidth: SPRITE_W * pxFront + (narrow ? 4 : 8),
      rows: narrow ? 2 : 3,
    });
  }, [size.width, height, groundTop, band, treeW, pxFront, narrow]);

  const capacity = Math.min(maxVisible, slots.length);
  const visible = participants.slice(0, capacity);
  const overflow = Math.max(0, total - visible.length);

  // ---- Ambient behaviour: one buddy does something every few seconds ----
  const [actions, setActions] = useState<Record<string, BuddyAction>>({});
  const [flips, setFlips] = useState<Record<string, boolean>>({});
  const visibleSeedsKey = visible.map((p) => p.seed).join(",");
  useEffect(() => {
    if (reducedMotion || !visibleSeedsKey) return;
    const seeds = visibleSeedsKey.split(",");
    const timers = new Set<number>();
    const tick = window.setInterval(() => {
      if (document.hidden) return;
      const seed = seeds[Math.floor(Math.random() * seeds.length)];
      const roll = Math.random();
      if (roll < 0.25) {
        setFlips((f) => ({ ...f, [seed]: !f[seed] }));
        return;
      }
      const action: BuddyAction = roll < 0.65 ? "wave" : roll < 0.85 ? "jump" : "walk";
      setActions((a) => ({ ...a, [seed]: action }));
      const t = window.setTimeout(() => {
        setActions((a) => ({ ...a, [seed]: "idle" }));
        timers.delete(t);
      }, action === "jump" ? 1300 : 1900);
      timers.add(t);
    }, 2600);
    return () => {
      window.clearInterval(tick);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [visibleSeedsKey, reducedMotion]);

  const unlockedFull = stage >= CELEBRATION_THRESHOLD;

  return (
    <section aria-labelledby="join-scene-title" className="relative">
      <h2 id="join-scene-title" className="sr-only">
        ต้นคริสต์มาสของกลุ่ม: มีผู้ลงทะเบียน {total} คน
      </h2>

      <div
        ref={stageRef}
        className={`join-scene relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[var(--shadow-card-lifted)] ${
          compact ? "h-[280px] sm:h-[320px]" : "h-[340px] sm:h-[420px] lg:h-[480px]"
        }`}
        data-celebrating={celebrating}
      >
        <WinterScene variant="join" showMoon />

        {/* Thick snowfield the buddies stand on */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,#eef4f7_0%,#dce7ee_55%,#c4d5df_100%)]"
          style={{ height: band }}
        >
          <SnowDrift className="absolute inset-x-0 -top-6 h-8" />
        </div>

        {height > 0 && (
          <ChristmasTree
            stage={stage}
            celebrating={celebrating}
            ground={false}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ width: treeW, height: treeH, top: treeBottom - treeH, zIndex: Math.round(groundTop) }}
          />
        )}

        {visible.map((p, i) => {
          const slot = slots[i];
          if (!slot) return null;
          const front = slot.row === (narrow ? 1 : 2);
          const px = front ? pxFront : Math.max(2, pxFront - (slot.row === 0 ? 1 : 0));
          const { dx, dy } = seedJitter(p.seed, SPRITE_W * px);
          const x = slot.x + dx;
          const y = slot.y + dy;
          const isEntering = Boolean(entering[p.seed]);
          const isYou = mySeed === p.seed;
          return (
            <PixelBuddy
              key={p.seed}
              seed={p.seed}
              x={x}
              y={y}
              px={px}
              zIndex={Math.round(y) + (slot.y > treeBottom ? 1000 : 0)}
              action={celebrating ? "jump" : actions[p.seed] ?? "idle"}
              flip={Boolean(flips[p.seed])}
              stroll={!reducedMotion && !celebrating && isStroller(p.seed)}
              entering={isEntering}
              enterFrom={entranceOffset(x, size.width)}
              pending={!p.verified}
              isYou={isYou}
              welcome={isEntering ? (isYou ? "สวัสดีทุกคน!" : "ยินดีต้อนรับ!") : null}
              bobDelay={(i * 0.37) % 1.6}
            />
          );
        })}

        {overflow > 0 && (
          <div className="absolute top-3 right-3 z-[3000] flex items-center gap-2 rounded-full border border-ink/10 bg-ivory/95 py-1 pr-3 pl-1.5 text-xs font-bold text-ink shadow-lg">
            <span aria-hidden="true" className="flex -space-x-1.5">
              {["#c5343b", "#2f8a5b", "#3b6fb6"].map((c) => (
                <span key={c} className="h-5 w-5 rounded-full border-2 border-ivory" style={{ background: c }} />
              ))}
            </span>
            +{overflow} คน
          </div>
        )}

        {total === 0 && (
          <div className="absolute inset-x-0 bottom-5 z-[3000] flex justify-center px-4">
            <p className="rounded-full bg-ivory/95 px-4 py-1.5 text-center text-xs font-semibold text-ink shadow-lg sm:text-sm">
              ยังไม่มีใครมาที่ต้นไม้นี้ — มาเป็นคนแรกกันเถอะ!
            </p>
          </div>
        )}

        {celebrating && (
          <div className="pointer-events-none absolute inset-0 z-[4000]">
            {!reducedMotion &&
              SPARKS.map((s, i) => (
                <svg
                  key={i}
                  viewBox="-8 -8 16 16"
                  className="sparkle-bloom absolute"
                  style={
                    {
                      left: `${s.left}%`,
                      top: `${s.top}%`,
                      width: s.size,
                      height: s.size,
                      "--sparkle-delay": `${s.delay}ms`,
                    } as CSSProperties
                  }
                >
                  <path d="M0 -8 L1.8 -1.8 L8 0 L1.8 1.8 L0 8 L-1.8 1.8 L-8 0 L-1.8 -1.8 Z" fill={s.color} />
                </svg>
              ))}
            <div className="absolute inset-x-0 top-5 flex justify-center px-4 sm:top-8">
              <div className="celebration-banner pointer-events-auto flex items-center gap-3 rounded-2xl border border-primary/60 bg-[linear-gradient(180deg,#8a1f26,#5e1418)] px-5 py-3 text-center text-ivory shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),0_0_40px_rgba(255,210,122,0.35)]">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-display-en text-lg font-semibold tracking-wide sm:text-2xl">
                    CHRISTMAS MAGIC UNLOCKED!
                  </p>
                  <p className="text-xs text-ivory/85 sm:text-sm">ครบ 5 คนแล้ว ต้นคริสต์มาสของเราสมบูรณ์!</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCelebrating(false)}
                  aria-label="ปิดข้อความฉลอง"
                  className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ivory/80 hover:bg-white/10 hover:text-ivory"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <TreeProgress total={total} unlockedFull={unlockedFull} />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

function TreeProgress({ total, unlockedFull }: { total: number; unlockedFull: boolean }) {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl leading-none text-text-primary">{total}</span>
        <span className="text-sm text-text-secondary">คนลงทะเบียนแล้ว</span>
      </div>

      <ol className="flex flex-wrap items-center gap-1.5" aria-label="ความคืบหน้าการตกแต่งต้นคริสต์มาส">
        {TREE_MILESTONES.map((m) => {
          const done = total >= m.count;
          return (
            <li
              key={m.count}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors duration-500 sm:text-xs ${
                done
                  ? m.count === CELEBRATION_THRESHOLD
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/50 bg-primary/12 text-primary"
                  : "border-border text-text-muted"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${done ? "bg-current shadow-[0_0_8px_currentColor]" : "bg-text-muted/50"}`}
              />
              <span>
                {m.count} · {m.label}
              </span>
              <span className="sr-only">{done ? "(ปลดล็อกแล้ว)" : "(ยังไม่ปลดล็อก)"}</span>
            </li>
          );
        })}
      </ol>

      {unlockedFull && (
        <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-primary uppercase sm:hidden">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Christmas Magic Unlocked
        </p>
      )}
    </div>
  );
}
