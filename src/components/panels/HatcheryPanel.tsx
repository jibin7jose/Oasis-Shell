import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, Trash2, Play, Brain, Shield, Terminal, Plus, X, Layers, MessageSquare } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

export const HatcheryPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { activeGolems, setActiveGolems, logEvent, setNotification } = useSystemStore();
    const [isHatching, setIsHatching] = useState(false);
    const [newAgent, setNewAgent] = useState({ name: "", mission: "", aura: "indigo" });

    const fetchGolems = async () => {
        try {
            const golems = await invokeSafe("get_active_golems") as any[];
            setActiveGolems(golems);
        } catch (e) {
            console.error("Golem Pulse Bridge Failure", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchGolems();
            const interval = setInterval(fetchGolems, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleHatch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsHatching(true);
        try {
            await invokeSafe("hatch_autonomous_golem", { 
                name: newAgent.name, 
                mission: newAgent.mission, 
                aura: newAgent.aura 
            });
            logEvent(`Autonomous Golem Hatched: ${newAgent.name}`, "neural");
            setNotification(`${newAgent.name} initiated. Objective: ${newAgent.mission}`);
            setNewAgent({ name: "", mission: "", aura: "indigo" });
            fetchGolems();
        } catch (e) {
            setNotification("Hatchery Depletion Breach.");
        } finally {
            setIsHatching(false);
        }
    };

    const handleDecommission = async (id: string) => {
        try {
            await invokeSafe("decommission_golem", { id });
            logEvent(`Golem Decommissioned: ${id}`, "system");
            fetchGolems();
        } catch (e) {
            console.error("Decommission Breach", e);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className="fixed inset-0 z-[7000] flex items-center justify-center p-12 pointer-events-none"
                >
                    <div className="w-full max-w-7xl h-full glass border-indigo-500/20 shadow-5xl rounded-[3rem] overflow-hidden flex pointer-events-auto">
                        {/* Sidebar: Hatchery Controls */}
                        <div className="w-96 border-r border-white/5 bg-black/40 p-10 flex flex-col">
                            <div className="flex items-center gap-4 text-indigo-400 mb-10">
                                <Cpu className="w-7 h-7" />
                                <h2 className="text-xl font-black uppercase tracking-[0.3em]">Hatchery</h2>
                            </div>

                            <form onSubmit={handleHatch} className="space-y-6 flex-1">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Agent Identity</label>
                                    <input 
                                        value={newAgent.name}
                                        onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                                        placeholder="e.g. Golem-Aether"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-indigo-500/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mission Directive</label>
                                    <textarea 
                                        value={newAgent.mission}
                                        onChange={e => setNewAgent({...newAgent, mission: e.target.value})}
                                        placeholder="Define the autonomous objective..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-indigo-500/50 outline-none transition-all h-32 resize-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Aura Signature</label>
                                    <div className="flex gap-3">
                                        {['indigo', 'emerald', 'amber', 'rose'].map(aura => (
                                            <button 
                                                key={aura}
                                                type="button"
                                                onClick={() => setNewAgent({...newAgent, aura})}
                                                className={`w-10 h-10 rounded-xl border-2 transition-all ${
                                                    newAgent.aura === aura ? 'border-white scale-110' : 'border-transparent'
                                                }`}
                                                style={{ backgroundColor: aura === 'emerald' ? '#10b981' : aura === 'amber' ? '#f59e0b' : aura === 'rose' ? '#f43f5e' : '#6366f1' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isHatching}
                                    className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    {isHatching ? 'Manifesting Identity...' : 'Hatch Autonomous Agent'}
                                </button>
                            </form>

                            <button onClick={onClose} className="mt-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all">
                                Return to Command
                            </button>
                        </div>

                        {/* Main Stage: Workforce Grid */}
                        <div className="flex-1 overflow-y-auto p-12 bg-slate-900/40 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <AnimatePresence>
                                    {activeGolems.map((golem) => (
                                        <motion.div
                                            key={golem.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="p-8 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col gap-6 hover:border-indigo-500/30 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-4 rounded-2xl shadow-lg ${
                                                        golem.aura === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 
                                                        golem.aura === 'amber' ? 'bg-amber-500/20 text-amber-400' : 
                                                        golem.aura === 'rose' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                                                    }`}>
                                                        <Brain className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white tracking-tight">{golem.name}</h3>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{golem.status}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDecommission(golem.id)}
                                                    className="p-3 hover:bg-rose-500/10 rounded-xl transition-colors group"
                                                >
                                                    <Trash2 className="w-5 h-5 text-slate-600 group-hover:text-rose-400" />
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-500">Mission Progress</span>
                                                    <span className="text-indigo-400">{Math.round(golem.progress * 100)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${golem.progress * 100}%` }}
                                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                    />
                                                </div>
                                            </div>

                                            {golem.mission && (
                                                <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                                                    <div className="flex items-center gap-2 text-indigo-400">
                                                        <Layers className="w-3 h-3" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">Target Objective</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">"{golem.mission}"</p>
                                                </div>
                                            )}

                                            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                                                <div className="flex items-center gap-2 text-emerald-400">
                                                    <MessageSquare className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Current Thought Trace</span>
                                                </div>
                                                <div className="text-[11px] text-slate-300 font-mono leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                                    {golem.thought_trace || "Initializing neural pathways..."}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {activeGolems.length === 0 && (
                                    <div className="col-span-2 h-96 flex flex-col items-center justify-center opacity-20">
                                        <Layers className="w-16 h-16 text-slate-500 mb-6 animate-pulse" />
                                        <p className="text-sm font-black uppercase tracking-[0.4em]">Workforce Flooding Inhibited</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
