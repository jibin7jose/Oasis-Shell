import { Shield, Mic, MicOff, Eye, Terminal, LayoutDashboard, Globe, Camera, Search } from "lucide-react";
import { OracleHub } from "../shared/OracleHub";
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useSystemStore } from '../../lib/systemStore';
import { invokeSafe } from '../../lib/tauri';

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

export default function TopBar() {
  const { 
    setShowVault, showPalette, setShowPalette, showNexus, setShowNexus,
    showSettings, setShowSettings, setNotification,
    showRealTerminal, setShowRealTerminal
  } = useSystemStore();

  const [systemStats, setSystemStats] = useState<any>(null);
  const [golems, setGolems] = useState<GolemTask[]>([]);
  const [zenMode, setZenMode] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [visionActive, setVisionActive] = useState(false);
  const [autoAura, setAutoAura] = useState(true);

  // Mock static values for now, can be hooked up to backend later
  const activeVenture = "Oasis OS";
  const ventureIntegrity = 100;
  const fiscalBurn = { total_burn: 0, token_load: 0, status: "NOMINAL" };
  const hardwareStatus: any = null;
  const performanceMode = false;
  const presentationMode = false;

  useEffect(() => {
    let unlisten: () => void;
    
    // Initial fetch
    invokeSafe("get_hardware_telemetry").then((stats: any) => {
      if (stats) {
        setSystemStats({
          cpu_load: stats?.cpu_usage || 0,
          mem_used: stats?.ram_usage || 0,
          battery_level: stats?.battery_percent || 100,
          is_charging: stats?.is_charging ?? true,
          battery_health: 100
        });
      }
    });

    import("@tauri-apps/api/event").then(({ listen }) => {
      listen("oasis-hardware-telemetry", (event: any) => {
        const stats = event.payload;
        setSystemStats({
          cpu_load: stats?.cpu_usage || 0,
          mem_used: stats?.ram_usage || 0,
          battery_level: stats?.battery_percent || 100,
          is_charging: stats?.is_charging ?? true,
          battery_health: 100
        });
      }).then(u => { unlisten = u; });
    });

    return () => { if (unlisten) unlisten(); };
  }, []);

  return (
    <header className="h-20 w-full flex items-center justify-between px-12 border-b border-white/5 backdrop-blur-xl bg-white/[0.01]">
      <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0 pr-4 overflow-hidden">
        <div className="flex flex-col shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Active Aura</span>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div 
                className="w-3 h-3 rounded-full animate-pulse transition-all duration-1000" 
                style={{ backgroundColor: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}
              />
              <span className="text-xl font-bold tracking-tight text-white uppercase tracking-tighter">{activeVenture}</span>
            </div>

            <div className={cn("hidden md:flex items-center gap-6 border-l border-white/10 pl-6 h-8 transition-all duration-700 shrink-0", zenMode && "opacity-0 translate-y-[-10px] pointer-events-none")}>
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

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setVoiceActive(!voiceActive)}
                className={cn(
                  "p-2 glass rounded-lg transition-all",
                  voiceActive && "scale-125 shadow-[0_0_20px_var(--accent-primary)]"
                )}
                style={{ color: voiceActive ? 'var(--accent-primary)' : '#94a3b8', borderColor: voiceActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.1)' }}
              >
                {voiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setVisionActive(!visionActive)}
                className={cn(
                  "p-2 glass rounded-lg transition-all",
                  visionActive
                    ? "text-rose-400 scale-125 border-rose-500/50 shadow-[0_0_20px_#f43f5e]"
                    : "text-slate-400"
                )}
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZenMode(!zenMode)}
                className={cn(
                  "p-2 glass rounded-lg transition-all",
                  zenMode && "scale-125"
                )}
                style={{ color: zenMode ? 'var(--accent-primary)' : '#94a3b8', borderColor: zenMode ? 'var(--accent-glow)' : 'rgba(255,255,255,0.1)' }}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowRealTerminal(!showRealTerminal)}
                aria-label="Open Oasis CLI"
                title="Open Oasis CLI"
                className={cn("p-2 glass rounded-lg text-emerald-400 group relative", zenMode && "opacity-0 scale-90")}
              >
                <Terminal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowPalette(!showPalette)}
                aria-label="Open Command Palette"
                title="Open Command Palette"
                className={cn("p-2 glass rounded-lg text-cyan-400 group relative", zenMode && "opacity-0 scale-90")}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-white/5 hidden lg:block" />
      </div>

    </header>
  );
}
