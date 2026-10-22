import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Headphones } from 'lucide-react';
import { CONTENT } from '../content';
import { useSceneStore } from '../store/useSceneStore';
import { useAudio } from '../hooks/useAudio';
import { triggerHaptic } from '../components/TouchSparkles';

export const Scene0Gate: React.FC = () => {
  const nextScene = useSceneStore((s) => s.nextScene);
  const { unlockAudio, playTap } = useAudio();

  const handleStart = () => {
    triggerHaptic(25);
    unlockAudio();
    playTap();
    nextScene();
  };

  return (
    <motion.section
      aria-label="Welcome Gate Screen"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex h-full w-full flex-col items-center justify-between py-6 text-center"
    >
      <div className="mt-6 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-medium tracking-wider text-gold">
        <Sparkles className="h-3.5 w-3.5 text-rose" />
        <span>{CONTENT.gate.badge}</span>
      </div>

      <div className="my-auto flex flex-col items-center px-2">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full glass-card">
          <div className="absolute inset-0 rounded-full bg-rose/25 blur-xl animate-pulse" />
          <span className="text-5xl" role="img" aria-label="Birthday Cake">
            🎂
          </span>
        </div>

        <h1
          className="font-display font-semibold tracking-tight text-cream"
          style={{ fontSize: 'clamp(2rem, 7vw, 2.75rem)' }}
        >
          {CONTENT.gate.title}
        </h1>

        <p className="mt-4 max-w-xs font-sans text-base leading-relaxed text-cream/80">
          {CONTENT.gate.subtitle}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 text-xs text-lavender">
          <Headphones className="h-4 w-4" />
          <span>Sound, Haptics & Mic experience inside</span>
        </div>
      </div>

      <div className="w-full pb-4">
        <button
          type="button"
          onClick={handleStart}
          className="group relative flex min-h-[54px] w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-rose via-peach to-gold p-[1px] shadow-[0_12px_35px_rgba(255,111,165,0.4)] transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span className="flex h-full w-full items-center justify-center gap-2 rounded-[15px] bg-[#1B1030]/80 px-6 py-3.5 font-sans text-base font-semibold text-cream backdrop-blur-md transition-colors group-hover:bg-[#1B1030]/60">
            {CONTENT.gate.cta}
          </span>
        </button>
      </div>
    </motion.section>
  );
};
