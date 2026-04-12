import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Activity, ShieldCheck, RotateCcw, HardDrive, Pause, Play, Skull, Usb, Filter, ArrowUpDown, History, Download, RefreshCcw, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SystemStats {
  oas_id: string;
  path_status: string;
  binary_sync: boolean;
  cpu_load: number;
  mem_used: number;
  battery_level: number;
  is_charging: boolean;
  battery_health: number;
  time_remaining_min: number;
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

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  mem_usage: number;
  status: string;
}

export interface StorageInfo {
  name: string;
  mount: string;
  total: number;
  available: number;
  health_score: number;
}

export interface DeviceInfo {
  kind: string;
  name: string;
  detail: string;
}

interface SystemPanelProps {
  stats: SystemStats | null;
  windows: WindowInfo[];
  processes: ProcessInfo[];
  storage: StorageInfo[];
  devices: DeviceInfo[];
  processPriorities: Record<number, string>;
  priorityCache: Record<string, { priority: string; lastApplied: number; source: "Manual" | "Auto-Applied"; ignore?: boolean; ttlDays?: number }>;
  priorityAudit: { id: number; pid: number; name: string; priority: string; source: "Manual" | "Auto-Applied" | "Reset"; time: number }[];
  batteryHealth: { health_percent: number; design_capacity: number; full_charge_capacity: number; cycle_count: number } | null;
  defaultTtlDays: number;
  autoApplyPriorities: boolean;
  isScanning?: boolean;
  sparklinesEnabled: boolean;
  externalConfirmAction?: "reset" | "reset_clear" | null;
  onClearExternalConfirm?: () => void;
  lastSync: string;
  onRefresh: () => void;
  onKillProcess: (pid: number) => void;
  onSuspendProcess: (pid: number) => void;
  onResumeProcess: (pid: number) => void;
  onSetPriority: (pid: number, priority: string) => void;
  onClearCacheReset: (pid: number, name: string) => void;
  onToggleIgnoreProcess: (name: string, ignore: boolean) => void;
  onExportAudit: (format: "json" | "csv", columns: string[], filter: string) => void;
  onClearAllCache: () => void;
  onReapplyAll: () => void;
  onResetAllPriorities: () => void;
  onResetAllPrioritiesAndClear: () => void;
  onToggleIgnoreAll: (ignore: boolean) => void;
  onSetProcessTtl: (name: string, ttlDays: number) => void;
}

const formatBytes = (value: number) => {
  const gb = value / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
};

const formatCapacity = (value: number) => {
  if (value <= 0) return "Unknown";
  return `${value} mWh`;
};

const formatTime = (ts: number) => {
  if (!ts || ts <= 0) return "Never";
  return new Date(ts).toLocaleTimeString();
};

const sparkValues = (base: number, pid: number, count = 12) => {
  const values = [];
  for (let i = 0; i < count; i += 1) {
    const wiggle = Math.sin(pid * 0.7 + i * 0.9) * 8 + Math.cos(pid * 1.3 + i * 0.6) * 5;
    const v = Math.max(0, Math.min(100, base + wiggle));
    values.push(v);
  }
  return values;
};

const sparkPoints = (values: number[], width = 80, height = 24) => {
  if (values.length === 0) return "";
  const step = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = (i * step).toFixed(2);
      const y = (height - (v / 100) * height).toFixed(2);
      return `${x},${y}`;
    })
    .join(" " );
};

const normalizePriority = (value: string) => {
  const v = value.toLowerCase();
  if (v.includes("low")) return "low";
  if (v.includes("high")) return "high";
  return "normal";
};

const DEFAULT_COLUMNS = ["time", "pid", "name", "priority", "source"]; // order matters

export default function SystemPanel({
  stats,
  windows,
  processes,
  storage,
  devices,
  processPriorities,
  priorityCache,
  priorityAudit,
  batteryHealth,
  defaultTtlDays,
  autoApplyPriorities,
  isScanning = false,
  sparklinesEnabled,
  externalConfirmAction,
  onClearExternalConfirm,
  lastSync,
  onRefresh,
  onKillProcess,
  onSuspendProcess,
  onResumeProcess,
  onSetPriority,
  onClearCacheReset,
  onToggleIgnoreProcess,
  onExportAudit,
  onClearAllCache,
  onReapplyAll,
  onResetAllPriorities,
  onResetAllPrioritiesAndClear,
  onToggleIgnoreAll,
  onSetProcessTtl
}: SystemPanelProps) {
  const [pidInput, setPidInput] = useState("");
  const [pidAction, setPidAction] = useState("pause");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("cpu");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [exportColumns, setExportColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [auditFilter, setAuditFilter] = useState("all");
  const [ignoreAll, setIgnoreAll] = useState(false);
  const [auditPage, setAuditPage] = useState(0);
  const [auditPageSize, setAuditPageSize] = useState(8);
  const [auditFrom, setAuditFrom] = useState("");
  const [auditTo, setAuditTo] = useState("");
  const [confirmAction, setConfirmAction] = useState<"reset" | "reset_clear" | null>(null);
  const processListRef = useRef<HTMLDivElement | null>(null);
  const [processListHeight, setProcessListHeight] = useState(0);
  const [processScrollTop, setProcessScrollTop] = useState(0);
  const [auditQuery, setAuditQuery] = useState("");
  const [hoverPid, setHoverPid] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_process_sort");
      if (saved) {
        const parsed = JSON.parse(saved) as { sortBy?: string; sortDir?: "asc" | "desc" };
        if (parsed.sortBy) setSortBy(parsed.sortBy);
        if (parsed.sortDir) setSortDir(parsed.sortDir);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("oas_process_sort", JSON.stringify({ sortBy, sortDir }));
    } catch (e) {}
  }, [sortBy, sortDir]);

  useEffect(() => {
    try {
      const q = localStorage.getItem("oas_audit_query");
      if (q !== null) setAuditQuery(q);
      const from = localStorage.getItem("oas_audit_from");
      if (from !== null) setAuditFrom(from);
      const to = localStorage.getItem("oas_audit_to");
      if (to !== null) setAuditTo(to);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("oas_audit_query", auditQuery); } catch (e) {}
  }, [auditQuery]);

  useEffect(() => {
    try { localStorage.setItem("oas_audit_from", auditFrom); } catch (e) {}
  }, [auditFrom]);

  useEffect(() => {
    try { localStorage.setItem("oas_audit_to", auditTo); } catch (e) {}
  }, [auditTo]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_audit_page_size");
      if (saved) {
        const n = parseInt(saved, 10);
        if (Number.isFinite(n)) setAuditPageSize(n);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_audit_page");
      if (saved) {
        const n = parseInt(saved, 10);
        if (Number.isFinite(n) && n >= 0) setAuditPage(n);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("oas_audit_page_size", String(auditPageSize));
    } catch (e) {}
  }, [auditPageSize]);

  useEffect(() => {
    try {
      localStorage.setItem("oas_audit_page", String(auditPage));
    } catch (e) {}
  }, [auditPage]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_audit_columns");
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) setExportColumns(parsed);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("oas_audit_columns", JSON.stringify(exportColumns));
    } catch (e) {}
  }, [exportColumns]);

  useEffect(() => {
    const el = processListRef.current;
    if (!el) return;
    const update = () => setProcessListHeight(el.clientHeight || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const anyIgnore = Object.values(priorityCache).some((c) => c.ignore);
    setIgnoreAll(anyIgnore);
  }, [priorityCache]);

  useEffect(() => {
    if (externalConfirmAction) setConfirmAction(externalConfirmAction);
  }, [externalConfirmAction]);

  useEffect(() => {
    if (!sparklinesEnabled) setHoverPid(null);
  }, [sparklinesEnabled]);

  const thermalReadings = devices
    .filter((d) => d.kind === "component")
    .map((d) => parseFloat(d.detail.replace("°C", "")))
    .filter((v) => Number.isFinite(v));
  const avgTemp = thermalReadings.length > 0 ? thermalReadings.reduce((a, b) => a + b, 0) / thermalReadings.length : null;

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("run")) return "text-emerald-400";
    if (s.includes("sleep") || s.includes("idle")) return "text-amber-400";
    if (s.includes("stop") || s.includes("zombie")) return "text-rose-400";
    return "text-slate-400";
  };

  const healthPercent = batteryHealth?.health_percent ?? stats?.battery_health ?? -1;
  const wearPercent = healthPercent >= 0 ? Math.max(0, 100 - healthPercent) : -1;

  const runPidAction = () => {
    const pid = parseInt(pidInput.trim(), 10);
    if (!Number.isFinite(pid)) return;
    if (pidAction === "pause") onSuspendProcess(pid);
    if (pidAction === "resume") onResumeProcess(pid);
    if (pidAction === "low") onSetPriority(pid, "low");
    if (pidAction === "high") onSetPriority(pid, "high");
    if (pidAction === "normal") onSetPriority(pid, "normal");
    if (pidAction === "kill") onKillProcess(pid);
  };

  const matchesSearch = (p: ProcessInfo) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || String(p.pid).includes(q);
  };

  const matchesFilter = (p: ProcessInfo) => {
    if (filter === "all") return true;
    if (filter === "high_cpu") return p.cpu_usage >= 30;
    if (filter === "high_mem") return p.mem_usage >= 600 * 1024 * 1024;
    if (filter === "paused") return p.status.toLowerCase().includes("sleep") || p.status.toLowerCase().includes("idle");
    return true;
  };

  const visibleProcesses = (Array.isArray(processes) ? processes : [])
    .filter((p) => matchesSearch(p) && matchesFilter(p))
    .sort((a, b) => {
      let aVal = 0;
      let bVal = 0;
      if (sortBy === "cpu") {
        aVal = a.cpu_usage;
        bVal = b.cpu_usage;
      } else if (sortBy === "mem") {
        aVal = a.mem_usage;
        bVal = b.mem_usage;
      } else {
        aVal = a.status.toLowerCase() < b.status.toLowerCase() ? -1 : 1;
        bVal = 0;
      }
      const diff = sortBy === "status" ? aVal : aVal - bVal;
      return sortDir === "asc" ? diff : -diff;
    });

  const toggleColumn = (col: string) => {
    setExportColumns((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
  };

  const q = auditQuery.trim().toLowerCase();
  const startMs = auditFrom ? new Date(auditFrom).setHours(0, 0, 0, 0) : null;
  const endMs = auditTo ? new Date(auditTo).setHours(23, 59, 59, 999) : null;
  const filteredAudit = (priorityAudit ?? []).filter((e) => {
    if (auditFilter !== "all" && e.source.toLowerCase() !== auditFilter) return false;
    if (q && !e.name.toLowerCase().includes(q) && !String(e.pid).includes(q)) return false;
    if (startMs !== null && e.time < startMs) return false;
    if (endMs !== null && e.time > endMs) return false;
    return true;
  });
  const totalAuditPages = Math.max(1, Math.ceil(filteredAudit.length / auditPageSize));
  const auditPageSafe = Math.min(auditPage, totalAuditPages - 1);

  useEffect(() => {
    if (auditPageSafe !== auditPage) setAuditPage(auditPageSafe);
  }, [auditPageSafe, auditPage]);

  useEffect(() => {
    setAuditPage(0);
  }, [auditFilter, priorityAudit.length, auditPageSize, auditQuery, auditFrom, auditTo]);

  return (
    <div className="w-full max-w-5xl glass p-8 rounded-[2rem] border border-white/5 mb-12 relative overflow-hidden">
      {/* Phase 7.3: Scanning Sweep Manifestation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent z-[50] pointer-events-none"
          >
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyan-400 shadow-[0_0_15px_var(--cyan-400)]" />
          </motion.div>
        )}
      </AnimatePresence>

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CPU Load</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats ? `${(stats.cpu_load ?? 0).toFixed(1)}%` : "--"}</div>
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
          <div className="text-2xl font-black text-white">{stats ? `${(stats.mem_used ?? 0).toFixed(1)}%` : "--"}</div>
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

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Battery</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats ? `${stats.battery_level}%` : "--"}
          </div>
          <div className="mt-2 text-[9px] font-mono text-slate-500">
            {stats ? (stats.is_charging ? "Charging" : "On Battery") : "Power telemetry unavailable"}
          </div>
          <div className="mt-2 text-[9px] font-mono text-slate-500 flex flex-wrap items-center gap-3">
            <span>Health: {healthPercent >= 0 ? `${healthPercent}%` : "Unknown"}</span>
            <span>Wear: {wearPercent >= 0 ? `${wearPercent}%` : "Unknown"}</span>
            <span>Cycles: {batteryHealth?.cycle_count ?? "Unknown"}</span>
            <span>ETA: {stats && stats.time_remaining_min >= 0 ? `${stats.time_remaining_min} min` : "Unknown"}</span>
          </div>
          <div className="mt-2 text-[9px] font-mono text-slate-500">
            Design {formatCapacity(batteryHealth?.design_capacity ?? -1)} · Full {formatCapacity(batteryHealth?.full_charge_capacity ?? -1)}
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Priority Policy</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Cache & Auto-Apply</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cache Size</div>
            <div className="text-lg font-black text-white">{Object.keys(priorityCache).length}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ignored</div>
            <div className="text-lg font-black text-white">{Object.values(priorityCache).filter((c) => c.ignore).length}</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Default TTL</div>
            <div className="text-lg font-black text-white">{defaultTtlDays}d</div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auto-Apply</div>
            <div className="text-lg font-black text-white">{autoApplyPriorities ? "On" : "Off"}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Storage & Disk Health</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">{(storage ?? []).length} volumes</span>
          </div>
          <div className="space-y-3">
            {(storage ?? []).length === 0 && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-500">
                Storage map unavailable.
              </div>
            )}
            {(storage ?? []).map((disk) => {
              const used = disk.total - disk.available;
              const usedPct = disk.total > 0 ? (used / disk.total) * 100 : 0;
              return (
                <div key={`${disk.name}-${disk.mount}`} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-[11px] font-bold text-white">{disk.name}</div>
                      <div className="text-[9px] font-mono text-slate-500">{disk.mount}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-300">{formatBytes(used)} / {formatBytes(disk.total)}</div>
                      <div className={cn("text-[9px] font-black", disk.health_score < 10 ? "text-rose-500" : disk.health_score < 25 ? "text-amber-400" : "text-emerald-400")}>
                        {(disk.health_score ?? 0).toFixed(0)}% free
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-indigo-500/80" style={{ width: `${Math.min(100, usedPct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Usb className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">System Devices</span>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
              <span>{(devices ?? []).length} signals</span>
              {avgTemp !== null && <span>Thermal Avg {(avgTemp ?? 0).toFixed(1)}°C</span>}
            </div>
          </div>
          <div className="space-y-3 max-h-52 overflow-y-auto custom-scrollbar">
            {(devices ?? []).length === 0 && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-500">
                Device telemetry unavailable.
              </div>
            )}
            {(devices ?? []).map((dev, i) => (
              <div key={`${dev.kind}-${dev.name}-${i}`} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-white">{dev.name}</div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase">{dev.kind}</div>
                  </div>
                  <div className="text-[10px] text-slate-400">{dev.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Process Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onReapplyAll} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 flex items-center gap-2">
              <RefreshCcw className="w-3 h-3" /> Reapply All
            </button>
            <button onClick={() => setConfirmAction("reset")} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center gap-2">
              <RotateCcw className="w-3 h-3" /> Reset Priorities
            </button>
            <button onClick={() => setConfirmAction("reset_clear")} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 flex items-center gap-2 border border-rose-500/20">
              <RotateCcw className="w-3 h-3" /> Reset + Clear Cache
            </button>
            <button onClick={onClearAllCache} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center gap-2">
              <Trash2 className="w-3 h-3" /> Clear Cache
            </button>
            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <input
                type="checkbox"
                checked={ignoreAll}
                onChange={(e) => {
                  setIgnoreAll(e.target.checked);
                  onToggleIgnoreAll(e.target.checked);
                }}
                className="accent-indigo-500"
              />
              Ignore All
            </label>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] text-slate-200"
              >
                <option value="all">All</option>
                <option value="high_cpu">High CPU</option>
                <option value="high_mem">High Mem</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none text-[10px] text-slate-200"
              >
                <option value="cpu">CPU</option>
                <option value="mem">RAM</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
                className="text-[9px] font-bold text-slate-300"
              >
                {sortDir === "asc" ? "ASC" : "DESC"}
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/PID"
              className="w-40 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-slate-500"
            />
            <input
              value={pidInput}
              onChange={(e) => setPidInput(e.target.value)}
              placeholder="PID"
              className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-slate-500"
            />
            <select
              value={pidAction}
              onChange={(e) => setPidAction(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-200"
            >
              <option value="pause">Pause</option>
              <option value="resume">Resume</option>
              <option value="low">Priority Low</option>
              <option value="high">Priority High</option>
              <option value="normal">Priority Normal</option>
              <option value="kill">Kill</option>
            </select>
            <button
              onClick={runPidAction}
              className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200"
            >
              Execute
            </button>
          </div>
        </div>

        <div
          ref={processListRef}
          onScroll={(e) => setProcessScrollTop(e.currentTarget.scrollTop)}
          className="max-h-72 overflow-y-auto custom-scrollbar relative"
        >
          {visibleProcesses.length === 0 && (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-500">
              No matching processes.
            </div>
          )}
          {visibleProcesses.length > 0 && (() => {
            const rowHeight = 170;
            const overscan = 5;
            const totalHeight = visibleProcesses.length * rowHeight;
            const startIndex = Math.max(0, Math.floor(processScrollTop / rowHeight) - overscan);
            const endIndex = Math.min(visibleProcesses.length, Math.ceil((processScrollTop + (processListHeight || 280)) / rowHeight) + overscan);
            const windowed = visibleProcesses.slice(startIndex, endIndex);
            return (
              <div className="relative" style={{ height: totalHeight }}>
                {windowed.map((proc, idx) => {
                  const absoluteIndex = startIndex + idx;
                  return (
                    <div
                      key={proc.pid}
                      style={{ position: "absolute", top: absoluteIndex * rowHeight, left: 0, right: 0, height: rowHeight }}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative"
                      onMouseEnter={() => sparklinesEnabled && setHoverPid(proc.pid)}
                      onMouseLeave={() => sparklinesEnabled && setHoverPid((prev) => (prev === proc.pid ? null : prev))}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-white truncate">{proc.name}</div>
                          <div className="text-[9px] font-mono text-slate-500">
                            PID {proc.pid} ? <span className={statusClass(proc.status)}>{proc.status}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-slate-300">{(proc.cpu_usage ?? 0).toFixed(1)}% CPU</div>
                          <div className="text-[9px] text-slate-500">{((proc.mem_usage ?? 0) / 1024 / 1024).toFixed(1)} MB</div>
                          <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                            {processPriorities[proc.pid] || "Normal"}
                          </div>
                          <div className="text-[8px] font-mono text-slate-500">
                            Source: {priorityCache[proc.name]?.source || "Manual"} ? Last {formatTime(priorityCache[proc.name]?.lastApplied || 0)}
                          </div>
                        </div>
                      </div>
                      {sparklinesEnabled && hoverPid === proc.pid && (
                        <div className="absolute top-3 right-3 p-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
                          <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">CPU / RAM</div>
                          <div className="flex items-center gap-3">
                            <svg width="80" height="24" className="overflow-visible">
                              <polyline
                                fill="none"
                                stroke="#34d399"
                                strokeWidth="1.5"
                                points={sparkPoints(sparkValues(Math.min(100, proc.cpu_usage), proc.pid))}
                              />
                            </svg>
                            <svg width="80" height="24" className="overflow-visible">
                              <polyline
                                fill="none"
                                stroke="#60a5fa"
                                strokeWidth="1.5"
                                points={sparkPoints(sparkValues(Math.min(100, Math.log10((proc.mem_usage / 1024 / 1024) + 1) * 20), proc.pid + 17))}
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <select
                          value={normalizePriority(processPriorities[proc.pid] || "NORMAL")}
                          onChange={(e) => onSetPriority(proc.pid, e.target.value)}
                          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        >
                          <option value="normal">Priority Normal</option>
                          <option value="low">Priority Low</option>
                          <option value="high">Priority High</option>
                        </select>
                        <select
                          value={(priorityCache[proc.name]?.ttlDays ?? defaultTtlDays).toString()}
                          onChange={(e) => onSetProcessTtl(proc.name, parseInt(e.target.value, 10))}
                          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        >
                          <option value="1">TTL 1d</option>
                          <option value="3">TTL 3d</option>
                          <option value="7">TTL 7d</option>
                          <option value="14">TTL 14d</option>
                          <option value="30">TTL 30d</option>
                        </select>
                        <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                          <input
                            type="checkbox"
                            checked={!!priorityCache[proc.name]?.ignore}
                            onChange={(e) => onToggleIgnoreProcess(proc.name, e.target.checked)}
                            className="accent-indigo-500"
                          />
                          Ignore Auto
                        </label>
                        <button
                          onClick={() => onClearCacheReset(proc.pid, proc.name)}
                          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                        >
                          Clear Cache & Reset
                        </button>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            if (val === "pause") onSuspendProcess(proc.pid);
                            if (val === "resume") onResumeProcess(proc.pid);
                            if (val === "kill") onKillProcess(proc.pid);
                            e.currentTarget.value = "";
                          }}
                          defaultValue=""
                          className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        >
                          <option value="">Quick Action</option>
                          <option value="pause">Pause</option>
                          <option value="resume">Resume</option>
                          <option value="kill">Kill</option>
                        </select>
                        <button onClick={() => onSuspendProcess(proc.pid)} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-2">
                          <Pause className="w-3 h-3" /> Pause
                        </button>
                        <button onClick={() => onResumeProcess(proc.pid)} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-2">
                          <Play className="w-3 h-3" /> Resume
                        </button>
                        <button onClick={() => onKillProcess(proc.pid)} className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center gap-2">
                          <Skull className="w-3 h-3" /> Kill
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Audit Log</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                placeholder="Search name/PID"
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-white placeholder:text-slate-500"
              />
              <input
                type="date"
                value={auditFrom}
                onChange={(e) => setAuditFrom(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-slate-200"
              />
              <input
                type="date"
                value={auditTo}
                onChange={(e) => setAuditTo(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-slate-200"
              />
              <select
                value={auditPageSize}
                onChange={(e) => setAuditPageSize(parseInt(e.target.value, 10))}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-slate-200"
              >
                <option value="8">8 / page</option>
                <option value="16">16 / page</option>
                <option value="32">32 / page</option>
              </select>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-slate-200"
              >
                <option value="all">All</option>
                <option value="manual">Manual</option>
                <option value="auto-applied">Auto-Applied</option>
                <option value="reset">Reset</option>
              </select>
              <button
                onClick={() => onExportAudit("json", exportColumns, auditFilter)}
                className="px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
              >
                JSON
              </button>
              <button
                onClick={() => onExportAudit("csv", exportColumns, auditFilter)}
                className="px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[9px] text-slate-400 mb-3">
            {DEFAULT_COLUMNS.map((col) => (
              <label key={col} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  checked={exportColumns.includes(col)}
                  onChange={() => toggleColumn(col)}
                  className="accent-indigo-500"
                />
                {col.toUpperCase()}
              </label>
            ))}
            <div className="ml-auto flex items-center gap-2 text-[9px] text-slate-400">
              <button
                onClick={() => setAuditPage(Math.max(0, auditPageSafe - 1))}
                disabled={auditPageSafe === 0}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-mono">Page {auditPageSafe + 1} / {totalAuditPages}</span>
              <button
                onClick={() => setAuditPage(Math.min(totalAuditPages - 1, auditPageSafe + 1))}
                disabled={auditPageSafe >= totalAuditPages - 1}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {((filteredAudit ?? [])).length === 0 && (
              <div className="text-[10px] text-slate-500">No priority changes yet.</div>
            )}
            {(filteredAudit ?? [])
              .slice(auditPageSafe * auditPageSize, auditPageSafe * auditPageSize + auditPageSize)
              .map((entry, index) => (
                <div key={`${entry.id ?? entry.pid ?? "audit"}-${index}`} className="flex items-center justify-between text-[10px] text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                  <div className="truncate">
                    <span className="font-bold text-white/80">{entry.name}</span> ? PID {entry.pid}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-400 font-bold">{entry.priority}</span>
                    <span className={cn("uppercase font-black", entry.source === "Auto-Applied" ? "text-amber-400" : entry.source === "Reset" ? "text-rose-400" : "text-emerald-400")}>
                      {entry.source}
                    </span>
                    <span className="text-slate-500">{formatTime(entry.time)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Running Windows</span>
            <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full">
              {(windows ?? []).length}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Live Process Surface</span>
        </div>

        <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-3">
          {(windows ?? []).length === 0 && (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-500">
              No visible windows detected.
            </div>
          )}
          {(windows ?? []).map((win) => (
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
{confirmAction && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 backdrop-blur-3xl">
          <div className="w-full max-w-lg glass-bright rounded-[2rem] p-10 border border-white/10 shadow-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">System Confirmation</div>
                <h3 className="text-2xl font-black text-white tracking-tight">Priority Reset</h3>
              </div>
              <button onClick={() => { setConfirmAction(null); onClearExternalConfirm?.(); }} className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/10">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-8">
              {confirmAction === "reset"
                ? "Reset priorities for all active processes? This can disrupt performance-sensitive workloads."
                : "Reset priorities and clear the cache for all active processes? This cannot be undone."}
            </p>
            <div className="flex items-center gap-4 justify-end">
              <button
                onClick={() => { setConfirmAction(null); onClearExternalConfirm?.(); }}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction === "reset") onResetAllPriorities();
                  if (confirmAction === "reset_clear") onResetAllPrioritiesAndClear();
                  setConfirmAction(null);
                  onClearExternalConfirm?.();
                }}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
