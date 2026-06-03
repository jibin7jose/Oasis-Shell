import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";

interface GuardianAlert {
  suggestion: string;
  action: string;
}

interface GuardianHUDProps {
  proactiveAlert: GuardianAlert | null;
  setProactiveAlert: (alert: GuardianAlert | null) => void;
  logEvent: (msg: string, type: any) => void;
}

export const GuardianHUD: React.FC<GuardianHUDProps> = ({
  proactiveAlert,
  setProactiveAlert,
  logEvent
}) => {
  return (
    <AnimatePresence>
      {proactiveAlert && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed bottom-32 right-10 w-96 bg-[#0B0F19]/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-5 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] z-[700] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="flex gap-4 relative">
            <div className="p-3 bg-indigo-500/20 rounded-2xl shrink-0 h-fit border border-indigo-400/20">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Guardian Protocol</h4>
              <p className="text-sm text-indigo-200/80 leading-relaxed mb-4">
                {proactiveAlert.suggestion}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    invoke("execute_neural_command", { command: `echo Authorizing action: ${proactiveAlert.action}`});
                    logEvent(`Guardian Executed: ${proactiveAlert.action}`, 'deploy');
                    setProactiveAlert(null);
                  }}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  Authorize
                </button>
                <button 
                  onClick={() => setProactiveAlert(null)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
