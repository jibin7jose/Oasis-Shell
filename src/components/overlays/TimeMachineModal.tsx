import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Image as ImageIcon, Search, FolderOpen } from 'lucide-react';

interface Memory {
  id: number;
  timestamp: string;
  description: string;
}

interface TimeMachineModalProps {
  show: boolean;
  onClose: () => void;
  memories: Memory[];
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({ show, onClose, memories }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/60 backdrop-blur-2xl"
        >
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-6xl h-[85vh] glass rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)] flex flex-col relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-indigo-900/10 backdrop-blur-sm">
              <div className="flex items-center gap-6">
                <motion.div 
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 flex items-center justify-center bg-purple-500/10 rounded-2xl text-purple-400 shadow-inner shadow-white/5 border border-white/10"
                >
                  <Clock className="w-8 h-8" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    Photographic Memory
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs tracking-widest uppercase border border-purple-500/30">Live Sync</span>
                  </h2>
                  <p className="text-slate-400 text-sm mt-1.5 font-medium">Autonomous cognitive snapshots of your digital workflow over time.</p>
                </div>
              </div>
              <button onClick={onClose} className="group flex items-center gap-2 text-slate-400 hover:text-white px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest text-xs font-bold border border-white/5 hover:border-white/10">
                <span>Close</span>
                <span className="opacity-50 group-hover:opacity-100">[ESC]</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar z-10">
              {memories.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-slate-500"
                >
                  <div className="relative">
                    <ImageIcon className="w-24 h-24 mb-6 opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No Memories Recorded</h3>
                  <p className="text-sm opacity-60 max-w-sm text-center">The Sentient OS hasn't captured any visual context snapshots yet. Let it run in the background to build your timeline.</p>
                </motion.div>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-8 pl-10 flex flex-col gap-12 pb-20">
                  {memories.map((mem, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4, type: "spring" }}
                      key={mem.id} 
                      className="relative group"
                    >
                      {/* Interactive Timeline Node */}
                      <div className="absolute -left-[49px] top-2 w-4 h-4 rounded-full bg-[#020617] border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-150 group-hover:border-white transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] z-20" />
                      
                      {/* Timeline connecting line glow on hover */}
                      <div className="absolute -left-[42px] top-6 bottom-[-48px] w-0.5 bg-gradient-to-b from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-white font-bold tracking-widest text-sm bg-purple-600/40 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/50 backdrop-blur-md">
                          {mem.timestamp}
                        </span>
                        <span className="text-slate-400 text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 bg-white/5 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Visual Context
                        </span>
                      </div>
                      
                      <div className="glass p-8 rounded-3xl border border-white/5 group-hover:border-purple-500/40 group-hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden shadow-lg hover:shadow-purple-900/20">
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                         
                         <p className="text-slate-300 leading-relaxed font-normal text-sm whitespace-pre-wrap relative z-10">
                          {mem.description}
                         </p>
                         
                         <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 relative z-10">
                           <button className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold tracking-widest uppercase text-purple-300 transition-all flex items-center gap-2 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                             <Search className="w-4 h-4" /> Deep Dive
                           </button>
                           <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold tracking-widest uppercase text-slate-300 transition-all flex items-center gap-2 border border-white/5 hover:border-white/10">
                             <FolderOpen className="w-4 h-4" /> Restore Workspace
                           </button>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
