import React, { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSceneStore, SceneId } from './store/useSceneStore';
import { AudioToggle } from './components/AudioToggle';
import { LoadingScreen } from './components/LoadingScreen';
import { WebGLErrorBoundary } from './components/WebGLErrorBoundary';
import { TouchSparkles } from './components/TouchSparkles';
import { Scene0Gate } from './scenes/Scene0Gate';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Countdown } from './scenes/Scene2Countdown';
import { Scene3MemoryLane } from './scenes/Scene3MemoryLane';
import { Scene4Cake } from './scenes/Scene4Cake';
import { Scene6Letter } from './scenes/Scene6Letter';
import { Scene7Finale } from './scenes/Scene7Finale';

const SceneCanvas = lazy(() => import('./components/three/SceneCanvas'));

export const App: React.FC = () => {
  const currentScene = useSceneStore((s) => s.currentScene);
  const setReducedMotion = useSceneStore((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setReducedMotion]);

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden select-none">
      <AudioToggle />
      <TouchSparkles />

      <WebGLErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <SceneCanvas />
        </Suspense>
      </WebGLErrorBoundary>

      <div className="pointer-events-none hidden md:block fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,rgba(8,4,20,0.65)_100%)]" />

      <main className="safe-stage pointer-events-none relative z-10 flex h-full w-full max-w-[430px] flex-col justify-between md:h-[92dvh] md:max-h-[860px] md:rounded-[38px] md:border md:border-cream/15 md:bg-[#1B1030]/25 md:p-6 md:shadow-[0_25px_90px_rgba(0,0,0,0.75)] md:backdrop-blur-sm [&>*]:pointer-events-auto">
        <AnimatePresence mode="wait">
          {currentScene === SceneId.GATE && <Scene0Gate key="scene-gate" />}
          {currentScene === SceneId.INTRO && <Scene1Intro key="scene-intro" />}
          {currentScene === SceneId.COUNTDOWN && <Scene2Countdown key="scene-countdown" />}
          {currentScene === SceneId.MEMORY_LANE && <Scene3MemoryLane key="scene-memories" />}
          {(currentScene === SceneId.CAKE_HERO ||
            currentScene === SceneId.CELEBRATION) && <Scene4Cake key="scene-cake" />}
          {currentScene === SceneId.LETTER && <Scene6Letter key="scene-letter" />}
          {currentScene === SceneId.FINALE && <Scene7Finale key="scene-finale" />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
