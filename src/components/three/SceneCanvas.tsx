import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { Starfield } from './Starfield';
import { ProceduralCake } from './ProceduralCake';
import { ConfettiSystem } from './ConfettiSystem';
import { FloatingBalloons } from './FloatingBalloons';
import { useSceneStore, SceneId } from '../../store/useSceneStore';

const CameraRig: React.FC = () => {
  const currentScene = useSceneStore((s) => s.currentScene);

  useFrame((state, delta) => {
    const isCakeFocus =
      currentScene === SceneId.CAKE_HERO || currentScene === SceneId.CELEBRATION;
    const targetPos = isCakeFocus
      ? new THREE.Vector3(0, 0.95, 4.1)
      : new THREE.Vector3(0, 0.2, 5.0);

    state.camera.position.lerp(targetPos, Math.min(1, delta * 3.2));
    state.camera.lookAt(0, isCakeFocus ? 0.15 : 0, 0);
  });

  return null;
};

export const SceneCanvas: React.FC = () => {
  const [lowTier, setLowTier] = useState(false);
  const currentScene = useSceneStore((s) => s.currentScene);

  const ambientIntensity = currentScene === SceneId.CAKE_HERO ? 0.45 : 0.85;

  // Enable pointer events on the 3D canvas during Cake & Finale scenes so 3D candles & balloons are clickable!
  const interactive3D =
    currentScene === SceneId.CAKE_HERO ||
    currentScene === SceneId.CELEBRATION ||
    currentScene === SceneId.FINALE;

  return (
    <div
      className={`fixed inset-0 z-0 ${
        interactive3D ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.2, 5], fov: 45 }}
        gl={{ antialias: !lowTier, alpha: true, powerPreference: 'high-performance' }}
      >
        <PerformanceMonitor
          onDecline={() => setLowTier(true)}
          onIncline={() => setLowTier(false)}
        />

        <CameraRig />

        <ambientLight intensity={ambientIntensity} color="#FFF6EC" />
        <directionalLight position={[3, 6, 4]} intensity={1.1} color="#FFD98A" />
        <directionalLight position={[-4, 2, -2]} intensity={0.6} color="#FF6FA5" />

        <Starfield count={lowTier ? 160 : 360} />
        <ProceduralCake />
        <ConfettiSystem count={lowTier ? 65 : 140} />
        <FloatingBalloons />
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
