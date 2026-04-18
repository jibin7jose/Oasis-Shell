import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Activity, Zap, ShieldCheck, Cpu, Database, ChevronRight, Binary, Fingerprint } from 'lucide-react';
import { listen } from "@tauri-apps/api/event";
import { useSystemStore } from "../../lib/systemStore";

export const RealityBridge: React.FC<{ isOpen: boolean; onClose: () => void; query: string }> = ({ isOpen, onClose, query }) => {
    const { logEvent } = useSystemStore();
    const [step, setStep] = useState<'IDLE' | 'VISIONARY_SENSING' | 'SYSTEMIC_TELEMETRY' | 'STRATEGIC_SYNTHESIS' | 'COMPLETE'>('IDLE');
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            const unlisten = listen('reality-bridge-pulse', (event: any) => {
                setStep(event.payload);
                logEvent(`Reality Bridge: Transitioning to ${event.payload}`, "system");
            });

            const handleComplete = (e: any) => {
                setResult(e.detail);
                setStep('COMPLETE');
                logEvent("Reality Bridge: Synthesis Resonance Complete.", "neural");
            };

            window.addEventListener('reality-bridge-complete', handleComplete);

            return () => {
                unlisten.then(f => f());
                window.removeEventListener('reality-bridge-complete', handleComplete);
            };
        } else {
            setStep('IDLE');
            setResult(null);
        }
    }, [isOpen]);
 Arkansas Arkansas

    const steps = [
        { id: 'VISIONARY_SENSING', label: 'Visionary Sensing', icon: Eye, color: 'text-amber-500' },
        { id: 'SYSTEMIC_TELEMETRY', label: 'Systemic Telemetry', icon: Activity, color: 'text-blue-500' },
        { id: 'STRATEGIC_SYNTHESIS', label: 'Strategic Synthesis', icon: Brain, color: 'text-purple-500' }
    ];

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-20"
        >
            <div className="w-full max-w-5xl glass-bright rounded-[3rem] p-12 border-white/10 relative overflow-hidden flex gap-12">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                {/* Left: Chain Visualizer */}
                <div className="w-[300px] space-y-8 relative z-10">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Reality Bridge</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" /> Multi-Model Synthesis v2.1
                        </p>
                    </div>

                    <div className="space-y-4">
                        {steps.map((s, i) => {
                            const isActive = step === s.id;
                            const isPast = steps.findIndex(x => x.id === step) > i || step === 'COMPLETE';
                            
                            return (
                                <div key={s.id} className="relative">
                                    <div className={`flex items-center gap-4 transition-all duration-500 ${isActive || isPast ? 'opacity-100' : 'opacity-20'}`}>
                                        <div className={`p-4 rounded-2xl ${isActive ? 'bg-white/10 shadow-2xl scale-110' : 'bg-white/5'}`}>
                                            <s.icon className={`w-5 h-5 ${isActive ? s.color : 'text-slate-400'}`} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                                            <div className={`text-[9px] font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                                                {isActive ? 'Processing...' : isPast ? 'Resonance Captured' : 'Awaiting Manifest'}
                                            </div>
                                        </div>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="ml-6.5 mt-2 h-4 w-0.5 bg-white/5" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-12">
                         <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                            <div className="flex items-center gap-3 text-emerald-500">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Founder Query</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">"{query}"</p>
                         </div>
                    </div>
                </div>

                {/* Right: Insights Output */}
                <div className="flex-1 space-y-8 relative z-10">
                    <AnimatePresence mode="wait">
                        {step === 'COMPLETE' && result ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col"
                            >
                                <div className="flex-1 glass bg-white/[0.02] border-white/5 rounded-[2.5rem] p-10 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-purple-500/20 rounded-xl">
                                            <Binary className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Synthesized Strategic Verdict</h3>
                                    </div>

                                    <div className="space-y-8">
                                        <p className="text-lg text-slate-200 leading-relaxed font-medium">
                                            {result.synthesis.final_insight || result.synthesis.insight}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Visionary Log</div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                                    {result.vision.advice}
                                                </p>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Telemetry Audit</div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                                    System Integrity: {result.telemetry.binary_sync ? 'STABLE' : 'CRITICAL'} | Load: {result.telemetry.cpu_load.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-4">
                                    <button 
                                        onClick={onClose}
                                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                                    >
                                        Dismiss Synthesis
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="relative">
                                    <Cpu className="w-16 h-16 text-white/10 animate-pulse" />
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-t-2 border-white/20 rounded-full"
                                    />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white uppercase tracking-widest animate-pulse">Neural Forge Active</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-2">Reality Synchronization in Progress</div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};
 Arkansas Arkansas
