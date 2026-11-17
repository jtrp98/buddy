"use client";

import { useEffect, useRef } from "react";
import { createPile, deposit, heightAt, melt, relax, totalSnow, COL_W, type SnowPile } from "@/lib/snow-pile";

export type SnowIntensity = "high" | "medium" | "low";

/** Window event used to make the snow briefly heavier (celebrations, reveals). */
export const SNOW_BOOST_EVENT = "buddy-snow-boost";

export function dispatchSnowBoost(durationMs = 4000) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SNOW_BOOST_EVENT, { detail: durationMs }));
}

interface Flake {
  x: number;
  y: number;
  r: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  alpha: number;
  layer: 0 | 1 | 2;
  extra: boolean;
  active: boolean;
}

const BASE_COUNT: Record<SnowIntensity, number> = { high: 170, medium: 115, low: 48 };

// Layer recipes: far, middle and near snow.
const LAYERS = [
  { share: 0.55, r: [1.2, 2.4], speed: [16, 30], alpha: [0.35, 0.6], sway: [6, 14] },
  { share: 0.37, r: [2.4, 3.8], speed: [30, 52], alpha: [0.65, 0.88], sway: [10, 22] },
  { share: 0.08, r: [4.5, 7], speed: [58, 90], alpha: [0.72, 0.92], sway: [16, 30] },
] as const;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** A pre-rendered soft snow disc per layer — drawImage is far cheaper than shadowBlur. */
function makeSprite(softness: number) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(softness, "rgba(248,250,252,0.9)");
  g.addColorStop(1, "rgba(216,232,239,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  return c;
}

function createFlake(width: number, height: number, layer: 0 | 1 | 2, extra: boolean, spreadY: boolean): Flake {
  const recipe = LAYERS[layer];
  return {
    x: Math.random() * width,
    y: spreadY ? Math.random() * height : rand(-40, -8),
    r: rand(recipe.r[0], recipe.r[1]),
    speed: rand(recipe.speed[0], recipe.speed[1]),
    swayAmp: rand(recipe.sway[0], recipe.sway[1]),
    swayFreq: rand(0.25, 0.7),
    phase: Math.random() * Math.PI * 2,
    alpha: rand(recipe.alpha[0], recipe.alpha[1]),
    layer,
    extra,
    active: !extra,
  };
}

/** A clump of settled snow knocked loose when the page scrolls. */
interface Clump {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const MAX_CLUMPS = 140;
const MELT_MS = 650;

function pickLayer(): 0 | 1 | 2 {
  const roll = Math.random();
  if (roll < LAYERS[0].share) return 0;
  if (roll < LAYERS[0].share + LAYERS[1].share) return 1;
  return 2;
}

/**
 * Full-viewport snowfall on a single canvas. Three depth layers with varied
 * size, speed, sway and a slowly changing wind. Flakes slowly pile up along the
 * bottom edge of the screen; scrolling knocks the pile loose and it slides away.
 * Never intercepts input.
 */
export function SnowCanvas({ intensity }: { intensity: SnowIntensity }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprites = [makeSprite(0.35), makeSprite(0.5), makeSprite(0.28)];
    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let boostUntil = 0;
    let pile: SnowPile = createPile(window.innerWidth, window.innerHeight);
    let pileGradient: CanvasGradient | null = null;
    let meltUntil = 0;
    let clumps: Clump[] = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const areaScale = Math.min(Math.max((width * height) / (1440 * 900), 0.42), 1.3);
      const count = Math.round(BASE_COUNT[intensity] * areaScale);
      const extraCount = Math.round(count * 0.7);
      flakes = [];
      for (let i = 0; i < count; i++) flakes.push(createFlake(width, height, pickLayer(), false, true));
      for (let i = 0; i < extraCount; i++) flakes.push(createFlake(width, height, pickLayer(), true, false));

      pile = createPile(width, height);
      clumps = [];
      pileGradient = ctx.createLinearGradient(0, height - pile.maxHeight, 0, height);
      pileGradient.addColorStop(0, "rgba(255,255,255,0.97)");
      pileGradient.addColorStop(0.55, "rgba(238,244,247,0.96)");
      pileGradient.addColorStop(1, "rgba(206,221,230,0.95)");
    };

    /** Scroll knocks the pile loose: it breaks into clumps that tumble off-screen. */
    const knockLoose = () => {
      const now = performance.now();
      if (now < meltUntil || totalSnow(pile) < 4) return;
      meltUntil = now + MELT_MS;
      const h = pile.heights;
      for (let i = 0; i < h.length && clumps.length < MAX_CLUMPS; i += 2) {
        if (h[i] < 2.5) continue;
        const pieces = h[i] > pile.maxHeight * 0.5 ? 2 : 1;
        for (let p = 0; p < pieces; p++) {
          clumps.push({
            x: i * COL_W + rand(-2, 2),
            y: height - rand(0, h[i]),
            vx: rand(-40, 40),
            vy: rand(-90, -15),
            r: rand(1.4, 3.4),
          });
        }
      }
    };

    const drawPile = () => {
      const h = pile.heights;
      if (totalSnow(pile) < 1) return;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, height - h[0]);
      for (let i = 0; i < h.length - 1; i++) {
        const x = i * COL_W;
        ctx.quadraticCurveTo(x, height - h[i], x + COL_W / 2, height - (h[i] + h[i + 1]) / 2);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = pileGradient ?? "#f4f8fa";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      elapsed += dt;
      const boosted = now < boostUntil;
      const speedMul = boosted ? 1.3 : 1;
      const wind = Math.sin(elapsed * 0.07) * 10 + Math.sin(elapsed * 0.023) * 6;

      ctx.clearRect(0, 0, width, height);
      for (const f of flakes) {
        if (!f.active) {
          if (f.extra && boosted && Math.random() < 0.06) {
            Object.assign(f, createFlake(width, height, f.layer, true, false), { active: true });
          } else {
            continue;
          }
        }
        f.y += f.speed * speedMul * dt;
        f.x += wind * (0.4 + f.layer * 0.3) * dt;
        const sx = f.x + Math.sin(elapsed * f.swayFreq + f.phase) * f.swayAmp;
        // Settle onto the pile at the bottom of the screen.
        const melting = now < meltUntil;
        if (!melting && sx >= 0 && sx <= width && f.y + f.r * 0.5 >= height - heightAt(pile, sx)) {
          deposit(pile, sx, f.r);
          if (f.extra && !boosted) {
            f.active = false;
            continue;
          }
          f.y = rand(-30, -6);
          f.x = Math.random() * width;
          continue;
        }
        if (f.y - f.r > height) {
          if (f.extra && !boosted) {
            f.active = false;
            continue;
          }
          f.y = rand(-30, -6);
          f.x = Math.random() * width;
        }
        if (f.x < -40) f.x += width + 80;
        if (f.x > width + 40) f.x -= width + 80;
        const d = f.r * 2;
        ctx.globalAlpha = f.alpha;
        ctx.drawImage(sprites[f.layer], sx - f.r, f.y - f.r, d, d);
      }
      ctx.globalAlpha = 1;

      if (now < meltUntil) {
        melt(pile, 0.84);
      } else {
        relax(pile);
      }
      drawPile();

      if (clumps.length) {
        const next: Clump[] = [];
        for (const c of clumps) {
          c.vy += 520 * dt;
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          if (c.y - c.r > height) continue;
          ctx.globalAlpha = 0.95;
          ctx.drawImage(sprites[1], c.x - c.r, c.y - c.r, c.r * 2, c.r * 2);
          next.push(c);
        }
        ctx.globalAlpha = 1;
        clumps = next;
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    };
    const onBoost = (e: Event) => {
      const ms = Number((e as CustomEvent<number>).detail) || 4000;
      boostUntil = performance.now() + ms;
    };

    build();
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    window.addEventListener(SNOW_BOOST_EVENT, onBoost);
    // Any scroll gesture (also on pages too short to actually scroll) shakes the pile loose.
    const scrollOpts: AddEventListenerOptions = { passive: true };
    window.addEventListener("scroll", knockLoose, scrollOpts);
    window.addEventListener("wheel", knockLoose, scrollOpts);
    window.addEventListener("touchmove", knockLoose, scrollOpts);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener(SNOW_BOOST_EVENT, onBoost);
      window.removeEventListener("scroll", knockLoose);
      window.removeEventListener("wheel", knockLoose);
      window.removeEventListener("touchmove", knockLoose);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 select-none"
    />
  );
}
