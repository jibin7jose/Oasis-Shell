import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Activity, Brain } from 'lucide-react';
import { cn } from "../../lib/utils";

interface ZenithHUDProps {
  cpuLoad: number;
  integrity: number;
  burn: number;
  activeVenture: string;
  onExit: () => void;
}

export default function ZenithHUD({ cpuLoad, integrity, burn, activeVenture, onExit }: ZenithHUDProps) {
  // Pulse intensity based on CPU
  const pulseScale = 1 + (cpuLoad / 200);
  const pulseDuration = Math.max(1, 3 - (cpuLoad / 50));

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center pointer-events-none">
      {/* The Neural Shroud */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-[30px]"
      />

      {/* The Zenith Pulse */}
      <div className="relative flex items-center justify-center pointer-events-auto cursor-pointer" onClick={onExit}>
        <motion.div 
           animate={{ 
             scale: [1, pulseScale, 1],
             opacity: [0.1, 0.3, 0.1]
           }}
           transition={{ 
             duration: pulseDuration,
             repeat: Infinity,
             ease: "easeInOut"
           }}
           className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500 blur-[100px]"
        />
        
        <div className="relative flex flex-col items-center">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-32 h-32 rounded-full glass border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden"
           >
              <Brain className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
           </motion.div>
           
           <motion.h2 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="mt-6 text-2xl font-black text-white uppercase tracking-[0.5em] ml-[0.5em]"
           >
             {activeVenture}
           </motion.h2>
           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">ZENITH PULSE ACTIVE</span>
        </div>
      </div>

      {/* Floating Executive Cards */}
      <div className="absolute bottom-16 left-16 flex gap-8 pointer-events-auto">
         <motion.div 
           initial={{ x: -50, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className="glass p-6 rounded-[2rem] border border-white/5 flex items-center gap-4"
         >
            <Shield className={cn("w-6 h-6", integrity < 80 ? "text-amber-500" : "text-emerald-500")} />
            <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Integrity</span>
               <span className="text-lg font-black text-white">{integrity}%</span>
            </div>
         </motion.div>

         <motion.div 
           initial={{ x: -30, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="glass p-6 rounded-[2rem] border border-white/5 flex items-center gap-4"
         >
            <Zap className="w-6 h-6 text-amber-400" />
            <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Fiscal Burn</span>
               <span className="text-lg font-black text-white">${burn.toFixed(2)}</span>
            </div>
         </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]"
      >
        Neural Integrity Nominal · Deep Work Shroud Active
      </motion.div>
    </div>
  );
}
