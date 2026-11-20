"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Flame, Sparkles, Stars, Sun, X } from "lucide-react";
import { WinterScene } from "@/components/scenery/WinterScene";
import { useFestiveAtmosphere } from "@/components/FestiveAtmosphere";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import {
  CELEBRATION_THRESHOLD,
  TREE_LIGHT_MODES,
  TREE_MILESTONES,
  ambientEmoji,
  buddyGreeting,
  buildSlots,
  entranceOffset,
  giftCountForMembers,
  newlyUnlockedStage,
  seedJitter,
  shouldCelebrate,
  treeStage,
  type TreeLightMode,
} from "@/lib/join-scene";
import { PixelBuddy, type BuddyAction } from "./PixelBuddy";
import { PIXEL_TREE_H, PIXEL_TREE_W, PixelChristmasTree } from "./PixelChristmasTree";
import {
  FestoonStringLights,
  PICNIC_TABLE_H,
  PICNIC_TABLE_W,
  PixelCabin,
  PixelFenceAndShrubs,
  PixelGiftPile,
  PixelLamppost,
  PixelPicnicTable,
  PixelSnowman,
} from "./PixelProps";
import { SPRITE_W } from "./pixelSprites";

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
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
          ? prev
          : { width, height }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

const CELEBRATION_SPARKS = Array.from({ length: 22 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  top: 6 + ((i * 53) % 62),
  delay: (i % 7) * 160,
  size: 10 + (i % 4) * 5,
  color: ["#ffe7a8", "#ffffff", "#ffc552", "#ff8f87"][i % 4],
}));

const STAGE_FLAKES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 96}%`,
  size: i % 3 === 0 ? 3 : 2,
  dur: `${9 + (i % 5) * 2.2}s`,
  delay: `-${(i * 1.4) % 10}s`,
  drift: `${(i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 8)}px`,
  opacity: 0.35 + (i % 3) * 0.16,
}));

const SPARK_OFFSETS = [
  [-18, -22],
  [18, -20],
  [-24, -4],
  [24, -6],
  [-10, -30],
  [12, -28],
];

interface SparkBurst {
  id: number;
  x: number;
  y: number;
  colors: string[];
}

interface VillageStation {
  id: string;
  x: number;
  y: number;
  flip: boolean;
  action: BuddyAction;
  emojis: string[];
  isLandmark?: boolean;
  triggersSnowman?: boolean;
}

interface BuddyRoutine {
  x: number;
  y: number;
  flip: boolean;
  action: BuddyAction;
  walkMs: number;
  walking: boolean;
  emoji: string | null;
  stationId: string;
  phase: "walking" | "acting";
  until: number;
}

function LightModeIcon({ mode }: { mode: TreeLightMode }) {
  switch (mode) {
    case "warm":
      return <Sun className="h-3.5 w-3.5" aria-hidden="true" />;
    case "twinkle":
      return <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />;
    case "aurora":
      return <Stars className="h-3.5 w-3.5" aria-hidden="true" />;
    case "candle":
      return <Flame className="h-3.5 w-3.5" aria-hidden="true" />;
  }
}

/**
 * The living Hybrid HD-2D Christmas village scene on the Join page:
 * smooth twilight winter sky + crisp pixel-art tree, cabin, lampposts,
 * snowman, growing gift pile, and interactive 8-bit participants.
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
  const { boostSnow, triggerChimeSound, triggerClickSound } = useFestiveAtmosphere();
  const [stageRef, size] = useElementSize<HTMLDivElement>();

  const stage = treeStage(total);
  const giftCount = stage >= 3 ? giftCountForMembers(total) : 0;
  const narrow = size.width > 0 && size.width < 640;

  // ---- Interactive scene states ----
  const [lightModeIdx, setLightModeIdx] = useState(0);
  const lightMode: TreeLightMode = TREE_LIGHT_MODES[lightModeIdx].id;
  const lightModeLabel = TREE_LIGHT_MODES[lightModeIdx].label;
  const [festoonOn, setFestoonOn] = useState(true);
  const [snowmanWiggle, setSnowmanWiggle] = useState(false);
  const [bursts, setBursts] = useState<SparkBurst[]>([]);
  const burstIdRef = useRef(0);

  const spawnBurst = useCallback(
    (x: number, y: number, colors = ["#ffe7a8", "#ffd266", "#ffffff"]) => {
      if (reducedMotion) return;
      const id = ++burstIdRef.current;
      setBursts((prev) => [...prev.slice(-4), { id, x, y, colors }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 700);
    },
    [reducedMotion]
  );

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

  // ---- Layout & shared pixel texel density ----
  const height = size.height;
  const width = size.width;
  const pxFront = narrow ? 2 : 3;
  const band = Math.round(height * (narrow ? 0.31 : 0.34));
  const groundTop = height - band;
  const treeBottom = groundTop + Math.round(band * 0.44);
  const treeW = PIXEL_TREE_W * pxFront;
  const treeH = PIXEL_TREE_H * pxFront;
  const treeTop = treeBottom - treeH;
  const maxVisible = narrow ? 16 : 30;

  const leftLampX = Math.max(26, Math.round(width * (narrow ? 0.11 : 0.14)));
  const rightLampX = Math.min(width - 26, Math.round(width * (narrow ? 0.89 : 0.86)));
  const lampY = groundTop + Math.round(band * 0.18);
  const snowmanX = narrow ? Math.round(width * 0.72) : Math.round(width * 0.67);
  const snowmanY = groundTop + Math.round(band * 0.14);
  const tableX = Math.round(width * (narrow ? 0.24 : 0.24));
  const tableY = groundTop + Math.round(band * 0.62);

  const slots = useMemo(() => {
    if (!width || !height) return [];
    return buildSlots({
      width,
      groundTop: groundTop + band * 0.29,
      groundBottom: height - 8,
      treeHalfWidth: Math.max(treeW * 0.56, 48 * pxFront * 0.52),
      spriteWidth: SPRITE_W * pxFront + (narrow ? 4 : 8),
      rows: narrow ? 2 : 3,
    });
  }, [width, height, groundTop, band, treeW, pxFront, narrow]);

  const capacity = Math.min(maxVisible, slots.length);
  const visible = participants.slice(0, capacity);
  const overflow = Math.max(0, total - visible.length);

  // ---- Waypoint stations for continuous looping buddy routines ----
  const stations = useMemo<VillageStation[]>(() => {
    if (!width || !height) return [];
    const marginX = SPRITE_W * pxFront * 0.7;
    const clampX = (vx: number) => Math.max(marginX, Math.min(width - marginX, Math.round(vx)));
    const clampY = (vy: number) =>
      Math.max(groundTop + band * 0.24, Math.min(height - 8, Math.round(vy)));

    const list: VillageStation[] = [
      {
        id: "table-left",
        x: clampX(tableX - 12 * pxFront),
        y: clampY(tableY + pxFront),
        flip: false,
        action: "sit",
        emojis: ["☕", "🍪", "✨"],
        isLandmark: true,
      },
      {
        id: "table-right",
        x: clampX(tableX + 12 * pxFront),
        y: clampY(tableY + pxFront),
        flip: true,
        action: "sit",
        emojis: ["☕", "❤️", "🎵"],
        isLandmark: true,
      },
      {
        id: "snowman-left",
        x: clampX(snowmanX - 16 * pxFront),
        y: clampY(snowmanY + 12 * pxFront),
        flip: false,
        action: "wave",
        emojis: ["❄️", "⛄", "✨"],
        isLandmark: true,
        triggersSnowman: true,
      },
      {
        id: "snowman-right",
        x: clampX(snowmanX + 16 * pxFront),
        y: clampY(snowmanY + 14 * pxFront),
        flip: true,
        action: "jump",
        emojis: ["❄️", "✨"],
        isLandmark: true,
        triggersSnowman: true,
      },
      {
        id: "tree-left",
        x: clampX(width / 2 - treeW * 0.62),
        y: clampY(treeBottom + 10 * pxFront),
        flip: false,
        action: "wave",
        emojis: ["🎄", "🎁", "✨"],
        isLandmark: true,
      },
      {
        id: "tree-right",
        x: clampX(width / 2 + treeW * 0.62),
        y: clampY(treeBottom + 10 * pxFront),
        flip: true,
        action: "idle",
        emojis: ["🎁", "✨", "❤️"],
        isLandmark: true,
      },
      {
        id: "tree-front",
        x: clampX(width / 2 + 6 * pxFront),
        y: clampY(treeBottom + 16 * pxFront),
        flip: true,
        action: "jump",
        emojis: ["🎁", "🎄"],
        isLandmark: true,
      },
      {
        id: "lamp-left",
        x: clampX(leftLampX + 13 * pxFront),
        y: clampY(lampY + 14 * pxFront),
        flip: true,
        action: "idle",
        emojis: ["🔥", "☕", "🎵"],
        isLandmark: true,
      },
      {
        id: "lamp-right",
        x: clampX(rightLampX - 13 * pxFront),
        y: clampY(lampY + 14 * pxFront),
        flip: false,
        action: "idle",
        emojis: ["🎵", "✨"],
        isLandmark: true,
      },
    ];

    if (width >= 520) {
      list.push({
        id: "cabin-front",
        x: clampX(Math.round(width * 0.74) + 12 * pxFront),
        y: clampY(groundTop + band * 0.28),
        flip: false,
        action: "wave",
        emojis: ["🏠", "☕", "✨"],
        isLandmark: true,
      });
    }

    // Add plaza gathering spots clear of the picnic table
    slots.forEach((slot, idx) => {
      const nearTable =
        Math.abs(slot.x - tableX) < PICNIC_TABLE_W * pxFront * 0.78 &&
        Math.abs(slot.y - tableY) < PICNIC_TABLE_H * pxFront * 1.1;
      if (nearTable) return;
      list.push({
        id: `plaza-${idx}`,
        x: Math.round(slot.x),
        y: Math.round(slot.y),
        flip: slot.flip ?? slot.x > width / 2,
        action: idx % 3 === 0 ? "wave" : "idle",
        emojis: ["☕", "🎁", "❄️", "🎵", "✨", "❤️"],
      });
    });

    return list;
  }, [
    width,
    height,
    pxFront,
    groundTop,
    band,
    tableX,
    tableY,
    snowmanX,
    snowmanY,
    treeW,
    treeBottom,
    leftLampX,
    rightLampX,
    lampY,
    slots,
  ]);

  // ---- Buddy choreography & interaction state ----
  const sizeKey = `${width}x${height}`;
  const [routinesState, setRoutinesState] = useState<{
    sizeKey: string;
    map: Record<string, BuddyRoutine>;
  }>({ sizeKey: "", map: {} });
  const routines = useMemo(
    () => (routinesState.sizeKey === sizeKey ? routinesState.map : {}),
    [routinesState, sizeKey]
  );
  const [clickActions, setClickActions] = useState<Record<string, BuddyAction>>({});
  const [speeches, setSpeeches] = useState<Record<string, string>>({});

  const clickCountsRef = useRef<Record<string, number>>({});
  const speechTimersRef = useRef<Record<string, number>>({});
  const actionTimersRef = useRef<Record<string, number>>({});
  const snowmanTimerRef = useRef<number | null>(null);
  const routinesRef = useRef<Record<string, BuddyRoutine>>({});
  const speechesRef = useRef<Record<string, string>>({});
  const enteringRef = useRef<Record<string, boolean>>({});
  const tickCountRef = useRef(0);

  useEffect(() => {
    routinesRef.current = routines;
  }, [routines]);

  useEffect(() => {
    speechesRef.current = speeches;
  }, [speeches]);

  useEffect(() => {
    enteringRef.current = entering;
  }, [entering]);

  useEffect(() => {
    const speechTimers = speechTimersRef.current;
    const actionTimers = actionTimersRef.current;
    return () => {
      Object.values(speechTimers).forEach((t) => window.clearTimeout(t));
      Object.values(actionTimers).forEach((t) => window.clearTimeout(t));
      if (snowmanTimerRef.current !== null) window.clearTimeout(snowmanTimerRef.current);
    };
  }, []);

  const homePositions = useMemo(() => {
    const map: Record<string, { x: number; y: number; flip: boolean; px: number }> = {};
    visible.forEach((p, i) => {
      const slot = slots[i];
      if (!slot) return;
      const px = pxFront;
      const { dx, dy } = seedJitter(p.seed, SPRITE_W * px);
      const x = slot.x + dx;
      const y = slot.y + dy;
      map[p.seed] = { x, y, flip: slot.flip ?? x > width / 2, px };
    });
    return map;
  }, [visible, slots, pxFront, width]);

  const visibleSeedsKey = visible.map((p) => p.seed).join(",");
  useEffect(() => {
    if (reducedMotion || !visibleSeedsKey || stations.length === 0) return;
    const seeds = visibleSeedsKey.split(",");

    const tick = window.setInterval(() => {
      if (document.hidden || celebrating) return;
      const now = Date.now();
      const step = ++tickCountRef.current;
      const prev = routinesRef.current;
      let changed = false;
      const next: Record<string, BuddyRoutine> = { ...prev };
      const claimed = new Set(
        Object.values(next).map((r) => r.stationId)
      );
      let triggerSnowman = false;

      seeds.forEach((seed, idx) => {
        const home = homePositions[seed];
        if (!home) return;

        let cur = next[seed];
        if (!cur) {
          cur = {
            x: home.x,
            y: home.y,
            flip: home.flip,
            action: "idle",
            walkMs: 0,
            walking: false,
            emoji: null,
            stationId: `home-${idx}`,
            phase: "acting",
            // Stagger start times so buddies begin strolling to activities within 0.4s-2.2s
            until: now + 350 + (idx % 5) * 450,
          };
          next[seed] = cur;
          changed = true;
          return;
        }

        if (enteringRef.current[seed] || speechesRef.current[seed]) return;
        if (now < cur.until) return;

        changed = true;
        if (cur.phase === "walking") {
          const st = stations.find((s) => s.id === cur.stationId);
          const emojiPool = st?.emojis ?? ["✨"];
          let flip = st?.flip ?? cur.flip;
          // Look toward a nearby acting neighbor when standing on plaza spots
          if (st && !st.isLandmark) {
            const neighbor = Object.entries(next).find(
              ([otherSeed, other]) =>
                otherSeed !== seed &&
                other.phase === "acting" &&
                Math.abs(other.x - cur.x) < 92 &&
                Math.abs(other.y - cur.y) < 34
            );
            if (neighbor) flip = cur.x > neighbor[1].x;
          }
          if (st?.triggersSnowman) triggerSnowman = true;

          const showEmoji = Math.random() < 0.72;
          const holdMs = (st?.action === "sit" ? 4200 : 3000) + Math.floor(Math.random() * 2400);
          next[seed] = {
            ...cur,
            walking: false,
            walkMs: 0,
            action: st?.action ?? "idle",
            flip,
            emoji: showEmoji
              ? emojiPool[(idx + step) % emojiPool.length] ?? ambientEmoji(seed, step)
              : null,
            phase: "acting",
            until: now + holdMs,
          };
        } else {
          // Pick a free station for the next routine loop
          claimed.delete(cur.stationId);
          const free = stations.filter((s) => s.id !== cur.stationId && !claimed.has(s.id));
          const freeLandmarks = free.filter((s) => s.isLandmark);
          const pool =
            freeLandmarks.length > 0 && Math.random() < 0.68
              ? freeLandmarks
              : free.length > 0
                ? free
                : stations.filter((s) => s.id !== cur.stationId);
          if (pool.length === 0) return;

          const target = pool[Math.floor(Math.random() * pool.length)];
          claimed.add(target.id);
          const dist = Math.hypot(target.x - cur.x, target.y - cur.y);
          const walkMs = Math.max(1100, Math.min(3400, Math.round(dist * 11)));
          next[seed] = {
            x: target.x,
            y: target.y,
            flip: target.x < cur.x,
            action: "walk",
            walkMs,
            walking: true,
            emoji: null,
            stationId: target.id,
            phase: "walking",
            until: now + walkMs,
          };
        }
      });

      if (triggerSnowman) {
        setSnowmanWiggle(true);
        if (snowmanTimerRef.current !== null) window.clearTimeout(snowmanTimerRef.current);
        snowmanTimerRef.current = window.setTimeout(() => setSnowmanWiggle(false), 1200);
      }

      if (changed) setRoutinesState({ sizeKey, map: next });
    }, 650);

    return () => window.clearInterval(tick);
  }, [visibleSeedsKey, reducedMotion, celebrating, stations, homePositions, sizeKey]);

  // ---- Interactive Handlers ----
  const handleCycleLightMode = useCallback(() => {
    setLightModeIdx((i) => (i + 1) % TREE_LIGHT_MODES.length);
    triggerChimeSound();
    if (width && height) {
      spawnBurst(width / 2, treeTop + treeH * 0.42, [
        "#ffe7a8",
        "#7ef2c8",
        "#ff8d7a",
        "#ffffff",
      ]);
    }
  }, [triggerChimeSound, width, height, treeTop, treeH, spawnBurst]);

  const handleToggleFestoon = useCallback(
    (side: "left" | "right") => {
      setFestoonOn((v) => !v);
      triggerClickSound();
      spawnBurst(
        side === "left" ? leftLampX : rightLampX,
        lampY - 26 * pxFront,
        ["#ffd66b", "#fff5bd"]
      );
    },
    [triggerClickSound, spawnBurst, leftLampX, rightLampX, lampY, pxFront]
  );

  const handleSnowmanClick = useCallback(() => {
    triggerClickSound();
    setSnowmanWiggle(true);
    spawnBurst(snowmanX, snowmanY - 12 * pxFront, ["#d8f0ff", "#ffffff", "#ffd66b"]);
    if (snowmanTimerRef.current !== null) window.clearTimeout(snowmanTimerRef.current);
    snowmanTimerRef.current = window.setTimeout(() => setSnowmanWiggle(false), 1300);
  }, [triggerClickSound, spawnBurst, snowmanX, snowmanY, pxFront]);

  const handleSelectBuddy = useCallback(
    (seed: string, clientX: number, clientY: number) => {
      triggerClickSound();
      const count = clickCountsRef.current[seed] ?? 0;
      clickCountsRef.current[seed] = count + 1;
      const line = buddyGreeting(seed, count);

      if (stageRef.current && clientX > 0 && clientY > 0) {
        const rect = stageRef.current.getBoundingClientRect();
        spawnBurst(clientX - rect.left, clientY - rect.top - 10, [
          "#ffe7a8",
          "#ff9b8a",
          "#ffffff",
        ]);
      }

      if (actionTimersRef.current[seed]) {
        window.clearTimeout(actionTimersRef.current[seed]);
      }
      if (speechTimersRef.current[seed]) {
        window.clearTimeout(speechTimersRef.current[seed]);
      }

      setClickActions((a) => ({ ...a, [seed]: "jump" }));
      setSpeeches((s) => ({ ...s, [seed]: line }));

      actionTimersRef.current[seed] = window.setTimeout(() => {
        setClickActions((a) => {
          const next = { ...a };
          delete next[seed];
          return next;
        });
      }, 1200);

      speechTimersRef.current[seed] = window.setTimeout(() => {
        setSpeeches((s) => {
          const next = { ...s };
          delete next[seed];
          return next;
        });
      }, 3600);
    },
    [triggerClickSound, spawnBurst, stageRef]
  );

  const verifiedCount = useMemo(
    () => participants.filter((p) => p.verified).length,
    [participants]
  );
  const pendingCount = Math.max(0, total - verifiedCount);

  return (
    <section aria-labelledby="join-scene-title" className="relative">
      <h2 id="join-scene-title" className="sr-only">
        ต้นคริสต์มาสของกลุ่ม: มีผู้ลงทะเบียน {total} คน
      </h2>

      <div
        ref={stageRef}
        className={`join-scene relative overflow-hidden rounded-[1.75rem] border border-white/12 shadow-[var(--shadow-card-lifted)] ${
          compact ? "h-[280px] sm:h-[320px]" : "h-[340px] sm:h-[420px] lg:h-[480px]"
        }`}
        data-celebrating={celebrating}
      >
        {/* Layer 1-2: Smooth atmospheric night sky, aurora, moon, mountains & far pines */}
        <WinterScene variant="join" showMoon showAurora />

        {/* Occasional shooting star across upper sky */}
        {!reducedMotion && (
          <div
            aria-hidden="true"
            className="px-shooting-star pointer-events-none absolute top-[14%] left-[22%] h-[2px] w-16 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,248,225,0.95))]"
          />
        )}

        {/* Layer 4: Moonlit twilight snowfield + HD-2D warm light pools */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,#1c3550_0%,#244262_45%,#15273c_100%)]"
          style={{ height: band }}
        >
          {/* Moonlit snow crest separating hills from foreground plaza */}
          <svg
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 -top-5 h-7 w-full"
          >
            <path
              d="M 0 32 C 160 12 320 26 480 20 S 820 8 980 24 S 1260 32 1440 16 L 1440 48 L 0 48 Z"
              fill="#1c3550"
            />
            <path
              d="M 0 32 C 160 12 320 26 480 20 S 820 8 980 24 S 1260 32 1440 16"
              fill="none"
              stroke="#6e98c2"
              strokeOpacity={0.62}
              strokeWidth={2}
            />
          </svg>

          {/* Subtle pixel plaza stepping ring beneath the tree */}
          {width > 0 && (
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full border border-[#7aa2ca]/18 bg-[#2a4a6b]/35"
              style={{
                top: Math.round(band * 0.25),
                width: Math.min(width * 0.72, treeW * 2.5),
                height: Math.round(band * 0.56),
              }}
            />
          )}

          {/* Warm golden snow pool beneath the Christmas tree */}
          {stage >= 2 && (
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full transition-opacity duration-700"
              style={{
                top: Math.round(band * 0.16),
                width: treeW * 2.2,
                height: Math.round(band * 0.68),
                opacity: stage >= 5 ? 0.95 : 0.65,
                background:
                  lightMode === "aurora"
                    ? "radial-gradient(ellipse, rgba(110,235,195,0.28) 0%, rgba(120,180,255,0.1) 48%, transparent 74%)"
                    : "radial-gradient(ellipse, rgba(255,212,116,0.34) 0%, rgba(255,168,76,0.12) 48%, transparent 74%)",
              }}
            />
          )}
        </div>

        {/* Layer 5-6: Pixel Village Stage (all strictly aligned to pxFront) */}
        {height > 0 && width > 0 && (
          <>
            <PixelFenceAndShrubs
              px={pxFront}
              side="left"
              className="absolute"
              style={{ left: 6, top: groundTop - 7 * pxFront, zIndex: Math.round(groundTop) - 15 }}
            />
            <PixelFenceAndShrubs
              px={pxFront}
              side="right"
              className="absolute"
              style={{ right: 6, top: groundTop - 7 * pxFront, zIndex: Math.round(groundTop) - 15 }}
            />

            {width >= 520 && (
              <PixelCabin
                px={pxFront}
                className="absolute"
                style={{
                  left: Math.round(width * 0.74),
                  top: groundTop + Math.round(band * 0.1) - 26 * pxFront,
                  zIndex: Math.round(groundTop) - 10,
                }}
              />
            )}

            <FestoonStringLights
              width={width}
              leftX={leftLampX}
              rightX={rightLampX}
              lampTopY={lampY - 27 * pxFront}
              treeAnchorY={treeTop + 22 * pxFront}
              lit={festoonOn}
              lightMode={lightMode}
              px={pxFront}
            />

            <PixelLamppost
              px={pxFront}
              lit={festoonOn}
              side="left"
              onToggle={() => handleToggleFestoon("left")}
              className="absolute"
              style={{
                left: leftLampX - 5 * pxFront,
                top: lampY - 32 * pxFront,
                zIndex: Math.round(lampY),
              }}
            />
            <PixelLamppost
              px={pxFront}
              lit={festoonOn}
              side="right"
              onToggle={() => handleToggleFestoon("right")}
              className="absolute"
              style={{
                left: rightLampX - 5 * pxFront,
                top: lampY - 32 * pxFront,
                zIndex: Math.round(lampY),
              }}
            />

            <PixelSnowman
              px={pxFront}
              wiggling={snowmanWiggle}
              onClick={handleSnowmanClick}
              className="absolute"
              style={{
                left: snowmanX - 8 * pxFront,
                top: snowmanY - 22 * pxFront,
                zIndex: Math.round(snowmanY),
              }}
            />

            <PixelChristmasTree
              stage={stage}
              lightMode={lightMode}
              celebrating={celebrating}
              px={pxFront}
              onCycleLightMode={handleCycleLightMode}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                top: treeTop,
                zIndex: Math.round(treeBottom),
              }}
            />

            <PixelGiftPile
              count={giftCount}
              px={pxFront}
              centerX={width / 2}
              treeBottomY={treeBottom + pxFront}
              zIndex={Math.round(treeBottom)}
            />

            <PixelPicnicTable
              px={pxFront}
              className="absolute"
              style={{
                left: tableX - Math.round((PICNIC_TABLE_W * pxFront) / 2),
                top: tableY - PICNIC_TABLE_H * pxFront,
                zIndex: Math.round(tableY) + 1000,
              }}
            />
          </>
        )}

        {/* Y-sorted interactive 8-bit buddies with looping village routines */}
        {visible.map((p, i) => {
          const home = homePositions[p.seed];
          if (!home) return null;
          const routine = routines[p.seed];
          const x = routine ? routine.x : home.x;
          const y = routine ? routine.y : home.y;
          const isEntering = Boolean(entering[p.seed]);
          const isYou = mySeed === p.seed;
          const action: BuddyAction =
            clickActions[p.seed] ??
            (celebrating ? "jump" : (routine?.action ?? "idle"));

          return (
            <PixelBuddy
              key={p.seed}
              seed={p.seed}
              x={x}
              y={y}
              px={home.px}
              zIndex={Math.round(y) + (y > treeBottom ? 1000 : 0) + (routine?.action === "sit" ? 5 : 0)}
              action={action}
              flip={routine ? routine.flip : home.flip}
              walkMs={routine?.walkMs ?? 0}
              isWalking={Boolean(routine?.walking && !clickActions[p.seed])}
              entering={isEntering}
              enterFrom={entranceOffset(x, width)}
              pending={!p.verified}
              isYou={isYou}
              welcome={isEntering ? (isYou ? "สวัสดีทุกคน!" : "ยินดีต้อนรับ!") : null}
              speech={speeches[p.seed] ?? null}
              emoji={routine?.emoji ?? null}
              bobDelay={(i * 0.37) % 1.6}
              onSelect={handleSelectBuddy}
            />
          );
        })}

        {/* Layer 7: Subtle foreground parallax snowfall + interactive sparkle bursts */}
        {!reducedMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2600] overflow-hidden">
            {STAGE_FLAKES.map((f, i) => (
              <span
                key={i}
                className="px-stage-flake absolute top-0 rounded-[1px] bg-white/85"
                style={
                  {
                    left: f.left,
                    width: f.size,
                    height: f.size,
                    "--flake-dur": f.dur,
                    "--flake-delay": f.delay,
                    "--flake-drift": f.drift,
                    "--flake-o": f.opacity,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        )}

        {bursts.map((b) => (
          <div
            key={b.id}
            aria-hidden="true"
            className="pointer-events-none absolute z-[3500]"
            style={{ left: b.x, top: b.y }}
          >
            {SPARK_OFFSETS.map(([sx, sy], idx) => (
              <span
                key={idx}
                className="px-spark-particle absolute block h-1.5 w-1.5 rounded-[1px]"
                style={
                  {
                    background: b.colors[idx % b.colors.length],
                    "--sx": `${sx}px`,
                    "--sy": `${sy}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        ))}

        {/* Layer 8: Minimal HUD (Icon-only light mode button + Overflow badge) */}
        <div className="absolute top-3 right-3 z-[3000] flex items-center gap-2">
          <button
            type="button"
            onClick={handleCycleLightMode}
            aria-label={`เปลี่ยนโหมดไฟต้นคริสต์มาส (ปัจจุบัน: ${lightModeLabel})`}
            title={`โหมดไฟ: ${lightModeLabel}`}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0d192b]/80 text-primary shadow-lg backdrop-blur-sm transition hover:border-primary/50 hover:bg-[#13243d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <LightModeIcon mode={lightMode} />
          </button>

          {overflow > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-ivory/95 py-1 pr-3 pl-1.5 text-xs font-bold text-ink shadow-lg">
              <span aria-hidden="true" className="flex -space-x-1.5">
                {["#c5343b", "#2f8a5b", "#3b6fb6"].map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-full border-2 border-ivory"
                    style={{ background: c }}
                  />
                ))}
              </span>
              +{overflow} คน
            </div>
          )}
        </div>

        {total === 0 && (
          <div className="absolute inset-x-0 bottom-4 z-[3000] flex justify-center px-4">
            <p className="rounded-full border border-white/15 bg-[#0e1c30]/90 px-4 py-1.5 text-center text-xs font-semibold text-ivory shadow-lg backdrop-blur-sm sm:text-sm">
              ยังไม่มีใครมาที่ต้นไม้นี้ — มาเป็นคนแรกกันเถอะ!
            </p>
          </div>
        )}

        {celebrating && (
          <div className="pointer-events-none absolute inset-0 z-[4000]">
            {!reducedMotion &&
              CELEBRATION_SPARKS.map((s, i) => (
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
                  <path
                    d="M0 -8 L1.8 -1.8 L8 0 L1.8 1.8 L0 8 L-1.8 1.8 L-8 0 L-1.8 -1.8 Z"
                    fill={s.color}
                  />
                </svg>
              ))}
            <div className="absolute inset-x-0 top-5 flex justify-center px-4 sm:top-8">
              <div className="celebration-banner pointer-events-auto flex items-center gap-3 rounded-2xl border border-primary/60 bg-[linear-gradient(180deg,#8a1f26,#5e1418)] px-5 py-3 text-center text-ivory shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),0_0_40px_rgba(255,210,122,0.35)]">
                <Sparkles className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-display-en text-lg font-semibold tracking-wide sm:text-2xl">
                    CHRISTMAS MAGIC UNLOCKED!
                  </p>
                  <p className="text-xs text-ivory/85 sm:text-sm">
                    ครบ 5 คนแล้ว ต้นคริสต์มาสของเราสมบูรณ์!
                  </p>
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

      <TreeProgress
        total={total}
        verifiedCount={verifiedCount}
        pendingCount={pendingCount}
      />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

function TreeProgress({
  total,
  verifiedCount,
  pendingCount,
}: {
  total: number;
  verifiedCount: number;
  pendingCount: number;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
      <span className="font-display text-3xl leading-none text-text-primary">{total}</span>
      <span className="text-sm text-text-secondary">คนลงทะเบียนแล้ว</span>

      {total > 0 && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="rounded-full border border-emerald-400/25 bg-emerald-500/12 px-2 py-0.5 font-medium text-emerald-300">
            ยืนยันแล้ว {verifiedCount}
          </span>
          {pendingCount > 0 && (
            <span className="rounded-full border border-amber-300/25 bg-amber-400/12 px-2 py-0.5 font-medium text-amber-200">
              รอยืนยัน {pendingCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
