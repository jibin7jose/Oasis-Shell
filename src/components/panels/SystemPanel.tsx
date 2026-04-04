import { Cpu, Activity, ShieldCheck, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SystemStats {
  oas_id: string;
  path_status: string;
  binary_sync: boolean;
  cpu_load: number;
  mem_used: number;
}

export interface WindowInfo {
  title: string;
  pid: number;
  exe_path: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_maximized: boolean;
}

interface SystemPanelProps {
  stats: SystemStats | null;
  windows: WindowInfo[];
  lastSync: string;
  onRefresh: () => void;
}

export default function SystemPanel({ stats, windows, lastSync, onRefresh }: SystemPanelProps) {
  return (
    <div className="w-full max-w-5xl glass p-8 rounded-[2rem] border border-white/5 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">System Core</h3>
            <p className="text-[10px] font-mono text-slate-500">Last Sync: {lastSync || "N/A"}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPU Load</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats ? `${stats.cpu_load.toFixed(1)}%` : "--"}</div>
          <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={cn("h-full rounded-full", stats && stats.cpu_load > 80 ? "bg-rose-500" : "bg-amber-400")}
              style={{ width: `${Math.min(100, stats?.cpu_load ?? 0)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memory Used</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats ? `${stats.mem_used.toFixed(1)}%` : "--"}</div>
          <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={cn("h-full rounded-full", stats && stats.mem_used > 85 ? "bg-rose-500" : "bg-emerald-400")}
              style={{ width: `${Math.min(100, stats?.mem_used ?? 0)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Binary Sync</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={cn("text-2xl font-black", stats?.binary_sync ? "text-emerald-400" : "text-rose-500")}>
            {stats?.binary_sync ? "Verified" : "Desynced"}
          </div>
          <div className="mt-2 text-[9px] font-mono text-slate-500 line-clamp-2">{stats?.path_status || "No path status"}</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Running Windows</span>
            <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full">
              {windows.length}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Live Process Surface</span>
        </div>

        <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-3">
          {windows.length === 0 && (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-500">
              No visible windows detected.
            </div>
          )}
          {windows.map((win) => (
            <div key={`${win.pid}-${win.title}`} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{win.title}</div>
                  <div className="text-[9px] font-mono text-slate-500 truncate">{win.exe_path}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-black text-slate-400">PID {win.pid}</div>
                  <div className="text-[8px] text-slate-500">
                    {win.is_maximized ? "Maximized" : `${win.width}x${win.height}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
