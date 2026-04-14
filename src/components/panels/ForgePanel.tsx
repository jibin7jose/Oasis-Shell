import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Zap, Play, Shield, Terminal, Trash2, CheckCircle } from 'lucide-react';

interface StrategicMacro {
  id: string;
  name: string;
  description: string;
  script: string;
  trigger_pattern: string;
  signed: boolean;
  aura: string;
  status: string;
}

interface ForgePanelProps {
  macros: StrategicMacro[];
  onExecute: (id: string) => void;
  onSign: (id: string) => void;
  onDelete?: (id: string) => void;
  isForging: boolean;
}

export const ForgePanel: React.FC<ForgePanelProps> = ({ macros, onExecute, onSign, onDelete, isForging }) => {
  return (
    <div className="h-full flex flex-col p-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Hammer className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Strategist's Forge</h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Neural Automation Manifest</p>
          </div>
        </div>
        {isForging && (
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Forging Intent...</span>
          </motion.div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {macros.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale">
            <Terminal className="w-12 h-12 text-slate-500 mb-4" />
            <p className="text-sm text-slate-400">Forge currently cold. Synthesis pending.</p>
          </div>
        ) : (
          <AnimatePresence>
            {macros.map((macro) => (
              <motion.div
                key={macro.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border transition-all duration-300 glass-card-hover ${
                  macro.signed ? 'bg-white/5 border-white/10' : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                       {macro.name}
                       {macro.signed && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{macro.description}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                    macro.aura === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 
                    macro.aura === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {macro.aura}
                  </div>
                </div>

                <div className="bg-black/40 rounded-lg p-2 mb-4 border border-white/5 font-mono text-[10px] text-indigo-300 overflow-x-auto">
                  <code>{macro.script}</code>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <Shield className="w-3 h-3" />
                    {macro.signed ? 'Founder Signed' : 'Awaiting Signature'}
                  </div>
                  <div className="flex gap-2">
                    {!macro.signed ? (
                      <button
                        onClick={() => onSign(macro.id)}
                        className="px-4 py-1.5 bg-amber-500 text-black text-[10px] font-bold rounded-lg hover:bg-amber-400 transition-colors uppercase tracking-widest"
                      >
                        Sign
                      </button>
                    ) : (
                      <button
                        onClick={() => onExecute(macro.id)}
                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-black text-[10px] font-bold rounded-lg hover:bg-emerald-400 transition-colors uppercase tracking-widest"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="text-[10px] text-slate-500 flex items-center gap-2 uppercase tracking-widest font-bold">
          <Terminal className="w-3 h-3 text-indigo-400" />
          Neural Macro Status
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
             <div className="w-5 h-5 rounded-full border border-slate-900 bg-emerald-500/40 blur-[2px]" />
             <div className="w-5 h-5 rounded-full border border-slate-900 bg-indigo-500/40 blur-[2px]" />
          </div>
          <span className="text-[10px] font-bold text-slate-300">Synchronized</span>
        </div>
      </div>
    </div>
  );
};
