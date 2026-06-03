import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Terminal, Shield, Eye } from 'lucide-react';

interface CommandPaletteProps {
  show: boolean;
  setShow: (val: boolean) => void;
  commandInput: string;
  setCommandInput: (val: string) => void;
  resolveNeuralIntent: (query: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  show,
  setShow,
  commandInput,
  setCommandInput,
  resolveNeuralIntent
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl glass-bright rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden border border-white/10 flex flex-col relative"
          >
            {/* Background ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
            
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 relative z-10 bg-black/20">
              <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              <input
                autoFocus
                type="text"
                placeholder="Ask Oasis or launch a command (e.g. 'Launch vscode crate')..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commandInput.trim()) {
                    resolveNeuralIntent(commandInput);
                    setCommandInput("");
                    setShow(false);
                  }
                  if (e.key === 'Escape') {
                    setShow(false);
                  }
                }}
                className="w-full bg-transparent border-none outline-none text-white text-xl font-light placeholder:text-slate-500/70"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 uppercase shadow-inner">Enter</kbd>
                <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 uppercase shadow-inner">Esc</kbd>
              </div>
            </div>
            
            {/* Command Palette Suggestions */}
            <div className="p-4 bg-black/40 backdrop-blur-md relative z-10 flex flex-col gap-1">
               <div className="px-4 py-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Suggested Directives</div>
               {[
                 { icon: Terminal, label: 'Review code and push to origin', type: 'Git Automation' },
                 { icon: Shield, label: 'Access Technical Vault Nodes', type: 'Foundry Protocol' },
                 { icon: Eye, label: 'Trigger Omniscient Vision Scan', type: 'System Capability' }
               ].map((suggestion, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => {
                      resolveNeuralIntent(suggestion.label);
                      setCommandInput("");
                      setShow(false);
                   }}
                   className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-indigo-500/20 group transition-all text-left border border-transparent hover:border-indigo-500/30"
                 >
                   <div className="flex items-center gap-4">
                     <div className="p-2 bg-white/5 group-hover:bg-indigo-500/30 rounded-lg border border-white/5 group-hover:border-indigo-400/50 transition-colors">
                       <suggestion.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 transition-colors" />
                     </div>
                     <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{suggestion.label}</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{suggestion.type}</span>
                 </button>
               ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
