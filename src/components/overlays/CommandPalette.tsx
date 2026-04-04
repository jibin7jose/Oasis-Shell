import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText } from "lucide-react";
import { cn } from "../../lib/utils";
import { invoke } from "@tauri-apps/api/core";

interface CommandPaletteProps {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onExecute: (query: string) => void;
}

interface SearchResult {
  filename: string;
  filepath: string;
  score: number;
  preview: string;
}

const BASE_COMMANDS = [
  { label: "System Scan", hint: "Run diagnostic + update status", id: 'scan' },
  { label: "Open Sentinel Vault", hint: "Security & sealed assets", id: 'vault' },
  { label: "Show Cortex Graph", hint: "3D knowledge map", id: 'graph' },
  { label: "Open Logs", hint: "Event history timeline", id: 'logs' },
  { label: "Start Presentation Mode", hint: "Full-screen executive view", id: 'presentation' },
  { label: "Sync Workspace", hint: "Git sync + status", id: 'sync' },
  { label: "Cortex Index: Full Project", hint: "Re-index semantic store", id: 'index' }
];

export default function CommandPalette({ open, query, onQueryChange, onClose, onExecute }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setSemanticResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await invoke<SearchResult[]>("search_semantic_nodes", { query: q });
        setSemanticResults(results);
      } catch (e) {
        console.error("Cortex Search Failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BASE_COMMANDS;
    return BASE_COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[4000] bg-black/60 backdrop-blur-2xl flex items-start justify-center pt-28 px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="w-full max-w-2xl glass-bright rounded-[2.5rem] border border-white/10 shadow-5xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 overflow-hidden">
                {isSearching ? (
                   <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 bg-indigo-400 rounded-full blur-sm" />
                ) : (
                   <Search className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onExecute(query);
                  if (e.key === "Escape") onClose();
                }}
                placeholder="Command the system…"
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-slate-600 font-medium"
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">ESC</span>
            </div>

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {/* PRIMARY COMMANDS */}
              {filteredCommands.length > 0 && (
                <div className="px-6 py-4 flex flex-col gap-2 bg-white/[0.01]">
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] px-2 mb-2">Neural Directives</span>
                   {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => onExecute(cmd.id)}
                      className={cn(
                        "w-full text-left px-5 py-5 rounded-3xl hover:bg-white/5 transition-all group",
                        "flex items-center justify-between gap-6"
                      )}
                    >
                      <div className="flex flex-col">
                        <div className="text-[13px] font-black text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight">{cmd.label}</div>
                        <div className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors">{cmd.hint}</div>
                      </div>
                      <span className="text-[10px] font-black text-indigo-500/40 group-hover:text-indigo-400 uppercase tracking-widest transition-colors">Invoke</span>
                    </button>
                  ))}
                </div>
              )}

              {/* SEMANTIC DISCOVERY RESULTS */}
              {semanticResults.length > 0 && (
                 <div className="px-6 py-6 flex flex-col gap-2 border-t border-white/5">
                    <span className="text-[9px] font-black text-indigo-400/60 uppercase tracking-[0.4em] px-2 mb-4 flex items-center gap-4">
                       Neural Knowledge Discovery
                       <div className="h-[1px] flex-1 bg-indigo-500/10" />
                    </span>
                    {semanticResults.map((result, i) => (
                       <button
                          key={i}
                          onClick={() => onExecute(`open ${result.filepath}`)}
                          className="w-full text-left p-5 rounded-[2.5rem] hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all group relative overflow-hidden"
                       >
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex justify-between items-start gap-4">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                   <FileText className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                                   <span className="text-sm font-black text-white tracking-tighter">{result.filename}</span>
                                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{result.filepath.split('\\').slice(-2).join(' / ')}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100 italic transition-all pr-12">
                                   "{result.preview}"
                                </div>
                             </div>
                             <div className="flex flex-col items-end">
                                <div className="text-[10px] font-black text-indigo-400">{Math.round(result.score * 100)}%</div>
                                <span className="text-[7px] text-slate-600 font-bold uppercase">Concept Sync</span>
                             </div>
                          </div>
                       </button>
                    ))}
                 </div>
              )}

              {filteredCommands.length === 0 && semanticResults.length === 0 && !isSearching && query.length > 0 && (
                <div className="p-12 text-center">
                   <p className="text-sm text-slate-600 font-bold mb-4 uppercase tracking-widest italic opacity-40">"Neural search yield null vectors."</p>
                   <button onClick={() => onExecute(query)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10">
                      Run Raw Intent: {query}
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
