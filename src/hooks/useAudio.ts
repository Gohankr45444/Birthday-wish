import { useEffect, useRef, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { CONTENT } from '../content';
import { useSceneStore } from '../store/useSceneStore';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private bgHowl: Howl | null = null;
  private fallbackInterval: number | null = null;
  private fallbackGain: GainNode | null = null;
  private isUsingFallback = false;
  private unlocked = false;

  public initAndUnlock() {
    if (this.unlocked) return;
    this.unlocked = true;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx && !this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.bgHowl = new Howl({
      src: [CONTENT.musicUrl],
      loop: true,
      volume: 0,
      html5: false,
      onload: () => {
        this.bgHowl?.play();
        this.bgHowl?.fade(0, 0.55, 2200);
      },
      onloaderror: () => {
        this.startProceduralMusicBox();
      },
    });
  }

  private startProceduralMusicBox() {
    if (this.isUsingFallback || !this.ctx) return;
    this.isUsingFallback = true;

    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.01, this.ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 2.0);
    master.connect(this.ctx.destination);
    this.fallbackGain = master;

    const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 587.33, 440.0];
    let step = 0;

    const playNote = () => {
      if (!this.ctx || this.ctx.state !== 'running' || !this.fallbackGain) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[step % notes.length], now);

      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.22, now + 0.06);
      noteGain.gain.exponentialRampToValueAtTime(0.0008, now + 1.8);

      osc.connect(noteGain);
      noteGain.connect(this.fallbackGain);

      osc.start(now);
      osc.stop(now + 1.85);
      step++;
    };

    playNote();
    this.fallbackInterval = window.setInterval(playNote, 650);
  }

  public setMuted(muted: boolean) {
    Howler.mute(muted);
    if (this.fallbackGain && this.ctx) {
      this.fallbackGain.gain.setTargetAtTime(muted ? 0.0001 : 0.18, this.ctx.currentTime, 0.15);
    }
  }

  public duckMusic(duck: boolean) {
    const targetHowl = duck ? 0.14 : 0.65;
    if (this.bgHowl && this.bgHowl.playing()) {
      this.bgHowl.fade(this.bgHowl.volume(), targetHowl, 800);
    }
    if (this.fallbackGain && this.ctx && !useSceneStore.getState().isMuted) {
      this.fallbackGain.gain.setTargetAtTime(duck ? 0.05 : 0.22, this.ctx.currentTime, 0.3);
    }
  }

  public playSfx(
    type: 'tap' | 'whoosh' | 'puff' | 'celebrate' | 'sparkle' | 'pop' | 'slice'
  ) {
    if (useSceneStore.getState().isMuted) return;
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    if (type === 'tap') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.065);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.075);
    } else if (type === 'sparkle') {
      // Magical high chime for constellation stars & candle lighting
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(1480, now + 0.16);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } else if (type === 'pop') {
      // Balloon pop sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'slice') {
      // Quick sword/knife shimmer for slicing cake
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (type === 'whoosh') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.22);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'puff') {
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } else if (type === 'celebrate') {
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.14, now + idx * 0.06 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.06 + 1.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 1.45);
      });
    }
  }

  public pauseOnHide(hidden: boolean) {
    if (!this.ctx) return;
    if (hidden) {
      this.ctx.suspend();
      this.bgHowl?.pause();
    } else if (!useSceneStore.getState().isMuted) {
      this.ctx.resume();
      this.bgHowl?.play();
    }
  }
}

export const soundEngine = new SoundEngine();

export function useAudio() {
  const isMuted = useSceneStore((s) => s.isMuted);
  const prevMuted = useRef(isMuted);

  useEffect(() => {
    if (prevMuted.current !== isMuted) {
      soundEngine.setMuted(isMuted);
      prevMuted.current = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const handleVisibility = () => {
      soundEngine.pauseOnHide(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const unlockAudio = useCallback(() => soundEngine.initAndUnlock(), []);
  const playTap = useCallback(() => soundEngine.playSfx('tap'), []);
  const playSparkle = useCallback(() => soundEngine.playSfx('sparkle'), []);
  const playPop = useCallback(() => soundEngine.playSfx('pop'), []);
  const playSlice = useCallback(() => soundEngine.playSfx('slice'), []);
  const playWhoosh = useCallback(() => soundEngine.playSfx('whoosh'), []);
  const playPuff = useCallback(() => soundEngine.playSfx('puff'), []);
  const playCelebrate = useCallback(() => soundEngine.playSfx('celebrate'), []);
  const duckMusic = useCallback((duck: boolean) => soundEngine.duckMusic(duck), []);

  return {
    unlockAudio,
    playTap,
    playSparkle,
    playPop,
    playSlice,
    playWhoosh,
    playPuff,
    playCelebrate,
    duckMusic,
  };
}
