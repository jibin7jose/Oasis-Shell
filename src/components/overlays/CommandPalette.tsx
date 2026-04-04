import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

interface CommandPaletteProps {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onExecute: (query: string) => void;
}

const BASE_COMMANDS = [
  { label: "System Scan", hint: "Run diagnostic + update status" },
  { label: "Open Sentinel Vault", hint: "Security & sealed assets" },
  { label: "Show Cortex Graph", hint: "3D knowledge map" },
  { label: "Open Logs", hint: "Event history timeline" },
  { label: "Start Presentation Mode", hint: "Full-screen executive view" },
  { label: "Sync Workspace", hint: "Git sync + status" }
];

export default function CommandPalette({ open, query, onQueryChange, onClose, onExecute }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open]);

  const filtered = useMemo(() => {
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
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Search className="w-5 h-5 text-indigo-400" />
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

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {filtered.length === 0 && (
                <div className="p-8 text-[10px] text-slate-500">No matches. Press Enter to run custom intent.</div>
              )}
              {filtered.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => onExecute(cmd.label)}
                  className={cn(
                    "w-full text-left px-6 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-all",
                    "flex items-center justify-between gap-6"
                  )}
                >
                  <div>
                    <div className="text-[12px] font-bold text-white">{cmd.label}</div>
                    <div className="text-[10px] text-slate-500">{cmd.hint}</div>
                  </div>
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Run</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
