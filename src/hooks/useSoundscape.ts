import { useCallback, useRef } from 'react';

export function useSoundscape() {
  const audioCtx = useRef<AudioContext | null>(null);
  const engineBase = useRef<OscillatorNode | null>(null);
  const engineTexture = useRef<OscillatorNode | null>(null);
  const engineGain = useRef<GainNode | null>(null);
  const engineFilter = useRef<BiquadFilterNode | null>(null);

  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const startEngine = useCallback(() => {
    initAudio();
    if (!audioCtx.current || engineBase.current) return;
    const ctx = audioCtx.current;

    const base = ctx.createOscillator();
    const texture = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    base.type = 'sine';
    base.frequency.setValueAtTime(40, ctx.currentTime);

    texture.type = 'sawtooth';
    texture.frequency.setValueAtTime(40, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime); 

    base.connect(filter);
    texture.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    base.start();
    texture.start();

    engineBase.current = base;
    engineTexture.current = texture;
    engineGain.current = gain;
    engineFilter.current = filter;

    // Fade in primary hum
    gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + 3);
  }, []);

  const updateEngine = useCallback((load: number) => {
    if (!audioCtx.current || !engineBase.current || !engineGain.current || !engineFilter.current) return;
    if (typeof load !== 'number' || !Number.isFinite(load)) return;
    const ctx = audioCtx.current;
    const normalizedLoad = Math.min(100, Math.max(0, load)) / 100;

    // Phase 9.2: Sensory Feedback Bridge (Dynamic Hum)
    // Subsonic scaling (40Hz to 80Hz)
    const baseFreq = 40 + (normalizedLoad * 40);
    engineBase.current.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.5);

    // Filter resonance scaling (200Hz to 2500Hz)
    const filterFreq = 200 + (Math.pow(normalizedLoad, 2) * 2300);
    engineFilter.current.frequency.setTargetAtTime(filterFreq, ctx.currentTime, 0.3);
    engineFilter.current.Q.setTargetAtTime(2 + (normalizedLoad * 8), ctx.currentTime, 0.3);

    // Texture harmonics scaling
    if (engineTexture.current) {
      engineTexture.current.frequency.setTargetAtTime(baseFreq * 2.01, ctx.currentTime, 0.5);
    }
  }, []);

  const playClick = useCallback(() => {
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playPulse = useCallback((freq = 440) => {
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq / 2, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const playHandshake = useCallback(() => {
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < ctx.sampleRate * 2; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(40, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 1.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + 2.0);
  }, []);

  const playNotification = useCallback(() => {
    initAudio();
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(440, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  }, []);

  return { 
    playClick, 
    playPulse, 
    playHandshake, 
    playNotification,
    playMutationSuccess,
    playAuraHandshake,
    startEngine,
    updateEngine
  };
}


