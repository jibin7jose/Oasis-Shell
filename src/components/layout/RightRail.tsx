import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bot, Activity, Zap, Shield, 
  Terminal, Cpu, HardDrive, BrainCircuit,
  ChevronRight, AlertCircle, CheckCircle2
} from "lucide-react";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface GolemDetail {
    id: string;
    name: string;
    mission: string;
    progress: number;
    status: string;
    aura: string;
}

interface RightRailProps {
    isOpen: boolean;
    onClose: () => void;
    golem: GolemDetail | null;
}

export default function RightRail({ isOpen, onClose, golem }: RightRailProps) {
    if (!isOpen || !golem) return null;

    return (
        <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-[400px] bg-black/40 backdrop-blur-3xl border-l border-white/5 z-[100] shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.5)] flex flex-col pt-24 p-8"
        >
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", golem.aura === 'emerald' ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400")}>
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{golem.name}</h2>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{golem.id}</div>
                    </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6 overflow-y-auto no-scrollbar pb-12">
                {/* MISSION BRIEF */}
                <div className="glass p-6 rounded-[2rem] border border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Mission</span>
                        <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-black uppercase", golem.aura === 'emerald' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400")}>{golem.status}</span>
                    </div>
                    <div className="text-sm font-bold text-white">{golem.mission}</div>
                    
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${golem.progress}%` }}
                            className={cn("h-full", golem.aura === 'emerald' ? "bg-emerald-500" : "bg-indigo-500")}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>Sync Progress</span>
                        <span>{golem.progress}%</span>
                    </div>
                </div>

                {/* SUBSYSTEM METRICS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        <div>
                            <div className="text-[9px] text-slate-500 uppercase font-black">Memory</div>
                            <div className="text-xs font-bold text-white">124 MB</div>
                        </div>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <div>
                            <div className="text-[9px] text-slate-500 uppercase font-black">Uptime</div>
                            <div className="text-xs font-bold text-white">09h 42m</div>
                        </div>
                    </div>
                </div>

                {/* NEURAL THREADS */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Subsystem Threads</h3>
                  <div className="flex flex-col gap-2">
                    {[
                        { id: 1, label: 'Neural Parse Engine', status: 'Optimal', aura: 'emerald' },
                        { id: 2, label: 'Context Buffer Sync', status: 'Stable', aura: 'indigo' },
                        { id: 3, label: 'Remote Foundry Link', status: 'Synchronizing', aura: 'emerald' },
                        { id: 4, label: 'Sentinel Archival', status: 'Standby', aura: 'slate' }
                    ].map((thread) => (
                        <div key={thread.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", thread.aura === 'emerald' ? "bg-emerald-500" : thread.aura === 'indigo' ? "bg-indigo-500" : "bg-slate-500")} />
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{thread.label}</span>
                            </div>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-white" />
                        </div>
                    ))}
                  </div>
                </div>

                {/* MISSION LOG */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Mission Logs
                  </h3>
                  <div className="flex flex-col gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[10px]">
                        <div className="text-emerald-500 flex gap-2">
                            <span className="opacity-40">[09:42:15]</span>
                            <span>Golem initialized successful.</span>
                        </div>
                        <div className="text-slate-400 flex gap-2">
                            <span className="opacity-40">[09:42:18]</span>
                            <span>Mapping strategic nodes for {golem.mission}...</span>
                        </div>
                        <div className="text-indigo-400 flex gap-2">
                            <span className="opacity-40">[10:14:02]</span>
                            <span>Neural pulse synchronized with foundry.</span>
                        </div>
                        <div className="text-amber-500 flex gap-2">
                            <span className="opacity-40">[11:02:44]</span>
                            <span>Foundry latency detected in Beta-Segment.</span>
                        </div>
                  </div>
                </div>
            </div>
            
            <div className="mt-auto pt-6 flex gap-3">
                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-xs font-bold text-white transition-all">Suspend</button>
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-2xl text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all">Re-Sync</button>
            </div>
        </motion.div>
    );
}
