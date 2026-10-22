import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../../store/useSceneStore';

interface StarfieldProps {
  count?: number;
}

export const Starfield: React.FC<StarfieldProps> = ({ count = 350 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#FFF6EC'),
      new THREE.Color('#FFD98A'),
      new THREE.Color('#FF6FA5'),
      new THREE.Color('#B8A1FF'),
    ];

    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi) - 6;

      const picked = palette[i % palette.length];
      col[i * 3] = picked.r;
      col[i * 3 + 1] = picked.g;
      col[i * 3 + 2] = picked.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.025;
    pointsRef.current.rotation.x = Math.sin(t * 0.08) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
