import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, History, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Snapshot {
  timestamp: string;
  integrity: number;
}

interface TemporalExplorerProps {
  history: Snapshot[];
  currentIndex: number;
  onSelect: (index: number) => void;
  active: boolean;
}

export const TemporalExplorer: React.FC<TemporalExplorerProps> = ({
  history,
  currentIndex,
  onSelect,
  active,
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Filter to avoid crowding, or just show last 50
  const snapshots = history.slice(0, 50).reverse();

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-32 z-[100] group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Visual Trigger Bar */}
      <div className={cn(
        "absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-indigo-500/20 rounded-t-full transition-all duration-500",
        isHovering ? "opacity-0 scale-x-150" : "opacity-100"
      )} />

      <AnimatePresence>
        {(isHovering || active) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute inset-x-0 bottom-0 p-8 glass-bright border-t border-indigo-500/30 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-8">
              <div className="flex flex-col gap-1 min-w-[120px]">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} /> Temporal Buffer
                </div>
                <div className="text-[8px] text-slate-500 font-bold uppercase">{snapshots.length} Snapshots Etched</div>
              </div>

              {/* The Timeline Axis */}
              <div className="flex-1 flex items-center gap-4 overflow-x-auto custom-scrollbar py-4 px-2">
                {snapshots.map((snap, i) => {
                  const actualIndex = history.length - 1 - i;
                  const isActive = currentIndex === actualIndex;
                  const date = new Date(snap.timestamp);
                  
                  return (
                    <motion.button
                      key={snap.timestamp}
                      whileHover={{ y: -5, scale: 1.1 }}
                      onClick={() => onSelect(actualIndex)}
                      className="flex flex-col items-center gap-3 group relative"
                    >
                      {/* Vertical Projection Line */}
                      <div className={cn(
                        "w-0.5 h-4 transition-all duration-300",
                        isActive ? "bg-indigo-400 h-6" : "bg-slate-700 h-3 group-hover:bg-slate-500"
                      )} />
                      
                      {/* Snapshot Sigil */}
                      <div className={cn(
                        "w-3 h-3 rounded-full border-2 transition-all duration-500",
                        isActive 
                        ? "bg-indigo-500 border-white shadow-[0_0_15px_rgba(99,102,241,0.8)] scale-125" 
                        : "bg-black border-slate-700 group-hover:border-indigo-500/50"
                      )} />

                      {/* Tooltip-like Timestamp */}
                      <div className={cn(
                        "absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                        isActive && "opacity-100"
                      )}>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          {date.getHours()}:{date.getMinutes().toString().padStart(2, '0')}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Present Day Jump */}
              <button 
                onClick={() => onSelect(-1)}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex items-center gap-3",
                  currentIndex === -1 
                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" 
                  : "bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/30"
                )}
              >
                <History size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Jump to Present</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
