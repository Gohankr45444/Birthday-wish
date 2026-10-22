import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, SceneId } from '../../store/useSceneStore';
import { soundEngine } from '../../hooks/useAudio';
import { triggerHaptic } from '../TouchSparkles';

export const FloatingBalloons: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const currentScene = useSceneStore((s) => s.currentScene);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const popBalloon = useSceneStore((s) => s.popBalloon);

  const isActive =
    currentScene === SceneId.CELEBRATION || currentScene === SceneId.FINALE;

  const balloons = useMemo(() => {
    const colors = ['#FF6FA5', '#FFB58A', '#B8A1FF', '#FFD98A', '#FF6FA5', '#B8A1FF'];
    return Array.from({ length: 8 }).map((_, i) => ({
      x: (i - 3.5) * 0.65 + (Math.random() - 0.5) * 0.25,
      yOffset: -3.2 - i * 0.5,
      z: -1.2 - (i % 3) * 0.6,
      speed: 0.55 + (i % 3) * 0.18,
      swayPhase: i * 1.3,
      color: colors[i % colors.length],
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !isActive || reducedMotion) return;
    const t = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, idx) => {
      const b = balloons[idx];
      if (!b) return;
      child.position.y += b.speed * delta;
      child.position.x = b.x + Math.sin(t * 1.4 + b.swayPhase) * 0.18;
      if (child.position.y > 4.2) {
        child.position.y = -4.0;
      }
    });
  });

  const handlePop = (e: ThreeEvent<MouseEvent>, idx: number) => {
    e.stopPropagation();
    triggerHaptic([20, 30]);
    soundEngine.playSfx('pop');
    popBalloon(e.clientX, e.clientY);

    // Respawn balloon at bottom so she can pop endlessly
    if (groupRef.current && groupRef.current.children[idx]) {
      groupRef.current.children[idx].position.y = -4.2;
    }
  };

  if (!isActive) return null;

  return (
    <group ref={groupRef}>
      {balloons.map((b, i) => (
        <group
          key={i}
          position={[b.x, reducedMotion ? (i % 3) - 0.5 : b.yOffset, b.z]}
          onClick={(e) => handlePop(e, i)}
        >
          <mesh scale={[0.36, 0.44, 0.36]}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial
              color={b.color}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.75, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.7, 6]} />
            <meshBasicMaterial color="#FFF6EC" transparent opacity={0.45} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
