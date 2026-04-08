import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ShieldAlert, TrendingUp, Cpu, MessageSquareQuote } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";

interface BoardroomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: any;
}

export default function BoardroomPanel({ isOpen, onClose, metrics }: BoardroomPanelProps) {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [debate, setDebate] = useState<any>(null);
  const [activePersona, setActivePersona] = useState(0);

  const triggerDebate = async () => {
    setIsSynthesizing(true);
    try {
      const task = "Strategic v1.1 Roadmap: Implement Remote Context Crates & Spectral Sound.";
      const context = JSON.stringify(metrics);
      const res = await invoke("derive_boardroom_debate", { task, context });
      setDebate(res);
    } catch (e) {
      console.error("Boardroom Breach", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !debate) {
      triggerDebate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[7000] bg-black/80 backdrop-blur-3xl flex items-center justify-center p-12"
    >
      <div className="w-full max-w-7xl h-full glass border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-6xl relative">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5 pointer-events-none" />

        {/* Header */}
        <header className="px-12 py-10 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl">
                <MessageSquareQuote className="w-7 h-7 text-indigo-400" />
             </div>
             <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Boardroom Debate</h2>
                <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.4em] mt-1">Founders Strategic Consensus Layer // V1.0</p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl border border-white/10 transition-all">
            <X className="w-7 h-7" />
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden relative z-10">
           {/* Sidebar: Agents */}
           <aside className="w-96 border-r border-white/5 bg-black/20 flex flex-col p-8 gap-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Neural Perspectives</h4>
              {debate?.insights.map((insight: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActivePersona(i)}
                  className={`p-6 rounded-3xl border transition-all flex flex-col gap-3 group ${activePersona === i ? 'bg-indigo-500/10 border-indigo-500/40 shadow-xl' : 'bg-white/5 border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">{insight.persona}</span>
                     {insight.persona.includes("ARCHITECT") ? <Cpu className="w-4 h-4 text-indigo-400" /> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${insight.score}%` }} className={`h-full ${insight.score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                </button>
              )) || (
                <div className="space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />)}
                </div>
              )}

              <button 
                onClick={triggerDebate}
                disabled={isSynthesizing}
                className="mt-auto py-5 bg-white/5 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-white/10 transition-all disabled:opacity-50"
              >
                {isSynthesizing ? "Resonating Perspectives..." : "RE-ITERATE DEBATE"}
              </button>
           </aside>

           {/* Main Hub: The Insight */}
           <main className="flex-1 p-16 overflow-y-auto custom-scrollbar relative">
              <AnimatePresence mode="wait">
                 {debate ? (
                   <motion.div 
                     key={activePersona}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-12"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-glow" />
                         <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Strategic Advice</h3>
                      </div>

                      <p className="text-3xl text-slate-300 font-medium leading-relaxed italic border-l-8 border-white/10 pl-12 py-6">
                        "{debate.insights[activePersona].advice}"
                      </p>

                      <div className="grid grid-cols-2 gap-10">
                         <div className="p-10 rounded-[3rem] bg-rose-500/5 border border-rose-500/10 space-y-4">
                            <div className="flex items-center gap-3 text-rose-400">
                               <ShieldAlert className="w-6 h-6" />
                               <span className="text-xs font-black uppercase tracking-[0.3em]">Risk Probability</span>
                            </div>
                            <div className="text-6xl font-black text-white">{(debate.insights[activePersona].risk * 100).toFixed(0)}%</div>
                            <p className="text-[10px] text-rose-500/60 uppercase font-black tracking-widest leading-relaxed">System-Level instability detected for this strategic vector.</p>
                         </div>

                         <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                            <div className="flex items-center gap-3 text-indigo-400">
                               <Zap className="w-6 h-6" />
                               <span className="text-xs font-black uppercase tracking-[0.3em]">Neural Resonance</span>
                            </div>
                            <div className="text-6xl font-black text-white">{debate.insights[activePersona].score}</div>
                            <p className="text-[10px] text-indigo-500/60 uppercase font-black tracking-widest leading-relaxed">Persona alignment score based on current kernel telemetry.</p>
                         </div>
                      </div>

                      <section className="p-12 glass-bright rounded-[3.5rem] border-white/5">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Concensus Summary</h4>
                         <p className="text-xl text-white font-black uppercase tracking-tighter leading-snug">
                           {debate.summary}
                         </p>
                      </section>
                   </motion.div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center gap-8 text-center">
                      <div className="w-20 h-20 border-t-2 border-indigo-500 rounded-full animate-spin" />
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest">Convening Boardroom</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mt-2 animate-pulse">Neural agents are analyzing venture telemetry...</p>
                      </div>
                   </div>
                 )}
              </AnimatePresence>
           </main>
        </div>

        {/* Footer */}
        <footer className="px-12 py-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between relative z-10">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Gemma-4 Multi-Agent Synthesis: ACTIVE</span>
           </div>
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Strategic Directive Layer // Locked To Founder Signature</p>
        </footer>
      </div>
    </motion.div>
  );
}
