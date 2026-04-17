import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, BarChart3, Search, Play, Filter, LayoutGrid, Plus, BrainCircuit, Activity } from 'lucide-react';
import { VenturePulseCard } from './VenturePulseCard';
import { invokeSafe } from '../../lib/tauri';
import { cn } from '../../lib/utils';

interface AegisNexusProps {
  onLaunch: (id: number) => void;
  onClose: () => void;
}

export const AegisNexus: React.FC<AegisNexusProps> = ({ onLaunch, onClose }) => {
  const [ventures, setVentures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const loadNexus = async () => {
    try {
      const pulse = await invokeSafe('get_nexus_pulse') as any[];
      setVentures(pulse);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNexus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] bg-slate-950/40 backdrop-blur-[50px] flex flex-col p-12 overflow-hidden"
    >
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[150px] rounded-full" />

      {/* Header HUD */}
      <header className="flex items-center justify-between mb-16 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 glass rounded-[2rem] border border-indigo-500/40 flex items-center justify-center shadow-2xl">
            <ShieldCheck className="w-9 h-9 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Aegis Nexus</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Portfolio Pulse Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setAnalysisOpen(!analysisOpen)}
            className="px-6 py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-all flex items-center gap-3 border border-indigo-500/20"
          >
            <BrainCircuit size={16} /> Cross-Venture Analysis
          </button>
          <button 
            onClick={onClose}
            className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/10"
          >
            <Play size={20} className="rotate-180" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex gap-12 overflow-hidden relative z-10">
        {/* Main Grid */}
        <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar pb-12">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Activity size={48} className="text-white animate-spin mb-4" />
                <span className="text-xs uppercase font-black tracking-widest text-white">Synchronizing Portfolio...</span>
             </div>
          ) : ventures.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] px-24 text-center grayscale opacity-40">
                <LayoutGrid size={64} className="text-slate-500 mb-8" />
                <h3 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">Nexus Core Offline</h3>
                <p className="max-w-md text-slate-400 text-sm leading-relaxed">No strategic ventures detected in the neural archive. Create a Context Crate to begin orchestrating your portfolio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
              {ventures.map((v) => (
                <VenturePulseCard 
                  key={v.id}
                  {...v}
                  onLaunch={onLaunch}
                />
              ))}
            </div>
          )}
        </div>

        {/* AI Insight Sidebar */}
        <AnimatePresence>
          {analysisOpen && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="w-96 glass-bright rounded-[3rem] border border-white/10 p-8 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 text-indigo-400">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight">Nexus Forensics</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cross-Context Reasoning</span>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h5 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Synergy Detection</h5>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "Detected high overlap between project 'Lumina' and project 'Aegis'. Synthesis suggests merging automation logic to reduce cognitive load."
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3">Economic Forecasting</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Portfolio burn is concentrated in your legacy crates. Re-distributing server assets from 'Nexus-01' to 'Production-A' could extend global runway by 2.4 months.
                  </p>
                </div>
              </div>

              <button className="mt-8 w-full py-4 bg-indigo-500 text-white text-[10px] font-black rounded-2xl hover:bg-indigo-400 transition-all uppercase tracking-[0.2em]">
                Rethink Portfolio Strategy
              </button>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
