import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Zap, ArrowRight, ShieldCheck } from "lucide-react";

interface SynthesisReport {
  id: string;
  strategic_narrative: string;
  confidence_score: number;
  market_context: string;
  actionable_outreach: string[];
}

interface NeuralWisdomFeedProps {
  report: SynthesisReport | null;
  onSynthesize?: () => void;
  isSynthesizing?: boolean;
}

export const NeuralWisdomFeed: React.FC<NeuralWisdomFeedProps> = ({ 
  report, 
  onSynthesize,
  isSynthesizing = false 
}) => {
  return (
    <div className="glass-bright p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Wisdom</h3>
            <p className="text-[8px] font-mono text-slate-500">Autonomous Golem Synthesis</p>
          </div>
        </div>
        
        <button 
          onClick={onSynthesize}
          disabled={isSynthesizing}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-400 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSynthesizing ? <Zap className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          {isSynthesizing ? "Synthesizing..." : "New Pulse"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!report ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-3xl"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">No active synthesis report</p>
            <p className="text-[8px] text-slate-600 font-mono italic">Trigger a neural pulse to generate strategic insights</p>
          </motion.div>
        ) : (
          <motion.div
            key={`wisdom-${report.id || report.strategic_narrative?.slice(0, 24) || "report"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 relative z-10"
          >
            <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-[11px] leading-relaxed text-slate-300 italic font-medium">
                "{report.strategic_narrative}"
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Strategic Directives</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400">{(report.confidence_score * 100).toFixed(0)}% Conf.</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {report.actionable_outreach.map((step, i) => (
                  <motion.div 
                    key={`wisdom-step-${i}-${step}`}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3 group/item hover:border-indigo-500/30 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[9px] font-black text-indigo-400 border border-indigo-400/20">
                      0{i+1}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight group-hover/item:text-white transition-colors">
                      {step}
                    </span>
                    <ArrowRight className="w-3 h-3 ml-auto text-slate-600 group-hover/item:text-indigo-400 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
