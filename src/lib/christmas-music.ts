"use client";

export interface NoteEvent {
  /** Eighth-note step index within the loop */
  step: number;
  /** Note name (e.g. "C5", "F#4") */
  note: string;
  /** Duration in eighth-note steps */
  duration: number;
}

export interface BarHarmony {
  /** Bass root note (e.g. "C2") */
  bass: string;
  /** Chord notes (e.g. ["C4", "E4", "G4"]) */
  chord: string[];
}

export interface ChristmasTrack {
  id: string;
  title: string;
  subtitle: string;
  bpm: number;
  totalSteps: number;
  melody: NoteEvent[];
  bars: BarHarmony[];
}

const NOTE_FREQS: Record<string, number> = {
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  "F#2": 92.5,
  G2: 98.0,
  A2: 110.0,
  Bb2: 116.54,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  "F#3": 185.0,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  "F#4": 369.99,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  "F#5": 739.99,
  G5: 783.99,
  A5: 880.0,
  Bb5: 932.33,
  B5: 987.77,
  C6: 1046.5,
};

export function noteToFreq(note: string): number {
  return NOTE_FREQS[note] ?? 440;
}

/**
 * 100% Public Domain International Christmas classics arranged in upbeat Pop / Synth-Pop style.
 */
export const CHRISTMAS_POP_PLAYLIST: ChristmasTrack[] = [
  {
    id: "jingle-bells-pop",
    title: "Jingle Bells (Synth-Pop Mix)",
    subtitle: "Upbeat Holiday Pop · Public Domain",
    bpm: 124,
    totalSteps: 128,
    melody: [
      // Bars 1-4
      { step: 0, note: "E5", duration: 2 },
      { step: 2, note: "E5", duration: 2 },
      { step: 4, note: "E5", duration: 4 },
      { step: 8, note: "E5", duration: 2 },
      { step: 10, note: "E5", duration: 2 },
      { step: 12, note: "E5", duration: 4 },
      { step: 16, note: "E5", duration: 2 },
      { step: 18, note: "G5", duration: 2 },
      { step: 20, note: "C5", duration: 3 },
      { step: 23, note: "D5", duration: 1 },
      { step: 24, note: "E5", duration: 6 },
      // Bars 5-8
      { step: 32, note: "F5", duration: 2 },
      { step: 34, note: "F5", duration: 2 },
      { step: 36, note: "F5", duration: 3 },
      { step: 39, note: "F5", duration: 1 },
      { step: 40, note: "F5", duration: 2 },
      { step: 42, note: "E5", duration: 2 },
      { step: 44, note: "E5", duration: 2 },
      { step: 46, note: "E5", duration: 1 },
      { step: 47, note: "E5", duration: 1 },
      { step: 48, note: "E5", duration: 2 },
      { step: 50, note: "D5", duration: 2 },
      { step: 52, note: "D5", duration: 2 },
      { step: 54, note: "E5", duration: 2 },
      { step: 56, note: "D5", duration: 4 },
      { step: 60, note: "G5", duration: 4 },
      // Bars 9-12
      { step: 64, note: "E5", duration: 2 },
      { step: 66, note: "E5", duration: 2 },
      { step: 68, note: "E5", duration: 4 },
      { step: 72, note: "E5", duration: 2 },
      { step: 74, note: "E5", duration: 2 },
      { step: 76, note: "E5", duration: 4 },
      { step: 80, note: "E5", duration: 2 },
      { step: 82, note: "G5", duration: 2 },
      { step: 84, note: "C5", duration: 3 },
      { step: 87, note: "D5", duration: 1 },
      { step: 88, note: "E5", duration: 6 },
      // Bars 13-16
      { step: 96, note: "F5", duration: 2 },
      { step: 98, note: "F5", duration: 2 },
      { step: 100, note: "F5", duration: 3 },
      { step: 103, note: "F5", duration: 1 },
      { step: 104, note: "F5", duration: 2 },
      { step: 106, note: "E5", duration: 2 },
      { step: 108, note: "E5", duration: 2 },
      { step: 110, note: "E5", duration: 1 },
      { step: 111, note: "E5", duration: 1 },
      { step: 112, note: "G5", duration: 2 },
      { step: 114, note: "G5", duration: 2 },
      { step: 116, note: "F5", duration: 2 },
      { step: 118, note: "D5", duration: 2 },
      { step: 120, note: "C5", duration: 6 },
    ],
    bars: [
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "A2", chord: ["A3", "C4", "E4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "G2", chord: ["G3", "B3", "D4"] },
      { bass: "G2", chord: ["G3", "B3", "D4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "A2", chord: ["A3", "C4", "E4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "G2", chord: ["G3", "B3", "D4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
    ],
  },
  {
    id: "deck-the-halls-pop",
    title: "Deck the Halls (Electro-Pop Mix)",
    subtitle: "Festive Dance Pop · Public Domain",
    bpm: 126,
    totalSteps: 64,
    melody: [
      // Bars 1-4
      { step: 0, note: "C5", duration: 3 },
      { step: 3, note: "Bb4", duration: 1 },
      { step: 4, note: "A4", duration: 2 },
      { step: 6, note: "G4", duration: 2 },
      { step: 8, note: "F4", duration: 2 },
      { step: 10, note: "G4", duration: 2 },
      { step: 12, note: "A4", duration: 2 },
      { step: 14, note: "F4", duration: 2 },
      { step: 16, note: "G4", duration: 1 },
      { step: 17, note: "A4", duration: 1 },
      { step: 18, note: "Bb4", duration: 1 },
      { step: 19, note: "G4", duration: 1 },
      { step: 20, note: "A4", duration: 3 },
      { step: 23, note: "G4", duration: 1 },
      { step: 24, note: "F4", duration: 2 },
      { step: 26, note: "E4", duration: 2 },
      { step: 28, note: "F4", duration: 4 },
      // Bars 5-8
      { step: 32, note: "C5", duration: 3 },
      { step: 35, note: "Bb4", duration: 1 },
      { step: 36, note: "A4", duration: 2 },
      { step: 38, note: "G4", duration: 2 },
      { step: 40, note: "F4", duration: 2 },
      { step: 42, note: "G4", duration: 2 },
      { step: 44, note: "A4", duration: 2 },
      { step: 46, note: "F4", duration: 2 },
      { step: 48, note: "D5", duration: 1 },
      { step: 49, note: "D5", duration: 1 },
      { step: 50, note: "D5", duration: 1 },
      { step: 51, note: "D5", duration: 1 },
      { step: 52, note: "C5", duration: 3 },
      { step: 55, note: "Bb4", duration: 1 },
      { step: 56, note: "A4", duration: 2 },
      { step: 58, note: "G4", duration: 2 },
      { step: 60, note: "F4", duration: 4 },
    ],
    bars: [
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "D2", chord: ["D4", "F4", "A4"] },
      { bass: "Bb2", chord: ["Bb3", "D4", "F4"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
    ],
  },
  {
    id: "we-wish-you-pop",
    title: "We Wish You a Merry Christmas (Pop Groove)",
    subtitle: "Modern 4/4 Pop Remix · Public Domain",
    bpm: 118,
    totalSteps: 64,
    melody: [
      // Bars 1-4
      { step: 0, note: "D4", duration: 2 },
      { step: 2, note: "G4", duration: 2 },
      { step: 4, note: "G4", duration: 1 },
      { step: 5, note: "A4", duration: 1 },
      { step: 6, note: "G4", duration: 1 },
      { step: 7, note: "F#4", duration: 1 },
      { step: 8, note: "E4", duration: 2 },
      { step: 10, note: "E4", duration: 2 },
      { step: 12, note: "E4", duration: 4 },
      { step: 16, note: "A4", duration: 2 },
      { step: 18, note: "A4", duration: 1 },
      { step: 19, note: "B4", duration: 1 },
      { step: 20, note: "A4", duration: 1 },
      { step: 21, note: "G4", duration: 1 },
      { step: 22, note: "F#4", duration: 2 },
      { step: 24, note: "D4", duration: 2 },
      { step: 26, note: "D4", duration: 2 },
      { step: 28, note: "B4", duration: 4 },
      // Bars 5-8
      { step: 32, note: "B4", duration: 1 },
      { step: 33, note: "C5", duration: 1 },
      { step: 34, note: "B4", duration: 1 },
      { step: 35, note: "A4", duration: 1 },
      { step: 36, note: "G4", duration: 2 },
      { step: 38, note: "E4", duration: 2 },
      { step: 40, note: "D4", duration: 1 },
      { step: 41, note: "D4", duration: 1 },
      { step: 42, note: "E4", duration: 2 },
      { step: 44, note: "A4", duration: 2 },
      { step: 46, note: "F#4", duration: 2 },
      { step: 48, note: "G4", duration: 4 },
      { step: 52, note: "D4", duration: 2 },
      { step: 54, note: "G4", duration: 2 },
      { step: 56, note: "B4", duration: 2 },
      { step: 58, note: "A4", duration: 2 },
      { step: 60, note: "G4", duration: 4 },
    ],
    bars: [
      { bass: "G2", chord: ["G3", "B3", "D4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "A2", chord: ["A3", "C4", "E4"] },
      { bass: "D2", chord: ["D4", "F#4", "A4"] },
      { bass: "E2", chord: ["E4", "G4", "B4"] },
      { bass: "D2", chord: ["D4", "F#4", "A4"] },
      { bass: "G2", chord: ["G3", "B3", "D4"] },
      { bass: "G2", chord: ["G3", "B3", "D4"] },
    ],
  },
  {
    id: "joy-to-the-world-pop",
    title: "Joy to the World (Holiday Pop Mix)",
    subtitle: "Warm Synth-Pop Anthem · Public Domain",
    bpm: 120,
    totalSteps: 64,
    melody: [
      // Bars 1-4
      { step: 0, note: "C6", duration: 4 },
      { step: 4, note: "B5", duration: 3 },
      { step: 7, note: "A5", duration: 1 },
      { step: 8, note: "G5", duration: 6 },
      { step: 14, note: "F5", duration: 2 },
      { step: 16, note: "E5", duration: 4 },
      { step: 20, note: "D5", duration: 4 },
      { step: 24, note: "C5", duration: 6 },
      { step: 30, note: "G5", duration: 2 },
      // Bars 5-8
      { step: 32, note: "A5", duration: 6 },
      { step: 38, note: "A5", duration: 2 },
      { step: 40, note: "B5", duration: 6 },
      { step: 46, note: "B5", duration: 2 },
      { step: 48, note: "C6", duration: 4 },
      { step: 52, note: "G5", duration: 2 },
      { step: 54, note: "E5", duration: 2 },
      { step: 56, note: "D5", duration: 2 },
      { step: 58, note: "E5", duration: 2 },
      { step: 60, note: "C5", duration: 4 },
    ],
    bars: [
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "G2", chord: ["G3", "B3", "D4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "F2", chord: ["F4", "A4", "C5"] },
      { bass: "G2", chord: ["G3", "B3", "D4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
      { bass: "C2", chord: ["C4", "E4", "G4"] },
    ],
  },
];

export function getNextTrackIndex(currentIndex: number, total = CHRISTMAS_POP_PLAYLIST.length): number {
  if (total <= 0) return 0;
  return (currentIndex + 1) % total;
}

class ChristmasPopEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delaySend: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isPlaying = false;
  private trackIndex = 0;
  private currentStep = 0;
  private loopsCompleted = 0;
  private onTrackChangeCallback: ((index: number) => void) | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!this.ctx) {
      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.connect(ctx.destination);

      // Warm studio slapback delay for pop synth lushness
      const delay = ctx.createDelay(0.5);
      delay.delayTime.setValueAtTime(0.19, ctx.currentTime);
      const feedback = ctx.createGain();
      feedback.gain.setValueAtTime(0.2, ctx.currentTime);
      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = "lowpass";
      delayFilter.frequency.setValueAtTime(2100, ctx.currentTime);
      const delayWet = ctx.createGain();
      delayWet.gain.setValueAtTime(0.18, ctx.currentTime);

      const delaySend = ctx.createGain();
      delaySend.gain.setValueAtTime(1, ctx.currentTime);
      delaySend.connect(delay);
      delay.connect(delayFilter);
      delayFilter.connect(feedback);
      feedback.connect(delay);
      delayFilter.connect(delayWet);
      delayWet.connect(master);

      this.ctx = ctx;
      this.masterGain = master;
      this.delaySend = delaySend;
      this.noiseBuffer = this.createNoiseBuffer(ctx);
    }

    if (this.ctx.state === "suspended") {
      void this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * 0.25);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setOnTrackChange(cb: ((index: number) => void) | null) {
    this.onTrackChangeCallback = cb;
  }

  public getTrackIndex(): number {
    return this.trackIndex;
  }

  public start(trackIndex?: number): boolean {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return false;

    if (typeof trackIndex === "number") {
      this.trackIndex = ((trackIndex % CHRISTMAS_POP_PLAYLIST.length) + CHRISTMAS_POP_PLAYLIST.length) % CHRISTMAS_POP_PLAYLIST.length;
    }

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.loopsCompleted = 0;

    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.001, this.masterGain.gain.value), now);
    this.masterGain.gain.linearRampToValueAtTime(0.24, now + 0.25);

    this.scheduleLoop();
    return ctx.state === "running";
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.ctx && this.masterGain) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(Math.max(0.001, this.masterGain.gain.value), now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.18);
      } catch {
        // ignore
      }
    }
  }

  public nextTrack(): number {
    const nextIdx = getNextTrackIndex(this.trackIndex);
    this.trackIndex = nextIdx;
    this.currentStep = 0;
    this.loopsCompleted = 0;
    if (this.isPlaying) {
      this.start(nextIdx);
    }
    this.onTrackChangeCallback?.(nextIdx);
    return nextIdx;
  }

  private scheduleLoop() {
    const track = CHRISTMAS_POP_PLAYLIST[this.trackIndex] ?? CHRISTMAS_POP_PLAYLIST[0];
    // Duration of one eighth-note step in milliseconds
    const stepMs = (60 / track.bpm / 2) * 1000;

    this.playStep(track, this.currentStep, stepMs / 1000);
    this.currentStep++;

    this.timerId = setInterval(() => {
      if (!this.isPlaying) return;
      const activeTrack = CHRISTMAS_POP_PLAYLIST[this.trackIndex] ?? CHRISTMAS_POP_PLAYLIST[0];
      if (this.currentStep >= activeTrack.totalSteps) {
        this.currentStep = 0;
        this.loopsCompleted++;
        // Auto-advance to the next Christmas Pop song after 2 full loops
        if (this.loopsCompleted >= 2) {
          this.nextTrack();
          return;
        }
      }
      const stepSec = 60 / activeTrack.bpm / 2;
      this.playStep(activeTrack, this.currentStep, stepSec);
      this.currentStep++;
    }, stepMs);
  }

  private playStep(track: ChristmasTrack, step: number, stepSec: number) {
    const ctx = this.ctx;
    const master = this.masterGain;
    if (!ctx || !master || ctx.state !== "running") return;

    const now = ctx.currentTime;
    const barIndex = Math.floor(step / 8) % track.bars.length;
    const stepInBar = step % 8;
    const harmony = track.bars[barIndex];

    // 1. Pop Drum Groove & Sleigh Bells
    if (stepInBar === 0 || stepInBar === 4) {
      this.playKick(ctx, master, now);
    }
    if (stepInBar === 2 || stepInBar === 6) {
      this.playSnare(ctx, master, now);
    }
    this.playSleighHiHat(ctx, master, now, stepInBar % 2 === 1);

    // 2. Bouncy Synth-Pop Bass (root-octave pop bounce)
    if (harmony) {
      const bassFreq = noteToFreq(harmony.bass);
      const freq = stepInBar % 2 === 1 ? bassFreq * 2 : bassFreq;
      this.playPopBass(ctx, master, now, freq, stepSec * 0.85);

      // 3. Warm Electric Piano Chords (on Pop syncopated beats: 0, 3, 6)
      if (stepInBar === 0 || stepInBar === 3 || stepInBar === 6) {
        const chordDur = stepInBar === 3 ? stepSec * 2.4 : stepSec * 1.8;
        this.playWarmChord(ctx, master, now, harmony.chord, chordDur);
      }
    }

    // 4. Bell-Synth Lead Melody
    for (const item of track.melody) {
      if (item.step === step) {
        this.playPopLead(
          ctx,
          master,
          now,
          noteToFreq(item.note),
          item.duration * stepSec * 0.92
        );
      }
    }
  }

  private playPopLead(
    ctx: AudioContext,
    master: GainNode,
    startTime: number,
    freq: number,
    duration: number
  ) {
    const oscMain = ctx.createOscillator();
    const oscBell = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    oscMain.type = "triangle";
    oscMain.frequency.setValueAtTime(freq, startTime);

    // Subtle octave bell harmonic for festive sparkle
    oscBell.type = "sine";
    oscBell.frequency.setValueAtTime(freq * 2, startTime);
    const bellGain = ctx.createGain();
    bellGain.gain.setValueAtTime(0.22, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2800, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.21, startTime + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.09, startTime + Math.min(0.14, duration * 0.5));
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    oscMain.connect(filter);
    oscBell.connect(bellGain);
    bellGain.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    if (this.delaySend) {
      gain.connect(this.delaySend);
    }

    oscMain.start(startTime);
    oscBell.start(startTime);
    oscMain.stop(startTime + duration + 0.02);
    oscBell.stop(startTime + duration + 0.02);
  }

  private playWarmChord(
    ctx: AudioContext,
    master: GainNode,
    startTime: number,
    notes: string[],
    duration: number
  ) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1350, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.048, startTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    filter.connect(gain);
    gain.connect(master);
    if (this.delaySend) {
      gain.connect(this.delaySend);
    }

    for (const note of notes) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(noteToFreq(note), startTime);
      osc.connect(filter);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    }
  }

  private playPopBass(
    ctx: AudioContext,
    master: GainNode,
    startTime: number,
    freq: number,
    duration: number
  ) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(560, startTime);
    filter.frequency.exponentialRampToValueAtTime(175, startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.11, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.015);
  }

  private playKick(ctx: AudioContext, master: GainNode, startTime: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130, startTime);
    osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.085);

    gain.gain.setValueAtTime(0.22, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

    osc.connect(gain);
    gain.connect(master);
    osc.start(startTime);
    osc.stop(startTime + 0.11);
  }

  private playSnare(ctx: AudioContext, master: GainNode, startTime: number) {
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1800, startTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.075, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.075);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      noise.start(startTime);
      noise.stop(startTime + 0.08);
    }

    const body = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    body.type = "triangle";
    body.frequency.setValueAtTime(185, startTime);
    body.frequency.exponentialRampToValueAtTime(95, startTime + 0.045);
    bodyGain.gain.setValueAtTime(0.06, startTime);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
    body.connect(bodyGain);
    bodyGain.connect(master);
    body.start(startTime);
    body.stop(startTime + 0.055);
  }

  private playSleighHiHat(
    ctx: AudioContext,
    master: GainNode,
    startTime: number,
    accentSleighBell: boolean
  ) {
    if (!this.noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(7200, startTime);

    const gain = ctx.createGain();
    const peak = accentSleighBell ? 0.045 : 0.024;
    const dur = accentSleighBell ? 0.065 : 0.035;
    gain.gain.setValueAtTime(peak, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    noise.start(startTime);
    noise.stop(startTime + dur + 0.01);

    // Subtle high metallic sleigh-bell shimmer on off-beats
    if (accentSleighBell) {
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = "sine";
      bell.frequency.setValueAtTime(3136, startTime); // G7 shimmer
      bellGain.gain.setValueAtTime(0.015, startTime);
      bellGain.gain.exponentialRampToValueAtTime(0.0005, startTime + 0.055);
      bell.connect(bellGain);
      bellGain.connect(master);
      bell.start(startTime);
      bell.stop(startTime + 0.06);
    }
  }
}

let engineInstance: ChristmasPopEngine | null = null;

export function getChristmasPopEngine(): ChristmasPopEngine {
  if (!engineInstance) {
    engineInstance = new ChristmasPopEngine();
  }
  return engineInstance;
}
