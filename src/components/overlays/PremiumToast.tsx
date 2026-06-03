import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ToastData {
  title: string;
  body: string; id: number;
}

interface PremiumToastProps {
  toast: ToastData | null;
  setToast: (toast: ToastData | null) => void;
}

export const PremiumToast: React.FC<PremiumToastProps> = ({ toast, setToast }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-10 right-10 z-[2000] w-96 glass-bright rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.2)] overflow-hidden group"
        >
          {/* Ambient Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none" />
          
          <div className="p-5 flex items-start gap-4 relative z-10">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl text-indigo-400 border border-indigo-500/30 shadow-inner">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 pt-0.5">
              <h4 className="text-white font-bold tracking-widest text-xs uppercase">{toast.title}</h4>
              <p className="text-slate-300 text-sm mt-1.5 leading-relaxed font-medium">{toast.body}</p>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="text-slate-400 hover:text-white transition-all p-1.5 bg-white/5 hover:bg-white/20 rounded-lg border border-transparent hover:border-white/10"
            >
               <span className="text-xs font-bold px-1">✕</span>
            </button>
          </div>
          
          {/* Animated Countdown Progress Bar */}
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
