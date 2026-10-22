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
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);

        const timeData = new Float32Array(analyser.fftSize);
        const freqData = new Uint8Array(analyser.frequencyBinCount);

        const nyquist = ctx.sampleRate / 2;
        const lowBandMaxBin = Math.max(
          4,
          Math.floor((1500 / nyquist) * analyser.frequencyBinCount)
        );

        const calibrationStart = performance.now();
        const calibrationSamples: number[] = [];
        let noiseFloor = 0.018;
        let calibrated = false;
        let blowStreakStart: number | null = null;
        let lastFrameTime = performance.now();

        const processAudio = (now: number) => {
          if (isCancelled) return;
          const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
          lastFrameTime = now;

          analyser.getFloatTimeDomainData(timeData);
          analyser.getByteFrequencyData(freqData);

          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            sumSquares += timeData[i] * timeData[i];
          }
          const rms = Math.sqrt(sumSquares / timeData.length);

          let lowBandEnergy = 0;
          let totalEnergy = 1;
          for (let i = 0; i < freqData.length; i++) {
            const val = freqData[i];
            totalEnergy += val;
            if (i <= lowBandMaxBin) {
              lowBandEnergy += val;
            }
          }
          const lowFreqRatio = lowBandEnergy / totalEnergy;

          if (!calibrated) {
            calibrationSamples.push(rms);
            if (now - calibrationStart >= 950) {
              const avgRms =
                calibrationSamples.reduce((a, b) => a + b, 0) /
                Math.max(1, calibrationSamples.length);
              noiseFloor = Math.min(0.08, Math.max(0.012, avgRms));
              calibrated = true;
              setMicStatus('listening');
            }
            rafRef.current = requestAnimationFrame(processAudio);
            return;
          }

          const rmsThreshold = noiseFloor * 2.1 + 0.015;
          const isBroadbandWind = lowFreqRatio > 0.42;
          const isLoudEnough = rms > rmsThreshold;

          if (isLoudEnough && isBroadbandWind) {
            const normalizedStrength = Math.min(
              1,
              (rms - rmsThreshold) / Math.max(0.08, noiseFloor * 4.5)
            );
            setBlowIntensity(0.35 + normalizedStrength * 0.65);

            if (blowStreakStart === null) {
              blowStreakStart = now;
            }
            const continuousBlowMs = now - blowStreakStart;

            if (continuousBlowMs >= 250) {
              addBlowEnergy(dt * (0.48 + normalizedStrength * 0.45));
            }
          } else {
            blowStreakStart = null;
            const currentIntensity = useSceneStore.getState().blowIntensity;
            if (currentIntensity > 0.01) {
              setBlowIntensity(currentIntensity * 0.84);
            } else if (currentIntensity !== 0) {
              setBlowIntensity(0);
            }
            noiseFloor = noiseFloor * 0.995 + Math.min(rms, noiseFloor) * 0.005;
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

    const handleVis = () => {
      if (document.hidden && audioCtxRef.current?.state === 'running') {
        audioCtxRef.current.suspend();
      } else if (!document.hidden && audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      isCancelled = true;
      document.removeEventListener('visibilitychange', handleVis);
      cleanupMic();
    };
  }, [enabled, cleanupMic, setBlowIntensity, addBlowEnergy, setMicStatus]);

  return { cleanupMic };
}
