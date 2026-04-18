import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Skull, Zap, Activity, AlertTriangle, ShieldCheck, ChevronRight, Binary, Terminal, Bot } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

export const SandboxHUD: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logEvent } = useSystemStore();
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [scope, setScope] = useState("OASIS_KRNL");

    const fetchHistory = async () => {
        try {
            const history = await invokeSafe("get_sandbox_history") as any[];
            setSessions(history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (e) {
            console.error("Sandbox Bridge Failure", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            const interval = setInterval(fetchHistory, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleInitiate = async () => {
        setIsSimulating(true);
        try {
            const id = await invokeSafe("initiate_adversarial_simulation", { scope });
            logEvent(`Neural Sandbox Initiated: ${id}`, "system");
            fetchHistory();
        } catch (e) {
            console.error("Simulation Initiation Failure", e);
        } finally {
            setIsSimulating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[8000] bg-black/90 backdrop-blur-3xl p-12 flex items-center justify-center"
        >
            <div className="w-full max-w-7xl h-full flex gap-8">
                {/* Left Rail: History & Control */}
                <div className="w-[400px] flex flex-col gap-6">
                    <div className="glass-bright p-8 rounded-[2.5rem] space-y-6 border-white/5">
                        <div className="flex items-center gap-4 text-amber-500">
                            <Zap className="w-8 h-8" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Neural Sandbox</h2>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Simulation Scope</label>
                                <input 
                                    value={scope}
                                    onChange={e => setScope(e.currentTarget.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-xs text-white uppercase font-bold tracking-widest focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                            <button 
                                onClick={handleInitiate}
                                disabled={isSimulating}
                                className="w-full py-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-amber-900/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Play className="w-4 h-4" />
                                {isSimulating ? 'Deploying Fleets...' : 'Initiate Simulation'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 glass bg-white/[0.02] border-white/5 rounded-[2.5rem] p-6 overflow-y-auto custom-scrollbar">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 px-4">Simulation History</h3>
                        <div className="space-y-3">
                            {sessions.map(s => (
                                <button 
                                    key={s.id}
                                    onClick={() => setActiveSession(s)}
                                    className={`w-full text-left p-6 rounded-3xl border transition-all ${
                                        activeSession?.id === s.id ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/[0.07]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest">{s.id.split('-')[1]}</div>
                                        <div className="text-[8px] text-slate-600 font-bold">{new Date(s.timestamp).toLocaleTimeString()}</div>
                                    </div>
                                    <div className="text-xs font-bold text-white truncate mb-2">{s.status}</div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-1000 ${s.hardening_report ? 'w-full bg-emerald-500' : 'w-1/2 bg-amber-500 animate-pulse'}`} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all">
                        Exit Simulation Mode
                    </button>
                </div>

                {/* Right Rail: Battle Stage */}
                <div className="flex-1 glass bg-white/[0.01] border-white/5 rounded-[3rem] p-10 flex flex-col relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeSession ? (
                            <motion.div 
                                key={activeSession.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full flex flex-col gap-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Strategic Clash: {activeSession.status}</h3>
                                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-black text-slate-500 tracking-widest uppercase">
                                        Session ID: {activeSession.id}
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-2 gap-8 min-h-0">
                                    {/* Red Team Area */}
                                    <div className="bg-red-500/5 rounded-[2.5rem] border border-red-500/10 flex flex-col p-8 gap-6">
                                        <div className="flex items-center gap-3 text-red-500 mb-2">
                                            <Skull className="w-5 h-5 shadow-lg shadow-red-500/20" />
                                            <span className="text-xs font-black uppercase tracking-widest">Red Team (The Disruptor)</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                            {activeSession.red_team_logs.length > 0 ? (
                                                activeSession.red_team_logs.map((log: string, i: number) => (
                                                    <div key={i} className="bg-black/40 p-5 rounded-2xl border border-red-500/10 text-xs text-red-100 leading-relaxed font-mono">
                                                        <div className="mb-2 opacity-30 text-[9px] uppercase tracking-tighter">Incursion Detected</div>
                                                        {log}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                                    <Zap className="w-12 h-12 mb-4 animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Disruption...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Blue Team Area */}
                                    <div className="bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 flex flex-col p-8 gap-6">
                                        <div className="flex items-center gap-3 text-blue-500 mb-2">
                                            <Shield className="w-5 h-5 shadow-lg shadow-blue-500/20" />
                                            <span className="text-xs font-black uppercase tracking-widest">Blue Team (The Architect)</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                            {activeSession.blue_team_logs.length > 0 ? (
                                                activeSession.blue_team_logs.map((log: string, i: number) => (
                                                    <div key={i} className="bg-black/40 p-5 rounded-2xl border border-blue-500/10 text-xs text-blue-100 leading-relaxed font-mono">
                                                        <div className="mb-2 opacity-30 text-[9px] uppercase tracking-tighter">Hardening Active</div>
                                                        {log}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                                    <Activity className="w-12 h-12 mb-4 animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Assessing Vulnerabilities...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Hardening Report Phase */}
                                {activeSession.hardening_report && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="h-1/3 glass-bright bg-emerald-500/5 border-emerald-500/20 rounded-[2.5rem] p-10 flex gap-10"
                                    >
                                        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center border border-emerald-500/40">
                                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xl font-black text-white uppercase tracking-tighter">Simulation Verdict: Hardening Report Manifested</h4>
                                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Integrity Level: HIGH</div>
                                            </div>
                                            <div className="text-xs text-slate-300 leading-relaxed font-medium bg-black/40 p-6 rounded-[2rem] border border-white/5 border-dashed">
                                                {activeSession.hardening_report}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
                                <div className="relative">
                                    <Bot className="w-24 h-24 text-white/10" />
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 border-t-2 border-amber-500/30 rounded-full"
                                    />
                                </div>
                                <div className="max-w-md space-y-2">
                                    <h3 className="text-xl font-black text-white uppercase tracking-widest uppercase">The Neural Sandbox Is Silent</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-loose">
                                        Select a forensic simulation session or initiate a new clash to identify architectural vulnerabilities.
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

const Play: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);
 Arkansas Arkansas
