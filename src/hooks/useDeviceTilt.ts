import { useState, useEffect, useCallback } from 'react';
import { useSceneStore } from '../store/useSceneStore';

interface TiltValues {
  rotateX: number;
  rotateY: number;
  handlePointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  handlePointerLeave: () => void;
}

export function useDeviceTilt(): TiltValues {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [hasGyro, setHasGyro] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      setHasGyro(true);
      const clampedBeta = Math.max(-25, Math.min(25, e.beta - 45));
      const clampedGamma = Math.max(-25, Math.min(25, e.gamma));

      setTilt({
        rotateX: Number((-clampedBeta * 0.45).toFixed(2)),
        rotateY: Number((clampedGamma * 0.45).toFixed(2)),
      });
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [reducedMotion]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reducedMotion || hasGyro) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({
        rotateX: Number((-y * 16).toFixed(2)),
        rotateY: Number((x * 16).toFixed(2)),
      });
    },
    [reducedMotion, hasGyro]
  );

  const handlePointerLeave = useCallback(() => {
    if (!hasGyro) {
      setTilt({ rotateX: 0, rotateY: 0 });
    }
  }, [hasGyro]);

  return {
    rotateX: reducedMotion ? 0 : tilt.rotateX,
    rotateY: reducedMotion ? 0 : tilt.rotateY,
    handlePointerMove,
    handlePointerLeave,
  };
}
