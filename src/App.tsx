import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, Code, Gamepad2, Globe, Settings, Search, Plus, Monitor, 
  MessageSquare, Bot, RefreshCw, CheckCircle2, CloudLightning, Zap, 
  AlertCircle, ExternalLink, Shield, Activity, FolderOpen, FileCode2, 
  Terminal, Eye, LayoutDashboard, BrainCircuit, ShieldCheck, HardDrive, 
  Command, Clock, Maximize2, Minimize2 
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { cn } from "./lib/utils";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// @ts-ignore
import ForceGraph3D from 'react-force-graph-3d';

const contexts = [
  { id: "dev", name: "Development", icon: Code, color: "blue", aura: "rgba(37, 99, 235, 0.4)" },
  { id: "design", name: "3D Design", icon: LayoutGrid, color: "purple", aura: "rgba(124, 58, 237, 0.4)" },
  { id: "gaming", name: "Gaming", icon: Gamepad2, color: "red", aura: "rgba(220, 38, 38, 0.4)" },
  { id: "research", name: "Market Research", icon: Globe, color: "emerald", aura: "rgba(5, 150, 105, 0.4)" },
];

const DesignShowroom = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={mountRef} className="w-full h-40 bg-slate-900/40 rounded-xl overflow-hidden mt-2 border border-emerald-500/10" />;
}

export default function App() {
  const [activeContext, setActiveContext] = useState("dev");
  const [activePortal, setActivePortal] = useState<'neuro' | 'nexus' | 'career' | 'market'>('neuro');
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [aiHeartbeat, setAiHeartbeat] = useState({ ready: true, online: true });
  const [showGraph, setShowGraph] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [vaultFiles, setVaultFiles] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [windowCount, setWindowCount] = useState(12);
  const [logs, setLogs] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [proactiveAlert, setProactiveAlert] = useState<any>(null);
  const [activeSettingTab, setActiveSettingTab] = useState("Crates");
  const [assistantInput, setAssistantInput] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", content: "Oasis Neural Link Established." }]);
  const [loadingVision, setLoadingVision] = useState(false);
  const [logicPath, setLogicPath] = useState("Initializing Pathing...");
  const [autoAcceptSentience, setAutoAcceptSentience] = useState(false);

  useEffect(() => {
    const paths: any = {
      dev: "Dev > Code > Audit > Pulse",
      design: "Scene > Render > Export > Sync",
      gaming: "Focus > Optimize > Play > Record",
      research: "Query > Analyze > Archive > Pulse"
    };
    setLogicPath(paths[activeContext] || "Idle");
  }, [activeContext]);


  const currentAura = useMemo(() => {
    const ctx = contexts.find(c => c.id === activeContext);
    return ctx?.aura || "rgba(99, 102, 241, 0.4)";
  }, [activeContext]);

  const graphData = useMemo(() => ({
    nodes: [
      { id: "Oasis Core", group: 1 }, 
      { id: "Neural Lens", group: 2 }, 
      { id: "Git Scout", group: 3 },
      { id: "CPU_SENSOR", group: 0, label: "System Core" },
      { id: "RAM_SENSOR", group: 0, label: "Neural Memory" }
    ], 
    links: [
      { source: "Oasis Core", target: "Neural Lens" }, 
      { source: "Oasis Core", target: "Git Scout" },
      { source: "CPU_SENSOR", target: "Oasis Core" },
      { source: "RAM_SENSOR", target: "Oasis Core" }
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
          nodeRelSize={4}
          linkColor={() => "rgba(255,255,255,0.05)"}
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
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nodes: <span className="text-white">{windowCount}</span></span>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Pulse: <span className="text-white">{lastSync || "IDLE"}</span></span>
            </div>
            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              Neural Sync
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-12">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="w-full max-w-2xl glass-bright rounded-[2.5rem] p-6 shadow-3xl border border-white/5 hover:border-white/10 transition-all"
            >
                <div className="flex items-center gap-5 px-4 py-2">
                  <Search className="w-7 h-7 text-indigo-400" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchIntent}
                    placeholder="Detecting Neural Intent..."
                    className="bg-transparent border-none outline-none text-2xl w-full text-white placeholder:text-slate-700 font-light"
                  />
                  <kbd className="hidden md:flex bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Ctrl+Space</kbd>
                </div>
            </motion.div>

            <div className="mt-16 flex gap-8">
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

      {/* Overlays */}
      <AnimatePresence>
        {showGraph && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-3xl">
             <button onClick={() => setShowGraph(false)} className="absolute top-10 right-10 w-14 h-14 glass rounded-full flex items-center justify-center text-white"><Plus className="w-8 h-8 rotate-45" /></button>
             <div className="w-full h-full">
                <ForceGraph3D graphData={graphData} backgroundColor="#00000000" nodeRelSize={8} />
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
