"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { playAnalogClick, playFestiveChime, playStampSound } from "@/lib/sound";

interface FestiveAtmosphereContextValue {
  festiveFx: boolean;
  toggleFestiveFx: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  triggerClickSound: () => void;
  triggerStampSound: () => void;
  triggerChimeSound: () => void;
}

const FestiveAtmosphereContext = createContext<FestiveAtmosphereContextValue>({
  festiveFx: true,
  toggleFestiveFx: () => {},
  soundEnabled: false,
  toggleSound: () => {},
  triggerClickSound: () => {},
  triggerStampSound: () => {},
  triggerChimeSound: () => {},
});

export function useFestiveAtmosphere() {
  return useContext(FestiveAtmosphereContext);
}

type SnowIntensity = "high" | "medium" | "low";

interface SnowParticle {
  left: string;
  size: number;
  delay: string;
  duration: string;
  sway: string;
  drift: string;
  opacity: number;
  mobileVisible: boolean;
  kind: "orb" | "crystal";
}

// Layer 1: Background Snow (4-6px, slow, soft blur for depth)
const BACK_SNOW: readonly SnowParticle[] = [
  { left: "3%", size: 4, delay: "-2s", duration: "21s", sway: "14px", drift: "-10px", opacity: 0.55, mobileVisible: true, kind: "orb" },
  { left: "8%", size: 5, delay: "-11s", duration: "24s", sway: "-16px", drift: "12px", opacity: 0.5, mobileVisible: false, kind: "orb" },
  { left: "13%", size: 6, delay: "-6s", duration: "19s", sway: "18px", drift: "-14px", opacity: 0.62, mobileVisible: true, kind: "orb" },
  { left: "19%", size: 4, delay: "-15s", duration: "22s", sway: "-12px", drift: "10px", opacity: 0.48, mobileVisible: false, kind: "orb" },
  { left: "24%", size: 5, delay: "-4s", duration: "20s", sway: "16px", drift: "-12px", opacity: 0.58, mobileVisible: true, kind: "orb" },
  { left: "30%", size: 6, delay: "-17s", duration: "23s", sway: "-18px", drift: "14px", opacity: 0.6, mobileVisible: false, kind: "orb" },
  { left: "36%", size: 4, delay: "-8s", duration: "25s", sway: "12px", drift: "-8px", opacity: 0.48, mobileVisible: true, kind: "orb" },
  { left: "42%", size: 5, delay: "-13s", duration: "18.5s", sway: "-14px", drift: "12px", opacity: 0.56, mobileVisible: false, kind: "orb" },
  { left: "47%", size: 6, delay: "-1s", duration: "21.5s", sway: "18px", drift: "-14px", opacity: 0.64, mobileVisible: true, kind: "orb" },
  { left: "53%", size: 4, delay: "-10s", duration: "24.5s", sway: "-15px", drift: "10px", opacity: 0.5, mobileVisible: false, kind: "orb" },
  { left: "58%", size: 5, delay: "-5s", duration: "19.5s", sway: "14px", drift: "-12px", opacity: 0.58, mobileVisible: true, kind: "orb" },
  { left: "64%", size: 6, delay: "-16s", duration: "22.5s", sway: "-18px", drift: "16px", opacity: 0.62, mobileVisible: false, kind: "orb" },
  { left: "69%", size: 4, delay: "-7s", duration: "20.5s", sway: "12px", drift: "-10px", opacity: 0.48, mobileVisible: true, kind: "orb" },
  { left: "75%", size: 5, delay: "-14s", duration: "23.5s", sway: "-16px", drift: "14px", opacity: 0.55, mobileVisible: false, kind: "orb" },
  { left: "80%", size: 6, delay: "-3s", duration: "18s", sway: "16px", drift: "-12px", opacity: 0.62, mobileVisible: true, kind: "orb" },
  { left: "86%", size: 5, delay: "-12s", duration: "21s", sway: "-14px", drift: "10px", opacity: 0.52, mobileVisible: false, kind: "orb" },
  { left: "91%", size: 4, delay: "-9s", duration: "24s", sway: "15px", drift: "-11px", opacity: 0.5, mobileVisible: true, kind: "orb" },
  { left: "96%", size: 6, delay: "-18s", duration: "19s", sway: "-16px", drift: "12px", opacity: 0.6, mobileVisible: false, kind: "orb" },
];

// Layer 2: Midground Snow (7-11px, crisp visible orbs & crystal flakes)
const MID_SNOW: readonly SnowParticle[] = [
  { left: "4%", size: 8, delay: "-1s", duration: "13.5s", sway: "24px", drift: "16px", opacity: 0.84, mobileVisible: true, kind: "orb" },
  { left: "10%", size: 10, delay: "-8s", duration: "15.5s", sway: "-22px", drift: "-14px", opacity: 0.88, mobileVisible: false, kind: "crystal" },
  { left: "15%", size: 7, delay: "-4s", duration: "12.5s", sway: "20px", drift: "18px", opacity: 0.78, mobileVisible: true, kind: "orb" },
  { left: "21%", size: 11, delay: "-11s", duration: "16s", sway: "-26px", drift: "-18px", opacity: 0.86, mobileVisible: true, kind: "crystal" },
  { left: "27%", size: 8, delay: "-6s", duration: "14s", sway: "22px", drift: "14px", opacity: 0.82, mobileVisible: false, kind: "orb" },
  { left: "33%", size: 9, delay: "-13s", duration: "15s", sway: "-20px", drift: "-12px", opacity: 0.85, mobileVisible: true, kind: "orb" },
  { left: "39%", size: 11, delay: "-2.5s", duration: "16.5s", sway: "28px", drift: "20px", opacity: 0.9, mobileVisible: false, kind: "crystal" },
  { left: "45%", size: 7, delay: "-9.5s", duration: "13s", sway: "-24px", drift: "-16px", opacity: 0.78, mobileVisible: true, kind: "orb" },
  { left: "51%", size: 10, delay: "-5s", duration: "14.5s", sway: "22px", drift: "15px", opacity: 0.88, mobileVisible: false, kind: "crystal" },
  { left: "57%", size: 8, delay: "-12s", duration: "15.8s", sway: "-26px", drift: "-18px", opacity: 0.82, mobileVisible: true, kind: "orb" },
  { left: "63%", size: 11, delay: "-3.5s", duration: "16.2s", sway: "24px", drift: "16px", opacity: 0.9, mobileVisible: true, kind: "crystal" },
  { left: "68%", size: 7, delay: "-10.5s", duration: "12.8s", sway: "-18px", drift: "-12px", opacity: 0.76, mobileVisible: false, kind: "orb" },
  { left: "74%", size: 9, delay: "-7s", duration: "14.2s", sway: "26px", drift: "18px", opacity: 0.86, mobileVisible: true, kind: "orb" },
  { left: "79%", size: 10, delay: "-14s", duration: "15.2s", sway: "-22px", drift: "-14px", opacity: 0.88, mobileVisible: false, kind: "crystal" },
  { left: "85%", size: 8, delay: "-2s", duration: "13.2s", sway: "20px", drift: "15px", opacity: 0.8, mobileVisible: true, kind: "orb" },
  { left: "90%", size: 11, delay: "-8.5s", duration: "16.5s", sway: "-24px", drift: "-16px", opacity: 0.9, mobileVisible: false, kind: "crystal" },
  { left: "95%", size: 8, delay: "-4.5s", duration: "13.8s", sway: "18px", drift: "12px", opacity: 0.82, mobileVisible: true, kind: "orb" },
];

// Layer 3: Foreground Snow (12-18px, limited crisp luminous crystal snowflakes)
const FORE_SNOW: readonly SnowParticle[] = [
  { left: "7%", size: 15, delay: "-1.5s", duration: "11.5s", sway: "-30px", drift: "22px", opacity: 0.92, mobileVisible: true, kind: "crystal" },
  { left: "18%", size: 13, delay: "-7.5s", duration: "13s", sway: "28px", drift: "-20px", opacity: 0.86, mobileVisible: false, kind: "crystal" },
  { left: "29%", size: 17, delay: "-4s", duration: "12.2s", sway: "-34px", drift: "26px", opacity: 0.94, mobileVisible: true, kind: "crystal" },
  { left: "41%", size: 12, delay: "-9.5s", duration: "11s", sway: "24px", drift: "-18px", opacity: 0.84, mobileVisible: false, kind: "crystal" },
  { left: "54%", size: 16, delay: "-2.8s", duration: "12.8s", sway: "-28px", drift: "20px", opacity: 0.92, mobileVisible: false, kind: "crystal" },
  { left: "66%", size: 18, delay: "-6.2s", duration: "13.6s", sway: "32px", drift: "-24px", opacity: 0.95, mobileVisible: true, kind: "crystal" },
  { left: "78%", size: 14, delay: "-10.5s", duration: "11.8s", sway: "-26px", drift: "18px", opacity: 0.88, mobileVisible: false, kind: "crystal" },
  { left: "89%", size: 16, delay: "-3.8s", duration: "12.5s", sway: "30px", drift: "-22px", opacity: 0.9, mobileVisible: true, kind: "crystal" },
];

const FX_STORAGE_KEY = "buddy_festive_fx";
const SOUND_STORAGE_KEY = "buddy_sound_fx";
const PREFS_EVENT = "buddy-festive-prefs-change";

function subscribePrefs(callback: () => void) {
  window.addEventListener(PREFS_EVENT, callback);
  window.addEventListener("storage", callback);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => {
    window.removeEventListener(PREFS_EVENT, callback);
    window.removeEventListener("storage", callback);
    mq.removeEventListener("change", callback);
  };
}

function getFxSnapshot(): boolean {
  try {
    const saved = window.localStorage.getItem(FX_STORAGE_KEY);
    if (saved !== null) return saved === "1";
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return true;
  }
}

function getSoundSnapshot(): boolean {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getHiddenSnapshot(): boolean {
  return typeof document !== "undefined" ? document.hidden : false;
}

function getRouteIntensity(pathname: string | null): SnowIntensity {
  if (!pathname || pathname === "/" || pathname.startsWith("/buddy")) {
    return "high";
  }
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/register")
  ) {
    return "medium";
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/dev")) {
    return "low";
  }
  return "medium";
}

function CrystalSnowflakeSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="block drop-shadow-[0_0_5px_rgba(220,239,245,0.7)]"
    >
      <g stroke="#FFF9F0" strokeWidth="1.75" strokeLinecap="round">
        <path d="M12 2v20M3.34 7l17.32 10M20.66 7L3.34 17" />
        <path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" strokeWidth="1.3" />
        <path d="M5.5 10.5 8 9l-1-2.8M18.5 13.5 16 15l1 2.8" strokeWidth="1.3" />
        <path d="M18.5 10.5 16 9l1-2.8M5.5 13.5 8 15l-1 2.8" strokeWidth="1.3" />
      </g>
      <circle cx="12" cy="12" r="2" fill="#DCEFF5" />
    </svg>
  );
}

function SnowParticleElement({
  flake,
  layerClass,
  blur = false,
}: {
  flake: SnowParticle;
  layerClass: string;
  blur?: boolean;
}) {
  const responsiveClass = flake.mobileVisible ? "block" : "hidden sm:block";

  return (
    <span
      className={`${layerClass} ${responsiveClass} absolute -top-8 will-change-transform`}
      style={{
        left: flake.left,
        animationDelay: flake.delay,
        animationDuration: flake.duration,
        ["--snow-sway" as string]: flake.sway,
        ["--snow-drift" as string]: flake.drift,
        ["--snow-opacity" as string]: String(flake.opacity),
      }}
    >
      {flake.kind === "crystal" ? (
        <CrystalSnowflakeSvg size={flake.size} />
      ) : (
        <span
          className={`block rounded-full ${blur ? "blur-[0.9px]" : ""}`}
          style={{
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            background:
              "radial-gradient(circle at 35% 35%, #FFF9F0 0%, #DCEFF5 70%, rgba(220,239,245,0.2) 100%)",
            boxShadow: blur
              ? "0 0 6px rgba(220, 239, 245, 0.45)"
              : "0 0 8px rgba(255, 249, 240, 0.65)",
          }}
        />
      )}
    </span>
  );
}

function SnowfallOverlay() {
  const pathname = usePathname();
  const isTabHidden = useSyncExternalStore(
    subscribeVisibility,
    getHiddenSnapshot,
    () => false
  );
  const intensity = getRouteIntensity(pathname);

  const backList = intensity === "low" ? BACK_SNOW.filter((_, i) => i % 2 === 0) : BACK_SNOW;
  const midList =
    intensity === "low"
      ? MID_SNOW.filter((_, i) => i % 3 === 0)
      : intensity === "medium"
        ? MID_SNOW.filter((_, i) => i % 4 !== 1)
        : MID_SNOW;
  const foreList =
    intensity === "low"
      ? []
      : intensity === "medium"
        ? FORE_SNOW.filter((_, i) => i % 2 === 0)
        : FORE_SNOW;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-20 overflow-hidden select-none ${
        isTabHidden ? "snow-paused" : ""
      }`}
    >
      {/* Layer 1: Atmospheric Background Snow */}
      {backList.map((flake, idx) => (
        <SnowParticleElement
          key={`back-${idx}`}
          flake={flake}
          layerClass="snow-layer-back"
          blur
        />
      ))}

      {/* Layer 2: Crisp Midground Snow */}
      {midList.map((flake, idx) => (
        <SnowParticleElement
          key={`mid-${idx}`}
          flake={flake}
          layerClass="snow-layer-mid"
        />
      ))}

      {/* Layer 3: Prominent Foreground Crystal Snowflakes */}
      {foreList.map((flake, idx) => (
        <SnowParticleElement
          key={`fore-${idx}`}
          flake={flake}
          layerClass="snow-layer-fore"
        />
      ))}
    </div>
  );
}

export function FestiveAtmosphereProvider({ children }: { children: ReactNode }) {
  const festiveFx = useSyncExternalStore(subscribePrefs, getFxSnapshot, () => true);
  const soundEnabled = useSyncExternalStore(subscribePrefs, getSoundSnapshot, () => false);

  const toggleFestiveFx = useCallback(() => {
    const next = !getFxSnapshot();
    try {
      window.localStorage.setItem(FX_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(PREFS_EVENT));
    if (getSoundSnapshot()) playAnalogClick(next ? 760 : 520);
  }, []);

  const toggleSound = useCallback(() => {
    const next = !getSoundSnapshot();
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, next ? "1" : "0");
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(PREFS_EVENT));
    if (next) {
      playFestiveChime();
    }
  }, []);

  const triggerClickSound = useCallback(() => {
    if (soundEnabled) playAnalogClick();
  }, [soundEnabled]);

  const triggerStampSound = useCallback(() => {
    if (soundEnabled) playStampSound();
  }, [soundEnabled]);

  const triggerChimeSound = useCallback(() => {
    if (soundEnabled) playFestiveChime();
  }, [soundEnabled]);

  return (
    <FestiveAtmosphereContext.Provider
      value={{
        festiveFx,
        toggleFestiveFx,
        soundEnabled,
        toggleSound,
        triggerClickSound,
        triggerStampSound,
        triggerChimeSound,
      }}
    >
      {festiveFx && (
        <Suspense fallback={null}>
          <SnowfallOverlay />
        </Suspense>
      )}
      {children}
    </FestiveAtmosphereContext.Provider>
  );
}
