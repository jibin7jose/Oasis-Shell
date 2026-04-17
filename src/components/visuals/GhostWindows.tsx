import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GhostWindow {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GhostWindowsProps {
  active: boolean;
  windows: GhostWindow[];
}

export const GhostWindows: React.FC<GhostWindowsProps> = ({ active, windows }) => {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Dashboard Dimmer: Strategic Contrast */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[40] pointer-events-none"
          />

          {/* Projection Layer */}
          <div className="fixed inset-0 z-[50] pointer-events-none">
            {windows.map((win, index) => (
              <motion.div
                key={`${win.title}-${index}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute border border-indigo-500/30 bg-indigo-500/5 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.1)] overflow-hidden"
                style={{
                  left: win.x,
                  top: win.y,
                  width: win.width,
                  height: win.height,
                }}
              >
                <div className="absolute top-0 left-0 right-0 p-3 bg-indigo-500/10 border-b border-indigo-500/20 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest truncate block">
                    {win.title}
                  </span>
                </div>
                
                {/* Circuit Grid Decoration */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "20px 20px" }} 
                />
              </motion.div>
            ))}
          </div>

          {/* Temporal Status Tag */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-[60] px-6 py-2 glass-bright border-indigo-500/30 rounded-full"
          >
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Temporal Projection Active</span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
