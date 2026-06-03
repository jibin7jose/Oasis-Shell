import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, BrainCircuit, Activity, FolderOpen, Shield, Activity as PulseIcon } from 'lucide-react';
import { enable, disable } from "@tauri-apps/plugin-autostart";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface SettingsPanelProps {
  show: boolean;
  onClose: () => void;
  vaultNodesCount: number;
  autostart: boolean;
  setAutostart: (v: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  show, 
  onClose, 
  vaultNodesCount, 
  autostart, 
  setAutostart 
}) => {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -500 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -500 }} 
      transition={{ type: "spring", damping: 30, stiffness: 300 }} 
      className="fixed inset-y-0 left-0 z-[400] w-[450px] bg-black/80 border-r border-white/5 p-12 backdrop-blur-3xl flex flex-col shadow-[30px_0_60px_rgba(0,0,0,0.6)]"
    >
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Settings className="w-3 h-3 animate-[spin_4s_linear_infinite]" /> System Configuration
          </span>
          <h2 className="text-3xl font-black text-white tracking-tighter">Kernel Settings</h2>
        </div>
        <button 
          onClick={onClose} 
          className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"
        >
          <Plus className="w-6 h-6 rotate-45" />
        </button>
      </div>
      
      <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar pr-4 z-10 pb-10">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Local AI Engine</h3>
          <div className="p-5 glass-bright rounded-3xl border border-white/5 space-y-4 hover:border-purple-500/30 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-purple-400" /> Inference Model</span>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20 shadow-inner">gemma3:4b</span>
            </div>
            <div className="w-full h-[1px] bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Embedding Model</span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 shadow-inner">nomic-embed-text</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Sentient Vault (Vector DB)</h3>
          <div className="p-5 glass-bright rounded-3xl border border-white/5 flex flex-col gap-5 hover:border-indigo-500/30 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white flex items-center gap-2"><FolderOpen className="w-4 h-4 text-indigo-400" /> Indexed Nodes</span>
              <span className="text-[11px] font-bold text-slate-200 bg-white/5 px-3 py-1 rounded-lg border border-white/10">{vaultNodesCount} Files</span>
            </div>
            <button className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              Purge All Vector Data
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hardware Telemetry Node</h3>
          <div className="p-5 glass-bright rounded-3xl border border-white/5 space-y-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white flex items-center gap-2"><PulseIcon className="w-4 h-4 text-cyan-400" /> Polling Rate</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1.5 rounded-lg border border-cyan-500/20">2000ms</span>
            </div>
            <div className="w-full h-[1px] bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white flex items-center gap-2"><Shield className="w-4 h-4 text-slate-400" /> Background Process</span>
              <div className="w-10 h-5 bg-cyan-500/20 border border-cyan-500/30 rounded-full relative shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <div className="absolute right-1 top-0.5 w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">System Boot Sequence</h3>
          <div className="p-5 glass-bright rounded-3xl border border-white/5 space-y-3 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-white">Initialize Oasis on Windows Startup</span>
              <button 
                onClick={async () => {
                  try {
                    if (autostart) { await disable(); setAutostart(false); }
                    else { await enable(); setAutostart(true); }
                  } catch(e) { console.error("Autostart Error:", e); }
                }}
                className={cn("w-12 h-6 rounded-full relative transition-all duration-300", autostart ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-white/10 border border-white/5")}
              >
                <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md duration-300", autostart ? "left-7" : "left-1")} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
