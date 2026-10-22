import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Flame, Utensils } from 'lucide-react';
import { CONTENT } from '../content';
import { useSceneStore, SceneId } from '../store/useSceneStore';
import { useBlowDetection } from '../hooks/useBlowDetection';
import { useAudio } from '../hooks/useAudio';
import { MicLevelRing } from '../components/MicLevelRing';
import { triggerHaptic } from '../components/TouchSparkles';

export const Scene4Cake: React.FC = () => {
  const currentScene = useSceneStore((s) => s.currentScene);
  const cakePhase = useSceneStore((s) => s.cakePhase);
  const candlesLit = useSceneStore((s) => s.candlesLit);
  const lightCandle = useSceneStore((s) => s.lightCandle);
  const sliceCake = useSceneStore((s) => s.sliceCake);
  const micStatus = useSceneStore((s) => s.micStatus);
  const setBlowIntensity = useSceneStore((s) => s.setBlowIntensity);
  const addBlowEnergy = useSceneStore((s) => s.addBlowEnergy);
  const nextScene = useSceneStore((s) => s.nextScene);
  const { duckMusic, playCelebrate, playTap, playSparkle, playSlice } = useAudio();

  const isCakeHero = currentScene === SceneId.CAKE_HERO;
  const isCelebration = currentScene === SceneId.CELEBRATION;
  const litCount = candlesLit.filter(Boolean).length;

  // Enable real-time microphone blow detection only during phase 'blow'
  useBlowDetection(isCakeHero && cakePhase === 'blow');

  useEffect(() => {
    if (isCakeHero && cakePhase === 'blow') {
      duckMusic(true);
    } else if (isCelebration) {
      duckMusic(false);
      playCelebrate();
    }
    return () => duckMusic(false);
  }, [isCakeHero, cakePhase, isCelebration, duckMusic, playCelebrate]);

  const holdTimerRef = useRef<number | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const startManualBlow = () => {
    if (!isCakeHero || cakePhase !== 'blow') return;
    triggerHaptic(15);
    setBlowIntensity(0.85);
    addBlowEnergy(0.14);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = window.setInterval(() => {
      setBlowIntensity(0.9);
      addBlowEnergy(0.08);
    }, 80);
  };

  const stopManualBlow = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setBlowIntensity(0);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  const handleSliceTrigger = () => {
    triggerHaptic([30, 50, 40]);
    playSlice();
    sliceCake();
  };

  return (
    <motion.section
      aria-label="Birthday Cake Interactive Experience"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)' }}
      transition={{ duration: 0.7 }}
      className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-between py-4 text-center"
    >
      {/* Top Banner */}
      <AnimatePresence mode="wait">
        {isCakeHero && cakePhase === 'light' && (
          <motion.div
            key="phase-light"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="pointer-events-auto w-full rounded-3xl glass-card px-4 py-3.5"
          >
            <h2 className="font-display text-xl font-semibold text-gold">
              {CONTENT.cakeScene.lightTitle} ({litCount}/{candlesLit.length})
            </h2>
            <p className="mt-1 font-sans text-xs leading-snug text-cream/90">
              {CONTENT.cakeScene.lightPrompt}
            </p>
          </motion.div>
        )}

        {isCakeHero && cakePhase === 'blow' && (
          <motion.div
            key="phase-blow"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="pointer-events-auto w-full rounded-3xl glass-card px-4 py-3.5"
          >
            <h2 className="font-display text-xl font-semibold text-gold">
              {CONTENT.cakeScene.title}
            </h2>
            <p className="mt-1 font-sans text-xs leading-snug text-cream/90">
              {CONTENT.cakeScene.prompt}
            </p>
          </motion.div>
        )}

        {isCakeHero && cakePhase === 'cut' && (
          <motion.div
            key="phase-cut"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto w-full rounded-3xl glass-card px-4 py-3.5"
          >
            <h2 className="font-display text-xl font-semibold text-rose">
              {CONTENT.cakeScene.cutTitle}
            </h2>
            <p className="mt-1 font-sans text-xs leading-snug text-cream/90">
              {CONTENT.cakeScene.cutPrompt}
            </p>
          </motion.div>
        )}

        {isCelebration && (
          <motion.div
            key="celebration-banner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-auto w-full rounded-3xl glass-card px-4 py-4"
          >
            <h2 className="font-display text-2xl font-bold shimmer-text">
              {CONTENT.cakeScene.celebrationHeadline}
            </h2>
            <p className="mt-1 font-sans text-sm text-cream/90">
              {CONTENT.cakeScene.celebrationSub}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Swipe Zone for Cake Slicing during 'cut' phase */}
      {isCakeHero && cakePhase === 'cut' && (
        <div
          onPointerDown={(e) => {
            swipeStartRef.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            if (!swipeStartRef.current) return;
            const dx = e.clientX - swipeStartRef.current.x;
            const dy = e.clientY - swipeStartRef.current.y;
            if (Math.hypot(dx, dy) > 35) {
              handleSliceTrigger();
            }
            swipeStartRef.current = null;
          }}
          className="pointer-events-auto my-auto flex h-56 w-full items-center justify-center cursor-crosshair"
        >
          <span className="rounded-full bg-midnight/70 px-4 py-1.5 text-xs text-gold border border-gold/30 animate-pulse">
            🔪 Swipe across cake to slice!
          </span>
        </div>
      )}

      {/* Bottom Interactive Controls */}
      <div className="pointer-events-auto flex w-full flex-col items-center gap-3 pb-2">
        {isCakeHero && cakePhase === 'light' && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              playSparkle();
              lightCandle();
            }}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold via-peach to-rose px-6 py-3.5 font-sans text-base font-semibold text-midnight shadow-[0_10px_28px_rgba(255,217,138,0.35)] active:scale-95"
          >
            <Flame className="h-5 w-5" />
            <span>
              {CONTENT.cakeScene.lightButtonCta} ({litCount}/{candlesLit.length})
            </span>
          </button>
        )}

        {isCakeHero && cakePhase === 'blow' && (
          <>
            <MicLevelRing />

            <p className="text-xs text-cream/80 px-2">
              {micStatus === 'calibrating' && CONTENT.cakeScene.calibratingHint}
              {micStatus === 'listening' && CONTENT.cakeScene.listeningHint}
              {(micStatus === 'denied' || micStatus === 'unsupported') && (
                <span className="text-peach">{CONTENT.cakeScene.micFallbackMessage}</span>
              )}
            </p>

            <button
              type="button"
              onPointerDown={startManualBlow}
              onPointerUp={stopManualBlow}
              onPointerLeave={stopManualBlow}
              className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl glass-card border border-gold/30 px-5 py-3 font-sans text-sm font-semibold text-gold active:scale-95"
            >
              <Wind className="h-4 w-4 text-rose" />
              <span>{CONTENT.cakeScene.holdToBlowCta}</span>
            </button>
          </>
        )}

        {isCakeHero && cakePhase === 'cut' && (
          <button
            type="button"
            onClick={handleSliceTrigger}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose via-peach to-gold px-6 py-3.5 font-sans text-base font-semibold text-midnight shadow-[0_10px_28px_rgba(255,111,165,0.4)] active:scale-95"
          >
            <Utensils className="h-4 w-4" />
            <span>{CONTENT.cakeScene.cutButtonCta}</span>
          </button>
        )}

        {isCelebration && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            onClick={() => {
              playTap();
              nextScene();
            }}
            className="flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose via-peach to-gold px-6 py-3.5 font-sans text-base font-semibold text-midnight shadow-[0_12px_32px_rgba(255,111,165,0.4)] transition-transform duration-150 active:scale-95"
          >
            {CONTENT.cakeScene.nextCta}
          </motion.button>
        )}
      </div>
    </motion.section>
  );
};
