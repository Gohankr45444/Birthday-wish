import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { CONTENT } from '../content';
import { useSceneStore } from '../store/useSceneStore';
import { useAudio } from '../hooks/useAudio';
import { ScratchCard } from '../components/ScratchCard';
import { triggerHaptic } from '../components/TouchSparkles';

export const Scene6Letter: React.FC = () => {
  const [isOpened, setIsOpened] = useState(false);
  const nextScene = useSceneStore((s) => s.nextScene);
  const { playTap, playWhoosh, playSparkle } = useAudio();

  const handleOpenSeal = () => {
    triggerHaptic([25, 40]);
    playSparkle();
    playWhoosh();
    setIsOpened(true);
  };

  return (
    <motion.section
      aria-label="Personal Birthday Letter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex h-full w-full flex-col items-center justify-between py-4"
    >
      <div className="inline-flex items-center gap-1.5 rounded-full glass-card px-3.5 py-1 text-xs text-gold">
        <Heart className="h-3.5 w-3.5 fill-rose text-rose" />
        <span>Dil Se • Handwritten Note</span>
      </div>

      <AnimatePresence mode="wait">
        {!isOpened ? (
          /* Wax-Sealed Interactive Envelope */
          <motion.div
            key="wax-envelope"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08, rotateX: 25 }}
            transition={{ duration: 0.55 }}
            onClick={handleOpenSeal}
            className="my-auto flex w-full cursor-pointer flex-col items-center justify-center rounded-[28px] glass-card p-8 text-center shadow-2xl border border-gold/30"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-peach">
              For {CONTENT.name} Only
            </p>

            <div className="relative my-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold via-peach to-rose shadow-[0_0_35px_rgba(255,217,138,0.5)] transition-transform active:scale-90">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-midnight/40">
                <Sparkles className="h-8 w-8 text-midnight" />
              </div>
            </div>

            <p className="font-display text-lg font-semibold text-gold">
              {CONTENT.letter.envelopePrompt}
            </p>
          </motion.div>
        ) : (
          /* Unfolded Letter + Foil Scratch-Off Gift Card */
          <motion.div
            key="unfolded-letter"
            initial={{ rotateX: -18, opacity: 0, scale: 0.94 }}
            animate={{ rotateX: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="my-2 flex max-h-[70dvh] w-full flex-col overflow-y-auto custom-scroll rounded-[26px] glass-card p-5 text-left shadow-2xl"
          >
            <h2 className="font-handwriting text-3xl font-bold text-gold">
              {CONTENT.letter.salutation}
            </h2>

            <div className="mt-2.5 space-y-3 font-sans text-[14.5px] leading-relaxed text-cream/92">
              {CONTENT.letter.paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Interactive Foil Scratch-Off Gift Voucher */}
            <ScratchCard
              secretText={CONTENT.letter.voucherPrize}
              subText={CONTENT.letter.voucherSub}
            />

            <div className="mt-4 border-t border-cream/10 pt-2.5 text-right">
              <p className="font-sans text-xs text-cream/70">{CONTENT.letter.closing}</p>
              <p className="font-handwriting text-2xl font-bold text-rose">
                {CONTENT.letter.signature}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full pb-2 min-h-[56px]">
        {isOpened && (
          <button
            type="button"
            onClick={() => {
              playTap();
              playWhoosh();
              nextScene();
            }}
            className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose via-peach to-gold px-6 py-3.5 font-sans text-base font-semibold text-midnight shadow-[0_10px_28px_rgba(255,111,165,0.35)] transition-transform duration-150 active:scale-95"
          >
            {CONTENT.letter.nextCta}
          </button>
        )}
      </div>
    </motion.section>
  );
};
