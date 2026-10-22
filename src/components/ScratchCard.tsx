import React, { useRef, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { triggerHaptic } from './TouchSparkles';
import { useAudio } from '../hooks/useAudio';

interface ScratchCardProps {
  secretText: string;
  subText: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ secretText, subText }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isDrawingRef = useRef(false);
  const { playCelebrate, playSparkle } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 320);
    const height = (canvas.height = 104);

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFD98A');
    grad.addColorStop(0.5, '#FF6FA5');
    grad.addColorStop(1, '#B8A1FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#1B1030';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Ungli se scratch karo (Secret Gift) 🎁', width / 2, height / 2 + 5);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;
    for (let i = 3; i < imageData.length; i += 16) {
      if (imageData[i] === 0) transparentPixels++;
    }
    const ratio = transparentPixels / (imageData.length / 16);
    if (ratio > 0.4) {
      setIsRevealed(true);
      triggerHaptic([25, 45, 35]);
      playSparkle();
      playCelebrate();
    }
  };

  return (
    <div className="relative mt-4 h-[104px] w-full shrink-0 overflow-hidden rounded-2xl border border-gold/40 bg-[#1B1030]/95 p-3 text-center shadow-inner select-none">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold">
          <Sparkles className="h-3.5 w-3.5 text-rose" />
          <span>VIP Birthday Voucher Unlocked!</span>
        </div>
        <p className="mt-1 font-display text-sm font-bold text-cream">{secretText}</p>
        <p className="mt-0.5 text-[10.5px] text-peach">{subText}</p>
      </div>

      {!isRevealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.stopPropagation();
            isDrawingRef.current = true;
            triggerHaptic(8);
            scratch(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (isDrawingRef.current) {
              e.stopPropagation();
              scratch(e.clientX, e.clientY);
            }
          }}
          onPointerUp={() => {
            isDrawingRef.current = false;
          }}
          onPointerLeave={() => {
            isDrawingRef.current = false;
          }}
          className="absolute inset-0 h-full w-full cursor-pointer touch-none"
        />
      )}
    </div>
  );
};
