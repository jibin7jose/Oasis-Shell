import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Box, Rocket, Terminal, X, Plus, Layers, Loader2, ExternalLink, Globe, Monitor } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

export const SingularityHUD: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logEvent, setNotification } = useSystemStore();
    const [isManifesting, setIsManifesting] = useState(false);
    const [newVenture, setNewVenture] = useState({ name: "", intent: "" });
    const [activeVentures, setActiveVentures] = useState<{name: string, status: string, pid?: number}[]>([]);

    const handleManifest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsManifesting(true);
        try {
            await invokeSafe("manifest_new_venture", { name: newVenture.name, intent: newVenture.intent });
            logEvent(`Neural Singularity Event: ${newVenture.name} Manifested.`, "neural");
            setNotification(`Venture ${newVenture.name} gestated successfully.`);
            
            // Auto-launch the sub-venture
            const pid = await invokeSafe("launch_sub_venture", { name: newVenture.name }) as number;
            setActiveVentures([{ name: newVenture.name, status: "Active (Gestation Complete)", pid }, ...activeVentures]);
            setNewVenture({ name: "", intent: "" });
        } catch (e) {
            setNotification(`Singularity Breach: ${e}`);
        } finally {
            setIsManifesting(false);
        }
    };

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
                <div className="w-[500px] flex flex-col gap-8">
                    <div className="glass-bright p-10 rounded-[3rem] border-white/5 space-y-8">
                        <div className="flex items-center gap-4 text-emerald-400">
                            <Sparkles className="w-10 h-10 animate-pulse" />
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Neural Singularity</h2>
                        </div>
                        
                        <form onSubmit={handleManifest} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-emerald-500/50">Venture Identity (Name)</label>
                                <input 
                                    value={newVenture.name}
                                    onChange={e => setNewVenture({...newVenture, name: e.target.value.replace(/\s+/g, '-')})}
                                    placeholder="e.g. pulse-node"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white font-black tracking-widest focus:border-emerald-500/50 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-emerald-500/50">Intent Directive (Prompt)</label>
                                <textarea 
                                    value={newVenture.intent}
                                    onChange={e => setNewVenture({...newVenture, intent: e.target.value})}
                                    placeholder="Define the digital organism's purpose..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white font-medium leading-relaxed focus:border-emerald-500/50 outline-none transition-all h-40 resize-none"
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={isManifesting}
                                className="w-full py-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.4em] shadow-2xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isManifesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                                {isManifesting ? 'Gestating Venture...' : 'Initiate Singularity'}
                            </button>
                        </form>
                    </div>

                    <button onClick={onClose} className="py-5 bg-white/5 hover:bg-white/10 rounded-[2rem] text-[11px] font-black text-slate-500 uppercase tracking-widest transition-all">
                        Return to Command Center
                    </button>
                </div>

                {/* Right Rail: Active Ventures Manifest */}
                <div className="flex-1 flex flex-col gap-8">
                    <div className="h-full glass bg-white/[0.01] border-white/5 rounded-[3.5rem] p-12 overflow-y-auto custom-scrollbar relative">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">Active Ventures Registry</h3>
                            <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[10px] font-black text-emerald-400 tracking-widest uppercase">
                                Autonomous Sub-Layer Active
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <AnimatePresence>
                                {activeVentures.map((v, i) => (
                                    <motion.div 
                                        key={v.name}
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        delay={i * 0.1}
                                        className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex flex-col gap-6 hover:border-emerald-500/30 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400">
                                                    <Monitor className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white tracking-tight">{v.name}</h4>
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{v.status}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl text-slate-600 group-hover:text-emerald-400 transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-500">Neural Sync</span>
                                                <span className="text-emerald-400">99.9%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[99.9%] shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest transition-all">
                                                Open Workspace
                                            </button>
                                            <button className="px-5 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-400 transition-all">
                                                <Globe className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
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
 Arkansas Arkansas
 Arkansas Arkansas
