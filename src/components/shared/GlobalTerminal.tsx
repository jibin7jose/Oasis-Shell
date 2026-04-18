import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Zap, Cpu, Shield, Activity, X } from 'lucide-react';
import { useSystemStore } from '../../lib/systemStore';
import { invokeSafe } from '../../lib/tauri';
import { dispatchTerminalActions } from '../../lib/terminalDispatcher';
import { NeuralRipple } from '../ui/NeuralRipple';

export const GlobalTerminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isManifesting, setIsManifesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { setNotification } = useSystemStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setLogs(["[SYSTEM] Kernel Semantic Interface Active.", "[SYSTEM] Awaiting Founder Directive..."]);
    } else {
      setQuery("");
      setIsManifesting(false);
    }
  }, [isOpen]);

  const handleManifest = async () => {
    if (!query.trim() || isManifesting) return;

    setIsManifesting(true);
    setLogs(prev => [...prev, `> ${query}`, "[NEURAL] Synthesizing Intent..."]);

    try {
      const actions = await invokeSafe("synthesize_founder_directive", { query }) as any[];
      setLogs(prev => [...prev, `[KERNEL] Manifested ${actions.length} Strategic Actions.`]);
      
      await dispatchTerminalActions(actions);
      
      setLogs(prev => [...prev, "[SYSTEM] Manifestation Sequence Complete."]);
      setTimeout(() => setIsOpen(false), 1500);
    } catch (err: any) {
      setLogs(prev => [...prev, `[ERROR] ${err.toString()}`]);
    } finally {
      setIsManifesting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center p-12 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <NeuralRipple />
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="max-w-4xl w-full flex flex-col gap-12 relative"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Terminal className="text-indigo-400 w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Global Founder Terminal</h2>
                   <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.4em] mt-1">Direct Neural-to-Kernel Manifestation</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-slate-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Input Field */}
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-[2.5rem] opacity-20 blur group-focus-within:opacity-40 transition-all duration-1000" />
               <input 
                 ref={inputRef}
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleManifest()}
                 placeholder="Enter Strategic Directive..."
                 className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-[2rem] py-10 px-12 text-2xl font-black text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/50 transition-all relative z-10 tracking-tight"
               />
               <button 
                 onClick={handleManifest}
                 disabled={isManifesting || !query.trim()}
                 className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-700 text-white rounded-2xl transition-all z-20 shadow-xl shadow-indigo-600/20"
               >
                 {isManifesting ? <Activity className="w-6 h-6 animate-pulse" /> : <Send className="w-6 h-6" />}
               </button>
            </div>

            {/* Manifestation Logs */}
            <div className="h-48 bg-black/40 border border-white/5 rounded-3xl p-8 font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
               {logs.map((log, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -5 }} 
                   animate={{ opacity: 1, x: 0 }}
                   className={log.startsWith('[ERROR]') ? 'text-rose-400' : log.startsWith('[SYSTEM]') ? 'text-emerald-500/60' : log.startsWith('[NEURAL]') ? 'text-amber-400' : 'text-slate-500'}
                 >
                   {log}
                 </motion.div>
               ))}
               {isManifesting && (
                 <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="text-indigo-400">
                    _
                 </motion.div>
               )}
            </div>

            {/* Action Matrix Status */}
            <div className="flex items-center gap-10 opacity-30">
               <div className="flex items-center gap-2">
                  <Shield size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Vault Link Active</span>
               </div>
               <div className="flex items-center gap-2">
                  <Zap size={12} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Neural Bridge Ready</span>
               </div>
               <div className="flex items-center gap-2">
                  <Cpu size={12} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Kernel V1.4_STABLE</span>
               </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
