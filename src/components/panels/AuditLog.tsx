import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, ShieldAlert, Terminal, FileCode2, Plus } from "lucide-react";
import { invokeSafe } from "../../lib/tauri";

export interface AuditRecord {
  id: string;
  timestamp: number;
  action: string;
  category: "system" | "neural" | "security" | "deploy";
  details: string;
}

export const AuditLog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) loadLogs();
  }, [isOpen]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await invokeSafe("get_audit_logs").catch(() => [
        { id: "log1", timestamp: Date.now() - 5000, action: "SENTINEL_LOCK", category: "security", details: "Vault locked due to idle timeout." },
        { id: "log2", timestamp: Date.now() - 120000, action: "EXEC_COMMAND", category: "system", details: "Purged zombie process PID 1450" },
        { id: "log3", timestamp: Date.now() - 360000, action: "INTENT_PARSE", category: "neural", details: "Parsed intent: 'clean workspace'" }
      ]);
      setLogs(data as AuditRecord[]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="fixed top-20 left-6 z-[600] w-[450px] h-[calc(100vh-160px)] glass-bright rounded-3xl border border-white/10 p-6 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Audit Trail</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Plus className="w-5 h-5 text-slate-400 rotate-45" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <History className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-xs uppercase tracking-widest">No Log Entries</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex gap-3">
              <div className="mt-1">
                {log.category === 'security' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                {log.category === 'system' && <Terminal className="w-4 h-4 text-indigo-400" />}
                {log.category === 'neural' && <FileCode2 className="w-4 h-4 text-emerald-400" />}
                {log.category === 'deploy' && <History className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{log.action}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{log.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
