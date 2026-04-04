import { motion } from 'framer-motion';
import { Activity, Shield, Hash, Clock, Cpu } from 'lucide-react';
import { cn } from "../../lib/utils";

interface NeuralEntry {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface CortexLogProps {
  logs: NeuralEntry[];
  onRefresh: () => void;
}

export default function CortexLog({ logs, onRefresh }: CortexLogProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'GOLEM_MANIFEST': return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'GOLEM_RETIRAL': return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'CONTEXT_PIN': return <Hash className="w-4 h-4 text-amber-400" />;
      case 'AUTHORITY_SHOCK': return <Shield className="w-4 h-4 text-rose-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getAuraClass = (type: string) => {
    switch (type) {
      case 'GOLEM_MANIFEST': return "bg-emerald-500/10 border-emerald-500/30";
      case 'GOLEM_RETIRAL': return "bg-indigo-500/10 border-indigo-500/30";
      case 'CONTEXT_PIN': return "bg-amber-500/10 border-amber-500/30";
      case 'AUTHORITY_SHOCK': return "bg-rose-500/10 border-rose-500/30";
      default: return "bg-slate-500/10 border-slate-500/30";
    }
  };

  return (
    <div className="w-full max-w-4xl glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden h-[70vh] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase">Neural Continuity Ledger</h2>
            <p className="text-[10px] font-mono text-slate-500">Historical System Intent & Event Pulse</p>
          </div>
        </div>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Sync Timeline
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20">
            <Activity className="w-16 h-16 mb-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">No neural footprints detected</span>
          </div>
        )}
        
        {logs.map((entry, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={entry.id} 
            className="relative pl-8 border-l border-white/10 last:border-0 pb-6"
          >
            <div className={cn(
              "absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full border flex items-center justify-center shadow-lg",
              getAuraClass(entry.type)
            )}>
              {getIcon(entry.type)}
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entry.type}</span>
                <span className="text-[9px] font-mono text-slate-600">ID://{entry.id.toString().padStart(4, '0')}</span>
              </div>
              <p className="text-sm font-semibold text-white/90">{entry.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-600" />
                <span className="text-[9px] font-mono text-slate-500">
                  {new Date(entry.timestamp).toLocaleDateString()} · {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500 opacity-5 blur-[150px] pointer-events-none" />
    </div>
  );
}
