import { Shield, Mic, MicOff, Eye, Terminal, LayoutDashboard, Globe } from "lucide-react";
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
  autoAura: boolean;
  ventureIntegrity: number;
  fiscalBurn: FiscalBurn;
  hardwareStatus: any;
  displayedMarket: any;
  lastSync: string;
  presentationMode: boolean;
  performanceMode: boolean;
  onOpenSentinel: () => void;
  onVoiceIntent: () => void;
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
  autoAura,
  ventureIntegrity,
  fiscalBurn,
  hardwareStatus,
  displayedMarket,
  lastSync,
  presentationMode,
  performanceMode,
  onOpenSentinel,
  onVoiceIntent,
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
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]" />
              <span className="uppercase tracking-tighter">{activeVenture}</span>
            </div>

            <div className={cn("flex items-center gap-6 border-l border-white/10 pl-6 h-8 transition-all duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Host Pulse</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-indigo-400 font-black">{systemStats? systemStats.cpu_load.toFixed(1) : "0.0"}% CPU</span>
                  <span className="text-[10px] font-mono text-purple-400 font-black">{systemStats? systemStats.mem_used.toFixed(1) : "0.0"}% RAM</span>
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
                        className={cn("transition-all duration-1000", systemStats?.is_charging ? "text-emerald-400" : "text-indigo-400")}
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

            <span className="text-[9px] font-mono text-indigo-500/50 border border-indigo-500/20 px-3 py-1 rounded-lg font-black tracking-widest uppercase bg-indigo-500/5">
              OAS_KRNL_4.5 // SENTINEL CORE
            </span>

            {performanceMode && (
              <span className="text-[9px] font-black text-amber-300 border border-amber-500/40 px-3 py-1 rounded-lg uppercase tracking-widest bg-amber-500/10">
                Performance Mode
              </span>
            )}

            {golems && golems.length > 0 && (
              <div className="flex items-center gap-6 bg-white/[0.03] border border-white/5 px-6 py-2 rounded-2xl ml-8 animate-in fade-in slide-in-from-left-4">
                {golems.map(g => (
                  <div key={g.id} className="flex items-center gap-4 transition-all group">
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
            
            <div className={cn("flex items-center gap-6 bg-white/[0.03] border border-white/5 px-6 py-2 rounded-2xl ml-8 hidden lg:flex animate-in fade-in slide-in-from-left-4 transition-all duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}>
              <div className="flex flex-col items-start mr-4">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Foundry Market Registry</span>
                 <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-black font-mono tracking-tighter", (displayedMarket?.market_index || 0) > 140 ? "text-emerald-500" : "text-rose-500")}>
                      {(displayedMarket?.market_index || 0).toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-600 font-bold tracking-tighter">{displayedMarket?.index_change}</span>
                 </div>
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="flex items-center gap-8 pl-2">
                 {(displayedMarket?.ai_ticker || []).map((t: any) => (
                    <div 
                      key={t.id} 
                      onClick={() => onDeepLink && onDeepLink(t.name)}
                      className="flex flex-col cursor-pointer hover:scale-110 transition-all duration-300"
                    >
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">{t.id}</span>
                          <span className={cn("text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded-sm", t.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : t.color === 'rose' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400')}>
                            {t.change}
                          </span>
                       </div>
                       <span className="text-[9px] font-mono font-bold text-slate-400 tracking-tighter">${t.price?.toFixed(1)}</span>
                    </div>
                 ))}
              </div>
            </div>
            <button
              onClick={onOpenSentinel}
              className={cn("ml-8 px-6 py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600/40 transition-all flex items-center gap-3 duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}
            >
              <Shield className="w-4 h-4" /> Sentinel Archive
            </button>
            <button
              onClick={onVoiceIntent}
              className={cn(
                "ml-8 p-2 glass rounded-lg transition-all",
                voiceActive
                  ? "text-indigo-400 scale-125 border-indigo-500/50 shadow-[0_0_20px_#6366f1]"
                  : "text-slate-400"
              )}
            >
              {voiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleZen}
              className={cn(
                "ml-4 p-2 glass rounded-lg transition-all",
                zenMode ? "text-indigo-400 scale-125 border-indigo-500/50" : "text-slate-400"
              )}
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
            <button onClick={onToggleNetwork} className={cn("ml-4 p-2 glass rounded-lg text-indigo-400 group relative transition-all duration-700", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}>
              <Globe className="w-3.5 h-3.5" />
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-indigo-600 text-[9px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
                      "w-10 h-5 rounded-full p-1 cursor-pointer transition-all border border-white/10 shadow-inner",
                      autoAura ? "bg-indigo-600 border-indigo-500/50" : "bg-white/5"
                    )}
                  >
                    <div className="w-3 h-3 rounded-full bg-white shadow-xl" style={{ transform: `translateX(${autoAura ? 20 : 0}px)` }} />
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
                    key={i}
                    className={cn(
                      "w-2 h-4 rounded-[1px]",
                      i < Math.ceil(ventureIntegrity / 12.5)
                        ? ventureIntegrity < 40
                          ? "bg-red-500"
                          : ventureIntegrity < 80
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
                  ${fiscalBurn.total_burn.toFixed(2)}
                </span>
              </div>
              <span className="text-[7px] font-mono text-slate-600 bg-white/5 px-2 py-1 rounded">
                {(fiscalBurn.token_load / 1000).toFixed(1)}K TOKENS
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
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          Nexus View
        </button>
      </div>
    </header>
  );
}
