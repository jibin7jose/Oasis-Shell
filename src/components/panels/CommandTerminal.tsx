import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Eye, Plus, BrainCircuit, Activity } from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface Message {
  role: string;
  content: string;
}

interface CommandTerminalProps {
  show: boolean;
  onClose: () => void;
  analyzeScreen: () => void;
  isThinking: boolean;
  messages: Message[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  resolveNeuralIntent: (query: string) => void;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  show,
  onClose,
  analyzeScreen,
  isThinking,
  messages,
  searchQuery,
  setSearchQuery,
  resolveNeuralIntent
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: "-100%", opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: "-100%", opacity: 0 }} 
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 right-0 h-[65vh] z-[300] bg-black/80 backdrop-blur-3xl border-b border-indigo-500/30 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.6),0_10px_30px_rgba(99,102,241,0.2)] overflow-hidden"
        >
          {/* Terminal Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Terminal Header */}
          <div className="flex items-center justify-between px-10 py-5 border-b border-white/10 bg-gradient-to-r from-black/60 via-indigo-950/20 to-black/60 relative z-10 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <Terminal className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Foundry Command Center
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Kernel v0.1.0-alpha   Secure Neural Link</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={analyzeScreen} 
                disabled={isThinking} 
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 rounded-xl border border-indigo-500/20 disabled:opacity-40 transition-all text-xs font-bold uppercase tracking-widest group shadow-[0_0_15px_rgba(99,102,241,0.1)]"
              >
                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> Trigger Vision Scan
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
                <Plus className="w-6 h-6 rotate-45 opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-6 relative z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:100px_100px] opacity-90 mix-blend-overlay flex flex-col">
            <div className="flex-1 flex flex-col justify-end space-y-6">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={cn("flex flex-col max-w-4xl", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", msg.role === 'user' ? "text-indigo-400" : "text-purple-400")}>
                      {msg.role === 'user' ? 'Operator Directive' : 'Oasis Kernel Synthesized'}
                    </span>
                    {msg.role !== 'user' && <BrainCircuit className="w-3 h-3 text-purple-400" />}
                  </div>
                  <div className={cn(
                    "p-5 rounded-3xl text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-lg relative overflow-hidden group",
                    msg.role === 'user' 
                      ? "bg-indigo-600/90 text-indigo-50 border border-indigo-400/30 rounded-tr-sm shadow-indigo-600/20" 
                      : "bg-black/40 text-purple-100 border border-purple-500/20 rounded-tl-sm backdrop-blur-md",
                    msg.content.includes("Analyze my screen") && "border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-cyan-900/40"
                  )}>
                    {msg.role !== 'user' && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-indigo-500 opacity-50" />}
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {isThinking && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col max-w-4xl mr-auto items-start">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    Oasis Kernel Processing <Activity className="w-3 h-3 animate-spin" />
                  </span>
                  <div className="flex items-center gap-2 p-5 bg-black/40 rounded-3xl rounded-tl-sm border border-purple-500/20 backdrop-blur-md">
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ animationDelay: '0.3s' }} />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Terminal Input */}
          <div className="p-8 bg-gradient-to-b from-transparent to-black/80 border-t border-indigo-500/20 relative z-20 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex items-center bg-black/60 border border-indigo-500/30 rounded-xl overflow-hidden shadow-2xl">
                <span className="absolute left-6 text-indigo-400 font-mono font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> <span className="animate-pulse">?</span>
                </span>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      resolveNeuralIntent(searchQuery);
                    }
                  }}
                  placeholder="Enter neural directive or execute system command..."
                  className="w-full bg-transparent py-5 pl-16 pr-8 text-indigo-50 font-mono text-sm outline-none transition-all placeholder:text-indigo-400/40"
                />
                <kbd className="absolute right-6 hidden md:flex bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-[9px] font-bold text-indigo-300 uppercase tracking-widest shadow-inner">Enter</kbd>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
