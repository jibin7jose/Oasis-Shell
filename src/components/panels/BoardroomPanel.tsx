import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ShieldAlert, TrendingUp, Cpu, MessageSquareQuote, Brain, ScrollText, Download, Loader2 } from 'lucide-react';
import { invokeSafe, isTauri } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

interface BoardroomPanelProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: any;
}

export default function BoardroomPanel({ isOpen, onClose, metrics }: BoardroomPanelProps) {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [debate, setDebate] = useState<any>(null);
  const [activePersona, setActivePersona] = useState(0);
  const [oracleData, setOracleData] = useState<any>(null);
  const [isSummoning, setIsSummoning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [mission, setMission] = useState("Strategic v1.1 Roadmap: Implement Remote Context Crates & Spectral Sound.");
  const { isVaultAuthenticated, setShowVault, setNotification } = useSystemStore();

  const triggerDebate = async () => {
    setIsSynthesizing(true);
    try {
      const task = mission;
      const context = JSON.stringify(metrics);
      const res = await invokeSafe("derive_boardroom_debate", { task, context });
      setDebate(res);
    } catch (e) {
      console.error("Boardroom Breach", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const summonOracle = async () => {
    setIsSummoning(true);
    try {
      const task = mission;
      const context = JSON.stringify({ ...metrics, boardroom_consensus: debate?.summary });
      const res = await invokeSafe("invoke_deep_oracle", { task, context });
      setOracleData(res);
      setActivePersona(99); // Magic index for Oracle
    } catch (e) {
      console.error("Oracle Summoning Failed", e);
    } finally {
      setIsSummoning(false);
    }
  };

  const manifestReport = async () => {
    if (!debate) return;
    if (!isVaultAuthenticated) {
      setNotification("Founder Signature Required to manifest strategic assets.");
      setShowVault(true);
      return;
    }
    setIsExporting(true);
    try {
      const path = await invokeSafe("generate_strategic_report", { 
        summary: debate.summary, 
        oracleAdvice: oracleData?.advice || "No Oracle directive present." 
      }) as string;
      setNotification(`Strategic Report Manifested: ${path}`);
    } catch (e) {
      setNotification("Report Manifestation Breach.");
    } finally {
      setIsExporting(false);
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
                <input 
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  placeholder="Define Strategic Mission..."
                  className="bg-transparent border-none text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-1 w-full focus:outline-none placeholder:text-indigo-500/20"
                />
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

              {debate && (
                <button
                  onClick={oracleData ? () => setActivePersona(99) : summonOracle}
                  disabled={isSummoning}
                  className={`p-6 rounded-3xl border transition-all flex flex-col gap-3 group relative overflow-hidden ${activePersona === 99 ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/5 border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">The Local Oracle</span>
                    {isSummoning ? <Loader2 className="w-4 h-4 text-purple-400 animate-spin" /> : <Brain className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest leading-none">
                    {oracleData ? "REASONING MANIFESTED" : isTauri ? "SUMMON LOCAL ORACLE" : "DESKTOP ORACLE REQUIRED"}
                  </p>
                  
                  {activePersona === 99 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
                  )}
                </button>
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
                 {debate && activePersona !== 99 ? (
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

                      <p className="text-3xl text-slate-300 font-medium leading-relaxed italic border-l-8 border-white/10 pl-12 py-6 text-left">
                        "{debate.insights[activePersona].advice}"
                      </p>

                      <div className="grid grid-cols-2 gap-10">
                         <div className="p-10 rounded-[3rem] bg-rose-500/5 border border-rose-500/10 space-y-4 shadow-xl">
                            <div className="flex items-center gap-3 text-rose-400">
                               <ShieldAlert className="w-6 h-6" />
                               <span className="text-xs font-black uppercase tracking-[0.3em]">Risk Probability</span>
                            </div>
                            <div className="text-6xl font-black text-white">{(debate.insights[activePersona].risk * 100).toFixed(0)}%</div>
                            <p className="text-[10px] text-rose-500/60 uppercase font-black tracking-widest leading-relaxed text-left">System-Level instability detected for this strategic vector.</p>
                         </div>

                         <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4 shadow-xl">
                            <div className="flex items-center gap-3 text-indigo-400">
                               <Zap className="w-6 h-6" />
                               <span className="text-xs font-black uppercase tracking-[0.3em]">Neural Resonance</span>
                            </div>
                            <div className="text-6xl font-black text-white">{debate.insights[activePersona].score}</div>
                            <p className="text-[10px] text-indigo-500/60 uppercase font-black tracking-widest leading-relaxed text-left">Persona alignment score based on current kernel telemetry.</p>
                         </div>
                      </div>

                      <section className="p-12 glass-bright rounded-[3.5rem] border-white/5">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Concensus Summary</h4>
                         <p className="text-xl text-white font-black uppercase tracking-tighter leading-snug text-left">
                           {debate.summary}
                         </p>
                      </section>
                   </motion.div>
                 ) : activePersona === 99 && oracleData ? (
                   <motion.div 
                     key="oracle"
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="space-y-12"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-1.5 h-10 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                         <h3 className="text-5xl font-black text-white uppercase tracking-tighter">Oracle Synthesis</h3>
                      </div>

                      <div className="space-y-4">
                         <div className="flex items-center gap-3 text-purple-400">
                            <ScrollText className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Thought Trace (Chain of Thought)</span>
                         </div>
                         <div className="p-10 glass-dark rounded-[2.5rem] border-purple-500/20 max-h-64 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed text-purple-200/60 lowercase italic text-left">
                            {oracleData.thought_trace}
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Final Strategic Directive</h4>
                         <p className="text-4xl text-white font-medium leading-tight border-l-8 border-purple-500/30 pl-12 py-6 text-left">
                           "{oracleData.advice}"
                         </p>
                      </div>

                      <div className="flex items-center gap-3 p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                         <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                         <span className="text-[9px] font-black text-purple-400 uppercase tracking-[0.4em]">Hybrid Reasoning Synergy: STABLE</span>
                      </div>
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
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Gemma-4 Synthesis: ACTIVE</span>
              </div>
              {oracleData && (
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                   <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Local Oracle Sync: NOMINAL</span>
                </div>
              )}
           </div>

           <div className="flex items-center gap-4">
              {debate && (
                <button 
                  onClick={manifestReport}
                  disabled={isExporting}
                  className="flex items-center gap-3 px-6 py-2 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-full transition-all group"
                >
                  {isExporting ? <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" /> : <Download className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />}
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Manifest Strategic Report</span>
                </button>
              )}
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">Strategic Directive Layer // Locked To Founder Signature</p>
           </div>
        </footer>
      </div>
    </motion.div>
  );
}
