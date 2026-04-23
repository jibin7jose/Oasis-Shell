import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, BarChart3, Activity, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface VenturePulseCardProps {
  id: number;
  name: string;
  integrity: number;
  arr: number;
  burn: number;
  status: string;
  aura: string;
  timestamp: string;
  onLaunch: (id: number) => void;
  onMirror?: (name: string) => void;
  isMirroring?: boolean;
}

export const VenturePulseCard: React.FC<VenturePulseCardProps> = ({
  id,
  name,
  integrity,
  arr,
  burn,
  status,
  aura,
  timestamp,
  onLaunch,
  onMirror,
  isMirroring
}) => {
  const runway = burn > 0 ? (arr / 12 / burn).toFixed(1) : "∞";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      style={{ borderColor: `${aura}30` }}
      className="glass rounded-[2.5rem] p-8 border hover:border-white/20 transition-all group relative overflow-hidden flex flex-col h-full"
    >
      {/* Background Glow */}
      <div 
        className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${aura} 0%, transparent 70%)` }}
      />

      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
            style={{ backgroundColor: `${aura}10`, borderColor: `${aura}30` }}
          >
            <Activity className="w-6 h-6" style={{ color: aura }} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">{name}</h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{status}</span>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
          integrity > 80 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          integrity > 40 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
          "bg-rose-500/10 border-rose-500/20 text-rose-400"
        )}>
          Integrity: {integrity}%
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            <TrendingUp size={10} className="text-emerald-400" />
            Peak ARR
          </div>
          <div className="text-lg font-black text-white tracking-widest">${(arr / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            <Shield size={10} className="text-indigo-400" />
            Runway
          </div>
          <div className="text-lg font-black text-white tracking-widest">{runway} MO</div>
        </div>
      </div>

      {/* Sparkline Simulation */}
      <div className="flex-1 min-h-[60px] flex items-end gap-1 mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="flex-1 rounded-full"
            style={{ 
              height: `${40 + Math.random() * 60}%`, 
              backgroundColor: aura,
              opacity: 0.1 + (i / 20) * 0.5 
            }}
          />
        ))}
      </div>

      <footer className="mt-auto flex items-center gap-4">
        <button 
          onClick={() => onLaunch(id)}
          className="flex-1 py-4 glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/10"
        >
          <Zap size={14} style={{ color: aura }} /> Restore Core
        </button>
        <button 
          onClick={() => onMirror?.(name)}
          disabled={isMirroring}
          className={cn(
            "w-14 h-14 glass rounded-2xl flex items-center justify-center transition-all border border-white/10",
            isMirroring ? "text-indigo-400 animate-pulse bg-indigo-500/10 border-indigo-500/20" : "text-slate-500 hover:text-white"
          )}
        >
          <ExternalLink size={18} className={cn(isMirroring && "animate-spin")} />
        </button>
      </footer>
    </motion.div>
  );
};
