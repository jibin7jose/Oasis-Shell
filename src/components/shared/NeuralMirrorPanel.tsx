import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, RotateCw, Binary, Check, X, ShieldAlert, Sparkles, 
    Layers, Zap, Search, Eye, Filter, Code, Terminal, ShieldCheck
} from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { useSystemStore } from '../../lib/systemStore';

interface NeuralMutation {
    id: string;
    file_path: string;
    rationale: string;
    original_content: string;
    proposed_content: string;
    logic_score: number;
    status: string;
    timestamp: string;
}

export const NeuralMirrorPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { setNotification, logEvent } = useSystemStore();
    const [mutations, setMutations] = useState<NeuralMutation[]>([]);
    const [selectedMutation, setSelectedMutation] = useState<NeuralMutation | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [auditLog, setAuditLog] = useState<{ type: 'info' | 'success' | 'warn' | 'error', msg: string }[]>([]);

    const refreshMutations = useCallback(async () => {
        try {
            const result = await invokeSafe('get_neural_mutations') as NeuralMutation[];
            setMutations(result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshMutations();
        }
    }, [isOpen, refreshMutations]);

    const addLog = (type: any, msg: string) => setAuditLog(prev => [...prev, { type, msg }]);

    const startAnalysis = async () => {
        const target = "src-tauri/src/ai.rs"; // Example target for MVP self-evolution
        setIsAnalyzing(true);
        addLog('info', `Mirroring system genome at ${target}...`);
        try {
            const mutation = await invokeSafe('analyze_system_genome', { targetFile: target }) as NeuralMutation;
            setSelectedMutation(mutation);
            refreshMutations();
            addLog('success', `Neural Refactor Derived: ${mutation.id}`);
        } catch (e) {
            addLog('error', `Reflection Fragmentation: ${e}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const verifyMutation = async () => {
        if (!selectedMutation) return;
        setIsValidating(true);
        addLog('info', "Initiating Forensic Build Audit...");
        try {
            const msg = await invokeSafe('verify_system_mutation', { mutationId: selectedMutation.id }) as string;
            addLog('success', msg);
            refreshMutations();
        } catch (e) {
            addLog('error', `Integrity Breach Detected: ${e}`);
        } finally {
            setIsValidating(false);
        }
    };

    const applyMutation = async () => {
        if (!selectedMutation) return;
        setIsApplying(true);
        addLog('info', "Manifesting Neural Mutation...");
        try {
            const msg = await invokeSafe('apply_neural_mutation', { mutationId: selectedMutation.id }) as string;
            addLog('success', msg);
            setNotification("SYSTEM EVOLUTION COMPLETE. KERNEL MUTATED.");
            logEvent(`Neural Mutation Manifested: ${selectedMutation.id} in ${selectedMutation.file_path}`, "neural");
            refreshMutations();
            setTimeout(onClose, 2000);
        } catch (e) {
            addLog('error', `Manifestation Failed: ${e}`);
        } finally {
            setIsApplying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden"
        >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                 <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]" />
            </div>

            <div className="w-full max-w-7xl h-full flex gap-12 relative z-10">
                {/* Left: Genome & Mutations */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center relative group">
                                <RotateCw className={`w-8 h-8 text-white transition-all ${isAnalyzing ? 'animate-spin' : 'group-hover:rotate-180 duration-700'}`} />
                                <div className="absolute inset-0 rounded-full bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Mirror Hub</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-[0.4em]">System Self-Reflection Engine</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sentience Level: 10</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                         {/* Mutation Stream */}
                         <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <Layers className="w-3.5 h-3.5 text-slate-500" /> Neural Evolution Queue
                                </h3>
                                <button 
                                    onClick={startAnalysis} 
                                    disabled={isAnalyzing}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all text-white disabled:opacity-30"
                                >
                                    {isAnalyzing ? "Reflecting..." : "Initiate System Audit"}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 font-sans">
                                {mutations.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-12">
                                        <Eye className="w-12 h-12 mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No genetic drift detected.</p>
                                    </div>
                                ) : (
                                    mutations.map((m) => (
                                        <button 
                                            key={m.id}
                                            onClick={() => setSelectedMutation(m)}
                                            className={`w-full p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                                                selectedMutation?.id === m.id ? 'bg-white/10 border-white/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                            }`}
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40" />
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">{m.id}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                    m.status === 'Applied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                                }`}>{m.status}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-white mb-1 truncate">{m.file_path}</h4>
                                            <p className="text-[10px] text-slate-400 line-clamp-1">{m.rationale}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                         </div>

                         {/* Selection Detail / Console */}
                         <div className="flex flex-col gap-6 min-h-0">
                            {/* Integrity Console */}
                            <div className="flex-1 bg-black/40 border border-white/5 rounded-[3rem] p-8 font-mono flex flex-col overflow-hidden">
                                <div className="flex items-center gap-3 mb-6">
                                    <Terminal className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Evolutionary Trace v1</span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[11px]">
                                    {auditLog.map((log, i) => (
                                        <div key={i} className="flex gap-3">
                                            <span className="opacity-20">[{new Date().toLocaleTimeString()}]</span>
                                            <span className={
                                                log.type === 'success' ? 'text-emerald-400' :
                                                log.type === 'warn' ? 'text-amber-400' :
                                                log.type === 'error' ? 'text-red-400' : 'text-slate-400'
                                            }>{log.msg}</span>
                                        </div>
                                    ))}
                                    {auditLog.length === 0 && <span className="opacity-30 italic">Awaiting genetic input...</span>}
                                </div>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Right: Mutation Manifest */}
                <div className="w-[500px] bg-white/[0.03] border border-white/10 rounded-[4rem] flex flex-col p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Cpu className="w-64 h-64" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        {selectedMutation ? (
                            <div className="flex flex-col h-full">
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mutation Manifest</h3>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Core</span>
                                            <span className="text-[10px] font-mono text-indigo-300">{selectedMutation.file_path}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Genetic Purity</span>
                                            <span className="text-xs font-black text-emerald-400">{selectedMutation.logic_score}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 bg-black/60 rounded-3xl border border-white/5 p-6 mb-8 overflow-hidden flex flex-col">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Neural Diff Analysis</span>
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                                        {/* Original Genome */}
                                        <div className="flex flex-col min-h-0">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 px-1">Original Genome</span>
                                            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 overflow-y-auto custom-scrollbar font-mono text-[9px] leading-relaxed text-slate-500 line-through decoration-rose-500/20">
                                                {selectedMutation.original_content}
                                            </div>
                                        </div>
                                        
                                        {/* Proposed Flux */}
                                        <div className="flex flex-col min-h-0">
                                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2 px-1">Proposed Flux</span>
                                            <div className="flex-1 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 overflow-y-auto custom-scrollbar font-mono text-[9px] leading-relaxed text-emerald-400/90">
                                                {selectedMutation.proposed_content}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Binary className="w-3 h-3 text-indigo-400" />
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Logic Rationale</span>
                                        </div>
                                        <p className="text-[10px] text-slate-300 italic leading-relaxed">
                                            "{selectedMutation.rationale}"
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button 
                                        onClick={verifyMutation}
                                        disabled={isValidating || selectedMutation.status === 'Applied'}
                                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group disabled:opacity-30"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-white/5 group-hover:text-indigo-400">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-black text-white uppercase tracking-tight">Run Integrity Audit</span>
                                        </div>
                                        {isValidating && <RotateCw className="w-4 h-4 animate-spin" />}
                                    </button>

                                    <button 
                                        onClick={applyMutation}
                                        disabled={isApplying || selectedMutation.status === 'Applied'}
                                        className="w-full py-6 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20 flex items-center justify-center gap-4 transition-all transform active:scale-95 disabled:opacity-30 group"
                                    >
                                        <Zap className={`w-5 h-5 ${isApplying ? 'animate-pulse text-amber-400' : 'group-hover:scale-125'}`} />
                                        <span className="text-xs font-black uppercase tracking-[0.4em]">Sign & Manifest Mutation</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-12">
                                <Cpu className="w-24 h-24 mb-6" />
                                <h3 className="text-lg font-black uppercase tracking-widest mb-2">Awaiting Directive</h3>
                                <p className="text-[10px] font-medium tracking-widest uppercase">Select a neural proposal to view systemic evolution.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
