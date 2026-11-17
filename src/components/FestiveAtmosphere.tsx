"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
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

const SNOWFLAKES = [
  { left: "6%", size: 10, delay: "0s", duration: "16s", drift: "16px", char: "❄", tone: "text-paper/65 drop-shadow-[0_1px_1px_rgba(70,53,44,0.18)]" },
  { left: "16%", size: 8, delay: "-5s", duration: "19s", drift: "-14px", char: "✦", tone: "text-gold/55" },
  { left: "28%", size: 11, delay: "-2s", duration: "17s", drift: "18px", char: "❄", tone: "text-paper/60 drop-shadow-[0_1px_1px_rgba(70,53,44,0.18)]" },
  { left: "40%", size: 8, delay: "-9s", duration: "21s", drift: "-16px", char: "•", tone: "text-gold/45" },
  { left: "52%", size: 10, delay: "-4s", duration: "16.5s", drift: "15px", char: "❄", tone: "text-paper/65 drop-shadow-[0_1px_1px_rgba(70,53,44,0.18)]" },
  { left: "64%", size: 9, delay: "-11s", duration: "20s", drift: "-14px", char: "✦", tone: "text-gold/50" },
  { left: "75%", size: 11, delay: "-3s", duration: "17.5s", drift: "16px", char: "❄", tone: "text-paper/60 drop-shadow-[0_1px_1px_rgba(70,53,44,0.18)]" },
  { left: "86%", size: 8, delay: "-8s", duration: "19.5s", drift: "-15px", char: "•", tone: "text-gold/45" },
  { left: "94%", size: 10, delay: "-6s", duration: "18s", drift: "12px", char: "❄", tone: "text-paper/55 drop-shadow-[0_1px_1px_rgba(70,53,44,0.18)]" },
] as const;

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
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none"
        >
          {SNOWFLAKES.map((flake, idx) => (
            <span
              key={idx}
              className={`snow-flake absolute -top-6 ${flake.tone}`}
              style={{
                left: flake.left,
                fontSize: `${flake.size}px`,
                animationDelay: flake.delay,
                animationDuration: flake.duration,
                ["--snow-drift" as string]: flake.drift,
              }}
            >
              {flake.char}
            </span>
          ))}
        </div>
      )}
      {children}
    </FestiveAtmosphereContext.Provider>
  );
}
