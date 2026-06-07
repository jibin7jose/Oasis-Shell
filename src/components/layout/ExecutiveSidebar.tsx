import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  LayoutDashboard, 
  Cpu, 
  BrainCircuit, 
  FolderOpen, 
  Clock, 
  Activity, 
  Zap, 
  Minimize2, 
  Settings 
} from 'lucide-react';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface ExecutiveSidebarProps {
  setShowGraph: (v: boolean) => void;
  setShowVault: (v: boolean) => void;
  setShowLogs: (v: boolean) => void;
  setSimMode: (v: boolean) => void;
  simMode: boolean;
  loadMemories: () => void;
  setShowTimeMachine: (v: boolean) => void;
  handleContextSwitch: (ctx: string) => void;
  toggleWidgetMode: () => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  setShowWorkforce: (v: boolean) => void;
}

export const ExecutiveSidebar: React.FC<ExecutiveSidebarProps> = ({
  setShowGraph,
  setShowVault,
  setShowLogs,
  setSimMode,
  simMode,
  loadMemories,
  setShowTimeMachine,
  handleContextSwitch,
  toggleWidgetMode,
  showSettings,
  setShowSettings,
  setShowWorkforce
}) => {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="relative z-50 w-16 md:w-24 h-screen glass border-r border-white/5 flex flex-col items-center py-6 md:py-10"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group cursor-pointer hover:scale-110 transition-transform mb-12">
        <Bot className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>

      <nav className="flex-1 flex flex-col gap-6 items-center overflow-y-auto custom-scrollbar w-full py-2">
        {[
          { id: 'dash', icon: LayoutDashboard, label: 'Dash' },

          { id: 'vault', icon: FolderOpen, label: 'Vault' },
          { id: 'time', icon: Clock, label: 'Timeline' },
          { id: 'workforce', icon: Cpu, label: 'Workforce' },
          { id: 'logs', icon: Activity, label: 'History' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'graph') setShowGraph(true);
              else if (item.id === 'vault') setShowVault(true);
              else if (item.id === 'logs') setShowLogs(true);
              else if (item.id === 'workforce') setShowWorkforce(true);
              else if (item.id === 'sim') setSimMode(true);
              else if (item.id === 'time') {
                loadMemories();
                setShowTimeMachine(true);
              }
              else { handleContextSwitch('dev'); }
            }}
            className={cn(
              "p-4 rounded-2xl transition-all group relative",
              (item.id === 'sim' && simMode) ? "bg-amber-500/20 text-amber-500" : "text-slate-500 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute left-full ml-4 px-3 py-1 glass rounded-lg text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-6 items-center mt-auto">
        <button
          onClick={() => setSimMode(!simMode)}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
            simMode ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
          )}
        >
          <Zap className={cn("w-6 h-6", simMode && "animate-pulse")} />
        </button>
        <button onClick={toggleWidgetMode} className="p-4 text-slate-500 hover:text-white transition-colors" title="Collapse to HUD Widget">
          <Minimize2 className="w-6 h-6" />
        </button>
        <button onClick={() => setShowSettings(!showSettings)} className="p-4 text-slate-500 hover:text-white transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </motion.aside>
  );
};
