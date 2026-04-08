import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';

interface BootSequenceProps {
  onSuccess: () => void;
}

export default function BootSequence({ onSuccess }: BootSequenceProps) {
  const [stage, setStage] = useState<'audit' | 'handshake' | 'breach'>('audit');
  const [logs, setLogs] = useState<string[]>([]);
  const [key, setKey] = useState('');
  const [isError, setIsError] = useState(false);

  const rawLogs = [
    "INITIALIZING OASIS KERNEL V4.0.1...",
    "AUDITING SPECTRAL INTEGRITY...",
    "MOUNTING SENTINEL VAULT (READ-ONLY)...",
    "ESTABLISHING NEURAL CORTEX BRIDGE...",
    "CHECKING VIRTUAL MACHINE DETECTOR... NONE FOUND.",
    "SYNCING PHYSICAL AURA... [OK]",
    "READY FOR NEURAL HANDSHAKE."
  ];

  useEffect(() => {
    if (stage === 'audit') {
      let i = 0;
      const interval = setInterval(() => {
        if (i < rawLogs.length) {
          setLogs(prev => [...prev, rawLogs[i]]);
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => setStage('handshake'), 1000);
        }
      }, 400);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const handleHandshake = () => {
    // For now, simulate successful handshake if key is not empty
    if (key.length > 3) {
      setStage('breach');
      setTimeout(onSuccess, 1500);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-10 overflow-hidden font-mono">
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        {stage === 'audit' && (
          <motion.div 
            key="audit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xl space-y-2"
          >
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-indigo-500 text-[10px] font-black tracking-widest flex items-center gap-3 uppercase"
              >
                <div className="w-1 h-3 bg-indigo-500/40" />
                {log}
              </motion.div>
            ))}
          </motion.div>
        )}

        {stage === 'handshake' && (
          <motion.div 
            key="handshake"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md flex flex-col items-center text-center gap-10"
          >
            <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/30 animate-pulse relative group">
              <Lock className="w-12 h-12 text-indigo-400 group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full -z-10" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Handshake</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-bold">Awaiting Encrypted Signature</p>
            </div>

            <div className="w-full relative group">
              <input 
                type="password"
                placeholder="ENTER NEURAL KEY"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHandshake()}
                className={`w-full bg-white/5 border-2 ${isError ? 'border-rose-500/40 text-rose-400' : 'border-indigo-500/20 text-indigo-400'} rounded-2xl px-8 py-6 text-center text-sm font-black uppercase tracking-[0.5em] focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-800`}
              />
              <motion.div 
                animate={{ width: isError ? '100%' : '0%' }}
                className="absolute bottom-0 left-0 h-1 bg-rose-500 rounded-full"
              />
            </div>

            <button 
              onClick={handleHandshake}
              className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              BREACH KERNEL →
            </button>
          </motion.div>
        )}

        {stage === 'breach' && (
          <motion.div 
            key="breach"
            initial={{ opacity: 0 }}
            animate={{ scale: [1, 15], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full flex items-center justify-center"
          >
             <div className="w-96 h-96 bg-white rounded-full blur-3xl" />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-10 left-0 right-0 flex justify-center">
         <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum Encryption Layer Active</span>
         </div>
      </footer>
    </div>
  );
}
