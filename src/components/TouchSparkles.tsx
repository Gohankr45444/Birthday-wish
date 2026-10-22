import React, { useEffect, useRef } from 'react';
import { useSceneStore } from '../store/useSceneStore';

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const triggerHaptic = (pattern: number | number[] = 15) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore on unsupported browsers
    }
  }
};

export const TouchSparkles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sparkles: Sparkle[] = [];
    const colors = ['#FFD98A', '#FF6FA5', '#FFB58A', '#B8A1FF', '#FFF6EC'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (x: number, y: number, count = 3) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.2;
        sparkles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          size: 2 + Math.random() * 3.2,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const onPointerMove = (e: PointerEvent) => spawn(e.clientX, e.clientY, 2);
    const onPointerDown = (e: PointerEvent) => spawn(e.clientX, e.clientY, 8);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    let rafId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.alpha -= 0.026;

        if (p.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
    />
  );
};
