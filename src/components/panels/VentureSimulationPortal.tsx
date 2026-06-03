import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Activity as PulseIcon } from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export interface SimMetrics {
  arr: number;
  burn: number;
  momentum: number;
}

interface VentureSimulationPortalProps {
  show: boolean;
  onClose: () => void;
  metrics: SimMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<SimMetrics>>;
}

export const VentureSimulationPortal: React.FC<VentureSimulationPortalProps> = ({ 
  show, 
  onClose, 
  metrics, 
  setMetrics 
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          transition={{ type: "spring", damping: 25, stiffness: 200 }} 
          className="fixed inset-0 z-[500] flex items-center justify-center p-20 bg-black/80 backdrop-blur-3xl"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          
          <div className="w-full max-w-4xl glass-bright rounded-[3rem] p-16 border border-amber-500/20 shadow-[0_0_100px_rgba(245,158,11,0.15)] relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0 opacity-70" />
            <div className="flex items-center justify-between mb-16 relative z-10">
              <div className="flex flex-col">
                <span className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-2 flex items-center gap-3">
                  <Activity className="w-4 h-4 animate-pulse" /> Strategic Sandbox
                </span>
                <h2 className="text-4xl font-black text-white tracking-tighter">Venture Simulation Portal</h2>
              </div>
              <button 
                onClick={onClose} 
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transform hover:-translate-y-1"
              >
                Commit Simulation
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-12 relative z-10">
              {[
                { label: 'Target ARR (Pro-Forma)', val: metrics.arr, unit: 'M', min: 0.5, max: 10, key: 'arr' as const, color: 'text-emerald-400', accent: 'accent-emerald-500' },
                { label: 'Estimated Burn Rate', val: metrics.burn, unit: 'K/mo', min: 10, max: 100, key: 'burn' as const, color: 'text-red-400', accent: 'accent-red-500' },
                { label: 'Growth Momentum', val: metrics.momentum, unit: '%', min: 0, max: 50, key: 'momentum' as const, color: 'text-amber-400', accent: 'accent-amber-500' }
              ].map((sim) => (
                <div key={sim.key} className="space-y-6 group">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4 group-hover:border-white/10 transition-colors">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      {sim.key === 'arr' && <Zap className="w-4 h-4 text-emerald-500" />}
                      {sim.key === 'burn' && <Activity className="w-4 h-4 text-red-500" />}
                      {sim.key === 'momentum' && <PulseIcon className="w-4 h-4 text-amber-500" />}
                      {sim.label}
                    </label>
                    <span className={cn("text-4xl font-black tracking-tighter drop-shadow-md", sim.color)}>
                      {sim.key === 'arr' ? '$' : ''}{sim.val}<span className="text-lg opacity-70 ml-1">{sim.unit}</span>
                    </span>
                  </div>
                  <div className="relative pt-2">
                    <input 
                      type="range" 
                      min={sim.min} 
                      max={sim.max} 
                      step={0.1} 
                      value={sim.val} 
                      onChange={(e) => setMetrics(prev => ({ ...prev, [sim.key]: parseFloat(e.target.value) }))} 
                      className={cn("w-full h-2 bg-black/40 rounded-full appearance-none cursor-pointer border border-white/5", sim.accent)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
