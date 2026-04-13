import { Bot, LayoutDashboard, BrainCircuit, FolderOpen, Activity, Zap, Settings, Cpu, Shield, History, ShieldCheck, Book, Camera, MessageSquareQuote, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface LeftRailProps {
  presentationMode: boolean;
  simMode: boolean;
  performanceMode: boolean;
  activeView: string;
  onViewChange: (view: string) => void;
  onDash: () => void;
  onOpenGraph: () => void;
  onOpenVault: () => void;
  onOpenLogs: () => void;
  onActivateSim: () => void;
  onToggleSim: () => void;
  onOpenSettings: () => void;
  onOpenDocs: () => void;
  onOpenBoardroom: () => void;
  onOpenWorkforce: () => void;
  onSnapshot: () => void;
  proposalCount: number;
  chronosIndex: number;
  chronosCount: number;
  chronosLabel?: string;
  onChronosChange: (index: number) => void;
  onJumpToPresent: () => void;
  pinnedContexts: any[];
  onRestoreContext: (pin: any) => void;
  onActivateZenith: () => void;
  className?: string;
}

export default function LeftRail({
  presentationMode,
  simMode,
  performanceMode,
  activeView,
  onViewChange,
  onDash,
  onOpenGraph,
  onOpenVault,
  onOpenLogs,
  onActivateSim,
  onToggleSim,
  onOpenSettings,
  onOpenDocs,
  onOpenBoardroom,
  onOpenWorkforce,
  onSnapshot,
  chronosIndex,
  chronosCount,
  chronosLabel,
  onChronosChange,
  onJumpToPresent,
  pinnedContexts,
  onRestoreContext,
  onActivateZenith,
  proposalCount,
  className
}: LeftRailProps) {
  if (presentationMode) return null;

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn("relative z-50 w-24 h-screen glass border-r border-white/5 flex flex-col items-center py-10 transition-all duration-700", className)}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group cursor-pointer hover:scale-110 transition-transform mb-3">
        <Bot className="w-7 h-7 text-white" />
      </div>
      {performanceMode && (
        <div className="mt-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[8px] font-black uppercase tracking-widest text-amber-300">
          Perf Mode
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-6 items-center">
        {[
          { id: "dash", icon: LayoutDashboard, label: "Dash", action: () => onViewChange("dash") },
          { id: "processes", icon: Cpu, label: "Nodes", action: () => onViewChange("processes") },
          { id: "storage", icon: Shield, label: "Disk", action: () => onViewChange("storage") },
          { id: "timeline", icon: History, label: "Timeline", action: () => onViewChange("timeline") },
          { id: "graph", icon: BrainCircuit, label: "Cortex", action: onOpenGraph },
          { id: "vault", icon: FolderOpen, label: "Vault", action: onOpenVault },
          { id: 'boardroom', icon: MessageSquareQuote, label: 'Strategic Consensus', action: onOpenBoardroom },
          { id: 'workforce', icon: Users, label: 'Neural Workforce', action: onOpenWorkforce },
          { id: 'logs', icon: Activity, label: 'Temporal Logs', action: onOpenLogs },
          { id: "zenith", icon: ShieldCheck, label: "Focus", action: onActivateZenith },
        ].map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            aria-label={item.label}
            className={cn(
              "p-4 rounded-2xl transition-all group relative",
              activeView === item.id
                ? "bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-6 h-6" />
            {item.id === 'workforce' && proposalCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg border-2 border-[#020617]"
              >
                {proposalCount}
              </motion.div>
            )}
            <span className="absolute left-full ml-4 px-3 py-1 glass rounded-lg text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-6 items-center mt-auto">
        <button
          onClick={onToggleSim}
          aria-label="Toggle Simulation Matrix"
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
            simMode
              ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
          )}
        >
          <Zap className={cn("w-6 h-6", simMode && "animate-pulse")} />
        </button>

        <div className="absolute right-8 bottom-8 flex flex-col items-end gap-3 z-30 transition-all">
          {chronosIndex < chronosCount - 1 && (
            <button
              onClick={onJumpToPresent}
              aria-label="Jump to Present"
              className="px-4 py-2 bg-indigo-600/40 hover:bg-indigo-600 text-[10px] font-black text-white rounded-xl border border-indigo-500/30 animate-pulse"
            >
              JUMP TO PRESENT →
            </button>
          )}
          <button
            onClick={onSnapshot}
            aria-label="Manifest Strategic Snapshot"
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-[10px] font-black text-emerald-400 hover:text-white rounded-xl border border-emerald-500/20 transition-all flex items-center gap-2 group"
          >
            <Camera className="w-3 h-3 group-hover:scale-125 transition-transform" />
            MANIFEST SNAPSHOT
          </button>
          {chronosCount > 0 && (
            <div className="flex flex-col items-end gap-2 p-4 glass rounded-2xl border-white/5">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">
                Neural Chronos Scrubber
              </span>
              <input
                type="range"
                min="0"
                max={Math.max(0, chronosCount - 1)}
                value={chronosIndex}
                onChange={(e) => onChronosChange(parseInt(e.target.value, 10))}
                className="w-64 accent-indigo-500"
              />
              <span className="text-[9px] font-mono text-indigo-400/60 uppercase">
                {chronosLabel || (chronosIndex >= 0 ? `L_${chronosIndex}` : "Present")}
              </span>
            </div>
          )}

          {pinnedContexts.length > 0 && (
            <div className="flex flex-col items-center gap-4 py-8 border-t border-white/5 w-full">
              <span className="text-[8px] font-black text-indigo-500/40 uppercase tracking-[0.4em] mb-2">Saved Contexts</span>
              {pinnedContexts.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => onRestoreContext(pin)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all border group relative",
                    pin.aura_color === 'emerald' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    pin.aura_color === 'rose' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                    "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  )}
                >
                  <Activity className="w-5 h-5" />
                  <span className="absolute left-full ml-4 px-3 py-2 glass rounded-xl text-[9px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100] shadow-2xl">
                    {pin.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={onOpenBoardroom} aria-label="Boardroom Debate" className="p-4 text-slate-500 hover:text-indigo-400 transition-all group relative">
          <MessageSquareQuote className="w-6 h-6" />
          <span className="absolute left-full ml-4 px-3 py-1 glass rounded-lg text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]">
            Boardroom Debate
          </span>
        </button>

        <button onClick={onOpenDocs} aria-label="System Manual" className="p-4 text-slate-500 hover:text-indigo-400 transition-all group relative">
          <MessageSquareQuote className="w-6 h-6" />
          <span className="absolute left-full ml-4 px-3 py-1 glass rounded-lg text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]">
            System Manual
          </span>
        </button>

        <button onClick={onOpenSettings} aria-label="Open System Settings" className="p-4 text-slate-500 hover:text-white transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </motion.aside>
  );
}
