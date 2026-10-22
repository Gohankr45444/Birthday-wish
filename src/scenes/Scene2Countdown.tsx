import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTENT } from '../content';
import { useSceneStore } from '../store/useSceneStore';
import { useAudio } from '../hooks/useAudio';
import { triggerHaptic } from '../components/TouchSparkles';

export const Scene2Countdown: React.FC = () => {
  const [count, setCount] = useState<number>(3);
  const nextScene = useSceneStore((s) => s.nextScene);
  const { playTap, playCelebrate } = useAudio();

  useEffect(() => {
    if (count > 0) {
      triggerHaptic(20);
      playTap();
      const timer = setTimeout(() => setCount((c) => c - 1), 900);
      return () => clearTimeout(timer);
    } else {
      triggerHaptic([40, 60, 80]);
      playCelebrate();
    }
  }, [count, playTap, playCelebrate]);

  return (
    <motion.section
      aria-label="Birthday Countdown and Reveal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
      transition={{ duration: 0.65 }}
      className="relative z-10 flex h-full w-full flex-col items-center justify-between py-6 text-center"
    >
      <div className="mt-4 text-xs uppercase tracking-[0.25em] text-gold/80">
        {CONTENT.countdown.preTitle}
      </div>

      <div className="my-auto flex w-full flex-col items-center justify-center px-2">
        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              initial={{ opacity: 0, scale: 0.4, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-40 w-40 items-center justify-center rounded-full glass-card shadow-[0_0_50px_rgba(255,111,165,0.35)]"
            >
              <span className="font-display text-7xl font-bold text-gold">{count}</span>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose/20 px-4 py-1 text-xs font-semibold text-peach border border-rose/30">
                <span>🎉 Official Birthday Broadcast</span>
              </div>

              <h2
                className="font-display font-bold leading-tight shimmer-text"
                style={{ fontSize: 'clamp(2.25rem, 8.5vw, 3.3rem)' }}
              >
                {CONTENT.countdown.headlinePrefix} <br />
                {CONTENT.nickname}! ✨
              </h2>

              <p className="mt-5 max-w-xs rounded-2xl glass-card p-4 font-sans text-base leading-relaxed text-cream/90">
                {CONTENT.countdown.subline}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full pb-4 min-h-[68px]">
        {count === 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onClick={() => {
              playTap();
              nextScene();
            }}
            className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose via-peach to-gold px-6 py-3.5 font-sans text-base font-semibold text-midnight shadow-[0_10px_30px_rgba(255,181,138,0.35)] transition-transform duration-150 active:scale-95"
          >
            {CONTENT.countdown.cta}
          </motion.button>
        )}
      </div>
    </motion.section>
  );
};
