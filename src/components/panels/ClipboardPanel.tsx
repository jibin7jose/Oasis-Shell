import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Search, Clock, Zap } from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { cn } from '../../lib/utils';

interface ClipboardItem {
  id: number;
  content: string;
  item_type: string;
  timestamp: number;
}

interface ClipboardPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClipboardPanel({ isOpen, onClose }: ClipboardPanelProps) {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen, query]);

  const loadHistory = async () => {
    const res = await invokeSafe('get_clipboard_history', { query }) as ClipboardItem[];
    setItems(res || []);
    setSelectedIndex(0);
  };

  const handleCopy = async (content: string) => {
    await invokeSafe('write_to_clipboard', { content });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        handleCopy(items[selectedIndex].content);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const timeAgo = (ts: number) => {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] flex flex-col glass-bright border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8),0_0_20px_rgba(99,102,241,0.2)] overflow-hidden"
          >
            {/* Header / Search */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-white/10 bg-black/40">
              <Search className="w-5 h-5 text-indigo-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search clipboard history..."
                className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-slate-500"
              />
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400">↑↓</kbd>
                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400">↵</kbd>
                <button onClick={onClose} className="p-2 ml-2 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Copy className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">No clipboard history found</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleCopy(item.content)}
                    className={cn(
                      "group flex flex-col p-4 rounded-2xl border transition-all cursor-pointer",
                      idx === selectedIndex 
                        ? "bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {timeAgo(item.timestamp)}
                      </span>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest transition-opacity",
                        idx === selectedIndex ? "text-indigo-400 opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-100"
                      )}>
                        ↵ to Copy
                      </span>
                    </div>
                    <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap truncate max-h-24 overflow-hidden">
                      {item.content}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
