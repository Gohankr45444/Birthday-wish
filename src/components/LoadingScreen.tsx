import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0E0A1F] text-cream"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-rose/25 blur-xl animate-pulse" />
        <span className="text-4xl animate-bounce">🎂</span>
      </div>
      <p className="mt-4 font-display text-lg text-gold/90 tracking-wide">
        Sajaavat ho rahi hai... ✨
      </p>
    </div>
  );
};
