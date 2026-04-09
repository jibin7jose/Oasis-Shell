import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, ChevronRight, Zap, Ghost, RefreshCcw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { cn } from '../../lib/utils';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'meta';
  content: string;
  timestamp: string;
}

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stressColor?: string;
}

export function TerminalPanel({ isOpen, onClose, stressColor = '#6366f1' }: TerminalPanelProps) {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'meta', content: 'OASIS KERNEL V4.5-SENTINEL INITIALIZED.', timestamp: new Date().toLocaleTimeString() },
    { id: '2', type: 'meta', content: 'AUTHENTICATED FOUNDER LINK ESTABLISHED.', timestamp: new Date().toLocaleTimeString() },
    { id: '3', type: 'meta', content: 'TYPE "status", "audit", "ls --strategic", OR "manifest [title]".', timestamp: new Date().toLocaleTimeString() },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    const cmdText = input.trim();
    const newLines = [...lines, { 
      id: Date.now().toString(), 
      type: 'input' as const, 
      content: `> ${cmdText}`, 
      timestamp: new Date().toLocaleTimeString() 
    }];
    setLines(newLines);
    setHistory([cmdText, ...history]);
    setHistoryIndex(-1);
    setInput('');
    setIsExecuting(true);

    try {
      const parts = cmdText.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      const response: any = await invoke('execute_cli_directive', {
        directive: { cmd, args },
        stressColor
      });

      setLines(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: response.output,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      setLines(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `FAULT: ${err}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="fixed inset-0 z-[9000] bg-black/40 flex items-center justify-center p-24"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="max-w-6xl w-full h-[70vh] bg-[#03040a]/90 border border-white/5 rounded-[3rem] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
          >
            {/* SCANLINES EFFECT */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            {/* GLOW OVERLAY */}
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

            {/* HEADER */}
            <header className="px-12 py-8 border-b border-white/5 flex items-center justify-between relative z-10 bg-black/20 backdrop-blur-md">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <TerminalIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                    Strategic Command Node
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[8px] font-black tracking-[0.2em] border border-indigo-500/20">CLI_SECURED</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">System Interaction Layer // Oasis Kernel v4.5</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setLines([])} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-500 hover:text-white">
                  <RefreshCcw size={16} />
                </button>
                <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                  <X className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </header>

            {/* OUTPUT AREA */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-3 font-mono text-[13px] relative z-10 scroll-smooth"
            >
              {lines.map((line) => (
                <div key={line.id} className="flex gap-4 group">
                  <span className="text-[10px] text-slate-700 w-20 shrink-0 font-bold leading-6">[{line.timestamp}]</span>
                  <div className={cn(
                    "leading-relaxed break-words",
                    line.type === 'input' && "text-white font-black",
                    line.type === 'output' && "text-indigo-400/90",
                    line.type === 'error' && "text-rose-500 font-black",
                    line.type === 'meta' && "text-slate-600 italic text-[11px]"
                  )}>
                    {line.content}
                  </div>
                </div>
              ))}
              {isExecuting && (
                <div className="flex gap-4">
                  <span className="text-[10px] text-slate-700 w-20 shrink-0 font-bold">[{new Date().toLocaleTimeString()}]</span>
                  <div className="text-indigo-500 animate-pulse font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <Zap size={10} className="animate-bounce" /> Processing Directive...
                  </div>
                </div>
              )}
            </div>

            {/* INPUT AREA */}
            <form 
              onSubmit={handleCommand}
              className="p-10 border-t border-white/5 bg-black/40 relative z-10"
            >
              <div className="flex items-center gap-6 glass rounded-2xl px-8 py-4 border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.05)] focus-within:border-indigo-500/50 transition-all">
                <ChevronRight className="w-5 h-5 text-indigo-500 animate-pulse" />
                <input 
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Awaiting Directive..."
                  className="bg-transparent border-none outline-none text-white w-full font-mono text-sm placeholder:text-slate-700"
                  autoFocus
                />
                <button type="submit" disabled={isExecuting} className={cn("text-indigo-500 transition-all", isExecuting ? "opacity-0" : "hover:text-white hover:scale-110")}>
                  <Zap size={20} fill={input.length > 0 ? "currentColor" : "none"} />
                </button>
              </div>
            </form>

            {/* DECORATIVE ELEMENTS */}
            <div className="absolute bottom-4 right-12 flex items-center gap-6 pointer-events-none opacity-20">
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-white uppercase tracking-[0.4em]">Sub-Node Logic</span>
                <span className="text-[8px] font-mono text-indigo-400">ACTIVE // PULSE_READY</span>
              </div>
              <Ghost className="w-8 h-8 text-indigo-500" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
