import React, { Component, ReactNode } from 'react';
import { useSceneStore, SceneId } from '../store/useSceneStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return <Fallback2DStage />;
    }
    return this.props.children;
  }
}

const Fallback2DStage: React.FC = () => {
  const currentScene = useSceneStore((s) => s.currentScene);
  const candlesLit = useSceneStore((s) => s.candlesLit);
  const blowIntensity = useSceneStore((s) => s.blowIntensity);
  const lightCandle = useSceneStore((s) => s.lightCandle);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#1B1030] to-[#0E0A1F]">
      <div className="absolute inset-0 opacity-60">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-cream animate-pulse"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              top: `${(i * 17) % 95}%`,
              left: `${(i * 29) % 95}%`,
              animationDelay: `${(i % 5) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {(currentScene === SceneId.CAKE_HERO || currentScene === SceneId.CELEBRATION) && (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="flex gap-3 mb-1">
            {candlesLit.map((isLit, idx) => (
              <div
                key={idx}
                onClick={() => lightCandle(idx)}
                className="flex flex-col items-center cursor-pointer"
              >
                {isLit && (
                  <div
                    className="h-5 w-3 rounded-full bg-gradient-to-t from-rose via-peach to-gold shadow-[0_0_14px_#FFD98A] transition-transform"
                    style={{
                      transform: `rotate(${blowIntensity * 32}deg) scaleY(${
                        1 - blowIntensity * 0.3
                      })`,
                    }}
                  />
                )}
                <div className="h-8 w-2 rounded-t-sm bg-cream border border-rose/40" />
              </div>
            ))}
          </div>
          <div className="h-14 w-36 rounded-t-2xl bg-gradient-to-r from-rose to-peach border-t-4 border-cream shadow-lg" />
          <div className="h-20 w-52 rounded-t-2xl bg-gradient-to-r from-lavender via-rose to-peach border-t-4 border-cream shadow-2xl" />
          <div className="h-3 w-60 rounded-full bg-gold/80" />
        </div>
      )}
    </div>
  );
};
