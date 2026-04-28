import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Settings, Clock, Activity, AlertCircle, Plus, FileCode2 } from "lucide-react";
import { invokeSafe } from "../../lib/tauri";
import { cn } from "../../lib/utils";

export interface AutomationTask {
  id: string;
  name: string;
  schedule: string;
  status: "idle" | "running" | "failed" | "success";
  lastRun?: number;
}

export const AutomationPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // Mocking the call since backend implementation is coming later or might return empty
      const data = await invokeSafe("get_automation_tasks").catch(() => [
        { id: "t1", name: "Daily System Clean", schedule: "@daily", status: "idle" },
        { id: "t2", name: "Sync Neural Manifest", schedule: "every 4 hours", status: "success", lastRun: Date.now() - 3600000 },
        { id: "t3", name: "Purge Zombie Procs", schedule: "@hourly", status: "running" }
      ]);
      setTasks(data as AutomationTask[]);
    } finally {
      setLoading(false);
    }
  };

  const executeTask = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "running" } : t));
    try {
      await invokeSafe("execute_automation_task", { id });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "success", lastRun: Date.now() } : t));
    } catch (e) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "failed" } : t));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed top-20 right-6 z-[600] w-96 h-[calc(100vh-160px)] glass-bright rounded-3xl border border-white/10 p-6 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Automation Engine</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Plus className="w-5 h-5 text-slate-400 rotate-45" />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-xl transition-colors">
          New Task
        </button>
        <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold uppercase rounded-xl transition-colors">
          Import Manifest
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-8 text-slate-500">
            <FileCode2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-xs uppercase tracking-widest">No Active Tasks</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-bold text-white truncate pr-8">{task.name}</h3>
                {task.status === "running" && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
                {task.status === "failed" && <AlertCircle className="absolute top-4 right-4 w-3 h-3 text-rose-400" />}
                {task.status === "success" && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-4">
                <Clock className="w-3 h-3" /> {task.schedule}
              </div>
              
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[9px] text-slate-500 uppercase">
                  {task.lastRun ? `Last: ${new Date(task.lastRun).toLocaleTimeString()}` : 'Never run'}
                </span>
                <button 
                  onClick={() => executeTask(task.id)}
                  disabled={task.status === "running"}
                  className="p-1.5 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
