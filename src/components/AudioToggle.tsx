import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSceneStore, SceneId } from '../store/useSceneStore';

export const AudioToggle: React.FC = () => {
  const currentScene = useSceneStore((s) => s.currentScene);
  const isMuted = useSceneStore((s) => s.isMuted);
  const toggleMute = useSceneStore((s) => s.toggleMute);

  if (currentScene === SceneId.GATE) return null;

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      className="fixed top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full glass-card text-cream transition-transform duration-200 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose"
      style={{
        marginTop: 'env(safe-area-inset-top)',
        marginRight: 'env(safe-area-inset-right)',
      }}
    >
      {isMuted ? (
        <VolumeX className="h-5 w-5 text-rose" />
      ) : (
        <span className="relative flex items-center justify-center">
          <Volume2 className="h-5 w-5 text-gold" />
          <span className="absolute -right-1 -top-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose" />
          </span>
        </span>
      )}
    </button>
  );
};
