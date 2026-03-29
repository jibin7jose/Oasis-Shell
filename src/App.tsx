import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, Code, Gamepad2, Globe, Settings, Search, Plus, 
  Bot, CheckCircle2, Zap, RefreshCw,
  Shield, Activity, FolderOpen, 
  Terminal, LayoutDashboard, BrainCircuit,
  Command, Clock, Maximize2
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "./lib/utils";
import ForceGraph3D from 'react-force-graph-3d';

const contexts = [
  { id: "dev", name: "Development", icon: Code, color: "blue", aura: "rgba(37, 99, 235, 0.4)" },
  { id: "design", name: "3D Design", icon: LayoutGrid, color: "purple", aura: "rgba(124, 58, 237, 0.4)" },
  { id: "gaming", name: "Gaming", icon: Gamepad2, color: "red", aura: "rgba(220, 38, 38, 0.4)" },
  { id: "research", name: "Market Research", icon: Globe, color: "emerald", aura: "rgba(5, 150, 105, 0.4)" },
];

const getNodeColor = (node: any) => {
  const colors: any = { core: "#3b82f6", capital: "#f59e0b", product: "#8b5cf6", growth: "#10b981" };
  return colors[node.group] || "#6366f1";
};

export default function App() {
  const [activeContext, setActiveContext] = useState("dev");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiHeartbeat] = useState({ ready: true, online: true });
  const [showGraph, setShowGraph] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [windowCount] = useState(12);
  const [logicPath, setLogicPath] = useState("Initializing Pathing...");
  const [autoAcceptSentience, setAutoAcceptSentience] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState("Crates");
  const [assistantInput, setAssistantInput] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", content: "Oasis Neural Link Established." }]);
  const [loadingVision] = useState(false);
  const [founderMetrics, setFounderMetrics] = useState({
    arr: "$0.0M", burn: "$0K/mo", runway: "0 Mo.", momentum: "0%"
  });

  // Sync Foundry Metrics from Rust Kernel with Browser Fallback
  useEffect(() => {
    const syncMetrics = async () => {
      try {
        // Attempt native Tauri bridge
        const metrics = await invoke("get_venture_metrics") as any;
        setFounderMetrics(metrics);
        setLastSync(new Date().toLocaleTimeString());
      } catch (e) {
        // Mock Fallback for Browser Audits
        console.warn("Venture Data Bridge: Native Bridge Unreachable. Initiating Simulation.", e);
        setFounderMetrics({
          arr: "$1.24M",
          burn: "$42.5K/mo",
          runway: "18.4 Mo.",
          momentum: "+12.8%"
        });
        setLastSync(new Date().toLocaleTimeString() + " (Simulated)");
      }
    };
    syncMetrics();
    const interval = setInterval(syncMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => [
    { label: 'Target ARR', value: founderMetrics.arr, trend: founderMetrics.momentum, icon: Zap },
    { label: 'Burn Rate', value: founderMetrics.burn, trend: '-2.1%', icon: Activity },
    { label: 'Venture Runway', value: founderMetrics.runway, trend: 'Stable', icon: Shield },
    { label: 'Market Pulse', value: '124.2K', trend: '+8.4%', icon: Globe },
  ], [founderMetrics]);

  useEffect(() => {
    const paths: any = {
      dev: "Foundry > Deploy > Scale",
      design: "Scene > Strategic Graph > Render",
      gaming: "Performance > Optimize > Mission",
      research: "Market > Analyze > Acquisition"
    };
    setLogicPath(paths[activeContext] || "Idle");
  }, [activeContext]);


  const currentAura = useMemo(() => {
    const ctx = contexts.find(c => c.id === activeContext);
    return ctx?.aura || "rgba(99, 102, 241, 0.4)";
  }, [activeContext]);

  const graphData = useMemo(() => ({
    nodes: [
      { id: "FOUNDRY CORE", group: "core", val: 20 }, 
      { id: "STRATEGIC CAPITAL", group: "capital", val: 12 }, 
      { id: "PRODUCT ROADMAP", group: "product", val: 12 },
      { id: "GROWTH MOMENTUM", group: "growth", val: 12 },
      { id: "SERIES A", group: "capital", val: 8 },
      { id: "MVP BUILD", group: "product", val: 8 },
      { id: "USER TRACTION", group: "growth", val: 8 },
      { id: "TECH STACK", group: "core", val: 8 },
    ], 
    links: [
      { source: "FOUNDRY CORE", target: "STRATEGIC CAPITAL" }, 
      { source: "FOUNDRY CORE", target: "PRODUCT ROADMAP" },
      { source: "FOUNDRY CORE", target: "GROWTH MOMENTUM" },
      { source: "STRATEGIC CAPITAL", target: "SERIES A" },
      { source: "PRODUCT ROADMAP", target: "MVP BUILD" },
      { source: "GROWTH MOMENTUM", target: "USER TRACTION" },
      { source: "FOUNDRY CORE", target: "TECH STACK" }
    ] 
  }), []);

  const handleSearchIntent = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
       setSearchQuery("");
       setMessages(prev => [...prev, { role: "assistant", content: `Neural Intent Recognized: '${searchQuery}'. Executing sync sequence...` }]);
    }
  };

  const handleNeuralSend = () => {
    if (!assistantInput.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: assistantInput }]);
    setAssistantInput("");
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      setMessages(prev => [...prev, { role: "assistant", content: "Executive directive acknowledged. Workspace recalibration initiated." }]);
    }, 1500);
  };

  const handleContextSwitch = (id: string) => {
    setActiveContext(id);
    setLastSync(new Date().toLocaleTimeString());
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden flex selection:bg-indigo-500/30">
      {/* Background Substrate */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ background: (isThinking || loadingVision) ? '#3b82f6' : currentAura, opacity: (isThinking || loadingVision) ? 0.25 : 0.1 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[250px] transition-all duration-1000"
        />
        <motion.div
          animate={{ background: (isThinking || loadingVision) ? '#6366f1' : currentAura, opacity: (isThinking || loadingVision) ? 0.2 : 0.08 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[250px] transition-all duration-1000"
        />
        <div className="absolute inset-0 opacity-[0.03] grayscale invert mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      {/* 3D Nebula Layer */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <ForceGraph3D
          graphData={graphData}
          backgroundColor="#00000000"
          nodeRelSize={6}
          nodeColor={getNodeColor}
          nodeLabel="id"
          linkColor={() => "rgba(99, 102, 241, 0.1)"}
          showNavInfo={false}
        />
      </div>

      {/* Level 9 Executive Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative z-50 w-24 h-screen glass border-r border-white/5 flex flex-col items-center py-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group cursor-pointer hover:scale-110 transition-transform mb-12">
          <Bot className="w-7 h-7 text-white" />
        </div>

        <nav className="flex-1 flex flex-col gap-6 items-center">
          {[
            { id: 'dash', icon: LayoutDashboard, label: 'Dash' },
            { id: 'graph', icon: BrainCircuit, label: 'Cortex' },
            { id: 'vault', icon: FolderOpen, label: 'Vault' },
            { id: 'logs', icon: Activity, label: 'History' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'graph') setShowGraph(true);
                else if (item.id === 'vault') setShowVault(true);
                else { setActiveSettingTab("Neural Logs"); setShowSettings(true); }
              }}
              className="p-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group relative"
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-full ml-4 px-3 py-1 glass rounded-lg text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all border border-white/10 whitespace-nowrap z-[100]">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

          <div className="flex flex-col gap-6 items-center mt-auto">
            <button 
              onClick={() => setAutoAcceptSentience(!autoAcceptSentience)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
                autoAcceptSentience ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
              )}
              title="Auto-Pilot Sentience"
            >
              <Zap className={cn("w-6 h-6", autoAcceptSentience && "animate-pulse")} />
            </button>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", aiHeartbeat.ready ? "bg-emerald-500" : "bg-red-500")} />
            <button onClick={() => setShowSettings(true)} className="p-4 text-slate-500 hover:text-white"><Settings className="w-6 h-6" /></button>
          </div>

      </motion.aside>

      {/* Main Command Stage */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 w-full flex items-center justify-between px-12 border-b border-white/5 backdrop-blur-xl bg-white/[0.01]">
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Active Aura</span>
               <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 {contexts.find(c => c.id === activeContext)?.name} Context
               </h1>
            </div>
            
            <div className="h-8 w-[1px] bg-white/5 hidden md:block" />

            <div className="hidden md:flex flex-col">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Logic Chain</span>
               <span className="text-xs font-mono text-indigo-400/80 tracking-tighter animate-pulse">{logicPath}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {metrics.map((m, i) => (
              <div key={i} className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-white/5 pl-8 first:border-none">
                <m.icon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{m.label}: <span className="text-white">{m.value}</span></span>
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-sm bg-white/5", m.trend.includes('+') ? "text-emerald-400" : "text-amber-400")}>{m.trend}</span>
              </div>
            ))}
            <div className="h-8 w-[1px] bg-white/5 mx-2" />
            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              Neural Sync
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto custom-scrollbar">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="w-full max-w-2xl glass-bright rounded-[2.5rem] p-6 shadow-3xl border border-white/5 hover:border-white/10 transition-all mb-12"
            >
                <div className="flex items-center gap-5 px-4 py-2">
                  <Search className="w-7 h-7 text-indigo-400" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setSearchQuery("")}
                    placeholder="Detecting Neural Intent..."
                    className="bg-transparent border-none outline-none text-2xl w-full text-white placeholder:text-slate-700 font-light"
                  />
                  <kbd className="hidden md:flex bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Ctrl+Space</kbd>
                </div>
            </motion.div>

            {/* Deployment Sentinel Hub */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 className="glass rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] group-hover:bg-indigo-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                        <Terminal className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-lg font-bold tracking-tight text-white">Foundry Pipeline</h3>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">All Systems Nominal</span>
                  </div>

                  <div className="space-y-6">
                     {[
                       { name: 'Edge Cluster', status: 'Deployed', color: 'emerald', progress: 100 },
                       { name: 'Core Stable', status: 'Syncing', color: 'indigo', progress: 65 },
                       { name: 'Stakeholder Preview', status: 'Idle', color: 'slate', progress: 0 }
                     ].map((env) => (
                       <div key={env.name} className="space-y-3">
                          <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                             <span className="text-slate-400">{env.name}</span>
                             <span className={`text-${env.color}-400`}>{env.status}</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${env.progress}%` }} className={`h-full bg-${env.color}-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]`} />
                          </div>
                       </div>
                     ))}
                  </div>

                  <button 
                    onClick={() => invoke('trigger_deploy', { env: 'Core Stable' }).catch(() => alert('Foundry Simulation: Core Deployment Initiated.'))}
                    className="w-full mt-10 py-4 glass-bright border border-white/10 hover:border-indigo-500/50 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  >
                    Trigger Global Deployment
                  </button>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.1 }}
                 className="glass rounded-[2rem] p-8 border border-white/5 flex flex-col justify-between"
               >
                  <div className="flex items-center gap-4 mb-8">
                     <BrainCircuit className="w-6 h-6 text-purple-400" />
                     <h3 className="text-lg font-bold tracking-tight text-white">Strategic Insights</h3>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                        <p className="text-sm text-slate-400 leading-relaxed"><span className="text-indigo-400 font-bold">Oasis Intel:</span> Burn rate is optimized at $42.5K. Runway exceeds 18 months. Recommend accelerating Series A outreach.</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                        <p className="text-sm text-slate-400 leading-relaxed"><span className="text-emerald-400 font-bold">Growth Tip:</span> User momentum is up 12.8%. Strategic Graph nodes suggest expanding 'Tech Stack' investment.</p>
                     </div>
                  </div>
                  
                  <button className="w-full mt-8 py-4 glass text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">
                     View Deep Analytics
                  </button>
               </motion.div>
            </div>

            <div className="mt-16 flex gap-8 pb-12">
              {contexts.map((ctx) => {
                const Icon = ctx.icon;
                const isActive = activeContext === ctx.id;
                return (
                  <motion.button
                    key={ctx.id}
                    onClick={() => { setActiveContext(ctx.id); setLastSync(new Date().toLocaleTimeString()); }}
                    whileHover={{ y: -5 }}
                    className={cn("flex flex-col items-center gap-4 group", isActive ? "opacity-100" : "opacity-30 hover:opacity-100")}
                  >
                    <div className={cn("w-20 h-20 rounded-[1.8rem] flex items-center justify-center border transition-all shadow-2xl", isActive ? "bg-indigo-600 border-white/20 shadow-indigo-500/40" : "glass border-transparent hover:border-white/10")}>
                      <Icon className={cn("w-8 h-8", isActive ? "text-white" : "text-slate-500")} />
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-[0.3em]", isActive ? "text-white" : "text-slate-600")}>{ctx.name}</span>
                  </motion.button>
                );
              })}
            </div>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {showGraph && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl">
             <button onClick={() => setShowGraph(false)} className="absolute top-10 right-10 w-14 h-14 glass rounded-full flex items-center justify-center text-white z-[210]"><Plus className="w-8 h-8 rotate-45" /></button>
             <div className="w-full h-full">
                <ForceGraph3D 
                  graphData={graphData} 
                  backgroundColor="#00000000" 
                  nodeRelSize={10} 
                  nodeColor={getNodeColor}
                  nodeLabel="id"
                  linkColor={() => "rgba(99, 102, 241, 0.3)"}
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Subsystem */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-6 z-[300]">
         <AnimatePresence>
            {showAI && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-96 h-[550px] glass rounded-[2.5rem] border-white/10 shadow-3xl overflow-hidden flex flex-col">
                  <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                     <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Neural Link Stable</span>
                     <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" /></div>
                  </header>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                     {messages.map((m, i) => (
                       <div key={i} className={cn("max-w-[85%] p-4 rounded-2xl text-sm", m.role === 'user' ? "ml-auto bg-indigo-600 text-white" : "mr-auto glass text-slate-300")}>{m.content}</div>
                     ))}
                     {isThinking && <div className="p-4 glass rounded-2xl w-fit animate-pulse tracking-widest text-[10px]">THINKING...</div>}
                  </div>
                  <div className="p-6 bg-black/20">
                     <div className="flex items-center glass rounded-2xl px-5 py-3 border-white/10">
                        <input value={assistantInput} onChange={(e) => setAssistantInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNeuralSend()} placeholder="Pulse Brain..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                        <button onClick={handleNeuralSend} className="text-indigo-400"><Zap size={18} /></button>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
         <button onClick={() => setShowAI(!showAI)} className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
           <Bot className="w-9 h-9" />
         </button>
      </div>
    </div>
  );
}
