import React from 'react';
import { Bot, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GolemMatrixProps {
  activeGolems: any[];
  setSelectedGolem: (golem: any) => void;
  zenMode: boolean;
}

export const GolemMatrix: React.FC<GolemMatrixProps> = ({
  activeGolems,
  setSelectedGolem,
  zenMode,
}) => {
  return (
    <div className={cn(
      "glass p-8 rounded-[2.5rem] border border-white/5",
      zenMode && "zen-hide"
    )}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Active Golem Matrix</h3>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Units: {activeGolems.length}</span>
      </div>
      <div className="flex flex-col gap-4">
        {activeGolems.map((golem, i) => (
          <div
            key={`golem-matrix-${golem.id}-${i}`}
            onClick={() => setSelectedGolem(golem)}
            className="flex flex-col gap-3 p-5 bg-white/5 rounded-2xl group cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="flex justify-between items-center">
              <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight flex items-center gap-2">
                {golem.name}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
              </div>
              <div className={cn("text-[9px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm flex items-center gap-1.5",
                golem.aura === 'emerald' ? "bg-emerald-500/10 text-emerald-400" :
                  golem.aura === 'rose' ? "bg-rose-500/10 text-rose-400" :
                    "bg-indigo-500/10 text-indigo-400"
              )}>
                <span className={cn("w-1 h-1 rounded-full", golem.aura === 'emerald' ? "bg-emerald-400" : golem.aura === 'rose' ? "bg-rose-400" : "bg-indigo-400")} />
                {golem.status}
              </div>
            </div>
            <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${golem.progress}%` }}
                className={cn("h-full relative overflow-hidden",
                  golem.aura === 'emerald' ? "bg-emerald-500 shadow-[0_0_8px_var(--emerald-500)]" :
                    golem.aura === 'rose' ? "bg-rose-500 shadow-[0_0_8px_var(--rose-500)]" :
                      "bg-indigo-500 shadow-[0_0_8px_var(--indigo-500)]"
                )}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              <span>{golem.mission}</span>
              <span>{golem.progress}% Complete</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
