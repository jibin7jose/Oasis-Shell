import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Search, LayoutDashboard, BrainCircuit, FolderOpen, 
  Activity, Settings, Zap, Shield, Terminal, 
  Plus, Activity as PulseIcon, AlertCircle, X, ShieldCheck,
  Globe, Cpu
} from "lucide-react";
import ForceGraph3D from "react-force-graph-3d";

// Design Utility
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// Context Library
const contexts = [
  { id: 'dev', name: 'Strategic Core', icon: Terminal, aura: 'rgba(99, 102, 241, 0.4)' },
  { id: 'design', name: 'Creative Forge', icon: Shield, aura: 'rgba(168, 85, 247, 0.4)' },
  { id: 'growth', name: 'Capital Matrix', icon: PulseIcon, aura: 'rgba(16, 185, 129, 0.4)' }
];

export default function App() {
  // --- CORE STATE ---
  const [activeContext, setActiveContext] = useState('dev');
  const [searchQuery, setSearchQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [lastSync, setLastSync] = useState("Never");
  const [showAI, setShowAI] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", content: "Oasis Neural Link Established." }]);
  
  const [mounted, setMounted] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // --- FEATURE STATE ---
  const [showGraph, setShowGraph] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [simMode, setSimMode] = useState(false);
  
  const [founderMetrics, setFounderMetrics] = useState({
    arr: "$1.24M", burn: "$42.5K/mo", runway: "18.4 Mo.", momentum: "+12.8%", stress_color: "#6366f1"
  });
  
  const [oracleAlert, setOracleAlert] = useState<any>(null);
  const [neuralWisdom, setNeuralWisdom] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [workforce, setWorkforce] = useState<any[]>([]);
  const [pendingManifests, setPendingManifests] = useState<any[]>([]);
  const [activeGolem, setActiveGolem] = useState<any>(null);

  const handleCommitSim = () => {
    setFounderMetrics(prev => ({ ...prev, arr: `$${simMetrics.arr}M` }));
    setSimMode(false);
    setNotification(`Simulation Committed: Venture Reality Re-forecasted to $${simMetrics.arr}M ARR.`);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  
  const [marketIntel, setMarketIntel] = useState([
    { symbol: "OASIS_INDEX", price: "$1,421.40", change: "+2.4%" },
    { symbol: "SAP_COMP", price: "$42.50", change: "-1.1%" },
    { symbol: "GLOBAL_AI", price: "8,942.00", change: "+0.8%" }
  ]);

  const [timeline, setTimeline] = useState([
    { id: 1, type: 'system', event: 'Oasis Foundry Kernel Initialized', time: '09:42:00' },
    { id: 2, type: 'neural', event: 'Venture Metrics Synced with Rust Kernel', time: '09:42:15' }
  ]);

  const [simMetrics, setSimMetrics] = useState({
    arr: 1.24, burn: 42.5, momentum: 12.8
  });

  // --- LOGIC: MEMORY & INTENT ---
  const logEvent = (event: string, type: 'neural' | 'deploy' | 'system') => {
    setTimeline(prev => [{ 
      id: Date.now(), 
      type, 
      event, 
      time: new Date().toLocaleTimeString() 
    }, ...prev].slice(0, 50));
  };

  const resolveNeuralIntent = (query: string) => {
    const q = query.toLowerCase();
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setIsThinking(true);
    logEvent(`Neural Intent Captured: "${query}"`, 'neural');

    setTimeout(() => {
      setIsThinking(false);
      if (q.includes("deploy") || q.includes("launch")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Deployment Sentinel Triggered. Syncing Edge Cluster..." }]);
        invoke('trigger_deploy', { env: 'Global' }).catch(() => {});
        logEvent("Deployment Sequence Alpha Initiated", "deploy");
      } else if (q.includes("presentation") || q.includes("vision") || q.includes("portal")) {
        setPresentationMode(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Visionary Portal Activated: Launching Stakeholder Mode..." }]);
        logEvent("Visionary Portal Initialized (Stakeholder Mode)", "system");
      } else if (q.includes("audit") || q.includes("report")) {
        invoke('generate_venture_audit').then((res: any) => {
           setMessages(prev => [...prev, { role: "assistant", content: `Auditor: ${res}` }]);
           setNotification("Venture Health Audit Manifested Successfully.");
           logEvent("Executive Venture Audit Generated", "system");
        }).catch(() => {});
      } else if (q.includes("manifest") || q.includes("build code") || q.includes("write module")) {
        const title = query.replace(/manifest|build code|write module/gi, "").trim() || "NewStrategy";
        invoke('manifest_code_module', { name: title }).then((res: any) => {
           setMessages(prev => [...prev, { role: "assistant", content: `Architect: ${res}` }]);
           setNotification(`Strategic Module '${title}' Successfully Architected.`);
           logEvent(`Strategic Code '${title}' Manifested to Disk`, "deploy");
        }).catch(() => {});
      } else if (q.includes("create") || q.includes("architect")) {
        setSimMode(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Initiating Strategic Venture Sandbox..." }]);
        logEvent("Venture Simulation Portal Opened", "system");
      } else if (q.includes("vault") || q.includes("files") || q.includes("open vault")) {
        setShowVault(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Accessing Sentient Vault Nodes..." }]);
        logEvent("Sentient Vault Portal Opened", "system");
      } else if (q.includes("graph") || q.includes("cortex") || q.includes("3d")) {
        setShowGraph(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Initiating 3D Strategic Cortex..." }]);
        logEvent("Strategic Cortex Visualization Launched", "system");
      } else if (q.includes("intel") || q.includes("market") || q.includes("competitors")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Retrieving Global Market Intelligence..." }]);
        logEvent("Market Intelligence Bridge Synced", "system");
      } else if (q.includes("arr") || q.includes("runway") || q.includes("metrics")) {
        setMessages(prev => [...prev, { role: "assistant", content: `Neural Audit: Current ARR is ${founderMetrics.arr} with ${founderMetrics.runway} runway.` }]);
        logEvent("Executive Metrics Audit Completed", "neural");
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: `Foundry Logic: Directive '${query}' acknowledged but currently unmapped.` }]);
      }
    }, 800);
    setSearchQuery("");
  };

  const handleSearchIntent = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      resolveNeuralIntent(searchQuery);
    }
  };

  const handleNeuralSend = () => {
    if (!assistantInput.trim()) return;
    resolveNeuralIntent(assistantInput);
    setAssistantInput("");
  };

  const handleContextSwitch = (id: string) => {
    setActiveContext(id);
    setLastSync(new Date().toLocaleTimeString());
    logEvent(`Context Shifted to: ${id.toUpperCase()}`, 'system');
  };

  const graphData = useMemo(() => {
    const baseNodes = [
      { id: "FOUNDRY CORE", group: "core", val: 20 }, 
      { id: "STRATEGIC CAPITAL", group: "capital", val: 12 }, 
      { id: "PRODUCT ROADMAP", group: "product", val: 12 },
      { id: "GROWTH MOMENTUM", group: "growth", val: 12 },
    ];
    
    const ghostNodes = pendingManifests.map(m => ({
      id: m.title.toUpperCase(), group: "ghost", val: 15, mData: m
    }));

    const baseLinks = [
      { source: "FOUNDRY CORE", target: "STRATEGIC CAPITAL" }, 
      { source: "FOUNDRY CORE", target: "PRODUCT ROADMAP" },
      { source: "FOUNDRY CORE", target: "GROWTH MOMENTUM" },
    ];

    const ghostLinks = pendingManifests.map(m => ({
      source: "GROWTH MOMENTUM", target: m.title.toUpperCase()
    }));

    return { 
      nodes: [...baseNodes, ...ghostNodes], 
      links: [...baseLinks, ...ghostLinks] 
    };
  }, [pendingManifests]);

  const getNodeColor = (node: any) => {
    if (simMode) return "#f59e0b";
    if (node.group === 'ghost') return 'rgba(255, 255, 255, 0.2)';
    switch (node.group) {
      case 'core': return '#6366f1';
      case 'capital': return '#f59e0b';
      case 'product': return '#a855f7';
      case 'growth': return '#10b981';
      default: return '#94a3b8';
    }
  };

  // --- V2 COGNITION EFFECTORS ---
  useEffect(() => {
    if (founderMetrics.stress_color !== "#6366f1") {
       invoke('get_neural_wisdom', { stressColor: founderMetrics.stress_color }).then((res: any) => {
          setNeuralWisdom(res);
          setMessages(prev => [...prev, { role: "assistant", content: `Neural Wisdom: ${res.recommendation}` }]);
       }).catch(() => {});
    } else {
       setNeuralWisdom(null);
    }
  }, [founderMetrics.stress_color]);

  useEffect(() => {
    const checkOracle = async () => {
       try {
         const alert = await invoke('trigger_oracle_audit') as any;
         setOracleAlert(alert);
       } catch (e) {}
    };
    checkOracle();
    const interval = setInterval(checkOracle, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncWorkforceData = async () => {
      try {
        const wf = await invoke("get_neural_workforce") as any[];
        setWorkforce(wf);
      } catch (e) {}
    };
    syncWorkforceData();
    const interval = setInterval(syncWorkforceData, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncGolems = async () => {
      try {
        const pmd = await invoke("get_pending_manifests", { stressColor: founderMetrics.stress_color }) as any[];
        setPendingManifests(pmd);
      } catch (e) {}
    };
    syncGolems();
    const interval = setInterval(syncGolems, 30000);
    return () => clearInterval(interval);
  }, [founderMetrics.stress_color]);

  // --- SYNC: BRIDGE ---
  useEffect(() => {
    const syncFoundryData = async () => {
      try {
        const metrics = await invoke("get_venture_metrics") as any;
        const intel = await invoke("get_market_intelligence") as any;
        if (!simMode) setFounderMetrics({ ...metrics, stress_color: metrics.stress_color || "#6366f1" });
        setMarketIntel(intel);
        setLastSync(new Date().toLocaleTimeString());
      } catch (e) {
        if (!simMode) {
          setFounderMetrics({
            arr: "$1.24M", burn: "$42.5K/mo", runway: "18.4 Mo.", momentum: "+12.8%", stress_color: "#6366f1"
          });
        }
        setLastSync(new Date().toLocaleTimeString() + " (Simulated)");
      }
    };
    syncFoundryData();
    const interval = setInterval(syncFoundryData, 10000);
    return () => clearInterval(interval);
  }, [simMode]);



  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden flex selection:bg-indigo-500/30">
      {/* Oracle Alert Notification (Pillar 20) */}
      <AnimatePresence>
        {oracleAlert && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6"
          >
            <div className="glass-bright border border-red-500/30 rounded-3xl p-6 shadow-4xl flex items-center gap-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/40">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="text-red-400 font-bold text-sm mb-1 uppercase tracking-wider">{oracleAlert.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{oracleAlert.body}</p>
              </div>
              <button onClick={() => setOracleAlert(null)} className="p-2 text-slate-500 hover:text-white transition-colors relative z-10">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crisis Lockout Overlay (Pillar 18) */}
      <AnimatePresence>
        {founderMetrics.stress_color === "#ef4444" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-red-950/40 backdrop-blur-xl flex items-center justify-center p-12"
          >
             <div className="max-w-2xl w-full glass-bright border border-red-500/50 shadow-[0_0_100px_rgba(239,68,68,0.2)] rounded-[3rem] p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-8 animate-bounce" />
                <h2 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-4">Critical Venture Burn</h2>
                <p className="text-red-200 text-lg mb-8 font-medium italic opacity-80">"Foundry Discipline Initiated. System restricted to Strategic Recovery Nodes."</p>
                <div className="grid grid-cols-2 gap-6 mb-10 text-left">
                   <div className="p-6 glass border-red-500/20 rounded-2xl">
                      <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Recovery Alpha</h4>
                      <p className="text-xs text-white">Activate Series A Outreach Code Module.</p>
                   </div>
                   <div className="p-6 glass border-red-500/20 rounded-2xl">
                      <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Recovery Beta</h4>
                      <p className="text-xs text-white">Generate Executive Venture Audit.</p>
                   </div>
                </div>
                <button onClick={() => setFounderMetrics(prev => ({ ...prev, stress_color: "#6366f1" }))} className="px-12 py-5 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl shadow-red-500/40">
                   Override Lockout
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Success Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed bottom-12 left-12 z-[2500] glass-bright border-emerald-500/30 rounded-2xl p-6 shadow-4xl flex items-center gap-5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ background: simMode ? '#f59e0b' : founderMetrics.stress_color, opacity: (isThinking || simMode) ? 0.15 : 0.08 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[250px] transition-all duration-1000"
        />
        <div className="absolute inset-0 opacity-[0.03] grayscale invert mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      </div>

      {/* 3D Nebula Layer */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        {mounted && (
          <ForceGraph3D
            graphData={graphData}
            backgroundColor="#00000000"
            nodeRelSize={simMode ? 10 : 6}
            nodeColor={() => simMode ? "#f59e0b" : founderMetrics.stress_color}
            nodeLabel="id"
            linkColor={() => simMode ? "rgba(245, 158, 11, 0.2)" : "rgba(99, 102, 241, 0.1)"}
            showNavInfo={false}
          />
        )}
      </div>

      {/* Level 9 Executive Sidebar */}
      {!presentationMode && (
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
              { id: 'logs', icon: Activity, label: 'History' },
              { id: 'sim', icon: Zap, label: 'Simulation' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'graph') setShowGraph(true);
                  else if (item.id === 'vault') setShowVault(true);
                  else if (item.id === 'logs') setShowLogs(true);
                  else if (item.id === 'sim') setSimMode(true);
                  else { handleContextSwitch('dev'); }
                }}
                className={cn(
                  "p-4 rounded-2xl transition-all group relative",
                  (item.id === 'sim' && simMode) ? "bg-amber-500/20 text-amber-500" : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
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
              onClick={() => setSimMode(!simMode)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all border",
                simMode ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
              )}
            >
              <Zap className={cn("w-6 h-6", simMode && "animate-pulse")} />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-4 text-slate-500 hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </motion.aside>
      )}

      {/* Main Command Stage */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 w-full flex items-center justify-between px-12 border-b border-white/5 backdrop-blur-xl bg-white/[0.01]">
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Active Aura</span>
               <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 {contexts.find(c => c.id === activeContext)?.name} Context
                 <span className="ml-4 text-[9px] font-mono text-indigo-500/50 border border-indigo-500/20 px-2 py-0.5 rounded">V2.2.1-SENTIENT</span>
               </h1>
            </div>
            
            <div className="h-8 w-[1px] bg-white/5 hidden md:block" />

            <div className="hidden md:flex flex-col">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Last System Sync</span>
               <span className="text-xs font-mono text-indigo-400/80 tracking-tighter animate-pulse">{lastSync}</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {marketIntel.map((m, i) => (
              <div key={i} className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-white/5 pl-8 first:border-none">
                <PulseIcon className={cn("w-3.5 h-3.5", m.change.includes('+') ? "text-emerald-400" : "text-amber-400")} />
                <span>{m.symbol}: <span className="text-white">{m.price}</span></span>
                <span className={cn("text-[8px] px-1.5 py-0.5 rounded-sm bg-white/5", m.change.includes('+') ? "text-emerald-400" : "text-amber-400")}>{m.change}</span>
              </div>
            ))}
            <div className="h-8 w-[1px] bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]" />
            <button onClick={() => setPresentationMode(!presentationMode)} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              {presentationMode ? "Exit Portal" : "Neural Sync"}
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto custom-scrollbar">
            {/* Neural Intent Bar */}
            {!presentationMode && (
              <motion.div 
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="w-full max-w-2xl glass-bright rounded-[2.5rem] p-6 shadow-3xl border border-white/5 hover:border-white/10 transition-all mb-12"
              >
                  <div className="flex items-center gap-5 px-4 py-2">
                    <Search className={cn("w-7 h-7 transition-colors", isThinking ? "text-indigo-400 animate-pulse" : "text-slate-600")} />
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchIntent}
                      placeholder="Detecting Neural Intent..."
                      className="bg-transparent border-none outline-none text-2xl w-full text-white placeholder:text-slate-700 font-light"
                    />
                    <kbd className="hidden md:flex bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Enter</kbd>
                  </div>
              </motion.div>
            )}

            {/* Metrics Ribbon */}
            <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
               {[
                 { label: 'Target ARR', val: simMode ? `$${simMetrics.arr}M` : founderMetrics.arr, icon: Activity },
                 { label: 'Burn Rate', val: simMode ? `$${simMetrics.burn}K` : founderMetrics.burn, icon: Zap },
                 { label: 'Projected Runway', val: founderMetrics.runway, icon: Shield },
                 { label: 'Growth Momentum', val: simMode ? `${simMetrics.momentum}%` : founderMetrics.momentum, icon: PulseIcon }
               ].map((m, i) => (
                 <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-3">
                    <m.icon className="w-5 h-5 text-indigo-400" />
                    <div>
                       <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                       <div className="text-xl font-bold text-white">{m.val}</div>
                    </div>
                 </div>
               ))}
            </div>

            {/* Neural Corporate Suite (Phase 21) */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {workforce.map((agent, i) => (
                   <motion.div 
                     key={agent.name}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: i * 0.1 }}
                     className="glass-bright rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all shadow-xl"
                   >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px]" />
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/20 transition-all">
                            {agent.name.includes("Growth") ? <Globe className="w-5 h-5 text-indigo-400" /> : agent.name.includes("Architect") ? <Cpu className="w-5 h-5 text-purple-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">{agent.name}</h4>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{agent.status}</span>
                         </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-black/20 border border-white/5 mb-4 min-h-[100px] flex items-center">
                         <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic line-clamp-4">
                            "{agent.recommendation}"
                         </p>
                      </div>
                      <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest rounded-xl transition-all border border-white/5">
                         Sync With Agent
                      </button>
                   </motion.div>
                ))}
            </div>

            {/* Deployment Messenger Hub (Simplified) */}
            <div className="w-full max-w-5xl glass p-8 rounded-[2rem] border border-white/5 mb-12">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <Terminal className="w-6 h-6 text-indigo-400" />
                      <h3 className="text-lg font-bold tracking-tight text-white">Foundry Pipeline</h3>
                   </div>
                   <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">Systems Level Access</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { name: 'Edge Cluster', status: 'Deployed', prog: 100, color: 'emerald' },
                     { name: 'Core Stable', status: 'Active', prog: 100, color: 'indigo' },
                     { name: 'Architecture', status: 'Manifesting', prog: 65, color: 'purple' }
                   ].map((env) => (
                     <div key={env.name} className="space-y-3">
                        <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500">
                           <span>{env.name}</span>
                           <span>{env.status}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${env.prog}%` }} className={cn("h-full", env.color === 'emerald' ? "bg-emerald-500" : env.color === 'indigo' ? "bg-indigo-500" : "bg-purple-500")} />
                        </div>
                     </div>
                   ))}
                </div>
            </div>

            <div className="flex gap-8 pb-12">
              {contexts.map((ctx) => {
                const Icon = ctx.icon;
                const isActive = activeContext === ctx.id;
                return (
                  <motion.button
                    key={ctx.id}
                    onClick={() => handleContextSwitch(ctx.id)}
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

      {/* OVERLAYS */}
      <AnimatePresence>
        {showGraph && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl">
             <button onClick={() => setShowGraph(false)} className="absolute top-10 right-10 w-14 h-14 glass rounded-full flex items-center justify-center text-white z-[210] hover:bg-white/10 transition-all"><Plus className="w-8 h-8 rotate-45" /></button>
             <div className="w-full h-full pointer-events-auto">
                {mounted && (
                  <ForceGraph3D 
                    graphData={graphData} 
                    backgroundColor="#00000000" 
                    nodeRelSize={simMode ? 10 : 10} 
                    nodeColor={(node: any) => node.group === 'ghost' ? '#C0C0C0' : getNodeColor(node)}
                    nodeLabel="id"
                    linkColor={() => simMode ? "rgba(245, 158, 11, 0.3)" : "rgba(99, 102, 241, 0.3)"}
                    onNodeClick={(node: any) => node.group === 'ghost' && setActiveGolem(node.mData)}
                  />
                )}
             </div>
          </motion.div>
        )}

        {activeGolem && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-12">
              <div className="max-w-4xl w-full glass-bright rounded-[3rem] border border-white/10 shadow-5xl overflow-hidden flex h-[600px]">
                 <div className="w-1/3 p-12 bg-white/5 border-r border-white/5 flex flex-col justify-between">
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{activeGolem.title}</h3>
                       <p className="text-xs text-slate-400 leading-relaxed italic">"Agentic Rationale: {activeGolem.rationale}"</p>
                    </div>
                    <div className="flex flex-col gap-4">
                       <button onClick={() => {
                          invoke('execute_golem_manifest', { id: activeGolem.id, title: activeGolem.title, code: activeGolem.code_draft }).then((res: any) => {
                            setNotification(res);
                            setActiveGolem(null);
                            setPendingManifests(prev => prev.filter(p => p.id !== activeGolem.id));
                          });
                       }} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30">Authorize Golem</button>
                       <button onClick={() => setActiveGolem(null)} className="w-full py-5 glass text-slate-500 hover:text-white uppercase tracking-widest text-[10px] rounded-2xl">Dismiss Draft</button>
                    </div>
                 </div>
                 <div className="flex-1 p-12 bg-black/20 font-mono text-sm text-indigo-300 custom-scrollbar overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{activeGolem.code_draft}</pre>
                 </div>
              </div>
           </motion.div>
        )}

        {showVault && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#020617]/95 backdrop-blur-3xl p-20 flex flex-col pt-10">
             <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Foundry Protocol</span>
                   <h2 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-4"><FolderOpen className="w-10 h-10 text-indigo-500" /> Sentient Venture Vault</h2>
                </div>
                <button onClick={() => setShowVault(false)} className="w-14 h-14 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"><Plus className="w-8 h-8 rotate-45" /></button>
             </div>
             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pr-4">
                {[
                  { name: 'Oasis_Whitepaper.pdf', cat: 'Strategic', size: '1.2MB' },
                  { name: 'Foundry_Kernel.rs', cat: 'Technical', size: '45KB' },
                  { name: 'Executive_Brand_Guide.fig', cat: 'Creative', size: '8.4MB' },
                  { name: 'Q3_Revenue_Projection.xlsx', cat: 'Strategic', size: '220KB' },
                  { name: 'Neural_Engine_Docs.md', cat: 'Technical', size: '12KB' }
                ].map((node) => (
                  <div key={node.name} className="glass-bright p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all group flex flex-col justify-between aspect-square">
                     <div className="flex justify-between items-start">
                        <div className={cn("p-4 rounded-xl", node.cat === 'Strategic' ? "bg-amber-500/10 text-amber-500" : node.cat === 'Technical' ? "bg-indigo-500/10 text-indigo-500" : "bg-purple-500/10 text-purple-500")}>
                           <Shield className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{node.size}</span>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest block mb-2">{node.cat}</span>
                        <h4 className="text-lg font-bold text-white truncate">{node.name}</h4>
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {showLogs && (
          <motion.div initial={{ opacity: 0, x: 500 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 500 }} className="fixed inset-y-0 right-0 z-[400] w-[450px] glass-bright border-l border-white/10 p-12 backdrop-blur-4xl flex flex-col">
             <div className="flex items-center justify-between mb-12">
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Foundry Ledger</span>
                   <h2 className="text-3xl font-bold text-white tracking-tighter">Cognitive Timeline</h2>
                </div>
                <button onClick={() => setShowLogs(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"><Plus className="w-6 h-6 rotate-45" /></button>
             </div>
             <div className="flex-1 relative overflow-y-auto custom-scrollbar pr-4">
                <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent" />
                <div className="space-y-12">
                   {timeline.map((event) => (
                      <div key={event.id} className="relative pl-12">
                         <div className={cn("absolute left-0 w-8 h-8 rounded-full border-4 border-[#020617] flex items-center justify-center z-10", event.type === 'neural' ? "bg-indigo-500" : event.type === 'deploy' ? "bg-emerald-500" : "bg-slate-600")}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                         </div>
                         <div className="glass p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-mono text-slate-500">{event.time}</span>
                               <span className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", 
                                  event.type === 'neural' ? "text-indigo-400 bg-indigo-400/10" : 
                                  event.type === 'deploy' ? "text-emerald-400 bg-emerald-400/10" : 
                                  "text-slate-400 bg-slate-400/10"
                               )}>{event.type}</span>
                            </div>
                            <p className="text-sm text-slate-300 font-medium leading-relaxed">{event.event}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}

        {simMode && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-[500] flex items-center justify-center p-20 bg-[#020617]/40 backdrop-blur-3xl">
             <div className="w-full max-w-4xl glass-bright rounded-[3rem] p-12 border border-amber-500/20 shadow-[0_0_100px_rgba(245,158,11,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
                <div className="flex items-center justify-between mb-16">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-[0.4em] mb-1">Strategic Sandbox</span>
                      <h2 className="text-4xl font-bold text-white tracking-tighter">Venture Simulation Portal</h2>
                   </div>
                   <button onClick={handleCommitSim} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20">Commit Simulation</button>
                </div>
                <div className="grid grid-cols-1 gap-12">
                   {[
                     { label: 'Target ARR (Pro-Forma)', val: simMetrics.arr, unit: 'M', min: 0.5, max: 10, key: 'arr' },
                     { label: 'Estimated Burn Rate', val: simMetrics.burn, unit: 'K/mo', min: 10, max: 100, key: 'burn' },
                     { label: 'Growth Momentum', val: simMetrics.momentum, unit: '%', min: 0, max: 50, key: 'momentum' }
                   ].map((sim) => (
                     <div key={sim.key} className="space-y-6">
                        <div className="flex justify-between items-end">
                           <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">{sim.label}</label>
                           <span className="text-3xl font-bold text-white tracking-tighter">{sim.key === 'arr' ? '$' : ''}{sim.val}{sim.unit}</span>
                        </div>
                        <input type="range" min={sim.min} max={sim.max} step={0.1} value={sim.val} onChange={(e) => setSimMetrics(prev => ({ ...prev, [sim.key]: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500" />
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Robot */}
      {!presentationMode && (
        <div className="fixed bottom-10 right-10 flex flex-col items-end gap-6 z-[600]">
           <AnimatePresence>
              {showAI && (
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="w-96 h-[550px] glass rounded-[2.5rem] border-white/10 shadow-3xl overflow-hidden flex flex-col mb-4">
                    <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                       <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Neural Link Stable</span>
                       <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" /></div>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                       {neuralWisdom && (
                         <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mb-4">
                            <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg mb-4">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">V2.2.1-SENTIENT</span>
                            </div>
                            <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <BrainCircuit className="w-4 h-4" /> Neural Wisdom (Mirror)
                            </h5>
                            <p className="text-xs text-indigo-100 font-bold leading-relaxed mb-3">{neuralWisdom.recommendation}</p>
                            <p className="text-[10px] text-indigo-300 italic opacity-80">{neuralWisdom.insight}</p>
                            <div className="mt-4 pt-3 border-t border-indigo-500/20 text-[9px] font-bold text-indigo-400/60 uppercase">
                               Confidence: {(neuralWisdom.confidence * 100).toFixed(0)}%
                            </div>
                         </div>
                       )}
                       {messages.map((m, i) => (
                         <div key={i} className={cn("max-w-[85%] p-4 rounded-2xl text-sm", m.role === 'user' ? "ml-auto bg-indigo-600 text-white" : "mr-auto glass text-slate-300 shadow-lg")}>{m.content}</div>
                       ))}
                       {isThinking && <div className="p-4 glass rounded-2xl w-fit animate-pulse tracking-widest text-[10px] font-bold text-indigo-400">THINKING...</div>}
                    </div>
                    <div className="p-6 bg-black/20">
                       <div className="flex items-center glass rounded-2xl px-5 py-3 border-white/10">
                          <input value={assistantInput} onChange={(e) => setAssistantInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNeuralSend()} placeholder="Pulse Brain..." className="bg-transparent border-none outline-none text-sm w-full font-medium text-white" />
                          <button onClick={handleNeuralSend} className="text-indigo-400 hover:text-white transition-colors"><Zap size={18} /></button>
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
           <button onClick={() => setShowAI(!showAI)} className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all">
             <Bot className="w-9 h-9" />
           </button>
        </div>
      )}
    </div>
  );
}
