import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CONTENT } from '../content';
import { useSceneStore } from '../store/useSceneStore';
import { useAudio } from '../hooks/useAudio';
import { triggerHaptic } from '../components/TouchSparkles';

const STAR_NODES = [
  { id: 0, x: 50, y: 78 },
  { id: 1, x: 22, y: 46 },
  { id: 2, x: 35, y: 22 },
  { id: 3, x: 65, y: 22 },
  { id: 4, x: 78, y: 46 },
];

export const Scene1Intro: React.FC = () => {
  const [connected, setConnected] = useState<number[]>([]);
  const nextScene = useSceneStore((s) => s.nextScene);
  const { playTap, playSparkle, playCelebrate, playWhoosh } = useAudio();

  const isUnlocked = connected.length === STAR_NODES.length;
  const letters = Array.from(CONTENT.name);

  const handleStarActivate = (id: number) => {
    if (connected.includes(id)) return;
    const next = [...connected, id];
    setConnected(next);
    triggerHaptic(18);
    playSparkle();
    if (next.length === STAR_NODES.length) {
      triggerHaptic([30, 50, 40]);
      playCelebrate();
    }
  };

  const handleNext = () => {
    playTap();
    playWhoosh();
    nextScene();
  };

  return (
    <motion.section
      aria-label="Interactive Star Constellation Introduction"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex h-full w-full flex-col items-center justify-between py-6 text-center"
    >
      <div className="mt-4 text-xs uppercase tracking-[0.25em] text-lavender/80">
        Chapter 01 • Midnight Constellation
      </div>

      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="constellation-lock"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
            className="my-auto flex w-full flex-col items-center"
          >
            <p className="mb-4 max-w-xs font-sans text-sm text-gold">
              {CONTENT.intro.constellationPrompt} ({connected.length}/5)
            </p>

            {/* Interactive SVG Constellation Pad */}
            <div className="relative h-64 w-64 rounded-3xl glass-card p-4 shadow-2xl">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100">
                {/* Lines connecting tapped stars */}
                {connected.map((nodeId, idx) => {
                  if (idx === 0) return null;
                  const prev = STAR_NODES[connected[idx - 1]];
                  const curr = STAR_NODES[nodeId];
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={prev.x}
                      y1={prev.y}
                      x2={curr.x}
                      y2={curr.y}
                      stroke="#FFD98A"
                      strokeWidth="1.8"
                      strokeDasharray="3 2"
                    />
                  );
                })}

                {/* Faint guide lines */}
                {STAR_NODES.map((node, i) => {
                  const nextNode = STAR_NODES[(i + 1) % STAR_NODES.length];
                  return (
                    <line
                      key={`guide-${i}`}
                      x1={node.x}
                      y1={node.y}
                      x2={nextNode.x}
                      y2={nextNode.y}
                      stroke="rgba(255, 246, 236, 0.14)"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>

              {/* Tappable / Pointer-Enter Star Buttons */}
              {STAR_NODES.map((node) => {
                const active = connected.includes(node.id);
                return (
                  <button
                    key={node.id}
                    type="button"
                    aria-label={`Constellation Star ${node.id + 1}`}
                    onPointerDown={() => handleStarActivate(node.id)}
                    onPointerEnter={(e) => {
                      if (e.buttons > 0) handleStarActivate(node.id);
                    }}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className={`-translate-x-1/2 -translate-y-1/2 absolute flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 ${
                      active
                        ? 'scale-110 bg-gold text-midnight shadow-[0_0_25px_#FFD98A]'
                        : 'bg-plum/90 text-gold border border-gold/40 animate-pulse'
                    }`}
                  >
                    <Sparkles className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked-intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-auto flex flex-col items-center px-2"
          >
            <div
              aria-label={CONTENT.name}
              className="mb-3 flex flex-wrap justify-center font-display font-semibold text-gold drop-shadow-[0_0_24px_rgba(255,217,138,0.35)]"
              style={{ fontSize: 'clamp(2.5rem, 10vw, 3.75rem)' }}
            >
              {letters.map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: 0.1 + index * 0.08,
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="font-display italic text-xl text-rose"
            >
              “{CONTENT.intro.line1}”
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="mt-6 rounded-3xl glass-card p-5 text-base leading-relaxed text-cream/90"
            >
              {CONTENT.intro.line2}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full pb-4 min-h-[60px]">
        {isUnlocked && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose to-peach px-6 py-3.5 font-sans text-base font-semibold text-midnight shadow-[0_10px_30px_rgba(255,111,165,0.35)] transition-transform duration-150 active:scale-95"
          >
            {CONTENT.intro.cta}
          </motion.button>
        )}
      </div>
    </motion.section>
  );
};
