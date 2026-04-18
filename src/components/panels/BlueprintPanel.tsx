import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, PenTool, GitMerge, CheckCircle2, AlertTriangle, RefreshCw, FileCode, Search, ShieldCheck, Zap } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

interface CollectiveManifest {
    id: string;
    mission: string;
    proposals: any[];
    verification_status: string;
    timestamp: string;
}

export const BlueprintPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logEvent, setNotification } = useSystemStore();
    const [mission, setMission] = useState("");
    const [targetFiles, setTargetFiles] = useState<string[]>(["src/App.tsx", "src-tauri/src/lib.rs"]);
    const [manifests, setManifests] = useState<CollectiveManifest[]>([]);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const [selectedManifest, setSelectedManifest] = useState<CollectiveManifest | null>(null);

    const fetchManifests = async () => {
        try {
            const res = await invokeSafe("get_architectural_manifests") as CollectiveManifest[];
            setManifests(res);
        } catch (e) {
            console.error("Blueprint Sync Breach", e);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchManifests();
            const interval = setInterval(fetchManifests, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleManifest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSynthesizing(true);
        try {
            await invokeSafe("manifest_architectural_blueprint", { mission, target_files: targetFiles });
            logEvent(`Architectural Mission Manifested: ${mission}`, "neural");
            setNotification("Blueprint synthesis initiated across multi-file target.");
            setMission("");
        } catch (e) {
            setNotification("Neural Forge Depletion.");
        } finally {
            setIsSynthesizing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, x: -50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -50 }}
                    className="fixed inset-0 z-[8000] flex items-center justify-center p-12 pointer-events-none"
                >
                    <div className="w-full max-w-7xl h-full glass border-emerald-500/20 shadow-5xl rounded-[3rem] overflow-hidden flex pointer-events-auto">
                        {/* Sidebar: Architect's Drafting Table */}
                        <div className="w-[450px] border-r border-white/5 bg-black/40 p-12 flex flex-col">
                            <div className="flex items-center gap-4 text-emerald-400 mb-10">
                                <PenTool className="w-8 h-8" />
                                <h2 className="text-2xl font-black uppercase tracking-[0.3em]">Neural Forge</h2>
                            </div>

                            <form onSubmit={handleManifest} className="space-y-8 flex-1">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Architectural Mission</label>
                                    <textarea 
                                        value={mission}
                                        onChange={e => setMission(e.target.value)}
                                        placeholder="e.g. Implement a cross-module telemetry system for disk encryption..."
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-sm focus:border-emerald-500/50 outline-none transition-all h-40 resize-none font-medium leading-relaxed"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Manifest Targets</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {targetFiles.map((file, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 group">
                                                <FileCode className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
                                                <span className="text-[11px] text-slate-300 font-mono truncate flex-1">{file}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSynthesizing}
                                    className="w-full py-6 rounded-3xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <Zap className="w-4 h-4" />
                                    {isSynthesizing ? 'Igniting Molecular Forge...' : 'Commit Blueprint'}
                                </button>
                            </form>

                            <button onClick={onClose} className="mt-8 py-5 rounded-3xl bg-white/5 hover:bg-white/10 text-slate-400 text-[11px] font-black uppercase tracking-widest transition-all">
                                Return to Command
                            </button>
                        </div>

                        {/* Main Stage: Manifestation Review */}
                        <div className="flex-1 overflow-y-auto p-12 bg-slate-900/60 custom-scrollbar flex flex-col">
                            <div className="mb-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Active Manifestations</h3>
                                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Collective Neural PRs</p>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                    <ShieldCheck className="w-3 h-3" /> Self-Healing Active
                                </div>
                            </div>

                            <div className="flex-1 space-y-8">
                                {manifests.map((manifest) => (
                                    <div 
                                        key={manifest.id}
                                        className={`p-10 rounded-[2.5rem] border bg-white/5 transition-all ${
                                            selectedManifest?.id === manifest.id ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-4xl' : 'border-white/10 hover:border-white/20'
                                        }`}
                                        onClick={() => setSelectedManifest(manifest)}
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-6">
                                                <div className="p-5 bg-emerald-500/20 rounded-3xl border border-emerald-500/30 text-emerald-400 shadow-xl">
                                                    <Layout className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{manifest.timestamp}</span>
                                                    <h4 className="text-lg font-bold text-white mt-1">{manifest.id}</h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-2xl border border-white/5">
                                                    <RefreshCw className={`w-3 h-3 text-amber-400 ${manifest.verification_status.includes('...') ? 'animate-spin' : ''}`} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{manifest.verification_status}</span>
                                                </div>
                                                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black uppercase tracking-widest text-white rounded-2xl shadow-xl transition-all flex items-center gap-2">
                                                    <GitMerge className="w-3 h-3" /> Manifest All
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-400 leading-relaxed font-medium italic mb-10 max-w-4xl opacity-80 border-l-2 border-emerald-500/30 pl-6">
                                            "{manifest.mission}"
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            {manifest.proposals.map((prop, i) => (
                                                <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <FileCode className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
                                                        <div>
                                                            <div className="text-[11px] font-bold text-slate-300">{prop.file_path}</div>
                                                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter mt-1">{prop.rationale}</div>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                                        <Search className="w-4 h-4 text-slate-600 hover:text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {manifests.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-32">
                                        <RefreshCw className="w-20 h-20 text-slate-500 mb-8 animate-spin-slow" />
                                        <h3 className="text-xl font-black uppercase tracking-[0.5em]">The Forge is Cold</h3>
                                        <p className="text-xs uppercase tracking-widest mt-4">Awaiting architectural intent...</p>
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
