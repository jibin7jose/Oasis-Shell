import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Box, Rocket, Terminal, X, Plus, Layers, Loader2,
    ExternalLink, Globe, Monitor, Square, Play, Trash2, Power,
    BrainCircuit, Cpu, Code2, Hexagon
} from 'lucide-react';

import { invokeSafe } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

type ForgeMode = 'react_vite' | 'rust_tauri';

const FORGE_MODES: { id: ForgeMode; label: string; icon: React.FC<any>; desc: string; accent: string; badge: string }[] = [
    {
        id: 'react_vite',
        label: 'React / Vite',
        icon: Globe,
        desc: 'Web-native subsidiary. Scaffolds a context-aware React+TypeScript venture SPA.',
        accent: 'emerald',
        badge: 'WEB',
    },
    {
        id: 'rust_tauri',
        label: 'Rust / Tauri',
        icon: Cpu,
        desc: 'Native desktop subsidiary. Scaffolds a full Tauri 2 application kernel with Knowledge Crate bridge.',
        accent: 'violet',
        badge: 'DESKTOP',
    },
];

export const SingularityHUD: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logEvent, setNotification } = useSystemStore();
    const [isManifesting, setIsManifesting] = useState(false);
    const [newVenture, setNewVenture] = useState({ name: "", intent: "" });
    const [forgeMode, setForgeMode] = useState<ForgeMode>('react_vite');
    const [activeVentures, setActiveVentures] = useState<any[]>([]);

    const fetchVentures = async () => {
        try {
            const list = await invokeSafe("list_active_ventures") as any[];
            setActiveVentures(list);
        } catch (e) {
            console.error("Venture Bridge Failure", e);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchVentures();
            const interval = setInterval(fetchVentures, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleStop = async (name: string) => {
        try {
            await invokeSafe("stop_sub_venture", { name });
            logEvent(`Venture Neutralized: ${name}`, "system");
            fetchVentures();
        } catch (e) {
            setNotification(`Stop Failure: ${e}`);
        }
    };

    const handleStart = async (name: string) => {
        try {
            await invokeSafe("launch_sub_venture", { name });
            logEvent(`Venture Re-Kindled: ${name}`, "system");
            fetchVentures();
        } catch (e) {
            setNotification(`Restart Failure: ${e}`);
        }
    };

    const handlePurge = async (name: string) => {
        try {
            await invokeSafe("purge_sub_venture", { name });
            logEvent(`Venture Purged: ${name}`, "system");
            setNotification(`Venture ${name} removed from reality.`);
            fetchVentures();
        } catch (e) {
            setNotification(`Purge Failure: ${e}`);
        }
    };

    const handleSyncIntelligence = async (name: string) => {
        try {
            await invokeSafe("manifest_knowledge_crate", { name });
            logEvent(`Semantic Mosaic Sync: ${name} context updated.`, "neural");
            setNotification(`Intelligence Bridge synchronized for ${name}.`);
        } catch (e) {
            setNotification(`Sync Failure: ${e}`);
        }
    };

    const handleManifest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsManifesting(true);
        try {
            const result = await invokeSafe("manifest_new_venture", {
                name: newVenture.name,
                intent: newVenture.intent,
                forgeMode: forgeMode,
            });
            logEvent(`Omni-Vent Forge: ${newVenture.name} [${forgeMode}] Manifested.`, "neural");
            setNotification(`${result}`);
            await fetchVentures();

            if (forgeMode === 'react_vite') {
                try {
                    await invokeSafe("launch_sub_venture", { name: newVenture.name });
                } catch (_) {}
            }
            setNewVenture({ name: "", intent: "" });
        } catch (e) {
            setNotification(`Singularity Breach: ${e}`);
        } finally {
            setIsManifesting(false);
        }
    };

    const selectedMode = FORGE_MODES.find(m => m.id === forgeMode)!;

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-3xl p-12 flex items-center justify-center"
        >
            <div className="w-full max-w-7xl h-full flex gap-12">
                {/* Left Rail: The Gestation Chamber */}
                <div className="w-[500px] flex flex-col gap-6">
                    <div className="glass-bright p-8 rounded-[3rem] border-white/5 space-y-6">
                        <div className="flex items-center gap-4 text-emerald-400">
                            <Sparkles className="w-8 h-8 animate-pulse" />
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Omni-Vent Forge</h2>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Phase 35 // Polyglot Scaffolding Engine</p>
                            </div>
                        </div>

                        {/* Forge Mode Selector */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Forge Mode</label>
                            <div className="grid grid-cols-2 gap-3">
                                {FORGE_MODES.map(mode => {
                                    const Icon = mode.icon;
                                    const active = forgeMode === mode.id;
                                    return (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setForgeMode(mode.id)}
                                            className={`relative p-5 rounded-2xl border text-left transition-all duration-300 ${
                                                active
                                                    ? mode.accent === 'emerald'
                                                        ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                                                        : 'border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                                                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Icon className={`w-5 h-5 ${active ? (mode.accent === 'emerald' ? 'text-emerald-400' : 'text-violet-400') : 'text-slate-500'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-400'}`}>{mode.label}</span>
                                            </div>
                                            <span className={`absolute top-3 right-3 text-[7px] font-black px-2 py-0.5 rounded-md tracking-widest ${
                                                mode.accent === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'
                                            }`}>{mode.badge}</span>
                                            <p className="text-[9px] text-slate-500 leading-relaxed">{mode.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <form onSubmit={handleManifest} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-emerald-500/50">Venture Identity (Name)</label>
                                <input
                                    value={newVenture.name}
                                    onChange={e => setNewVenture({...newVenture, name: e.target.value.replace(/\s+/g, '-')})}
                                    placeholder="e.g. pulse-node"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white font-black tracking-widest focus:border-emerald-500/50 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-emerald-500/50">Intent Directive (Prompt)</label>
                                <textarea
                                    value={newVenture.intent}
                                    onChange={e => setNewVenture({...newVenture, intent: e.target.value})}
                                    placeholder="Define the digital organism's purpose..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white font-medium leading-relaxed focus:border-emerald-500/50 outline-none transition-all h-32 resize-none"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isManifesting}
                                className={`w-full py-5 rounded-3xl text-white text-xs font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 ${
                                    forgeMode === 'react_vite'
                                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
                                        : 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/40'
                                }`}
                            >
                                {isManifesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                                {isManifesting ? 'Forging Venture...' : `Initiate ${selectedMode.badge} Forge`}
                            </button>
                        </form>
                    </div>

                    <button onClick={onClose} className="py-4 bg-white/5 hover:bg-white/10 rounded-[2rem] text-[11px] font-black text-slate-500 uppercase tracking-widest transition-all">
                        Return to Command Center
                    </button>
                </div>

                {/* Right Rail: Active Ventures Manifest */}
                <div className="flex-1 flex flex-col gap-8">
                    <div className="h-full glass bg-white/[0.01] border-white/5 rounded-[3.5rem] p-10 overflow-y-auto custom-scrollbar relative">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest">Active Ventures Registry</h3>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">React/Vite ⬡ Rust/Tauri — Polyglot Fleet</p>
                            </div>
                            <div className="px-4 py-2 bg-violet-500/10 rounded-xl border border-violet-500/20 text-[10px] font-black text-violet-400 tracking-widest uppercase">
                                Omni-Vent Nexus
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <AnimatePresence>
                                {activeVentures.map((v, i) => {
                                    const isNative = v.forge_mode === 'rust-tauri';
                                    const accentColor = isNative ? 'violet' : 'emerald';
                                    return (
                                        <motion.div
                                            key={v.name}
                                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`p-7 rounded-[2.5rem] bg-white/[0.03] border transition-all group ${
                                                v.pid
                                                    ? isNative ? 'border-violet-500/20 shadow-lg shadow-violet-500/5' : 'border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                                    : 'border-slate-800 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${v.pid ? (isNative ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400') : 'bg-slate-800 text-slate-500'}`}>
                                                        {isNative ? <Cpu className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black text-white tracking-tight">{v.name}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${v.pid ? (isNative ? 'bg-violet-500 animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-slate-600'}`} />
                                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{v.status}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {v.pid ? (
                                                        <>
                                                            <button onClick={() => handleSyncIntelligence(v.name)} className={`p-2.5 ${isNative ? 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'} rounded-xl transition-all`} title="Sync Intelligence">
                                                                <BrainCircuit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => handleStop(v.name)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all" title="Stop Venture">
                                                                <Square className="w-3.5 h-3.5 fill-current" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleStart(v.name)} className={`p-2.5 ${isNative ? 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'} rounded-xl transition-all`} title="Start Venture">
                                                            <Play className="w-3.5 h-3.5 fill-current" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handlePurge(v.name)} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition-all" title="Purge Venture">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Forge Mode Badge */}
                                            <div className="mb-3">
                                                <span className={`text-[7px] font-black px-2 py-1 rounded-lg tracking-widest uppercase ${
                                                    isNative ? 'bg-violet-500/10 text-violet-500' : 'bg-emerald-500/10 text-emerald-500'
                                                }`}>
                                                    {isNative ? '⬡ Rust/Tauri Desktop' : '⬡ React/Vite Web'}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-500">PID: {v.pid || 'NULL'}</span>
                                                    <span className={v.pid ? (isNative ? 'text-violet-400' : 'text-emerald-400') : 'text-slate-600'}>
                                                        {v.pid ? 'ONLINE' : 'OFFLINE'}
                                                    </span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: v.pid ? '100%' : '0%' }}
                                                        className={`h-full ${v.pid ? (isNative ? 'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]') : 'bg-slate-700'}`}
                                                    />
                                                </div>
                                            </div>

                                            {!isNative && (
                                                <div className="flex gap-2 mt-4">
                                                    <a
                                                        href={`http://localhost:${v.port || 5173}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                            v.pid ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600 pointer-events-none'
                                                        }`}
                                                    >
                                                        <Globe className="w-3 h-3" /> Open
                                                    </a>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>

                            {activeVentures.length === 0 && (
                                <div className="col-span-2 h-96 flex flex-col items-center justify-center text-center opacity-20">
                                    <Layers className="w-20 h-20 mb-6 text-slate-500 animate-pulse" />
                                    <p className="text-lg font-black uppercase tracking-[0.4em]">Sub-Ventures Void</p>
                                    <p className="text-xs font-bold uppercase tracking-widest mt-2">No standalone organisms have been manifested yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
