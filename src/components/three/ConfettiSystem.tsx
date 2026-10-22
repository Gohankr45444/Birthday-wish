import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, SceneId } from '../../store/useSceneStore';

export const ConfettiSystem: React.FC<{ count?: number }> = ({ count = 140 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const currentScene = useSceneStore((s) => s.currentScene);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const isActive =
    currentScene === SceneId.COUNTDOWN ||
    currentScene === SceneId.CELEBRATION ||
    currentScene === SceneId.FINALE;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const colors = ['#FF6FA5', '#FFD98A', '#B8A1FF', '#FFB58A', '#FFF6EC'];
    return Array.from({ length: count }).map((_, i) => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 4
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2.2,
        Math.random() * 2.5 + 1.5,
        (Math.random() - 0.5) * 2.2
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      ),
      color: new THREE.Color(colors[i % colors.length]),
    }));
  }, [count]);

  useEffect(() => {
    if (!isActive || !meshRef.current) return;
    particles.forEach((p, idx) => {
      p.position.set(
        (Math.random() - 0.5) * 1.2,
        0.2 + Math.random() * 0.8,
        (Math.random() - 0.5) * 1.2
      );
      p.velocity.set(
        (Math.random() - 0.5) * 3.8,
        Math.random() * 3.8 + 2.0,
        (Math.random() - 0.5) * 3.2
      );
      meshRef.current?.setColorAt(idx, p.color);
    });
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [isActive, currentScene, particles]);

  useFrame((_, delta) => {
    if (!meshRef.current || !isActive || reducedMotion) return;
    const dt = Math.min(0.05, delta);

    particles.forEach((p, i) => {
      p.velocity.y -= 3.2 * dt;
      p.velocity.x *= 0.99;
      p.position.addScaledVector(p.velocity, dt);

      p.rotation.x += p.rotSpeed.x * dt;
      p.rotation.y += p.rotSpeed.y * dt;

      if (p.position.y < -3.2) {
        p.position.y = 3.8;
        p.position.x = (Math.random() - 0.5) * 5;
        p.velocity.y = -0.8 - Math.random() * 1.2;
      }

      dummy.position.copy(p.position);
      dummy.rotation.copy(p.rotation);
      dummy.scale.set(0.07, 0.11, 0.02);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!isActive || reducedMotion) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.3} metalness={0.2} />
    </instancedMesh>
  );
};
