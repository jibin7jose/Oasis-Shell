import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldAlert, Binary, Check, X, Terminal, RotateCw, Activity, Zap, ShieldCheck } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";

export const KernelForge: React.FC<{ isOpen: boolean; onClose: () => void; proposal: any }> = ({ isOpen, onClose, proposal }) => {
    const [isValidating, setIsValidating] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [validationResult, setValidationResult] = useState<{ success: boolean; msg: string } | null>(null);

    const handleValidate = async () => {
        setIsValidating(true);
        setValidationResult(null);
        try {
            // In a real self-replication, we'd temp write then check
            // For this phase, we run 'cargo check' on the CURRENT state as a baseline
            const res = await invokeSafe("validate_kernel_integrity");
            setValidationResult({ success: true, msg: String(res) });
        } catch (e) {
            setValidationResult({ success: false, msg: String(e) });
        } finally {
            setIsValidating(false);
        }
    };

    const handleApply = async () => {
        setIsApplying(true);
        try {
            // Apply logic: use existing resolve_golem_proposal
            await invokeSafe("resolve_golem_proposal", { proposal_id: proposal.id, action: "merge" });
            setValidationResult({ success: true, msg: "Kernel Mutation Successful. SYSTEM REBUILD REQUIRED." });
        } catch (e) {
            setValidationResult({ success: false, msg: `Mutation Failed: ${e}` });
        } finally {
            setIsApplying(false);
        }
    };

    if (!isOpen || !proposal) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-3xl p-12 flex items-center justify-center font-sans"
        >
            <div className="w-full max-w-6xl h-full flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                            <Cpu className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Kernel Re-Forge</h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500" /> Recursive Architecture v1.0
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-2xl transition-colors">
                        <X className="w-8 h-8 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 flex gap-8 min-h-0">
                    {/* Diff Viewer */}
                    <div className="flex-1 glass bg-white/[0.02] border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recursive Rust Diff: {proposal.file_path}</h3>
                            <div className="px-3 py-1 bg-purple-500/20 rounded-lg text-[9px] font-black text-purple-400 uppercase">Gemma3 Synthesis</div>
                        </div>
                        
                        <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 overflow-y-auto custom-scrollbar font-mono text-[11px] p-6 leading-relaxed">
                            <div className="text-slate-500 mb-4">// Original content identified...</div>
                            <div className="opacity-40 line-through decoration-red-500/50">{proposal.original_content.substring(0, 500)}...</div>
                            <div className="text-slate-500 my-6">// Proposed Self-Replication Body:</div>
                            <div className="text-emerald-400">{proposal.proposed_content}</div>
                        </div>
                    </div>

                    {/* Controls & Integrity */}
                    <div className="w-[380px] space-y-6">
                        <div className="glass-bright p-8 rounded-[2.5rem] space-y-6 border-white/5">
                            <div className="flex items-center gap-3 text-amber-500">
                                <ShieldAlert className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Mutation Protocol</span>
                            </div>
                            
                            <div className="space-y-4 text-[11px] text-slate-400 leading-relaxed font-bold">
                                <p>This manifest allows the AI to autonomously modify its own Rust source code based on adversarial feedback.</p>
                                <ul className="space-y-2 text-slate-500">
                                    <li className="flex gap-2">
                                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                        <span>Targeting: {proposal.file_path}</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                        <span>Integrity Protocol: Cargo Check 1.0</span>
                                    </li>
                                </ul>
                            </div>

                            <button 
                                onClick={handleValidate}
                                disabled={isValidating}
                                className="w-full py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isValidating ? <RotateCw className="w-4 h-4 animate-spin" /> : <Binary className="w-4 h-4" />}
                                {isValidating ? 'Running Forensic Audit...' : 'Run Integrity Check'}
                            </button>
                        </div>

                        {validationResult && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-8 rounded-[2rem] border ${
                                    validationResult.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                                }`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    {validationResult.success ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <ShieldAlert className="w-5 h-5 text-red-500" />}
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${validationResult.success ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {validationResult.success ? 'Integrity PASSED' : 'Integrity FAILED'}
                                    </span>
                                </div>
                                <p className="text-[10px] font-mono leading-relaxed text-slate-300 break-words">{validationResult.msg}</p>
                            </motion.div>
                        )}

                        <button 
                            onClick={handleApply}
                            disabled={isApplying || !validationResult?.success}
                            className={`w-full py-6 rounded-3xl text-white text-[11px] font-black uppercase tracking-[0.5em] shadow-4xl transition-all flex items-center justify-center gap-4 ${
                                validationResult?.success 
                                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/40' 
                                    : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                            }`}
                        >
                            <RotateCw className={`w-5 h-5 ${isApplying ? 'animate-spin' : ''}`} />
                            {isApplying ? 'Re-Forging Kernel...' : 'Sign & Apply Mutation'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
 Arkansas Arkansas
 Arkansas Arkansas
