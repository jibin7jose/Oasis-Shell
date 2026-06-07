import { Bot, LayoutDashboard, FolderOpen, Zap, Settings, Cpu, ShieldCheck, HardDrive, Camera, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useSystemStore } from "../../lib/systemStore";
import { useState, useEffect } from "react";

export default function LeftRail({ className }: { className?: string }) {
  const {
    activeView, setActiveView,
    showVault, setShowVault,
    showSettings, setShowSettings,
    showNexus, setShowNexus,
    showGraph, setShowGraph,
    showLogs, setShowLogs,
    showTerminal, setShowTerminal,
  } = useSystemStore();

  const [healthScore, setHealthScore] = useState<number>(100);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/event").then(({ listen }) => {
      listen<number>("oasis-health-score", (e) => setHealthScore(e.payload))
        .then(u => { unlisten = u; });
    });
    return () => { if (unlisten) unlisten(); };
  }, []);

  const healthColor = healthScore >= 75 ? "#10b981"   // emerald
    : healthScore >= 45 ? "#f59e0b"                   // amber
    : "#ef4444";                                       // red

  const circumference = 2 * Math.PI * 14; // r=14

  const navItems = [
    { id: "dash",      icon: LayoutDashboard,  label: "Dashboard",      action: () => setActiveView("dash") },
    { id: "processes", icon: Cpu,               label: "Core Nodes",      action: () => setActiveView("processes") },
    { id: "files",     icon: HardDrive,         label: "File Explorer",   action: () => setActiveView("files") },
    { id: "vault",     icon: FolderOpen,        label: "Sentinel Vault",  action: () => setShowVault(true) },
    { id: "terminal",  icon: TerminalSquare,    label: "Terminal",        action: () => setShowTerminal(!showTerminal) },
    { id: "nexus",     icon: ShieldCheck,       label: "Aegis Nexus",     action: () => setShowNexus(true) },
    { id: "settings",  icon: Settings,          label: "Parameters",      action: () => setShowSettings(true) },
  ];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "relative z-50 w-16 md:w-24 h-screen glass border-r border-white/5 flex flex-col items-center py-6 md:py-10 transition-all duration-700",
        className
      )}
    >
      {/* System Health Score Ring */}
      <div className="relative flex items-center justify-center mb-3 group cursor-pointer" title={`System Health: ${healthScore}%`}>
        <svg width="48" height="48" viewBox="0 0 32 32" className="-rotate-90 transition-all duration-1000">
          {/* Track */}
          <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          {/* Progress arc */}
          <circle
            cx="16" cy="16" r="14" fill="none"
            stroke={healthColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * healthScore) / 100}
            style={{ transition: "stroke-dashoffset 1s ease, stroke 1s ease", filter: `drop-shadow(0 0 4px ${healthColor})` }}
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Bot className="w-4 h-4" style={{ color: healthColor }} />
        </div>
        {/* Tooltip */}
        <span className="absolute left-full ml-4 px-3 py-1 glass rounded-lg text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]"
          style={{ color: healthColor }}>
          Health {healthScore}%
        </span>
      </div>

      {/* Nav icons */}
      <nav className="flex-1 flex flex-col gap-6 items-center w-full py-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              aria-label={item.label}
              className={cn(
                "p-4 rounded-2xl transition-all group relative",
                isActive
                  ? "text-white"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
              style={{
                backgroundColor: isActive ? "rgba(var(--accent-primary-rgb), 0.2)" : "transparent",
                color:           isActive ? "var(--accent-primary)" : "",
                boxShadow:       isActive ? "0 0 15px rgba(var(--accent-primary-rgb), 0.2)" : "none",
              }}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute left-full ml-4 px-3 py-1 glass rounded-lg text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col gap-4 items-center mt-auto">
        {/* Graph toggle */}
        <button
          onClick={() => setShowGraph(!showGraph)}
          aria-label="Strategic Cortex Graph"
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
            showGraph
              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
          )}
        >
          <Zap className={cn("w-6 h-6", showGraph && "animate-pulse")} />
        </button>

        {/* Neural Logs button */}
        <button
          onClick={() => setShowLogs(true)}
          aria-label="View Neural Logs"
          className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-[10px] font-black text-emerald-400 hover:text-white rounded-xl border border-emerald-500/20 transition-all flex items-center gap-2 group"
        >
          <Camera className="w-3 h-3 group-hover:scale-125 transition-transform" />
          <span className="hidden md:inline">LOGS</span>
        </button>
      </div>
    </motion.aside>
  );
}
