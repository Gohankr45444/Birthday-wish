import React, { useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore, SceneId } from '../../store/useSceneStore';
import { soundEngine } from '../../hooks/useAudio';
import { triggerHaptic } from '../TouchSparkles';

const flameVertexShader = `
  uniform float uTime;
  uniform float uBlow;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float heightFactor = clamp((pos.y + 0.14) / 0.28, 0.0, 1.0);

    float flickerX = sin(uTime * 14.0 + uSeed * 6.28 + pos.y * 10.0) * 0.025 * heightFactor;
    float windBend = uBlow * 0.22 * pow(heightFactor, 1.4);
    float windSquash = 1.0 - uBlow * 0.35 * heightFactor;

    pos.x += flickerX + windBend;
    pos.z += cos(uTime * 11.0 + uSeed) * 0.018 * heightFactor;
    pos.y *= windSquash;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const flameFragmentShader = `
  uniform float uTime;
  uniform float uBlow;
  varying vec2 vUv;

  void main() {
    float y = clamp(vUv.y, 0.0, 1.0);
    vec3 coreColor = vec3(1.0, 0.97, 0.85);
    vec3 midColor = vec3(1.0, 0.78, 0.32);
    vec3 tipColor = vec3(1.0, 0.38, 0.55);

    vec3 col = mix(coreColor, midColor, smoothstep(0.0, 0.55, y));
    col = mix(col, tipColor, smoothstep(0.55, 1.0, y));

    float alpha = (1.0 - smoothstep(0.75, 1.0, y)) * (0.92 - uBlow * 0.2);
    gl_FragColor = vec4(col, alpha);
  }
`;

export const ProceduralCake: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const sliceRef = useRef<THREE.Group>(null);
  const userSpinVelRef = useRef<number>(0);
  const lastPointerXRef = useRef<number | null>(null);

  const currentScene = useSceneStore((s) => s.currentScene);
  const cakePhase = useSceneStore((s) => s.cakePhase);
  const candlesLit = useSceneStore((s) => s.candlesLit);
  const lightCandle = useSceneStore((s) => s.lightCandle);
  const isCakeSliced = useSceneStore((s) => s.isCakeSliced);
  const blowIntensity = useSceneStore((s) => s.blowIntensity);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);

  const isVisible =
    currentScene === SceneId.CAKE_HERO || currentScene === SceneId.CELEBRATION;

  const candlePositions = useMemo(() => {
    const count = candlesLit.length;
    const radius = 0.52;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      return [Math.cos(angle) * radius, 0.92, Math.sin(angle) * radius] as [
        number,
        number,
        number
      ];
    });
  }, [candlesLit.length]);

  const frostingDollops = useMemo(() => {
    const items: Array<{ pos: [number, number, number]; scale: number }> = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      items.push({
        pos: [Math.cos(a) * 1.22, 0.16, Math.sin(a) * 1.22],
        scale: 0.11,
      });
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      items.push({
        pos: [Math.cos(a) * 0.84, 0.72, Math.sin(a) * 0.84],
        scale: 0.09,
      });
    }
    return items;
  }, []);

  const flameMaterials = useMemo(() => {
    return candlesLit.map(
      (_, i) =>
        new THREE.ShaderMaterial({
          vertexShader: flameVertexShader,
          fragmentShader: flameFragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uBlow: { value: 0 },
            uSeed: { value: i * 1.7 + 0.5 },
          },
        })
    );
  }, [candlesLit.length]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    const targetScale = isVisible ? 1 : 0.001;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      Math.min(1, delta * 5)
    );

    if (!isVisible) return;

    if (!reducedMotion) {
      // Combine gentle auto-rotation with user finger-spin momentum
      groupRef.current.rotation.y += delta * 0.25 + userSpinVelRef.current;
      userSpinVelRef.current *= 0.92;
      groupRef.current.position.y = -0.35 + Math.sin(t * 1.6) * 0.04;
    }

    // Animate sliced wedge sliding out when cake is cut
    if (sliceRef.current) {
      const targetZ = isCakeSliced ? 0.48 : 0;
      const targetY = isCakeSliced ? 0.12 : 0;
      sliceRef.current.position.z = THREE.MathUtils.lerp(
        sliceRef.current.position.z,
        targetZ,
        delta * 4
      );
      sliceRef.current.position.y = THREE.MathUtils.lerp(
        sliceRef.current.position.y,
        targetY,
        delta * 4
      );
    }

    flameMaterials.forEach((mat) => {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uBlow.value = THREE.MathUtils.lerp(
        mat.uniforms.uBlow.value,
        blowIntensity,
        0.2
      );
    });
  });

  const handleCandleClick = (e: ThreeEvent<MouseEvent>, idx: number) => {
    e.stopPropagation();
    if (cakePhase === 'light' && !candlesLit[idx]) {
      triggerHaptic(20);
      soundEngine.playSfx('sparkle');
      lightCandle(idx);
    }
  };

  return (
    <group
      ref={groupRef}
      position={[0, -0.35, 0]}
      scale={0.001}
      onPointerDown={(e) => {
        lastPointerXRef.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (lastPointerXRef.current !== null) {
          const dx = e.clientX - lastPointerXRef.current;
          userSpinVelRef.current = dx * 0.003;
          lastPointerXRef.current = e.clientX;
        }
      }}
      onPointerUp={() => {
        lastPointerXRef.current = null;
      }}
    >
      {/* Golden Stand */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.45, 0.08, 40]} />
        <meshStandardMaterial color="#FFD98A" metalness={0.5} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.68, 0]}>
        <cylinderGeometry args={[0.45, 0.75, 0.4, 32]} />
        <meshStandardMaterial color="#FFD98A" metalness={0.45} roughness={0.3} />
      </mesh>

      {/* Bottom Cake Tier */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[1.25, 1.25, 0.68, 40]} />
        <meshStandardMaterial color="#FF6FA5" roughness={0.45} />
      </mesh>

      {/* Cream Icing Ring */}
      <mesh position={[0, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.22, 0.07, 16, 48]} />
        <meshStandardMaterial color="#FFF6EC" roughness={0.3} />
      </mesh>

      {/* Top Cake Tier */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.86, 0.86, 0.54, 36]} />
        <meshStandardMaterial color="#FFB58A" roughness={0.4} />
      </mesh>

      {/* Top Cream Cap */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.06, 36]} />
        <meshStandardMaterial color="#FFF6EC" roughness={0.25} />
      </mesh>

      {/* Interactive Cuttable Cake Wedge Slice */}
      <group ref={sliceRef}>
        <mesh position={[0, 0.52, 0.02]}>
          <cylinderGeometry args={[0.87, 0.87, 0.55, 16, 1, false, -0.35, 0.7]} />
          <meshStandardMaterial color="#FF6FA5" roughness={0.35} />
        </mesh>
      </group>

      {/* Whipped Cream Dollops */}
      {frostingDollops.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[d.scale, 14, 14]} />
          <meshStandardMaterial color="#FFF6EC" roughness={0.28} />
        </mesh>
      ))}

      {/* Candles + Interactive Hitboxes */}
      {candlePositions.map((pos, idx) => {
        const isLit = candlesLit[idx];
        return (
          <group
            key={idx}
            position={pos}
            onClick={(e) => handleCandleClick(e, idx)}
          >
            {/* Invisible generous touch target for mobile fingers */}
            <mesh position={[0, 0.18, 0]} visible={false}>
              <cylinderGeometry args={[0.22, 0.22, 0.65, 8]} />
              <meshBasicMaterial />
            </mesh>

            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.048, 0.048, 0.36, 16]} />
              <meshStandardMaterial color="#FFF6EC" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#FF6FA5' : '#B8A1FF'}
                roughness={0.35}
              />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.05, 8]} />
              <meshBasicMaterial color={cakePhase === 'light' && !isLit ? '#FFD98A' : '#2A1B2E'} />
            </mesh>

            {isLit ? (
              <group position={[0, 0.38, 0]}>
                <mesh material={flameMaterials[idx]}>
                  <coneGeometry args={[0.075, 0.28, 20, 12]} />
                </mesh>
                <pointLight
                  color="#FFD98A"
                  intensity={0.65 * (1 - blowIntensity * 0.4)}
                  distance={2.6}
                  decay={2}
                />
              </group>
            ) : (
              cakePhase !== 'light' && <SmokeWisp />
            )}
          </group>
        );
      })}
    </group>
  );
};

const SmokeWisp: React.FC = () => {
  const wispRef = useRef<THREE.Group>(null);
  const startTime = useRef<number | null>(null);

  useFrame((state) => {
    if (!wispRef.current) return;
    if (startTime.current === null) {
      startTime.current = state.clock.getElapsedTime();
    }
    const elapsed = state.clock.getElapsedTime() - startTime.current;
    if (elapsed > 2.5) {
      wispRef.current.visible = false;
      return;
    }
    wispRef.current.position.y = 0.28 + elapsed * 0.45;
    wispRef.current.position.x = Math.sin(elapsed * 5) * 0.06;
    const s = 1 + elapsed * 1.2;
    wispRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={wispRef} position={[0, 0.28, 0]}>
      <mesh>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color="#E2D9F3" transparent opacity={0.42} />
      </mesh>
    </group>
  );
};
