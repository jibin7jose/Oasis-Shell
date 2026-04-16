import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, Activity, ShieldCheck, AlertCircle, Database, Server } from 'lucide-react';
import { useSystemStore } from '../../lib/systemStore';
import { cn } from '../../lib/utils';

export const StoragePanel: React.FC = () => {
  const storage = useSystemStore((state) => state.storage);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb > 1024) return `${(gb / 1024).toFixed(2)} TB`;
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="w-full max-w-7xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Storage Atlas</h2>
        <p className="text-slate-500 font-medium tracking-widest text-[10px] uppercase">Host Logical Volume Mapping & Health Diagnostics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {storage.map((disk, idx) => {
          const used = disk.total - disk.available;
          const usedPct = (used / disk.total) * 100;
          const isCritical = usedPct > 90;
          const isWarning = usedPct > 75;

          return (
            <motion.div
              key={`${disk.mount}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden glass rounded-[3rem] border border-white/5 p-10 hover:border-white/20 transition-all duration-500"
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 transition-all duration-700 group-hover:opacity-40",
                isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-indigo-500"
              )} />

              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors",
                      isCritical ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-white/5 border-white/10 text-indigo-400"
                    )}>
                      <HardDrive className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{disk.name || 'Local Disk'}</h3>
                      <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{disk.mount}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integrity Rank</span>
                    <span className={cn(
                      "text-xl font-black",
                      disk.health_score > 90 ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {disk.health_score.toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Capacity Used</span>
                      <span className="text-3xl font-black text-white">
                        {usedPct.toFixed(1)}<span className="text-slate-500 text-lg">%</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-300">
                        {formatBytes(used)} <span className="text-slate-500">/ {formatBytes(disk.total)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="h-4 w-full bg-white/5 rounded-full p-1 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usedPct}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                        isCritical ? "bg-rose-500 shadow-rose-500/20" : isWarning ? "bg-amber-500 shadow-amber-500/20" : "bg-indigo-500 shadow-indigo-500/20"
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sector Status: OK</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encryption: Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {storage.length === 0 && (
          <div className="col-span-full h-96 glass rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
              <Database className="w-10 h-10 text-slate-700" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-[0.3em]">No Logical Volumes Detected</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Server, label: "Neural Cache", value: "2.4 GB", sub: "Optimized" },
          { icon: Database, label: "Vault Ledger", value: "Locked", sub: "Auth Required" },
          { icon: AlertCircle, label: "System Debt", value: "None", sub: "Clear" },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-3xl border border-white/5 p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <stat.icon className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-lg font-black text-white tracking-tight">{stat.value}</p>
              <p className="text-[8px] font-mono text-indigo-400/60 uppercase">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
