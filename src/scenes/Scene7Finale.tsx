import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { CONTENT } from '../content';
import { useSceneStore } from '../store/useSceneStore';
import { useAudio } from '../hooks/useAudio';
import { triggerHaptic } from '../components/TouchSparkles';

export const Scene7Finale: React.FC = () => {
  const resetExperience = useSceneStore((s) => s.resetExperience);
  const isMuted = useSceneStore((s) => s.isMuted);
  const toggleMute = useSceneStore((s) => s.toggleMute);
  const poppedCount = useSceneStore((s) => s.poppedCount);
  const complimentToasts = useSceneStore((s) => s.complimentToasts);
  const popBalloon = useSceneStore((s) => s.popBalloon);
  const { playTap, playPop } = useAudio();

  return (
    <motion.section
      aria-label="Finale Celebration"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none relative z-10 flex h-full w-full flex-col items-center justify-between py-5 text-center"
    >
      {/* Floating Compliment Toasts from Popped 3D Balloons */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <AnimatePresence>
          {complimentToasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: -30 }}
              exit={{ opacity: 0, scale: 0.8, y: -55 }}
              transition={{ duration: 0.9 }}
              style={{
                left: Math.max(20, Math.min(window.innerWidth - 220, t.x - 90)),
                top: Math.max(60, Math.min(window.innerHeight - 160, t.y)),
              }}
              className="fixed rounded-full bg-gradient-to-r from-rose to-gold px-4 py-1.5 text-xs font-bold text-midnight shadow-lg"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pointer-events-auto mt-2 inline-flex items-center gap-2 rounded-full glass-card px-4 py-1.5 text-xs font-semibold text-gold">
        <span>{CONTENT.finale.badge}</span>
        {poppedCount > 0 && (
          <span className="rounded-full bg-rose/30 px-2 py-0.5 text-[11px] text-cream">
            🎈 {poppedCount} Popped
          </span>
        )}
      </div>

      <div className="pointer-events-auto my-auto flex flex-col items-center px-2">
        <div className="mb-3 text-4xl">🎈🥂✨</div>

        <h1
          className="font-display font-bold shimmer-text"
          style={{ fontSize: 'clamp(2.1rem, 8vw, 3rem)' }}
        >
          {CONTENT.finale.headline}
        </h1>

        <p className="mt-3 max-w-xs rounded-3xl glass-card p-4 font-sans text-sm leading-relaxed text-cream/90">
          {CONTENT.finale.subtext}
        </p>

        <button
          type="button"
          onClick={(e) => {
            triggerHaptic([15, 25]);
            playPop();
            popBalloon(e.clientX, e.clientY);
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/15 border border-gold/40 px-4 py-1.5 text-xs font-medium text-gold active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-rose" />
          <span>{CONTENT.finale.balloonHint}</span>
        </button>

        <p className="mt-3 font-handwriting text-2xl text-peach">
          Made with 💖 by {CONTENT.fromName}
        </p>
      </div>

      <div className="pointer-events-auto flex w-full flex-col gap-2.5 pb-2">
        <button
          type="button"
          onClick={() => {
            playTap();
            resetExperience();
          }}
          className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose via-peach to-gold px-6 py-3 font-sans text-base font-semibold text-midnight shadow-[0_10px_30px_rgba(255,111,165,0.4)] transition-transform duration-150 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{CONTENT.finale.replayCta}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTap();
            toggleMute();
          }}
          className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl glass-card px-5 py-2.5 font-sans text-sm font-medium text-cream/90 active:scale-95"
        >
          {isMuted ? (
            <>
              <VolumeX className="h-4 w-4 text-rose" />
              <span>Music: Off (Tap to Unmute)</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-gold" />
              <span>Music: On (Tap to Mute)</span>
            </>
          )}
        </button>
      </div>
    </motion.section>
  );
};
