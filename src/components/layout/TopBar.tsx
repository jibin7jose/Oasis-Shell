import { Shield, Mic, MicOff, Eye, Terminal, LayoutDashboard, Globe, Camera } from "lucide-react";
import { OracleHub } from "../shared/OracleHub";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ContextItem {
  id: string;
  name: string;
}

interface FiscalBurn {
  total_burn: number;
  token_load: number;
  status: string;
}

interface GolemTask {
  id: string;
  name: string;
  status: string;
  progress: number;
  aura: string;
}

interface TopBarProps {
  activeVenture: string;
  activeContext: string;
  systemStats: any;
  contexts: ContextItem[];
  golems: GolemTask[];
  zenMode: boolean;
  voiceActive: boolean;
  visionActive: boolean;
  autoAura: boolean;
  ventureIntegrity: number;
  fiscalBurn: FiscalBurn;
  hardwareStatus: any;
  displayedMarket: any;
  lastSync: string;
  presentationMode: boolean;
  performanceMode: boolean;
  onOpenVault: () => void;
  onVoiceIntent: () => void;
  onToggleVision: () => void;
  onToggleZen: () => void;
  onToggleCLI: () => void;
  onTogglePresentation: () => void;
  onToggleNetwork: () => void;
  onToggleAutoAura: () => void;
  onAegisSync: () => void;
  onOpenNexus: () => void;
  onDeepLink?: (target: string) => void;
}

export default function TopBar({
  activeVenture,
  activeContext,
  systemStats,
  contexts,
  golems,
  zenMode,
  voiceActive,
  visionActive,
  autoAura,
  ventureIntegrity,
  fiscalBurn,
  hardwareStatus,
  displayedMarket,
  lastSync,
  presentationMode,
  performanceMode,
  onOpenVault,
  onVoiceIntent,
  onToggleVision,
  onToggleZen,
  onToggleCLI,
  onTogglePresentation,
  onToggleNetwork,
  onToggleAutoAura,
  onAegisSync,
  onOpenNexus,
  onDeepLink
}: TopBarProps) {
  return (
    <header className="h-20 w-full flex items-center justify-between px-12 border-b border-white/5 backdrop-blur-xl bg-white/[0.01]">
      <div className="flex items-center gap-12">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Active Aura</span>
          <h1
            className={cn(
              "text-xl font-bold tracking-tight text-white flex items-center gap-6 transition-all"
            )}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full animate-pulse transition-all duration-1000" 
                style={{ backgroundColor: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}
              />
              <span className="uppercase tracking-tighter">{activeVenture}</span>
            </div>

            <div className={cn("flex items-center gap-6 border-l border-white/10 pl-6 h-8 transition-all duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Host Pulse</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-black" style={{ color: 'var(--accent-primary)' }}>{(systemStats?.cpu_load ?? 0).toFixed(1)}% CPU</span>
                  <span className="text-[10px] font-mono text-purple-400 font-black">{(systemStats?.mem_used ?? 0).toFixed(1)}% RAM</span>
                </div>
              </div>

               <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Power Hub</span>
                <div className="flex items-center gap-3">
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/5" />
                      <circle 
                        cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" 
                        strokeDasharray="63" 
                        strokeDashoffset={63 - (63 * Math.max(0, Math.min(100, systemStats?.battery_level ?? 0))) / 100}
                        className={cn("transition-all duration-1000")}
                        style={{ color: systemStats?.is_charging ? '#10b981' : 'var(--accent-primary)' }}
                      />
                    </svg>
                    <span className="absolute text-[7px] font-black text-white">{systemStats?.battery_level ?? "0"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[8px] font-black uppercase leading-none", systemStats?.is_charging ? "text-emerald-400 animate-pulse" : "text-slate-400")}>
                      {systemStats?.is_charging ? "CHG" : "BAT"}
                    </span>
                    <span className="text-[7px] font-mono text-slate-600 mt-0.5">HEALTH {systemStats?.battery_health ?? "--"}%</span>
                  </div>
                </div>
              </div>
            </div>

            <span 
              className="text-[9px] font-mono border px-3 py-1 rounded-lg font-black tracking-widest uppercase"
              style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-glow)', backgroundColor: 'rgba(var(--accent-primary-rgb), 0.05)' }}
            >
              OAS_KRNL_4.5 // SENTINEL CORE // v1.0-STABLE
            </span>

            {performanceMode && (
              <span className="text-[9px] font-black text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg uppercase tracking-widest bg-amber-500/10">
                Performance Mode
              </span>
            )}

            {golems && golems.length > 0 && (
              <div className="flex items-center gap-6 bg-white/[0.03] border border-white/5 px-6 py-2 rounded-2xl ml-8 animate-in fade-in slide-in-from-left-4">
                {golems.map((g, index) => (
                  <div key={`golem-${g.id || g.name || index}`} className="flex items-center gap-4 transition-all group">
                    <div className={cn(
                      "w-2 h-2 rounded-full animate-pulse",
                      g.aura === 'emerald' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" :
                      g.aura === 'amber' ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" :
                      g.aura === 'rose' ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" :
                      "bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                    )} />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{g.name}</span>
                      <div className="flex items-center gap-3">
                         <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${g.progress * 100}%` }}
                              className={cn(
                                "h-full transition-all duration-1000",
                                g.aura === 'emerald' ? "bg-emerald-500" :
                                g.aura === 'amber' ? "bg-amber-500" :
                                g.aura === 'rose' ? "bg-rose-500" : "bg-indigo-500"
                              )} 
                            />
                         </div>
                         <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter truncate max-w-[120px]">{g.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className={cn("ml-8 h-10 border border-white/5 rounded-2xl overflow-hidden hidden lg:flex transition-all duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}>
              <OracleHub />
            </div>


            <button
              onClick={onOpenVault}
              className={cn("ml-8 px-6 py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600/40 transition-all flex items-center gap-3 duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}
            >
              <Shield className="w-4 h-4" /> Sentinel Archive
            </button>
            <button
              onClick={onVoiceIntent}
              className={cn(
                "ml-8 p-2 glass rounded-lg transition-all",
                voiceActive && "scale-125 shadow-[0_0_20px_var(--accent-primary)]"
              )}
              style={{ color: voiceActive ? 'var(--accent-primary)' : '#94a3b8', borderColor: voiceActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.1)' }}
            >
              {voiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleVision}
              className={cn(
                "ml-4 p-2 glass rounded-lg transition-all",
                visionActive
                  ? "text-rose-400 scale-125 border-rose-500/50 shadow-[0_0_20px_#f43f5e]"
                  : "text-slate-400"
              )}
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleZen}
              className={cn(
                "ml-4 p-2 glass rounded-lg transition-all",
                zenMode && "scale-125"
              )}
              style={{ color: zenMode ? 'var(--accent-primary)' : '#94a3b8', borderColor: zenMode ? 'var(--accent-glow)' : 'rgba(255,255,255,0.1)' }}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCLI}
              className={cn("ml-4 p-2 glass rounded-lg text-emerald-400 group relative", zenMode && "opacity-0 scale-90")}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-emerald-600 text-[9px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Oasis Shell (CLI)
              </span>
            </button>
            <button
              onClick={onTogglePresentation}
              className={cn(
                "ml-4 p-2 glass rounded-lg transition-all duration-700",
                presentationMode ? "text-amber-400 scale-125 border-amber-500/50" : "text-slate-400",
                zenMode && "opacity-0 translate-y-[-10px] pointer-events-none"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button 
              onClick={onToggleNetwork} 
              className={cn("ml-4 p-2 glass rounded-lg group relative transition-all duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}
              style={{ color: 'var(--accent-primary)' }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span 
                className="absolute left-full ml-3 px-3 py-1.5 text-[9px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Venture Network Registry
              </span>
            </button>
            <div className="ml-12 flex items-center gap-8 border-l border-white/5 pl-12 h-14">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aura Sync</span>
                  <div
                    onClick={onToggleAutoAura}
                    className={cn(
                      "w-10 h-5 rounded-full p-1 cursor-pointer transition-all border shadow-inner",
                      autoAura ? "border-white/20" : "bg-white/5 border-white/10"
                    )}
                    style={{ backgroundColor: autoAura ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-3 h-3 rounded-full bg-white shadow-xl transition-transform" style={{ transform: `translateX(${autoAura ? 20 : 0}px)` }} />
                  </div>
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter opacity-40">WLED Bridge Active</span>
              </div>
            </div>

            <div className="ml-12 flex items-center gap-4 border-l border-white/5 pl-12 hidden xl:flex">
              <div className="flex flex-col items-end mr-4">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Foundry Reactor</span>
                <span
                  className={cn(
                    "text-[8px] font-black uppercase tracking-widest",
                    ventureIntegrity < 50 ? "text-red-500" : ventureIntegrity < 80 ? "text-amber-500" : "text-emerald-500"
                  )}
                >
                  {ventureIntegrity < 50 ? "Integrity Critical" : ventureIntegrity < 80 ? "Integrity Divergent" : "Nominal Stability"}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`integrity-bar-${ventureIntegrity}-${i}`}
                    className={cn(
                      "w-2 h-4 rounded-[1px]",
                      i < Math.ceil((ventureIntegrity ?? 0) / 12.5)
                        ? (ventureIntegrity ?? 0) < 40
                          ? "bg-red-500"
                          : (ventureIntegrity ?? 0) < 80
                          ? "bg-amber-500"
                          : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                        : "bg-white/5"
                    )}
                    style={{ opacity: i < Math.ceil(ventureIntegrity / 12.5) ? 1 : 0.2 }}
                  />
                ))}
              </div>
            </div>

            <div className="ml-8 flex items-center gap-4 border-l border-white/5 pl-8 hidden lg:flex">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Fiscal Burn</span>
                <span
                  className={cn(
                    "text-[10px] font-black tracking-tight",
                    fiscalBurn.status === "CRITICAL" ? "text-red-500" : fiscalBurn.status === "HIGH" ? "text-amber-500" : "text-emerald-500"
                  )}
                >
                  ${(fiscalBurn?.total_burn ?? 0).toFixed(2)}
                </span>
              </div>
              <span className="text-[7px] font-mono text-slate-600 bg-white/5 px-2 py-1 rounded">
                {((fiscalBurn?.token_load ?? 0) / 1000).toFixed(1)}K TOKENS
              </span>
            </div>
            {hardwareStatus && (
              <span className="ml-4 text-[8px] font-black text-red-500/40 uppercase tracking-[0.25em] animate-pulse border-l border-white/5 pl-4">
                {hardwareStatus.focus_mode}
              </span>
            )}
          </h1>
        </div>

        <div className="h-8 w-[1px] bg-white/5 hidden md:block" />
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={onAegisSync}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Shield className="w-4 h-4" /> Aegis Sync
        </button>
        <button
          onClick={onOpenNexus}
          className="px-6 py-2.5 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg"
          style={{ backgroundColor: 'var(--accent-primary)', boxShadow: '0 10px 20px -5px var(--accent-glow)' }}
        >
          Nexus View
        </button>
      </div>
    </header>
  );
}
