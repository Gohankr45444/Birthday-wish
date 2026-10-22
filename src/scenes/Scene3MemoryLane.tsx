import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw, Heart } from 'lucide-react';
import { CONTENT } from '../content';
import { useSceneStore } from '../store/useSceneStore';
import { useDeviceTilt } from '../hooks/useDeviceTilt';
import { useAudio } from '../hooks/useAudio';
import { triggerHaptic } from '../components/TouchSparkles';

export const Scene3MemoryLane: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const lastTapRef = useRef<number>(0);

  const nextScene = useSceneStore((s) => s.nextScene);
  const { rotateX, rotateY, handlePointerMove, handlePointerLeave } = useDeviceTilt();
  const { playTap, playWhoosh, playSparkle } = useAudio();

  const memories = CONTENT.memories;
  const currentCard = memories[activeIndex];

  const paginate = (newDirection: number) => {
    const nextIdx = activeIndex + newDirection;
    if (nextIdx >= 0 && nextIdx < memories.length) {
      playWhoosh();
      setIsFlipped(false);
      setDirection(newDirection);
      setActiveIndex(nextIdx);
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const swipeThreshold = 45;
    if (info.offset.x < -swipeThreshold && activeIndex < memories.length - 1) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold && activeIndex > 0) {
      paginate(-1);
    }
  };

  const handlePhotoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      // Double-tap heart burst!
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      triggerHaptic([15, 30]);
      playSparkle();
      setHearts((prev) => [...prev.slice(-6), { id: now + Math.random(), x, y }]);
    }
    lastTapRef.current = now;
  };

  return (
    <motion.section
      aria-label="Memory Lane Cards"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
      transition={{ duration: 0.7 }}
      className="relative z-10 flex h-full w-full flex-col items-center justify-between py-4"
    >
      <div className="text-center">
        <h2
          className="font-display font-semibold text-cream"
          style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2rem)' }}
        >
          {CONTENT.memoriesHeader.title}
        </h2>
        <p className="mt-1 text-xs text-gold/90">{CONTENT.memoriesHeader.subtitle}</p>
      </div>

      <div
        className="relative my-auto flex w-full items-center justify-center"
        style={{ perspective: '1000px' }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={currentCard.id}
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: direction > 0 ? 90 : -90, scale: 0.92 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              rotateX,
              rotateY,
            }}
            exit={{ opacity: 0, x: direction > 0 ? -90 : 90, scale: 0.92 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full cursor-grab active:cursor-grabbing rounded-[26px] glass-card p-4 shadow-2xl select-none"
          >
            {!isFlipped ? (
              <div>
                {/* Front of Polaroid */}
                <div
                  onClick={handlePhotoTap}
                  className="relative h-72 w-full overflow-hidden rounded-2xl bg-plum cursor-pointer"
                >
                  {/* Blurred ambient background fill so sides don't look empty */}
                  <img
                    src={currentCard.imageUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-50"
                  />

                  {/* Full uncropped 720x1280 portrait image */}
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.title}
                    loading="lazy"
                    draggable={false}
                    className="relative z-10 h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A1F]/80 via-transparent to-transparent" />

                  <span className="absolute left-3 top-3 rounded-full bg-midnight/75 px-3 py-1 text-[11px] font-medium text-gold backdrop-blur-md">
                    {currentCard.dateTag}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(15);
                      playTap();
                      setIsFlipped(true);
                    }}
                    className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose/85 px-2.5 py-1 text-[11px] font-semibold text-midnight shadow-md active:scale-90"
                  >
                    <RotateCw className="h-3 w-3" />
                    <span>Flip ↻</span>
                  </button>

                  <span className="absolute right-3 bottom-3 text-2xl">
                    {currentCard.sticker}
                  </span>

                  {/* Double-tap floating hearts */}
                  {hearts.map((h) => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 1, scale: 0.3, y: 0 }}
                      animate={{ opacity: 0, scale: 1.6, y: -55 }}
                      transition={{ duration: 0.75 }}
                      style={{ left: h.x - 14, top: h.y - 14 }}
                      className="pointer-events-none absolute text-rose"
                    >
                      <Heart className="h-8 w-8 fill-rose text-rose drop-shadow" />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 text-left px-1">
                  <h3 className="font-display text-lg font-semibold text-gold">
                    {currentCard.title}
                  </h3>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-cream/90">
                    {currentCard.caption}
                  </p>
                </div>
              </div>
            ) : (
              /* Back of Polaroid (Secret Behind-The-Scenes Roast/Note) */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-[292px] flex-col items-center justify-between rounded-2xl bg-[#1B1030]/90 p-5 text-center border border-gold/30"
              >
                <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold">
                  🤫 Secret Behind-The-Scenes
                </span>

                <p className="my-auto font-handwriting text-2xl leading-relaxed text-cream">
                  “{currentCard.secretBackNote}”
                </p>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(12);
                    playTap();
                    setIsFlipped(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-4 py-1.5 text-xs font-medium text-peach active:scale-95"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Wapas Photo Dekho</span>
                </button>
              </motion.div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-cream/10 pt-3">
              <button
                type="button"
                onClick={() => paginate(-1)}
                disabled={activeIndex === 0}
                aria-label="Previous memory"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream disabled:opacity-30 active:scale-90"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-1.5">
                {memories.map((m, idx) => (
                  <span
                    key={m.id}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex ? 'w-6 bg-rose' : 'w-2 bg-cream/25'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => paginate(1)}
                disabled={activeIndex === memories.length - 1}
                aria-label="Next memory"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream disabled:opacity-30 active:scale-90"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="w-full pb-2">
        <button
          type="button"
          onClick={() => {
            playTap();
            nextScene();
          }}
          className="flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose via-peach to-gold px-6 py-3.5 font-sans text-base font-semibold text-midnight shadow-[0_10px_28px_rgba(255,111,165,0.35)] transition-transform duration-150 active:scale-95"
        >
          {CONTENT.memoriesHeader.cta}
        </button>
      </div>
    </motion.section>
  );
};
