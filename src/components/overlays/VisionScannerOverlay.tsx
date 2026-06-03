import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Activity } from 'lucide-react';

interface VisionScannerOverlayProps {
  isScanning: boolean;
}

export const VisionScannerOverlay: React.FC<VisionScannerOverlayProps> = ({ isScanning }) => {
  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] pointer-events-none flex flex-col items-center justify-center overflow-hidden"
        >
          {/* The scanning laser line */}
          <motion.div 
            initial={{ y: "-50vh" }}
            animate={{ y: "50vh" }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_30px_10px_rgba(34,211,238,0.5)] z-[3001]"
          />
          {/* Scan Overlay background */}
          <div className="absolute inset-0 bg-cyan-900/10 backdrop-blur-[2px] mix-blend-overlay" />
          
          {/* Scanner HUD target */}
          <div className="relative z-[3002] border border-cyan-500/50 rounded-3xl p-12 bg-black/40 backdrop-blur-md flex flex-col items-center">
             <Eye className="w-16 h-16 text-cyan-400 mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
             <h3 className="text-2xl font-bold text-white tracking-widest uppercase shadow-black drop-shadow-md">Omniscient Vision</h3>
             <p className="text-cyan-300 font-mono text-sm mt-2 flex items-center gap-2">
               <Activity className="w-4 h-4 animate-spin" /> Analyzing Pixel Matrix...
             </p>
             
             {/* Corner brackets */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
             <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
