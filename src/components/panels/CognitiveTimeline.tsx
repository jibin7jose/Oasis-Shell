import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Plus, Clock } from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export interface TimelineEvent {
  id: string | number;
  type: 'neural' | 'deploy' | 'system';
  event: string;
  time: string;
}

interface CognitiveTimelineProps {
  show: boolean;
  onClose: () => void;
  timeline: TimelineEvent[];
}

export const CognitiveTimeline: React.FC<CognitiveTimelineProps> = ({ show, onClose, timeline }) => {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 500 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 500 }} 
      transition={{ type: "spring", damping: 30, stiffness: 300 }} 
      className="fixed inset-y-0 right-0 z-[400] w-[450px] bg-black/80 border-l border-white/5 p-12 backdrop-blur-3xl flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.6)]"
    >
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Activity className="w-3 h-3 animate-pulse" /> Foundry Ledger
          </span>
          <h2 className="text-3xl font-black text-white tracking-tighter">Cognitive Timeline</h2>
        </div>
        <button 
          onClick={onClose} 
          className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"
        >
          <Plus className="w-6 h-6 rotate-45" />
        </button>
      </div>
      
      <div className="flex-1 relative overflow-y-auto custom-scrollbar pr-4 z-10">
        <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent" />
        <div className="space-y-8 pb-10">
          {timeline.map((event, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }} 
              key={event.id} 
              className="relative pl-12 group"
            >
              <div className={cn(
                "absolute left-0 w-8 h-8 rounded-full border-4 border-black flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110", 
                event.type === 'neural' ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : 
                event.type === 'deploy' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-slate-600"
              )}>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <div className="glass-bright p-5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-white/[0.03] transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" /> {event.time}
                  </span>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border",
                    event.type === 'neural' ? "text-indigo-300 bg-indigo-500/10 border-indigo-500/20" :
                    event.type === 'deploy' ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" :
                    "text-slate-300 bg-slate-500/10 border-slate-500/20"
                  )}>
                    {event.type}
                  </span>
                </div>
                <p className="text-sm text-slate-200 font-light leading-relaxed relative z-10">
                  {event.event}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
