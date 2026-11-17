"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { playAnalogClick, playFestiveChime, playStampSound } from "@/lib/sound";
import {
  CHRISTMAS_POP_PLAYLIST,
  getChristmasPopEngine,
  type ChristmasTrack,
} from "@/lib/christmas-music";
import {
  SnowCanvas,
  dispatchSnowBoost,
  type SnowIntensity,
} from "@/components/atmosphere/SnowCanvas";

interface FestiveAtmosphereContextValue {
  festiveFx: boolean;
  toggleFestiveFx: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  currentTrack: ChristmasTrack;
  nextTrack: () => void;
  triggerClickSound: () => void;
  triggerStampSound: () => void;
  triggerChimeSound: () => void;
  /** Briefly makes the snowfall heavier for a meaningful moment. */
  boostSnow: (durationMs?: number) => void;
}

const FestiveAtmosphereContext = createContext<FestiveAtmosphereContextValue>({
  festiveFx: true,
  toggleFestiveFx: () => {},
  soundEnabled: false,
  toggleSound: () => {},
  currentTrack: CHRISTMAS_POP_PLAYLIST[0],
  nextTrack: () => {},
  triggerClickSound: () => {},
  triggerStampSound: () => {},
  triggerChimeSound: () => {},
  boostSnow: () => {},
});

export function useFestiveAtmosphere() {
  return useContext(FestiveAtmosphereContext);
}

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

function getRouteIntensity(pathname: string | null): SnowIntensity {
  if (
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/buddy") ||
    pathname.startsWith("/join")
  ) {
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

function SnowfallOverlay() {
  const pathname = usePathname();
  return <SnowCanvas intensity={getRouteIntensity(pathname)} />;
}

export function FestiveAtmosphereProvider({ children }: { children: ReactNode }) {
  const festiveFx = useSyncExternalStore(subscribePrefs, getFxSnapshot, () => true);
  const soundEnabled = useSyncExternalStore(subscribePrefs, getSoundSnapshot, () => false);
  const [trackIndex, setTrackIndex] = useState(0);

  useEffect(() => {
    const engine = getChristmasPopEngine();
    engine.setOnTrackChange((idx) => setTrackIndex(idx));
    return () => {
      engine.setOnTrackChange(null);
    };
  }, []);

  useEffect(() => {
    const engine = getChristmasPopEngine();
    if (!soundEnabled) {
      engine.stop();
      return;
    }

    const startedImmediately = engine.start();
    if (startedImmediately) return;

    const resumeOnGesture = () => {
      if (getSoundSnapshot()) {
        engine.start();
      }
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };

    window.addEventListener("pointerdown", resumeOnGesture, { passive: true });
    window.addEventListener("keydown", resumeOnGesture, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", resumeOnGesture);
      window.removeEventListener("keydown", resumeOnGesture);
    };
  }, [soundEnabled]);

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
    const engine = getChristmasPopEngine();
    if (next) {
      playFestiveChime();
      engine.start();
    } else {
      engine.stop();
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (getSoundSnapshot()) {
      playAnalogClick(740);
    }
    const nextIdx = getChristmasPopEngine().nextTrack();
    setTrackIndex(nextIdx);
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

  const currentTrack =
    CHRISTMAS_POP_PLAYLIST[trackIndex] ?? CHRISTMAS_POP_PLAYLIST[0];

  return (
    <FestiveAtmosphereContext.Provider
      value={{
        festiveFx,
        toggleFestiveFx,
        soundEnabled,
        toggleSound,
        currentTrack,
        nextTrack,
        triggerClickSound,
        triggerStampSound,
        triggerChimeSound,
        boostSnow: dispatchSnowBoost,
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
