import { useEffect, useRef, useCallback } from 'react';
import { useSceneStore, SceneId } from '../store/useSceneStore';
import { soundEngine } from './useAudio';

export function useBlowDetection(enabled: boolean) {
  const setBlowIntensity = useSceneStore((s) => s.setBlowIntensity);
  const addBlowEnergy = useSceneStore((s) => s.addBlowEnergy);
  const setMicStatus = useSceneStore((s) => s.setMicStatus);
  const candlesLit = useSceneStore((s) => s.candlesLit);
  const cakePhase = useSceneStore((s) => s.cakePhase);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevCandlesCountRef = useRef<number>(candlesLit.filter(Boolean).length);

  useEffect(() => {
    const litCount = candlesLit.filter(Boolean).length;
    if (cakePhase === 'blow' && litCount < prevCandlesCountRef.current) {
      soundEngine.playSfx('puff');
    }
    prevCandlesCountRef.current = litCount;
  }, [candlesLit, cakePhase]);

  const cleanupMic = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      cleanupMic();
      return;
    }

    let isCancelled = false;

    async function startMicAnalysis() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicStatus('unsupported');
        return;
      }

      try {
        setMicStatus('calibrating');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const calibrationStart = performance.now();
        const calibrationSamples: number[] = [];
        let noiseFloor = 15;
        let calibrated = false;
        let lastFrameTime = performance.now();

        const processAudio = (now: number) => {
          if (isCancelled) return;
          const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
          lastFrameTime = now;

          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

          if (!calibrated) {
            calibrationSamples.push(avg);
            if (now - calibrationStart >= 950) {
              const avgNoise =
                calibrationSamples.reduce((a, b) => a + b, 0) /
                Math.max(1, calibrationSamples.length);
              noiseFloor = Math.max(12, avgNoise);
              calibrated = true;
              setMicStatus('listening');
            }
            rafRef.current = requestAnimationFrame(processAudio);
            return;
          }

          // Blow threshold based on your working code adjusted for ambient baseline
          const blowThreshold = noiseFloor + 18;

          if (avg > blowThreshold) {
            const intensity = Math.min(1, (avg - blowThreshold) / 50);
            setBlowIntensity(0.4 + intensity * 0.6);
            addBlowEnergy(dt * (0.5 + intensity * 0.5));
          } else {
            const currentIntensity = useSceneStore.getState().blowIntensity;
            if (currentIntensity > 0.02) {
              setBlowIntensity(currentIntensity * 0.82);
            } else {
              setBlowIntensity(0);
            }
            noiseFloor = noiseFloor * 0.995 + Math.min(avg, noiseFloor) * 0.005;
          }

          const state = useSceneStore.getState();
          if (state.currentScene === SceneId.CAKE_HERO && state.cakePhase === 'blow') {
            rafRef.current = requestAnimationFrame(processAudio);
          } else {
            cleanupMic();
          }
        };

        rafRef.current = requestAnimationFrame(processAudio);
      } catch {
        if (!isCancelled) {
          setMicStatus('denied');
        }
      }
    }

    startMicAnalysis();

    return () => {
      isCancelled = true;
      cleanupMic();
    };
  }, [enabled, cleanupMic, setBlowIntensity, addBlowEnergy, setMicStatus]);

  return { cleanupMic };
}