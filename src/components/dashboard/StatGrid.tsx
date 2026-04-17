import React from 'react';
import { Activity, Zap, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatGridProps {
  simMode: boolean;
  simMetrics: any;
  founderMetrics: any;
  zenMode: boolean;
}

export const StatGrid: React.FC<StatGridProps> = ({
  simMode,
  simMetrics,
  founderMetrics,
  zenMode,
}) => {
  const metrics = [
    { label: 'Target ARR', val: simMode ? `$${simMetrics.arr}M` : founderMetrics.arr, icon: Activity },
    { label: 'Burn Rate', val: simMode ? `$${simMetrics.burn}K` : founderMetrics.burn, icon: Zap },
    { label: 'Projected Runway', val: founderMetrics.runway, icon: Shield },
    { label: 'Growth Momentum', val: simMode ? `${simMetrics.momentum}%` : founderMetrics.momentum, icon: Activity }
  ];

  return (
    <div className={cn(
      "w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-12",
      zenMode && "zen-hide"
    )}>
      {metrics.map((m, i) => (
        <div 
          key={`founder-metric-${m.label}-${i}`} 
          className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-3 hover:border-white/10 transition-all group"
        >
          <m.icon 
            className="w-5 h-5 group-hover:scale-110 transition-transform" 
            style={{ color: 'var(--accent-primary)' }}
          />
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
            <div className="text-xl font-bold text-white">{m.val}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
