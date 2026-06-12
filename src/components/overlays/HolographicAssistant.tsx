import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bird, Activity, Zap } from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface Message {
  role: string;
  content: string;
}

interface HolographicAssistantProps {
  showAI: boolean;
  setShowAI: (val: boolean) => void;
  messages: Message[];
  isThinking: boolean;
  assistantInput: string;
  setAssistantInput: (val: string) => void;
  handleNeuralSend: () => void;
}

export const HolographicAssistant: React.FC<HolographicAssistantProps> = ({
  showAI,
  setShowAI,
  messages,
  isThinking,
  assistantInput,
  setAssistantInput,
  handleNeuralSend
}) => {
  return (
    <div className="fixed bottom-10 right-10 flex flex-col items-end gap-6 z-[600]">
      <AnimatePresence>
        {showAI && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50, filter: "blur(10px)" }} 
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} 
            exit={{ opacity: 0, scale: 0.9, y: 50, filter: "blur(10px)" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }} 
            className="w-96 h-[550px] glass-bright rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(99,102,241,0.2)] overflow-hidden flex flex-col mb-4 backdrop-blur-3xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Bird className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Sentient Link Stable</span>
              </div>
              <div className="flex gap-1.5 p-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </header>
            <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar relative z-10">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={i} 
                  className={cn("max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg", m.role === 'user' ? "ml-auto bg-indigo-600/90 text-white border border-indigo-500/30 rounded-tr-sm" : "mr-auto glass-bright text-indigo-100 border border-white/10 rounded-tl-sm")}
                >
                  {m.content}
                </motion.div>
              ))}
              {isThinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 glass rounded-2xl w-fit flex items-center gap-2 border border-white/5 rounded-tl-sm text-indigo-300">
                  <Activity className="w-3 h-3 animate-spin" /> <span className="text-[10px] font-bold uppercase tracking-widest">Synthesizing...</span>
                </motion.div>
              )}
            </div>
            <div className="p-6 bg-gradient-to-b from-transparent to-black/60 relative z-10">
              <div className="flex items-center bg-black/40 rounded-2xl px-5 py-4 border border-indigo-500/30 shadow-inner group transition-all hover:border-indigo-400/50">
                <input 
                  value={assistantInput} 
                  onChange={(e) => setAssistantInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleNeuralSend()} 
                  placeholder="Pulse Brain..." 
                  className="bg-transparent border-none outline-none text-sm w-full font-medium text-white placeholder:text-indigo-200/40" 
                />
                <button onClick={handleNeuralSend} className="text-indigo-400 hover:text-indigo-200 hover:scale-110 transition-all bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                  <Zap size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setShowAI(!showAI)} 
        className={cn("w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 transition-all border border-indigo-400/30", showAI ? "bg-indigo-600" : "bg-gradient-to-br from-indigo-500 to-purple-600")}
      >
        <Bird className={cn("w-9 h-9", showAI ? "animate-pulse" : "")} />
      </button>
    </div>
  );
};
