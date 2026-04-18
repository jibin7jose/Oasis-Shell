import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { useSystemStore } from '../../lib/systemStore';

export const SoundscapeManager: React.FC = () => {
    const { founderMetrics } = useSystemStore();
    const [isMuted, setIsMuted] = useState(true);
    const [audioStarted, setAudioStarted] = useState(false);
    
    // Audio Context and Nodes
    const audioCtx = useRef<AudioContext | null>(null);
    const mainGain = useRef<GainNode | null>(null);
    const oscillator1 = useRef<OscillatorNode | null>(null);
    const oscillator2 = useRef<OscillatorNode | null>(null);
    const filter = useRef<BiquadFilterNode | null>(null);

    const initAudio = () => {
        if (audioCtx.current) return;
        
        audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        mainGain.current = audioCtx.current.createGain();
        filter.current = audioCtx.current.createBiquadFilter();
        
        mainGain.current.gain.value = 0.05; // Low volume background
        filter.current.type = 'lowpass';
        filter.current.frequency.value = 400;

        mainGain.current.connect(filter.current);
        filter.current.connect(audioCtx.current.destination);

        // Core Ambient Tone (Drone 1)
        oscillator1.current = audioCtx.current.createOscillator();
        oscillator1.current.type = 'sine';
        oscillator1.current.frequency.setValueAtTime(55, audioCtx.current.currentTime); // low A
        
        const osc1Gain = audioCtx.current.createGain();
        osc1Gain.gain.value = 0.5;
        osc1Gain.connect(mainGain.current);
        oscillator1.current.connect(osc1Gain);
        oscillator1.current.start();

        // Harmonic Pulse (Drone 2)
        oscillator2.current = audioCtx.current.createOscillator();
        oscillator2.current.type = 'triangle';
        oscillator2.current.frequency.setValueAtTime(110, audioCtx.current.currentTime); // A2
        
        const osc2Gain = audioCtx.current.createGain();
        osc2Gain.gain.setValueAtTime(0.2, audioCtx.current.currentTime);
        osc2Gain.connect(mainGain.current);
        oscillator2.current.connect(osc2Gain);
        oscillator2.current.start();

        // LFO for "Neural Breathing"
        const lfo = audioCtx.current.createOscillator();
        const lfoGain = audioCtx.current.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // slow breath
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(mainGain.current.gain);
        lfo.start();

        setAudioStarted(true);
        setIsMuted(false);
    };

    const toggleMute = () => {
        if (!audioStarted) {
            initAudio();
            return;
        }
        
        if (mainGain.current && audioCtx.current) {
            const nextValue = isMuted ? 0.05 : 0;
            mainGain.current.gain.setTargetAtTime(nextValue, audioCtx.current.currentTime, 0.5);
            setIsMuted(!isMuted);
        }
    };

    // React to System Stress
    useEffect(() => {
        if (!audioCtx.current || !oscillator1.current || !filter.current || isMuted) return;

        const isCritical = founderMetrics.stress_color === '#ef4444';
        const targetFreq = isCritical ? 45 : 55; // Darker when high stress
        const filterFreq = isCritical ? 200 : 600; // Muffled when high stress
        const resonance = isCritical ? 15 : 2;

        oscillator1.current.frequency.setTargetAtTime(targetFreq, audioCtx.current.currentTime, 2);
        filter.current.frequency.setTargetAtTime(filterFreq, audioCtx.current.currentTime, 2);
        filter.current.Q.setTargetAtTime(resonance, audioCtx.current.currentTime, 2);

    }, [founderMetrics.stress_color, isMuted]);

    return (
        <div className="fixed bottom-8 left-8 z-[9000] flex items-center gap-4 group">
            <button
                onClick={toggleMute}
                className={`p-3 rounded-xl border transition-all duration-500 flex items-center gap-3 ${
                    isMuted 
                    ? 'bg-white/5 border-white/10 text-slate-500 hover:text-white' 
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:scale-105'
                }`}
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                    {isMuted ? "Resonance Offline" : "Ambient Resonance: Nominal"}
                </span>
            </button>
            
            {!isMuted && (
                <div className="flex gap-1 items-end h-3 mb-1 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <motion.div
                            key={i}
                            animate={{ height: [4, 12, 4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-0.5 bg-indigo-500/40 rounded-full"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

import { motion } from 'framer-motion';
