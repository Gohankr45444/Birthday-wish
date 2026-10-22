import React from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useSceneStore } from '../store/useSceneStore';

export const MicLevelRing: React.FC = () => {
  const blowIntensity = useSceneStore((s) => s.blowIntensity);
  const blowProgress = useSceneStore((s) => s.blowProgress);
  const micStatus = useSceneStore((s) => s.micStatus);

  const ringScale = 1 + blowIntensity * 0.65;
  const strokeDashoffset = 176 - 176 * blowProgress;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose/40 to-gold/40 blur-md transition-transform duration-75"
          style={{
            transform: `scale(${ringScale})`,
            opacity: 0.25 + blowIntensity * 0.75,
          }}
        />

        <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(255, 246, 236, 0.15)"
            strokeWidth="3.5"
            fill="rgba(27, 16, 48, 0.65)"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="url(#blowGrad)"
            strokeWidth="3.5"
            strokeDasharray="176"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-150"
          />
          <defs>
            <linearGradient id="blowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6FA5" />
              <stop offset="100%" stopColor="#FFD98A" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute flex items-center justify-center">
          {micStatus === 'denied' || micStatus === 'unsupported' ? (
            <MicOff className="h-4 w-4 text-peach" />
          ) : micStatus === 'calibrating' ? (
            <Sparkles className="h-4 w-4 text-gold animate-spin" />
          ) : (
            <Mic
              className={`h-4 w-4 transition-colors ${
                blowIntensity > 0.15 ? 'text-gold' : 'text-rose'
              }`}
            />
          )}
        </div>
      </div>

      <span className="text-[11px] font-medium tracking-wide text-cream/75">
        {Math.round(blowProgress * 100)}% Wish Power ✨
      </span>
    </div>
  );
};
