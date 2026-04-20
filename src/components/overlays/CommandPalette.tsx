import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lock, FileText, Activity } from "lucide-react";
import { cn } from "../../lib/utils";
import { invoke } from "@tauri-apps/api/core";

export type CommandPermission = "process_control" | "system_control";

interface CommandPaletteProps {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onExecute: (query: string) => void;
  permissions: Record<CommandPermission, boolean>;
  onRequestPermission: (permission: CommandPermission, label: string, action?: () => void) => void;
  onQuarantinePid: (pid: number) => void;
  processes: { pid: number; name: string }[];
  onPinContext: (name: string) => void;
  onZenithPulse: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  permission?: CommandPermission;
}

interface SearchResult {
  filename: string;
  filepath: string;
  score: number;
  preview: string;
}

const BASE_COMMANDS: CommandItem[] = [
  { id: "system_scan", label: "System Scan", hint: "Run diagnostic + update status", permission: "system_control" },
  { id: "open_vault", label: "Open Sentinel Vault", hint: "Security & sealed assets" },
  { id: "show_graph", label: "Show Cortex Graph", hint: "3D knowledge map" },
  { id: "open_logs", label: "Open Logs", hint: "Event history timeline" },
  { id: "presentation", label: "Start Presentation Mode", hint: "Full-screen executive view" },
  { id: "sync_workspace", label: "Sync Workspace", hint: "Git sync + status", permission: "system_control" },
  { id: "forge", label: "Omni-Vent Forge", hint: "Manifest polyglot sub-ventures (Phase 35)", permission: "system_control" },
  { id: "exodus", label: "The Exodus Protocol", hint: "Manifest native binary forge (Phase 37)", permission: "system_control" },
  { id: "consortium", label: "The Consortium Mesh", hint: "Synchronize local strategic collective (Phase 38)", permission: "system_control" },
  { id: "singularity", label: "The Singularity Gateway", hint: "Multi-agent neural orchestration (Phase 40)", permission: "system_control" },
  { id: "mirror", label: "Neural Mirror: Final Evolution", hint: "Manifest recursive self-optimization (Phase 41)", permission: "system_control" },
  { id: "sentinel", label: "Neural Sentinel Core", hint: "Activate proactive security & intrusion detection (Phase 39)", permission: "system_control" },
  { id: "sandbox", label: "Neural Sandbox Hardening", hint: "Adversarial audit & resilience (Phase 36)", permission: "system_control" },
  { id: "index", label: "Cortex Index: Full Project", hint: "Re-index semantic store", permission: "system_control" },
  { id: "process_quarantine", label: "Quarantine Process", hint: "Kill a process by PID", permission: "process_control" },
  { id: "pin_context", label: "Pin Context Snapshot", hint: "Freeze current workspace metrics", permission: "system_control" },
  { id: "zenith_pulse", label: "Activate Zenith Pulse", hint: "Deep focus: shroud non-mission telemetry" },
  { id: "reset_priorities", label: "Reset All Priorities", hint: "Return active processes to normal", permission: "process_control" },
  { id: "clear_priority_cache", label: "Clear Priority Cache", hint: "Drop all cached priority rules" },
  { id: "toggle_performance", label: "Toggle Performance Mode", hint: "Disable heavy visuals for low-end devices" }
];

const isTauri = typeof (window as any).__TAURI__ !== "undefined";
const TAURI_DEFAULTS: Record<string, any> = {
  seek_chronos: [],
  search_semantic_nodes: []
};
const invokeSafe = async <T = any>(cmd: string, payload?: Record<string, any>) => {
  if (!isTauri) return (TAURI_DEFAULTS[cmd] ?? null) as T;
  return invoke(cmd, payload as any) as Promise<T>;
};

const scoreMatch = (query: string, text: string) => {
  if (!query) return 1;
  let score = 0;
  let t = text.toLowerCase();
  let q = query.toLowerCase();
  let ti = 0;
  let streak = 0;
  for (let qi = 0; qi < q.length; qi += 1) {
    const qc = q[qi];
    let found = false;
    while (ti < t.length) {
      if (t[ti] === qc) {
        found = true;
        streak += 1;
        score += 3 + streak;
        ti += 1;
        break;
      }
      streak = 0;
      ti += 1;
    }
    if (!found) return 0;
  }
  return score;
};

export default function CommandPalette({
  open,
  query,
  onQueryChange,
  onClose,
  onExecute,
  permissions,
  onRequestPermission,
  onQuarantinePid,
  processes,
  onPinContext,
  onZenithPulse
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pidMode, setPidMode] = useState(false);
  const [pidValue, setPidValue] = useState("");
  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);
  const [chronosResults, setChronosResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!isTauri) {
      setSemanticResults([]);
      setChronosResults([]);
      return;
    }
    if (q.length < 3) {
      setSemanticResults([]);
      setChronosResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (q.startsWith('/seek ')) {
          const seekQ = q.slice(6).trim();
          if (seekQ.length >= 2) {
            const results = await invokeSafe<any[]>("seek_chronos",  { query: seekQ, limit: 10 });
            setChronosResults(results);
          }
        } else {
          const results = await invokeSafe<SearchResult[]>("search_semantic_nodes",  { query: q });
          setSemanticResults(results);
        }
      } catch (e) {
        console.error("Cortex Search Failed", e);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return BASE_COMMANDS;
    const ranked = BASE_COMMANDS.map((cmd) => ({
      cmd,
      score: Math.max(scoreMatch(q, cmd.label), scoreMatch(q, cmd.hint) * 0.8)
    }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return ranked.map((r) => r.cmd);
  }, [query]);

  const processMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return processes
      .filter((p) => p.name.toLowerCase().includes(q) || String(p.pid).includes(q))
      .slice(0, 6);
  }, [query, processes]);

  const handleExecute = (cmd: CommandItem, raw: string) => {
    if (cmd.permission && !permissions[cmd.permission]) {
      onRequestPermission(cmd.permission, cmd.label);
      return;
    }
    onExecute(cmd.id || raw || cmd.label);
  };

  const handleQuarantineSubmit = () => {
    const pid = parseInt(pidValue.trim(), 10);
    if (!Number.isFinite(pid)) return;
    const run = () => {
      onQuarantinePid(pid);
      setPidValue("");
      setPidMode(false);
      onClose();
    };
    if (!permissions.process_control) {
      onRequestPermission("process_control", "Quarantine Process", run);
      return;
    }
    run();
  };

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
                  if (e.key === "Enter") {
                    const trimmed = query.trim();
                    const match = BASE_COMMANDS.find((cmd) => cmd.label.toLowerCase() === trimmed.toLowerCase());
                    if (match) {
                      if (match.id === "process_quarantine") {
                        setPidMode(true);
                      } else {
                        handleExecute(match, match.label);
                      }
                    } else if (trimmed) {
                      onExecute(trimmed);
                    }
                  }
                  if (e.key === "Escape") onClose();
                }}
                placeholder="Command the system…"
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-slate-600 font-medium"
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">ESC</span>
            </div>

            {pidMode && (
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Target PID</div>
                <input
                  value={pidValue}
                  onChange={(e) => setPidValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleQuarantineSubmit();
                    if (e.key === "Escape") {
                      setPidMode(false);
                      setPidValue("");
                    }
                  }}
                  placeholder="e.g. 4321"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500"
                />
                <button
                  onClick={handleQuarantineSubmit}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-[9px] font-black uppercase tracking-widest rounded-lg text-rose-200"
                >
                  Quarantine
                </button>
              </div>
            )}

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {/* PRIMARY COMMANDS */}
              {filtered.length > 0 && (
                <div className="px-6 py-4 flex flex-col gap-2">
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] px-2 mb-2">Neural Directives</span>
                   {filtered.map((cmd) => {
                    const locked = cmd.permission && !permissions[cmd.permission];
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          if (cmd.id === "process_quarantine") {
                            setPidMode(true);
                            return;
                          }
                          handleExecute(cmd, cmd.label);
                        }}
                        className={cn(
                          "w-full text-left px-5 py-5 rounded-3xl hover:bg-white/5 transition-all group",
                          "flex items-center justify-between gap-6",
                          locked && "opacity-70"
                        )}
                      >
                        <div className="flex flex-col">
                          <div className="text-[13px] font-black text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight flex items-center gap-2">
                             {cmd.label}
                             {locked && <Lock className="w-3 h-3 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]" />}
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors">{cmd.hint}</div>
                        </div>
                        <span className="text-[10px] font-black text-indigo-500/40 group-hover:text-indigo-400 uppercase tracking-widest transition-colors">Invoke</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {processMatches.length > 0 && (
                <div className="px-6 py-6 flex flex-col gap-2 border-t border-white/5 bg-black/10">
                  <span className="text-[9px] font-black text-amber-400/70 uppercase tracking-[0.4em] px-2 mb-2">
                    Process Targets
                  </span>
                  {processMatches.map((proc) => (
                    <button
                      key={proc.pid}
                      onClick={() => {
                        setPidMode(true);
                        setPidValue(String(proc.pid));
                      }}
                      className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[12px] font-bold text-white">{proc.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">PID {proc.pid}</div>
                      </div>
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Target</span>
                    </button>
                  ))}
                </div>
              )}

              {/* SEMANTIC DISCOVERY RESULTS */}
    {chronosResults.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 mb-6 px-4">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chronos ledger Insights</h3>
              </div>
              <div className="space-y-4">
                {chronosResults.map((res, i) => (
                  <div key={i} className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center border",
                        res.source === 'PINNED_CONTEXT' ? "bg-amber-500/10 border-amber-500/20" : "bg-indigo-500/10 border-indigo-500/20"
                      )}>
                        <Activity className={cn("w-5 h-5", res.source === 'PINNED_CONTEXT' ? "text-amber-400" : "text-indigo-400")} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{res.source}</span>
                        <h4 className="text-sm font-bold text-white transition-colors group-hover:text-amber-400">{res.title || res.message}</h4>
                        <span className="text-[9px] font-mono text-slate-600 mt-0.5">{res.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {semanticResults.length > 0 && (
                 <div className="px-6 py-6 flex flex-col gap-2 border-t border-white/5 bg-white/[0.01]">
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
                                   <span className="text-[8px] font-bold text-slate-600 font-mono uppercase tracking-widest">{result.filepath.split('\\').slice(-2).join(' / ')}</span>
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

              {filtered.length === 0 && semanticResults.length === 0 && !isSearching && query.length > 0 && (
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
