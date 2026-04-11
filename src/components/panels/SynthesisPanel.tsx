import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Plus, Book, Zap } from "lucide-react";
import { useSystemStore } from "../../lib/systemStore";

const SynthesisPanel: React.FC = () => {
  const { activeSynthesis, setActiveSynthesis, setShowDocs } = useSystemStore();

  return (
    <AnimatePresence>
      {activeSynthesis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[8000] bg-indigo-950/40 backdrop-blur-5xl flex items-center justify-center p-20"
        >
          <div className="w-full max-w-6xl glass-bright rounded-[4rem] border border-indigo-500/30 p-16 relative overflow-hidden flex flex-col h-[750px] shadow-6xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start mb-12">
              <div>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 block animate-pulse">
                  Neural Pitch Synthesis L_01
                </span>
                <h2 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">
                  Strategic Venture Narrative
                </h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                  <Bot className="w-5 h-5 text-indigo-400" /> Synthesis ID: {activeSynthesis.id}
                </p>
              </div>
              <button
                onClick={() => setActiveSynthesis(null)}
                className="w-20 h-20 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border-white/10 shadow-2xl"
              >
                <Plus size={40} className="rotate-45" />
              </button>
            </div>

            <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-16 overflow-hidden">
              {activeSynthesis.type === "FILE_MANIFEST" ? (
                <>
                  <div className="space-y-10 overflow-y-auto pr-6 custom-scrollbar">
                    <section>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
                        Neural File Manifest
                      </h4>
                      <div className="p-8 rounded-3xl bg-black/40 border border-white/10 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar">
                        {activeSynthesis.content}
                      </div>
                    </section>
                  </div>
                  <div className="flex flex-col gap-8">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                      Neural Context
                    </h4>
                    <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-6">
                      <p className="text-lg text-white font-medium italic">
                        "This node represents a critical junction in the {activeSynthesis.id.split(".").pop()?.toUpperCase()}{" "}
                        logic layer. Its structural integrity is essential for the Oasis Kernel's stability."
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                          Type: {activeSynthesis.id.split(".").pop()?.toUpperCase()}
                        </div>
                        <div className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                          Resonance: 0.98
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-col gap-4 pt-10">
                      <button
                        onClick={() => {
                          setShowDocs(true);
                          setActiveSynthesis(null);
                        }}
                        className="py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3"
                      >
                        <Book className="w-5 h-5" /> REVEAL IN MANUAL HUB
                      </button>
                      <button className="py-6 bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all">
                        GENERATE ARCHITECTURAL AUDIT
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-10 overflow-y-auto pr-6 custom-scrollbar">
                    <section>
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
                        The Narrative
                      </h4>
                      <p className="text-xl text-white font-medium leading-relaxed italic border-l-4 border-indigo-500/40 pl-8 bg-white/5 p-8 rounded-3xl">
                        "{activeSynthesis.strategic_narrative}"
                      </p>
                    </section>
                    <section>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">
                        Market Correlation
                      </h4>
                      <div className="p-8 rounded-3xl bg-black/20 border border-white/5">
                        <p className="text-sm text-slate-300 leading-relaxed font-mono">
                          {activeSynthesis.market_context}
                        </p>
                      </div>
                    </section>
                  </div>

                  <div className="flex flex-col gap-8">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                      Actionable Outreach
                    </h4>
                    <div className="space-y-4">
                      {activeSynthesis.actionable_outreach.map((step: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-6 group hover:bg-indigo-500/10 transition-all"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center font-black text-indigo-400 border border-indigo-400/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            {i + 1}
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-wider">{step}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 pt-10">
                      <button className="py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all">
                        Export Pitch PDF
                      </button>
                      <button className="py-6 bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all">
                        Commit to Vault
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SynthesisPanel;
