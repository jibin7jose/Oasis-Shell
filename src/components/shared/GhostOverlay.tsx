import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../../lib/systemStore';
import { Ghost, Activity } from 'lucide-react';

export const GhostOverlay: React.FC = () => {
  const { isTimeTraveling, chronosHistory, travelIndex } = useSystemStore();

  if (!isTimeTraveling || travelIndex < 0 || !chronosHistory[travelIndex]) return null;

  const snapshot = chronosHistory[travelIndex];
  const windows = snapshot.windows || [];

  return (
    <div className="fixed inset-0 z-[6000] pointer-events-none overflow-hidden">
      {/* Spectral Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-indigo-950/20 backdrop-blur-[2px]"
      />

      <AnimatePresence mode="popLayout">
        {windows.map((win: any, i: number) => {
          // Normalize coordinates if necessary (assuming current viewport is the same as snapshot)
          return (
            <motion.div
              key={`${win.title}-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 0.6, 
                scale: 1,
                left: win.x,
                top: win.y,
                width: win.width,
                height: win.height 
              }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute border border-indigo-400/40 bg-indigo-500/5 rounded-2xl flex flex-col items-center justify-center gap-3 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl" />
              
              <Ghost className="w-8 h-8 text-indigo-400/50" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-indigo-200/60 uppercase tracking-widest text-center px-4 truncate max-w-full">
                  {win.title}
                </span>
                <div className="flex items-center gap-1.5 opacity-40">
                  <Activity size={10} className="text-indigo-400" />
                  <span className="text-[8px] font-mono text-indigo-300">
                    {win.width}x{win.height} @ [{win.x},{win.y}]
                  </span>
                </div>
              </div>

              {/* Scanline Effect */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden rounded-2xl">
                 <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Temporal Metadata Overlay */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 px-8 py-4 glass-bright rounded-2xl border border-indigo-500/30 flex items-center gap-6 shadow-2xl pointer-events-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Temporal Rejuvenation Active</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest">
          Snapshot Vector: {new Date(snapshot.timestamp).toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
};
