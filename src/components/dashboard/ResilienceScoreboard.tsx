import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Zap, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSystemStore } from '../../lib/systemStore';

export const ResilienceScoreboard: React.FC = () => {
  const { resilienceData, fetchResilienceAudit } = useSystemStore();

  useEffect(() => {
    fetchResilienceAudit();
    const interval = setInterval(fetchResilienceAudit, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!resilienceData) return null;

  const score = resilienceData.score || 0;
  
  return (
    <div className="flex flex-col gap-8 p-10 glass rounded-[3rem] border border-white/5 relative overflow-hidden">
      {/* Background Kinetic Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 opacity-50" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Systemic Resilience</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Foundry Forensics vs. Oracle Forecasts</p>
          </div>
        </div>
        <div className="text-right">
           <span className="text-4xl font-black text-white font-mono">{score.toFixed(1)}%</span>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Resilience Index</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
         {/* Metric Card: Predictions */}
         <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-400">
               <AlertCircle size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">Predicted Risks</span>
            </div>
            <span className="text-3xl font-black text-white">{resilienceData.predictions_count}</span>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Anomalies anticipated by Neural Oracle</p>
         </div>

         {/* Metric Card: Mitigations */}
         <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-emerald-400">
               <CheckCircle2 size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">Neutralized</span>
            </div>
            <span className="text-3xl font-black text-white">{resilienceData.mitigated_count}</span>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Heuristic Guardians deployed via Forge</p>
         </div>

         {/* Metric Card: Integrity */}
         <div className="p-6 rounded-3xl bg-[#050505]/50 border border-white/10 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
            <div className="flex items-center gap-3 text-indigo-400 relative z-10">
               <Zap size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">Foundry Stability</span>
            </div>
            <span className="text-3xl font-black text-white relative z-10">NOMINAL</span>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight relative z-10">Current kernel equilibrium state</p>
         </div>
      </div>

      {/* Prediction Log */}
      <div className="space-y-4 relative z-10">
         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Recent Anomaly Identifiers</h4>
         <div className="grid grid-cols-1 gap-3">
            {resilienceData.recent_predictions?.map((pred: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-indigo-500/20 transition-all">
                 <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${pred.level === 'High Risk' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                    <span className="text-xs font-bold text-white uppercase tracking-tight">{pred.title}</span>
                 </div>
                 <span className="text-[9px] font-mono text-slate-600">{new Date(pred.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
