import { LayoutDashboard, FolderOpen, Zap, Settings, Cpu, ShieldCheck, HardDrive, Camera, TerminalSquare, Network, ScanSearch, Monitor, PanelBottomClose } from "lucide-react";
import { FalconIcon } from "../icons/FalconIcon";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useSystemStore } from "../../lib/systemStore";
import { useState, useEffect } from "react";

export default function BottomDock({ className }: { className?: string }) {
  const {
    activeView, setActiveView,
    showVault, setShowVault,
    showSettings, setShowSettings,
    showNexus, setShowNexus,
    showGraph, setShowGraph,
    showLogs, setShowLogs,
    showTerminal, setShowTerminal,
    showWorkforce, setShowWorkforce,
    showClickableReality, setShowClickableReality,
    setShowDock
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
    { id: "desktop",   icon: Monitor,          label: "Desktop",        action: () => setActiveView("desktop") },
    { id: "dash",      icon: LayoutDashboard,  label: "Workspaces",     action: () => setActiveView("dash") },
    { id: "workforce", icon: Network,          label: "Neural Workforce",action: () => setShowWorkforce(true) },
    { id: "processes", icon: Cpu,               label: "System Core",      action: () => setActiveView("processes") },
    { id: "clickable", icon: ScanSearch,        label: "Oasis Lens",      action: () => setShowClickableReality(!showClickableReality) },
    { id: "vault",     icon: FolderOpen,        label: "Sentinel Vault",  action: () => setShowVault(true) },
    { id: "terminal",  icon: TerminalSquare,    label: "Terminal",        action: () => setShowTerminal(!showTerminal) },
    { id: "nexus",     icon: ShieldCheck,       label: "Aegis Nexus",     action: () => setShowNexus(true) },
    { id: "settings",  icon: Settings,          label: "Parameters",      action: () => setShowSettings(true) },
  ];

  return (
    <motion.footer
      className={cn(
        "relative z-50 w-full h-16 md:h-20 glass border-t border-white/5 flex flex-row items-center px-6 md:px-10 transition-all duration-700 bg-black/40 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      <div className="relative flex items-center justify-center mr-2 group cursor-pointer" title={`System Health: ${healthScore}%`}>
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
          <FalconIcon className="w-4 h-4" style={{ color: healthColor }} />
        </div>
        {/* Tooltip */}
        <span className="absolute bottom-full mb-4 px-3 py-1 glass rounded-lg text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]"
          style={{ color: healthColor }}>
          Health {healthScore}%
        </span>
      </div>

      <div className="w-[1px] h-8 bg-white/10 mx-2"></div>

      {/* Hide Dock Button (Moved to left) */}
      <button
        onClick={() => setShowDock(false)}
        aria-label="Hide Taskbar"
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-slate-400 hover:bg-red-500/20 hover:text-red-400 mr-4 group"
      >
        <PanelBottomClose className="w-5 h-5 group-hover:scale-90 transition-transform" />
      </button>

      {/* Nav icons - Centered */}
      <nav className="flex-1 flex flex-row gap-2 md:gap-4 justify-center items-center h-full">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              onDragEnter={(e) => {
                if (item.id === 'terminal' && !showTerminal) {
                  item.action();
                }
              }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              aria-label={item.label}
              className={cn(
                "p-3 md:p-4 rounded-2xl transition-all group relative hover:-translate-y-2",
                isActive
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              style={{
                backgroundColor: isActive ? "rgba(var(--accent-primary-rgb), 0.2)" : "transparent",
                color:           isActive ? "var(--accent-primary)" : "",
                boxShadow:       isActive ? "0 0 15px rgba(var(--accent-primary-rgb), 0.2)" : "none",
              }}
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1 glass rounded-lg text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions (now right side actions) */}
      <div className="flex flex-row gap-4 items-center ml-6">
        {/* Graph toggle */}
        <button
          onClick={() => setShowGraph(!showGraph)}
          aria-label="Strategic Cortex Graph"
          className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all border hover:-translate-y-1",
            showGraph
              ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
          )}
        >
          <Zap className={cn("w-5 h-5 md:w-6 md:h-6", showGraph && "animate-pulse")} />
        </button>

        {/* Neural Logs button */}
        <button
          onClick={() => setShowLogs(true)}
          aria-label="View Neural Logs"
          className="px-3 py-2 md:px-4 md:py-3 bg-emerald-600/20 hover:bg-emerald-600 text-[10px] md:text-xs font-black text-emerald-400 hover:text-white rounded-xl border border-emerald-500/20 transition-all flex items-center gap-2 group hover:-translate-y-1 shadow-[0_0_15px_rgba(16,185,129,0.1)] mr-2"
        >
          <Camera className="w-4 h-4 group-hover:scale-125 transition-transform" />
          <span className="hidden lg:inline">LOGS</span>
        </button>
      </div>
    </motion.footer>
  );
}
