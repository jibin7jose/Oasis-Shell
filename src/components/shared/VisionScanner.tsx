import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Zap, Shield, Search, Camera, Target } from 'lucide-react';

interface VisionScannerProps {
    isScanning: boolean;
    imagePreview?: string;
}

export const VisionScanner: React.FC<VisionScannerProps> = ({ isScanning, imagePreview }) => {
    const [scanLines, setScanLines] = useState<number[]>([]);

    useEffect(() => {
        if (isScanning) {
            setScanLines(Array.from({ length: 8 }, (_, i) => i));
        }
    }, [isScanning]);

    return (
        <AnimatePresence>
            {isScanning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] pointer-events-none"
                >
                    {/* Darkened Backdrop for visibility */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                    {/* Neural Grid Background */}
                    <div className="absolute inset-0 overflow-hidden opacity-20">
                        <div className="w-full h-full grid grid-cols-12 grid-rows-12">
                            {Array.from({ length: 144 }).map((_, i) => (
                                <div key={i} className="border-[0.5px] border-indigo-500/20" />
                            ))}
                        </div>
                    </div>

                    {/* Scanning Lasers */}
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_20px_#f43f5e] z-10"
                    />

                    {/* Corner Brackets */}
                    <div className="absolute inset-20 pointer-events-none border border-white/5">
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    </div>

                    {/* Telemetry Panel */}
                    <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute right-12 top-1/2 -translate-y-1/2 w-64 glass p-6 border-indigo-500/30 space-y-6"
                    >
                        <div className="flex items-center gap-3 text-indigo-400">
                            <Target className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Omniscient Eye</span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Spectral Density</span>
                                <span className="text-[10px] font-mono text-indigo-300">{(Math.random() * 100).toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Neural Sync</span>
                                <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Context Lock</span>
                                <span className="text-[10px] font-mono text-rose-400">FOUNDER_ONLY</span>
                            </div>
                        </div>

                        {imagePreview && (
                            <div className="mt-6 border-2 border-indigo-500/40 rounded-xl overflow-hidden shadow-2xl">
                                <img src={`data:image/png;base64,${imagePreview}`} className="w-full h-auto opacity-70 grayscale sepia hue-rotate-[240deg]" alt="field scan" />
                                <div className="p-2 bg-indigo-900/40 text-[7px] font-black text-center text-indigo-200 uppercase tracking-widest">
                                    Spectral Manifest Captured
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-4">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Optical Processing...</span>
                        </div>
                    </motion.div>

                    {/* Center Crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-indigo-500/40 rounded-full"
                            />
                            <Eye className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
