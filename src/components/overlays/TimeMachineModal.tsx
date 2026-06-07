import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Image as ImageIcon, Search, FolderOpen } from 'lucide-react';

interface Memory {
  id: number;
  timestamp: string;
  description: string;
  image_base64: string;
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/80 backdrop-blur-3xl"
        >
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-7xl h-[90vh] glass rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.15)] flex flex-col relative z-10 bg-[#020617]/90"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-indigo-900/10 backdrop-blur-sm z-20">
              <div className="flex items-center gap-6">
                <motion.div 
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-12 h-12 flex items-center justify-center bg-purple-500/10 rounded-2xl text-purple-400 shadow-inner shadow-white/5 border border-white/10"
                >
                  <Clock className="w-6 h-6" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    Photographic Rewind
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black tracking-widest uppercase border border-purple-500/30 animate-pulse">Live</span>
                  </h2>
                </div>
              </div>
              <button onClick={onClose} className="group flex items-center gap-2 text-slate-400 hover:text-white px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest text-xs font-bold border border-white/5 hover:border-white/10">
                <span>Close Window</span>
                <span className="opacity-50 group-hover:opacity-100">[ESC]</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar z-10 flex flex-col items-center">
              {memories.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center text-slate-500"
                >
                  <ImageIcon className="w-24 h-24 mb-6 opacity-20" />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">No Memories Recorded</h3>
                  <p className="text-sm opacity-60 max-w-sm text-center">The Sentient OS is running, but no visual snapshots have been captured to the database yet. Wait 60 seconds.</p>
                </motion.div>
              ) : (
                <div className="w-full max-w-5xl flex flex-col gap-16 pb-20">
                  {memories.map((mem, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, type: "spring" }}
                      key={mem.id} 
                      className="relative w-full flex flex-col gap-6"
                    >
                      <div className="flex items-center gap-4 w-full justify-center">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-purple-500/30" />
                        <span className="text-white font-black tracking-widest text-sm bg-purple-600/20 px-6 py-2 rounded-full border border-purple-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                          {new Date(mem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-purple-500/30" />
                      </div>
                      
                      <div className="w-full relative group">
                        <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-500/50 to-indigo-500/50 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-purple-500/50 transition-colors duration-500 shadow-2xl bg-black">
                           <img 
                             src={`data:image/png;base64,${mem.image_base64}`} 
                             alt="Desktop Snapshot" 
                             className="w-full h-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                           />
                           <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                             <div className="flex items-center gap-3 mb-2">
                               <Search className="w-4 h-4 text-purple-400" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">LLaVA AI Context Analysis</span>
                             </div>
                             <p className="text-white text-base leading-relaxed font-medium drop-shadow-lg">
                               {mem.description}
                             </p>
                           </div>
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
