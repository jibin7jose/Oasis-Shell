import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, ChevronRight, Zap, Trash2, Sparkles, Plus } from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { cn } from '../../lib/utils';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'meta' | 'done';
  content: string;
  timestamp: string;
}

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stressColor?: string;
}

export function TerminalInstance({ isActive, stressColor = '#6366f1' }: { isActive: boolean; stressColor?: string }) {
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '0a', type: 'meta', content: '╔══════════════════════════════════════╗', timestamp: '' },
    { id: '0b', type: 'meta', content: '║  OASIS KERNEL v4.5 — SENTINEL LINK   ║', timestamp: '' },
    { id: '0c', type: 'meta', content: '╚══════════════════════════════════════╝', timestamp: '' },
    { id: '0d', type: 'meta', content: 'Real-time streaming terminal active.', timestamp: new Date().toLocaleTimeString() },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [cwd, setCwd] = useState<string>(''); // Track native working directory
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when opened or active
  useEffect(() => {
    if (isActive && inputRef.current) inputRef.current.focus();
  }, [isActive]);

  // Fetch initial directory
  useEffect(() => {
    import('@tauri-apps/api/path').then(({ appDir }) => {
      appDir().then(dir => setCwd(dir)).catch(() => setCwd('C:\\'));
    });
  }, []);

  // Listen for streaming terminal output from Rust
  useEffect(() => {
    let unlistenFn: (() => void) | undefined;
    let isMounted = true;

    const setupListener = async () => {
      const { listen } = await import('@tauri-apps/api/event');
      unlistenFn = await listen<{ session: string; line: string; kind: 'input' | 'output' | 'error' | 'done' }>(
        'terminal-stdout',
        (event) => {
          if (!isMounted) return;
          const { session, line, kind } = event.payload;
          if (kind === 'done') {
            setIsExecuting(false);
            setCurrentSession(null);
            setLines(prev => [...prev, {
              id: `${session}-done`,
              type: 'meta',
              content: '─── Command complete ─────────────────────',
              timestamp: ''
            }]);
            return;
          }
          if (!line) return;
          
          // Strip ANSI codes to ensure regex works even if terminal outputs colored text
          const cleanLine = line.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();

          // Smart error detection for stdout streams that print errors
          const isError = kind === 'error' || 
            (kind === 'output' && /error|failed|exception|unknown command|not found|is not recognized/i.test(cleanLine));

          setLines(prev => [...prev, {
            id: `${session}-${Date.now()}-${Math.random()}`,
            type: isError ? 'error' : kind === 'input' ? 'input' : 'output',
            content: line,
            timestamp: new Date().toLocaleTimeString(),
          }]);
        }
      );
    };

    setupListener();

    return () => {
      isMounted = false;
      if (unlistenFn) unlistenFn();
    };
  }, []);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    const cmdText = input.trim();
    const parts = cmdText.split(' ');
    let cmd = parts[0];
    let args = parts.slice(1);

    setHistory(prev => [cmdText, ...prev]);
    setHistoryIndex(-1);
    setInput('');
    setIsExecuting(true);

    // Immediately print what the user actually typed
    setLines(prev => [...prev, { id: Date.now() + 'in', type: 'input', content: `$ ${cmdText}`, timestamp: '' }]);

    // Native Oasis Commands Interceptor
    if (cmd === 'warp' || cmd === 'cd') {
      const targetDir = args.join(' ');
      if (targetDir) {
        // Very basic mock relative navigation for now (ideally resolved via Rust)
        const newCwd = targetDir === '..' 
          ? cwd.substring(0, cwd.lastIndexOf('\\')) || 'C:\\'
          : targetDir.includes('\\') || targetDir.includes('/') ? targetDir : `${cwd}\\${targetDir}`;
        setCwd(newCwd);
        setLines(prev => [...prev, 
          { id: Date.now() + 'out', type: 'output', content: `Warped to ${newCwd}`, timestamp: '' },
          { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }
        ]);
      } else {
        setLines(prev => [...prev, { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }]);
      }
      setIsExecuting(false);
      return;
    }

    if (cmd === 'scan') cmd = 'ls';
    if (cmd === 'view') cmd = 'cat';
    if (cmd === 'purge') cmd = 'rm';

    // The Rust command now streams via events — it returns a session ID
    const sessionId = await invokeSafe('execute_cli_directive', { cmd, args, cwd }) as string | null;
    if (sessionId) setCurrentSession(sessionId);
    // If invokeSafe returns null (error), reset executing state
    else {
      setIsExecuting(false);
      setLines(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: 'Failed to spawn command.',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  };

  const handleStopCommand = () => {
    setIsExecuting(false);
    setLines(prev => [...prev, {
      id: Date.now() + 'kill',
      type: 'error',
      content: '^C (Process Detached)',
      timestamp: ''
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIdx);
      setInput(history[newIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIdx);
      setInput(newIdx === -1 ? '' : history[newIdx] ?? '');
    }
  };

  const triggerHealProtocol = async (errorContent: string) => {
    if (isHealing) return;
    setIsHealing(true);
    const healId1 = Date.now() + 'h1';
    setLines(prev => [...prev, { id: healId1, type: 'meta', content: '[AURA-HEAL] Analyzing stack trace via Neural Engine...', timestamp: '' }]);
    
    try {
      const response = await invokeSafe('analyze_terminal_error', { errorText: errorContent }) as string;
      
      const responseText = response.trim();
      let cleanResponse = responseText;
      
      // Extract the command from <command> tags
      const commandMatch = responseText.match(/<command>([\s\S]*?)<\/command>/);
      if (commandMatch && commandMatch[1]) {
        setInput(commandMatch[1].trim());
        // Clean the tags out of the UI text
        cleanResponse = responseText.replace(/<\/?command>/g, '`');
      }

      const healId2 = Date.now() + 'h2';
      setLines(prev => [...prev, { id: healId2, type: 'output', content: `✓ AI Analysis: ${cleanResponse}`, timestamp: '' }]);

    } catch (e) {
      setLines(prev => [...prev, { id: Date.now() + 'err', type: 'error', content: '[AURA-HEAL] Neural Engine offline or failed.', timestamp: '' }]);
    } finally {
      setIsHealing(false);
    }

    if (inputRef.current) inputRef.current.focus();
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input':  return 'text-indigo-300 font-bold';
      case 'output': return 'text-emerald-300/90';
      case 'error':  return 'text-red-400';
      case 'meta':   return 'text-slate-500';
      case 'done':   return 'text-slate-600';
    }
  };

  return (
    <div className={cn("flex flex-col h-full w-full absolute inset-0 z-10", !isActive && "hidden")}>
      <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-black/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-slate-500" />
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            {cwd ? cwd : 'Oasis Shell'}
          </span>
          {isExecuting && (
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Running</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLines(lines.slice(0, 4))}
            className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>


          {/* Output */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-4 font-mono text-[12px] leading-relaxed space-y-0.5 no-scrollbar"
          >
            {lines.map((line, index) => {
              const isLastErrorInBlock = line.type === 'error' && lines[index + 1]?.type !== 'error';
              
              const getFullErrorContext = () => {
                let context = '';
                let i = index;
                while (i >= 0 && lines[i].type === 'error') {
                  context = lines[i].content + '\n' + context;
                  i--;
                }
                return context.trim();
              };

              return (
                <div key={line.id} className={cn('flex flex-col gap-1', lineColor(line.type))}>
                  <div className="flex gap-3 items-start">
                    {line.type === 'input' && (
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-400" />
                    )}
                    {line.type === 'error' && (
                      <span className="flex-shrink-0 text-red-500">!</span>
                    )}
                    {(line.type === 'output' || line.type === 'meta' || line.type === 'done') && (
                      <span className="flex-shrink-0 w-3" />
                    )}
                    <span className="break-all">{line.content}</span>
                  </div>
                  {isLastErrorInBlock && (
                    <div className="pl-6 py-1">
                      <button
                        onClick={() => triggerHealProtocol(getFullErrorContext())}
                        disabled={isHealing}
                        className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 text-red-300 rounded text-[10px] uppercase font-bold tracking-widest transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className={cn("w-3 h-3", isHealing && "animate-pulse")} />
                        {isHealing ? 'Healing...' : 'Diagnose & Fix'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {isExecuting && (
              <div className="flex gap-2 items-center text-emerald-400/60 mt-1">
                <span className="w-3" />
                <span className="animate-pulse text-[11px]">▋</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleCommand}
            className="flex items-center gap-3 px-6 py-3 border-t border-white/5 flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: stressColor }} />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder={isExecuting ? 'Command running…' : 'Enter command…'}
              className="flex-1 bg-transparent font-mono text-[12px] text-white outline-none placeholder:text-slate-700 disabled:opacity-40"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={isExecuting ? handleStopCommand : (e) => { e.preventDefault(); handleCommand(e as any); }}
              disabled={!isExecuting && !input.trim()}
              className={cn("p-1.5 rounded-lg transition-all", (!isExecuting && !input.trim()) && "opacity-30")}
              style={{ color: isExecuting ? '#ef4444' : stressColor }}
              title={isExecuting ? 'Stop Command' : 'Run Command'}
            >
              {isExecuting ? <div className="w-3.5 h-3.5 bg-red-500 rounded-sm" /> : <Zap className="w-4 h-4" />}
            </button>
          </form>
    </div>
  );
}

export function TerminalPanel({ isOpen, onClose, stressColor = '#6366f1' }: TerminalPanelProps) {
  const [tabs, setTabs] = useState([{ id: '1', name: 'oasis' }]);
  const [activeTab, setActiveTab] = useState('1');

  const addTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, name: 'oasis' }]);
    setActiveTab(newId);
  };

  const removeTab = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close the last tab
    const newTabs = tabs.filter(t => t.id !== idToRemove);
    setTabs(newTabs);
    if (activeTab === idToRemove) {
      setActiveTab(newTabs[newTabs.length - 1].id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed bottom-0 left-20 md:left-24 right-0 h-[45vh] z-[300] flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.97) 0%, rgba(2,4,20,0.99) 100%)',
            borderTop: `1px solid ${stressColor}40`,
            boxShadow: `0 -20px 60px rgba(0,0,0,0.8), 0 -4px 20px ${stressColor}20`,
          }}
        >
          {/* Header & Tabs */}
          <div className="flex justify-between items-center bg-black/40 border-b border-white/5 pl-2 pr-4 flex-shrink-0 pt-1">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-[11px] font-mono cursor-pointer transition-all border-t border-l border-r",
                    activeTab === tab.id 
                      ? "bg-[#0a0a0f] text-white border-white/10" 
                      : "bg-transparent text-slate-500 border-transparent hover:bg-white/5"
                  )}
                >
                  <TerminalIcon className="w-3 h-3" style={{ color: activeTab === tab.id ? stressColor : undefined }} />
                  {tab.name}
                  {tabs.length > 1 && (
                    <button 
                      onClick={(e) => removeTab(e, tab.id)}
                      className="p-0.5 ml-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={addTab}
                className="p-1.5 ml-1 mb-1 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                title="New Terminal"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="Close Panel">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Instances */}
          <div className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
            {tabs.map((tab) => (
              <TerminalInstance 
                key={tab.id} 
                isActive={activeTab === tab.id} 
                stressColor={stressColor} 
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
