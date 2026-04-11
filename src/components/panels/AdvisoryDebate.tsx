import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ShieldAlert } from "lucide-react";
import { useSystemStore } from "../../lib/systemStore";
import { cn } from "../../lib/utils";

const AdvisoryDebate: React.FC = () => {
  const { activeDebate, setActiveDebate } = useSystemStore();

  return (
    <AnimatePresence>
      {activeDebate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[8500] bg-black/60 backdrop-blur-5xl flex items-center justify-center p-24"
        >
          <div className="w-full max-w-7xl glass-bright rounded-[4rem] border border-white/10 p-16 relative overflow-hidden flex flex-col h-[800px] shadow-6xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />

            <div className="flex justify-between items-start mb-16 px-4">
              <div>
                <span
                  className={cn(
                    "text-xs font-black uppercase tracking-[0.4em] px-4 py-1 rounded-full border mb-4 inline-block",
                    activeDebate.consensus_aura === "volatile"
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  )}
                >
                  Consensus Status: {activeDebate.consensus_aura}
                </span>
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">
                  Strategic Advisory Debate
                </h2>
              </div>
              <button
                onClick={() => setActiveDebate(null)}
                className="w-20 h-20 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border-white/10 shadow-2xl"
              >
                <Plus size={40} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden px-4">
              {activeDebate.insights.map((insight: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col rounded-3xl p-8 bg-white/[0.03] border border-white/5 relative group hover:bg-white/5 transition-all overflow-hidden"
                >
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-1 h-full",
                      insight.persona.includes("ARCHITECT")
                        ? "bg-amber-500"
                        : insight.persona.includes("GROWTH")
                        ? "bg-pink-500"
                        : "bg-slate-400"
                    )}
                  />

                  <div className="flex items-center justify-between mb-8">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.3em]",
                        insight.persona.includes("ARCHITECT")
                          ? "text-amber-500"
                          : insight.persona.includes("GROWTH")
                          ? "text-pink-500"
                          : "text-slate-400"
                      )}
                    >
                      {insight.persona}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500">
                        {insight.strategic_score}%
                      </span>
                      <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/40"
                          style={{ width: `${insight.strategic_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-medium mb-auto">
                    "{insight.perspective}"
                  </p>

                  <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">
                      Risk Index: {Math.round(insight.risk_impact * 100)}%
                    </span>
                    <ShieldAlert
                      className={cn(
                        "w-4 h-4",
                        insight.risk_impact > 0.7 ? "text-rose-500" : "text-slate-500"
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 bg-white/5 p-8 rounded-[2rem] border border-white/10 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400 max-w-2xl px-4">
                Observe the conflicting perspectives between technical stability, market velocity, and catastrophic risk
                mitigation. Your tie-breaking decision is required for commit manifestation.
              </p>
              <button className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all">
                Review & Commit
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvisoryDebate;
