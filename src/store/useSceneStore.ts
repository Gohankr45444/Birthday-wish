import { create } from 'zustand';
import { CONTENT } from '../content';

export enum SceneId {
  GATE = 0,
  INTRO = 1,
  COUNTDOWN = 2,
  MEMORY_LANE = 3,
  CAKE_HERO = 4,
  CELEBRATION = 5,
  LETTER = 6,
  FINALE = 7,
}

export type CakeInteractivePhase = 'light' | 'blow' | 'cut';

export interface PoppedCompliment {
  id: number;
  text: string;
  x: number;
  y: number;
}

interface SceneState {
  currentScene: SceneId;
  isMuted: boolean;
  cakePhase: CakeInteractivePhase;
  blowIntensity: number;
  blowProgress: number;
  candlesLit: boolean[];
  isCakeSliced: boolean;
  micStatus: 'idle' | 'calibrating' | 'listening' | 'denied' | 'unsupported';
  reducedMotion: boolean;
  poppedCount: number;
  complimentToasts: PoppedCompliment[];

  setScene: (scene: SceneId) => void;
  nextScene: () => void;
  toggleMute: () => void;
  lightCandle: (index?: number) => void;
  setBlowIntensity: (intensity: number) => void;
  addBlowEnergy: (deltaProgress: number) => void;
  sliceCake: () => void;
  popBalloon: (screenX?: number, screenY?: number) => void;
  setMicStatus: (status: SceneState['micStatus']) => void;
  setReducedMotion: (reduced: boolean) => void;
  resetExperience: () => void;
}

// Candles start UNLIT in phase 'light' so the user can interactively light them!
const initialUnlitCandles = () => Array(CONTENT.candleCount).fill(false);

export const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: SceneId.GATE,
  isMuted: false,
  cakePhase: 'light',
  blowIntensity: 0,
  blowProgress: 0,
  candlesLit: initialUnlitCandles(),
  isCakeSliced: false,
  micStatus: 'idle',
  reducedMotion: false,
  poppedCount: 0,
  complimentToasts: [],

  setScene: (scene) => set({ currentScene: scene }),

  nextScene: () => {
    const current = get().currentScene;
    if (current < SceneId.FINALE) {
      set({ currentScene: (current + 1) as SceneId });
    }
  },

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  lightCandle: (index) => {
    const state = get();
    if (state.cakePhase !== 'light') return;

    const nextCandles = [...state.candlesLit];
    if (typeof index === 'number') {
      nextCandles[index] = true;
    } else {
      // Light the next unlit candle
      const firstUnlit = nextCandles.findIndex((c) => !c);
      if (firstUnlit !== -1) nextCandles[firstUnlit] = true;
    }

    const allLit = nextCandles.every(Boolean);
    set({
      candlesLit: nextCandles,
      cakePhase: allLit ? 'blow' : 'light',
    });
  },

  setBlowIntensity: (intensity) =>
    set({ blowIntensity: Math.max(0, Math.min(1, intensity)) }),

  addBlowEnergy: (deltaProgress) => {
    const state = get();
    if (state.currentScene !== SceneId.CAKE_HERO || state.cakePhase !== 'blow') return;

    const nextProgress = Math.min(1, state.blowProgress + deltaProgress);
    const totalCandles = state.candlesLit.length;

    const nextCandles = state.candlesLit.map((isLit, idx) => {
      const threshold = (idx + 1) / totalCandles;
      return nextProgress >= threshold - 0.02 ? false : isLit;
    });

    set({
      blowProgress: nextProgress,
      candlesLit: nextCandles,
    });

    if (nextProgress >= 1) {
      // Transition to the interactive Knife Slice phase!
      set({
        cakePhase: 'cut',
        blowIntensity: 0,
      });
    }
  },

  sliceCake: () => {
    const state = get();
    if (state.isCakeSliced) return;
    set({
      isCakeSliced: true,
      currentScene: SceneId.CELEBRATION,
    });
  },

  popBalloon: (screenX, screenY) => {
    const state = get();
    const list = CONTENT.finale.compliments;
    const text = list[state.poppedCount % list.length];
    const id = Date.now() + Math.random();
    const x = screenX ?? window.innerWidth * (0.25 + Math.random() * 0.5);
    const y = screenY ?? window.innerHeight * (0.25 + Math.random() * 0.35);

    set({
      poppedCount: state.poppedCount + 1,
      complimentToasts: [...state.complimentToasts.slice(-4), { id, text, x, y }],
    });
  },

  setMicStatus: (micStatus) => set({ micStatus }),

  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  resetExperience: () =>
    set({
      currentScene: SceneId.INTRO,
      cakePhase: 'light',
      blowIntensity: 0,
      blowProgress: 0,
      candlesLit: initialUnlitCandles(),
      isCakeSliced: false,
      micStatus: 'idle',
      poppedCount: 0,
      complimentToasts: [],
    }),
}));
