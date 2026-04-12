import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, GitPullRequest, Check, Trash2, Loader2, ChevronRight, FileCode, Zap } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface GolemTask {
  id: String;
  name: String;
  status: String;
  progress: number;
  aura: string;
}

interface GolemProposal {
  id: string;
  task_id: string;
  agent_name: string;
  file_path: string;
  title: string;
  original_content: string;
  proposed_content: string;
  rationale: string;
  status: string;
}

interface WorkforcePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkforcePanel({ isOpen, onClose }: WorkforcePanelProps) {
  const [activeGolems, setActiveGolems] = useState<GolemTask[]>([]);
  const [proposals, setProposals] = useState<GolemProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<GolemProposal | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(async () => {
        try {
          const [tasks, props] = await Promise.all([
            invokeSafe('get_active_golems') as Promise<GolemTask[]>,
            invokeSafe('get_golem_proposals') as Promise<GolemProposal[]>
          ]);
          setActiveGolems(tasks);
          setProposals(props.filter(p => p.status === 'pending'));
        } catch (e) {
          console.error("Failed to fetch workforce state", e);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleResolve = async (id: string, action: 'merge' | 'discard') => {
    setIsResolving(true);
    try {
      await invokeSafe('resolve_golem_proposal', { proposalId: id, action });
      setSelectedProposal(null);
    } catch (e) {
      console.error("Resolution failed", e);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed right-0 top-0 bottom-0 w-[550px] glass-dark border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                  <Cpu className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white uppercase tracking-tighter">Neural Workforce</h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Autonomous Agent Coordination</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Active Tasks Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Active Neural Pulses</h2>
                  <span className="px-2 py-0.5 bg-indigo-500/10 rounded-full text-[8px] font-black text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">{activeGolems.length} Golems</span>
                </div>
                
                {activeGolems.length === 0 ? (
                  <div className="p-10 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center opacity-40">
                     <Zap className="w-8 h-8 text-slate-600 mb-4" />
                     <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">No active autonomous labor detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGolems.map((golem, index) => (
                      <motion.div 
                        key={`${String(golem.id ?? golem.name ?? "golem")}-${index}`}
                        layout
                        className="p-5 glass rounded-2xl border border-white/5 flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full animate-pulse",
                              golem.aura === 'rose' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" :
                              golem.aura === 'amber' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
                              "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            )} />
                            <span className="text-[11px] font-black text-white tracking-widest uppercase">{golem.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{golem.status}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${golem.progress * 100}%` }}
                            className={cn(
                              "h-full transition-all duration-1000",
                              golem.aura === 'rose' ? "bg-rose-500" :
                              golem.aura === 'amber' ? "bg-amber-500" :
                              "bg-emerald-500"
                            )}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              {/* Proposals Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Manifested Proposals</h2>
                  <span className="px-2 py-0.5 bg-emerald-500/10 rounded-full text-[8px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">{proposals.length} Neural PRs</span>
                </div>

                <div className="grid gap-4">
                  {proposals.map((prop, index) => (
                    <motion.button
                      key={`${prop.id ?? prop.file_path ?? "proposal"}-${index}`}
                      onClick={() => setSelectedProposal(prop)}
                      className={cn(
                        "w-full text-left p-6 glass rounded-2xl border border-white/5 hover:border-emerald-500/40 transition-all group relative overflow-hidden",
                        selectedProposal?.id === prop.id && "border-emerald-500/50 bg-emerald-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <GitPullRequest className="w-4 h-4 text-emerald-400" />
                          <span className="text-[11px] font-black text-white tracking-widest uppercase">{prop.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-all" />
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{prop.rationale}</p>
                      
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500/40 opacity-0 group-hover:opacity-100 transition-all" />
                    </motion.button>
                  ))}
                </div>
              </section>
            </div>

            {/* Proposal Detail Overlay */}
            <AnimatePresence>
                {selectedProposal && (
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute inset-0 bg-slate-950 z-[110] flex flex-col"
                    >
                         <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-transparent">
                            <button onClick={() => setSelectedProposal(null)} className="flex items-center gap-2 group">
                                <ChevronRight className="w-4 h-4 text-slate-500 rotate-180 group-hover:text-white transition-all" />
                                <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Return to Workforce</span>
                            </button>
                            <div className="text-right">
                                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Refactoring Manifesto</h3>
                                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none mt-1">{selectedProposal.id}</p>
                            </div>
                         </div>

                         <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                             <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <FileCode className="w-4 h-4" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{selectedProposal.file_path}</span>
                                </div>
                                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl italic text-[11px] text-emerald-200/80 leading-relaxed">
                                    "{selectedProposal.rationale}"
                                </div>
                             </div>

                             <div className="space-y-4">
                                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Proposed Code Manifest</h4>
                                <div className="p-6 bg-black/60 border border-white/5 rounded-2xl overflow-x-auto">
                                    <pre className="text-[10px] text-indigo-300 font-mono leading-relaxed">
                                        <code>{selectedProposal.proposed_content}</code>
                                    </pre>
                                </div>
                             </div>
                         </div>

                         <div className="p-8 border-t border-white/5 grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleResolve(selectedProposal.id, 'discard')}
                                disabled={isResolving}
                                className="flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 rounded-2xl group transition-all"
                            >
                                <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-rose-400" />
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-rose-400 uppercase tracking-widest">Discard Manifest</span>
                            </button>
                            <button 
                                onClick={() => handleResolve(selectedProposal.id, 'merge')}
                                disabled={isResolving}
                                className="flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                            >
                                {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                <span className="text-[10px] font-black uppercase tracking-widest">Merge Neural PR</span>
                            </button>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
