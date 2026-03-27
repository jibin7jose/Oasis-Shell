import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Code, Gamepad2, Globe, Settings, Search, Plus, Monitor, MessageSquare, Bot, RefreshCw, CheckCircle2, CloudLightning, Zap, AlertCircle, ExternalLink, Shield, Activity, FolderOpen, FileCode2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "./lib/utils";
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// @ts-ignore
import ForceGraph3D from 'react-force-graph-3d';

const contexts = [
  { id: "dev", name: "Development", icon: Code, color: "blue", aura: "from-blue-600/30 to-blue-900/10" },
  { id: "design", name: "3D Design", icon: LayoutGrid, color: "purple", aura: "from-purple-600/30 to-indigo-900/10" },
  { id: "gaming", name: "Gaming", icon: Gamepad2, color: "red", aura: "from-red-600/30 to-orange-900/10" },
  { id: "research", name: "Market Research", icon: Globe, color: "emerald", aura: "from-emerald-600/30 to-teal-900/10" },
];

const auraColors: Record<string, string> = {
  dev: "#2563eb",
  design: "#7c3aed",
  gaming: "#dc2626",
  research: "#059669",
};

const DesignShowroom = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    let model: THREE.Group;

    loader.load('/design/scene.gltf', (gltf) => {
      model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      model.position.set(0, -1, 0);
      scene.add(model);
    });

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const animate = () => {
      requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.005;
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

function App() {
  const [activeContext, setActiveContext] = useState("dev");
  const [searchQuery, setSearchQuery] = useState("");
  const [windowCount, setWindowCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [activeSettingTab, setActiveSettingTab] = useState("Crates");

  const openVault = async () => {
    try {
      const data = await invoke("get_all_files");
      setVaultFiles(data as any[]);
      setShowVault(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (showGraph && graphData.nodes.length === 0) {
      invoke("get_neural_graph").then((data: any) => setGraphData(data)).catch(console.error);
    }
  }, [showGraph]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexCount, setIndexCount] = useState<number | null>(null);
  const [indexStatus, setIndexStatus] = useState<"idle" | "success" | "error">("idle");
  const [indexPath, setIndexPath] = useState("D:\\myproject\\scout-racer");

  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [autoPulse, setAutoPulse] = useState(false);
  const [autoWatch, setAutoWatch] = useState(false);
  const [pulseInterval] = useState(15); // minutes
  const [crates, setCrates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isNative, setIsNative] = useState(true);
  const [nearbyProjects, setNearbyProjects] = useState<string[]>([]);
  const [neuroProfile, setNeuroProfile] = useState<any>(null);
  const [nexusHealth, setNexusHealth] = useState<any>(null);
  const [careerData, setCareerData] = useState<any>({
    role: "Full Stack & 3D Engineer",
    score: 98,
    experience: "Software Engineer @ ABHRAM TECHNOLOGIES",
    portfolio: "https://portfolio-pi-cyan-64.vercel.app"
  });
  const [scoutData, setScoutData] = useState<any>({ hp: 120, torque: 210, status: "M3A1 Ready" });
  const [marketData, setMarketData] = useState<any>({ property: "4 Bhk Villa - Kakkanad", price: "₹90L", trend: "+2.4%" });
  const [learningData, setLearningData] = useState<any>({
    languages: ["Rust", "Go", "C++", ".NET", "C#", "Shell"],
    maturity: { "Rust": 85, "Go": 70, "C++": 92 }
  });
  const [diagStatus, setDiagStatus] = useState<any>({ linker: "Offline", port1420: "Active", node: "v20.x" });
  const [gameEngineData, setGameEngineData] = useState<any>({
    active: ["Z-Racing (15GB)", "Z-Attact (7GB)", "GTA V (5GB)"],
    loadStatus: "Engine Optimized"
  });
  const [securityStatus, setSecurityStatus] = useState<any>({ oauth: "Ready", tempMail: "Active", vault: "Locked" });
  const [pulseSummary, setPulseSummary] = useState<any>({
    totalProjects: 9,
    activeNodes: 4,
    ecosystemHealth: "Optimal"
  });
  const [activePortal, setActivePortal] = useState<'neuro' | 'nexus' | 'career' | 'market'>('neuro');

  const repoUrl = "https://github.com/jibin7jose/Oasis-Shell.git";

  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Oasis Neural Link Established. I'm monitoring your context and cloud pulses." }
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      setSearchResults([
        { title: "NeuroForge DNA", type: "Code", aura: "indigo" },
        { title: "M3A1 Scout Tuning", type: "Performance", aura: "rose" },
        { title: "Kakkanad Villa #4", type: "Market", aura: "amber" }
      ]);
    } else {
      setSearchResults([]);
    }
  };

  const fetchLogs = async () => {
    try {
      const data: any[] = await invoke("get_logs");
      if (data.length === 0) {
        await logEvent("SYSTEM", "Oasis Shell Neural Bridge Initiated.");
        await fetchLogs();
      } else {
        setLogs(data);
      }
      setIsNative(true);
    } catch (e) {
      console.error("Failed to fetch logs", e);
      setIsNative(false);
    }
  };

  const logEvent = async (type: string, message: string) => {
    try {
      await invoke("log_event", { eventType: type, message });
    } catch (e) {
      console.error("Failed to log event", e);
    }
  };

  const fetchCrates = async () => {
    try {
      const data: any[] = await invoke("get_crates");
      setCrates(data.map(c => ({
        ...c,
        apps: JSON.parse(c.apps)
      })));
      setIsNative(true);
    } catch (e) {
      console.error("Failed to fetch crates", e);
      setIsNative(false);
    }
  };

  const createCrate = async () => {
    const name = prompt("Enter a name for your new Context Crate:");
    if (!name) return;

    try {
      const currentWindows = await invoke("get_running_windows");
      await invoke("save_crate", { name, apps: currentWindows });
      logEvent("CRATE_CREATE", `Neural Snapshot created: ${name}`);
      fetchCrates();
      fetchLogs();
    } catch (e) {
      console.error("Failed to create crate", e);
    }
  };

  const launchCrate = async (id: number) => {
    try {
      const crateName = crates.find(c => c.id === id)?.name || id;
      logEvent("CRATE_LAUNCH", `Restoring Workspace: ${crateName}`);
      await invoke("launch_crate", { id });
      setShowSettings(false);
      fetchLogs();
    } catch (e) {
      console.error("Failed to launch crate", e);
    }
  };

  const handleAssistantChat = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && assistantInput.trim()) {
      const userMsg = assistantInput.trim().toLowerCase();
      setMessages(prev => [...prev, { role: "user", content: assistantInput }]);
      setAssistantInput("");

      // Executive AI logic
      setTimeout(() => {
        let response = "Instruction Received. Command queued for execution.";

        if (userMsg.includes("status")) {
          const aura = contexts.find(c => c.id === activeContext)?.name;
          response = `System Operational. Active Aura: ${aura}. Cloud Sync: Stable.`;
        } else if (userMsg.includes("summarize") || userMsg.includes("what did i do")) {
          if (logs.length === 0) {
            response = "No neural patterns recorded for this cycle yet. Suggest creating a 'Crate' to begin tracking.";
          } else {
            const summary = logs.slice(0, 3).map(l => l.message).join(", ");
            response = `Neural Summary: Recent activity includes ${summary}. You are currently ${activeContext === "dev" ? "in deep work" : "exploring"}.`;
          }
        } else if (userMsg.includes("log") || userMsg.includes("activity") || userMsg.includes("history")) {
          response = "Accessing Neural Activity Stream. Control Center deployed.";
          setActiveSettingTab("Neural Logs");
          setShowSettings(true);
        } else if (userMsg.includes("crate") || userMsg.includes("snapshot")) {
          response = "Retrieving Context Crates. Neural Repository opened.";
          setActiveSettingTab("Crates");
          setShowSettings(true);
        } else if (userMsg.includes("sync") || userMsg.includes("pulse") || userMsg.includes("push")) {
          response = "Initiating Oasis Pulse. Synchronizing with Neural Cloud...";
          handleSync();
        } else {
          // Check for context names first
          const matched = contexts.find(ctx => userMsg.includes(ctx.name.toLowerCase()) || userMsg.includes(ctx.id));
          if (matched) {
            response = `Executing Aura Transition: Setting context to ${matched.name}.`;
            handleContextSwitch(matched.id);
            setMessages(prev => [...prev, { role: "assistant", content: response }]);
          } else {
            // If completely unhandled, use RAG Engine (Context-Aware Local AI)
            invoke("rag_query", { query: userMsg })
              .then((llmResponse: any) => {
                setMessages(prev => [...prev, { role: "assistant", content: llmResponse }]);
              })
              .catch((e) => {
                setMessages(prev => [...prev, { role: "assistant", content: "Error: Semantic Engine or Local AI (Ollama) offline." }]);
              });
            return;
          }
        }
        
        if (userMsg.includes("status") || userMsg.includes("summarize") || userMsg.includes("log") || userMsg.includes("crate") || userMsg.includes("sync")) {
          setMessages(prev => [...prev, { role: "assistant", content: response }]);
        }
      }, 100);
    }
  };

  const handleSync = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus("idle");

    try {
      const msg = logs.length > 0 ? logs[0].message : "Neural Pattern Update";
      await invoke("sync_project", { message: msg });
      setSyncStatus("success");
      setLastSync(new Date().toLocaleTimeString());
      logEvent("SYNC", "Oasis Pulse: Synchronized with Neural Cloud.");
    } catch (e) {
      console.error("Sync failed", e);
      setSyncStatus("error");
      logEvent("SYNC_ERROR", "Oasis Pulse: Interrupted. Connection unstable.");
    } finally {
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };
  const fetchNearby = async () => {
    try {
      const projects: string[] = await invoke("get_nearby_projects");
      setNearbyProjects(projects.filter(p => !p.includes("oasis-shell")));

      const profile = await invoke("get_neuroforge_profile");
      setNeuroProfile(profile);

      const health = await invoke("get_nexus_health");
      setNexusHealth(health);

      const career = await invoke("get_latest_resume_analysis");
      setCareerData(career);
    } catch (e) {
      console.error("Failed to fetch nearby or profiles", e);
    }
  };

  useEffect(() => {
    fetchCrates();
    fetchLogs();
    fetchNearby();

    const interval = setInterval(() => {
      fetchNearby();
      fetchLogs();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showSettings) {
      fetchCrates();
      fetchLogs();
    }
  }, [showSettings]);

  const handleContextSwitch = (id: string) => {
    const contextName = contexts.find(c => c.id === id)?.name || id;
    logEvent("CONTEXT_SWITCH", `Aura transitioned to ${contextName}`);
    setActiveContext(id);
  };

  const [suggestedContext, setSuggestedContext] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await invoke("start_watcher");
      } catch (e) {
        console.error("Failed to start watcher", e);
      }
    };
    init();

    const scan = async () => {
      try {
        const windows: any[] = await invoke("get_running_windows");
        setWindowCount(windows.length);
        setIsNative(true);

        // Simple Heuristic AI (Neural Suggestion)
        const titles = windows.map(w => w.title.toLowerCase()).join(" ");
        if (titles.includes("code") || titles.includes("vscode") || titles.includes("studio")) {
          setSuggestedContext("dev");
        } else if (titles.includes("blender") || titles.includes("unity") || titles.includes("unreal")) {
          setSuggestedContext("design");
        } else if (titles.includes("steam") || titles.includes("epic") || titles.includes("battle.net")) {
          setSuggestedContext("gaming");
        } else if (titles.includes("chrome") || titles.includes("edge") || titles.includes("search")) {
          setSuggestedContext("research");
        } else {
          setSuggestedContext(null);
        }

      } catch (e) {
        console.error("Failed to scan windows", e);
        setIsNative(false);
        setWindowCount(12); // Simulated count for Browser Preview
      }
    };
    scan();
    const interval = setInterval(scan, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!autoPulse) return;

    const intervalId = setInterval(() => {
      handleSync();
    }, pulseInterval * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [autoPulse, pulseInterval]);

  const handleSearchIntent = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const query = searchQuery.toLowerCase().trim();

      // 1. Sync Intent
      if (query.includes("sync") || query.includes("pulse") || query.includes("push") || query.includes("backup")) {
        handleSync();
        setSearchQuery("");
        return;
      }

      // 2. Semantic AI Search
      try {
        const results: any = await invoke("semantic_search", { query });
        if (results && results.length > 0) {
          await invoke("plugin:opener|open", { path: results[0].filepath });
          setSearchQuery("");
          return;
        }
      } catch (e) {
        console.error("Semantic search failed:", e);
      }

      // 3. Crate Intent
      if (query.startsWith("crate ") || query.startsWith("save ") || query.startsWith("snapshot ")) {
        const name = query.split(" ").slice(1).join(" ");
        if (name) {
          try {
            const currentWindows = await invoke("get_running_windows");
            await invoke("save_crate", { name, apps: currentWindows });
            fetchCrates();
            setSearchQuery("");
          } catch (e) { console.error(e); }
        }
        return;
      }

      // 3. Context Switch Intent
      const matched = contexts.find(ctx =>
        query.includes(ctx.id) ||
        query.includes(ctx.name.toLowerCase()) ||
        query.includes("move to") ||
        query.includes("switch to")
      );

      if (matched) {
        setActiveContext(matched.id);
        setSearchQuery("");
        return;
      }

      // 4. Fallback search (google)
      if (query.length > 0) {
        await invoke("plugin:opener|open", { path: `https://www.google.com/search?q=${encodeURIComponent(query)}` });
        setSearchQuery("");
      }
    }
  };

  const currentAura = auraColors[activeContext] || auraColors.dev;

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-200 selection:bg-blue-500/30 font-sans overflow-hidden">
      {/* Background Glows (Neural Aura) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none transition-all duration-1000">
        <motion.div
          animate={{ backgroundColor: currentAura }}
          className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] rounded-full blur-[180px] opacity-20"
        />
        <motion.div
          animate={{ backgroundColor: currentAura }}
          className="absolute bottom-[-20%] right-[10%] w-[50%] h-[50%] rounded-full blur-[180px] opacity-10"
        />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">

        {/* Header/Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-12"
        >
          {/* Neural Suggestion Hint */}
          <AnimatePresence>
            {suggestedContext && activeContext !== suggestedContext && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 text-[10px] font-bold text-blue-500/80 uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-blue-500/5 py-2 px-4 rounded-full border border-blue-500/10 backdrop-blur-sm self-center"
              >
                <Bot className="w-3 h-3 animate-pulse" />
                Neural Intent: Suggested Context - {contexts.find(c => c.id === suggestedContext)?.name}
                <button
                  onClick={() => { setActiveContext(suggestedContext); setSuggestedContext(null); }}
                  className="ml-2 hover:text-white transition-colors"
                >
                  [Approve]
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <div className="relative w-full max-w-xl">
              <div className="flex items-center px-4 py-3 bg-slate-900/40 border border-slate-700/50 rounded-2xl backdrop-blur-xl group-focus-within:border-blue-500/50 transition-all shadow-xl shadow-black/20">
                <Search className="w-5 h-5 text-slate-400 mr-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleSearchIntent}
                  placeholder="Neural Search across your ecosystem..."
                  className="w-full bg-transparent border-none outline-none text-sm placeholder:text-slate-600 font-medium text-white"
                />
                <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[9px] text-slate-500 font-bold whitespace-nowrap">CTRL + SHIFT + SPACE</kbd>
              </div>

              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 p-2 bg-slate-900/90 border border-slate-700/50 rounded-xl backdrop-blur-xl z-50 flex flex-col gap-1 shadow-2xl"
                  >
                    {searchResults.map((result, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors group">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", `bg-${result.aura}-500 shadow-[0_0_8px_currentColor]`)} />
                          <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{result.title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{result.type}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Action Center / Context Switcher */}
        <div className="flex flex-col items-center gap-8">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500"
          >
            Active Context
          </motion.h2>

          <div className="flex items-center gap-4 bg-slate-900/30 backdrop-blur-3xl p-4 rounded-[2rem] border border-white/5 shadow-2xl">
            {contexts.map((ctx) => {
              const Icon = ctx.icon;
              const isActive = activeContext === ctx.id;

              return (
                <motion.button
                  key={ctx.id}
                  onClick={() => handleContextSwitch(ctx.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 group",
                    isActive
                      ? "bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-xl"
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className={cn(
                    "w-8 h-8 transition-colors duration-300",
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute -bottom-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </motion.button>
              );
            })}

            <div className="w-[1px] h-12 bg-white/10 mx-2" />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveSettingTab("Crates");
                setShowSettings(true);
              }}
              className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl hover:bg-white/5 border border-dashed border-white/10 group"
            >
              <Settings className="w-6 h-6 text-slate-500 group-hover:text-slate-300" />
            </motion.button>
          </div>

          {nearbyProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 mt-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-6">
                {[
                  { name: 'NeuroForge', id: 'neuro' as const, color: 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' },
                  { name: 'Nexus Engine', id: 'nexus' as const, color: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' },
                  { name: 'Career Link', id: 'career' as const, color: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' },
                  { name: 'Market Watch', id: 'market' as const, color: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' }
                ].map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setActivePortal(node.id)}
                    className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                    title={`Focus Node: ${node.name}`}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      activePortal === node.id ? node.color : "bg-slate-700"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold tracking-widest uppercase transition-colors",
                      activePortal === node.id ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                    )}>{node.name}</span>
                  </button>
                ))}
              </div>

              <div className="relative">
                <AnimatePresence mode="wait">
                  {activePortal === 'neuro' && neuroProfile && (
                    <motion.div
                      key="neuro"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Neural DNA Link active</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NeuroForge Core</span>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium">Archetype</span>
                          <span className="text-sm font-bold text-white tracking-tight">{neuroProfile.risk_archetype || "Pioneer-Class"}</span>
                        </div>
                        <div className="p-2 rounded bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-2">
                          <Shield size={10} className="text-indigo-400" />
                          <span className="text-[10px] font-mono text-indigo-400">Vault: {securityStatus.vault}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-indigo-500/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Privacy & Auth Vault</span>
                          <span className="text-[10px] font-mono text-indigo-300/50">NextAuth • TempMail</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="px-2 py-1 rounded bg-indigo-500/5 border border-indigo-500/10 text-[9px] text-indigo-300 font-bold text-center">
                            OAuth: {securityStatus.oauth}
                          </div>
                          <div className="px-2 py-1 rounded bg-indigo-500/5 border border-indigo-500/10 text-[9px] text-indigo-300 font-bold text-center">
                            Mail: {securityStatus.tempMail}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePortal === 'nexus' && nexusHealth && (
                    <motion.div
                      key="nexus"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Nexus Pulse Active</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Infra Center</span>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium">Deployment</span>
                          <span className="text-sm font-bold text-white tracking-tight">{nexusHealth.status || "Healthy / Stable"}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Load Pulse</span>
                          <div className="flex gap-0.5 mt-1 h-3 items-end">
                            {[5, 12, 8, 15, 6, 10].map((h, i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [h, h * 1.5, h] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1.5 bg-emerald-500/40 rounded-t-sm"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <DesignShowroom />

                      <div className="pt-2 border-t border-emerald-500/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hardware & Build Pulse</span>
                          <span className="text-[9px] text-emerald-400 font-bold uppercase animate-pulse">Monitoring...</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-slate-900/60 border border-emerald-500/5">
                            <span className="text-[8px] text-slate-600 font-bold uppercase block">Linker (MSVC)</span>
                            <span className={cn("text-[10px] font-mono", diagStatus.linker === "Offline" ? "text-rose-500" : "text-emerald-500")}>{diagStatus.linker}</span>
                          </div>
                          <div className="p-2 rounded bg-slate-900/60 border border-emerald-500/5">
                            <span className="text-[8px] text-slate-600 font-bold uppercase block">Vite Port (1420)</span>
                            <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
                          </div>
                        </div>
                        <div className="p-2 rounded bg-rose-500/5 border border-rose-500/10 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-rose-300 font-bold uppercase block">Diagnostic Alert</span>
                            <AlertCircle size={10} className="text-rose-500" />
                          </div>
                          <p className="text-[9px] text-rose-400 font-medium leading-tight">Linker pulse not found. Visual Studio Build Tools required for native build.</p>
                          <button
                            onClick={() => window.open('https://visualstudio.microsoft.com/visual-cpp-build-tools/', '_blank')}
                            className="mt-1 px-2 py-1 bg-rose-500/20 border border-rose-500/20 rounded text-[9px] text-rose-300 font-bold uppercase hover:bg-rose-500/30 transition-all flex items-center justify-center gap-1"
                          >
                            <ExternalLink size={10} />
                            Install Build Tools
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePortal === 'career' && (
                    <motion.div
                      key="career"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex flex-col gap-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Career & Gaming Pulse</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Elite Profile</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ATS Score</span>
                          <span className="text-xl font-black text-rose-500">{careerData?.score || 98}%</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">HP / Torque</span>
                          <span className="text-xs font-bold text-white tracking-tight">{scoutData.hp}hp / {scoutData.torque}ft-lb</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-rose-500/10 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Alpha Engine Pulse</span>
                          <span className="text-[9px] text-rose-400 font-bold uppercase animate-pulse">Syncing...</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {gameEngineData.active.map((game: string) => (
                            <div key={game} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-300 font-mono">
                              {game}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => window.open(careerData?.portfolio || 'https://portfolio-pi-cyan-64.vercel.app', '_blank')}
                          className="flex items-center justify-center gap-2 w-full p-2 mt-2 bg-rose-500/20 border border-rose-500/20 rounded-xl group hover:bg-rose-500/30 transition-all"
                        >
                          <Globe size={12} className="text-rose-400 group-hover:rotate-12 transition-transform" />
                          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Open Portfolio</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activePortal === 'market' && (
                    <motion.div
                      key="market"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Market Watch Active</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real Estate</span>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400 font-medium">Hot Property</span>
                          <span className="text-sm font-bold text-white tracking-tight">{marketData.property}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price Point</span>
                          <span className="text-xl font-black text-amber-500">{marketData.price}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-500/10 flex flex-col gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Technical Encyclopedia</span>
                        <div className="flex flex-wrap gap-1.5">
                          {learningData.languages.map((lang: string) => (
                            <div key={lang} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-bold tracking-tight">
                              {lang}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* Settings Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-4xl bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[70vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-semibold">Oasis Control Center</h3>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                  </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Sidebar */}
                  <div className="w-64 border-right border-white/5 p-4 flex flex-col gap-2 bg-black/20">
                    {["Crates", "Neural Logs", "AI Settings", "Appearance", "Oasis Pulse"].map(item => (
                      <button
                        key={item}
                        onClick={() => setActiveSettingTab(item)}
                        className={cn(
                          "text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                          activeSettingTab === item ? "bg-blue-500/10 text-blue-400" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                        )}>
                        {item === "Oasis Pulse" && <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />}
                        {item === "Neural Logs" && <Bot className="w-4 h-4" />}
                        {item}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 overflow-y-auto">
                    {activeSettingTab === "Neural Logs" && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold mb-6">Neural Activity Stream</h4>
                        {logs.length === 0 && (
                          <div className="text-center py-12 text-slate-600 italic">No neural patterns recorded yet.</div>
                        )}
                        {logs.map(log => (
                          <div key={log.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4 hover:border-white/10 transition-all">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2 animate-pulse",
                              log.event_type === "SYNC" ? "bg-emerald-500 shadow-[0_0_8px_bg-emerald-500/50]" :
                                log.event_type === "CONTEXT_SWITCH" ? "bg-blue-500 shadow-[0_0_8px_bg-blue-500/50]" : "bg-slate-500"
                            )} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{log.event_type}</span>
                                <span className="text-[10px] text-slate-600 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed leading-snug">{log.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSettingTab === "Crates" && (
                      <>
                        <div className="flex justify-between items-center mb-8">
                          <h4 className="text-lg font-bold">Manage Context Crates</h4>
                          <button
                            onClick={createCrate}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                          >
                            Create New Crate
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {crates.length === 0 && (
                            <div className="col-span-2 text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                              <Monitor className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                              <p className="text-slate-500 font-medium">No crates found. Snapshot your current workspace to get started.</p>
                            </div>
                          )}
                          {crates.map(ctx => (
                            <div key={ctx.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 transition-all flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-800 rounded-xl">
                                  <Monitor className="w-5 h-5 text-white/70" />
                                </div>
                                <div>
                                  <div className="font-bold">{ctx.name}</div>
                                  <div className="text-xs text-slate-500">{ctx.apps.length} apps defined</div>
                                </div>
                              </div>
                              <button
                                onClick={() => launchCrate(ctx.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all text-xs font-bold text-blue-400"
                              >
                                Launch
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {activeSettingTab === "Oasis Pulse" && (
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unified Project Pulse</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Total Projects Indexed</span>
                                <span className="text-white font-bold">{pulseSummary.totalProjects}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Active Node Trajectories</span>
                                <span className="text-white font-bold">{pulseSummary.activeNodes}</span>
                              </div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-400">Ecosystem Health</span>
                                <span className="text-emerald-400 font-bold uppercase tracking-widest">{pulseSummary.ecosystemHealth}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">GitHub Sync Bridge</span>
                              <RefreshCw size={10} className="text-indigo-400" />
                            </div>
                            <div className="p-2 rounded bg-indigo-500/5 border border-indigo-500/10 text-[9px] text-indigo-300 font-mono text-center">
                              Synchronized to Origin Main
                            </div>
                            <button
                              onClick={() => window.open(repoUrl, '_blank')}
                              className="w-full py-1 text-[9px] text-slate-500 hover:text-white transition-colors uppercase font-bold"
                            >
                              View Repository
                            </button>
                          </div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-blue-600/20 to-indigo-900/10 border border-blue-500/20 rounded-3xl">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
                              <RefreshCw className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold">Neural Cloud Sync</h4>
                              <p className="text-sm text-slate-400">Linked to Oasis GitHub Repository</p>
                            </div>
                          </div>

                          <div className="bg-black/40 rounded-xl p-4 font-mono text-sm text-blue-300 border border-white/5 mb-6">
                            {repoUrl}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Last Pulsed</span>
                              <span className="text-sm text-slate-300">{lastSync || "Never"}</span>
                            </div>

                            <button
                              onClick={handleSync}
                              disabled={isSyncing}
                              className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                                isSyncing
                                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                  : "bg-white text-black hover:bg-blue-500 hover:text-white shadow-xl"
                              )}
                            >
                              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                              {isSyncing ? "Pulsing..." : "Trigger Pulse"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">Auto-Pulse Mode</span>
                              <span className="text-xs text-slate-500">Automatically backup context every {pulseInterval} minutes</span>
                            </div>
                            <button
                              onClick={() => setAutoPulse(!autoPulse)}
                              className={cn(
                                "relative w-12 h-6 rounded-full transition-colors",
                                autoPulse ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" : "bg-slate-800"
                              )}
                            >
                              <motion.div
                                animate={{ x: autoPulse ? 26 : 2 }}
                                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                              />
                            </button>
                          </div>
                        </div>

                        {/* Sentient Watcher Component */}
                        <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-800/20 border border-purple-500/20 rounded-3xl mt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-400" /> Auto-Sentience Overdrive
                              </span>
                              <span className="text-xs text-slate-500">Automatically AI-Vectoryze files in D:\myproject upon saving.</span>
                            </div>
                            <button
                              onClick={async () => {
                                const newVal = !autoWatch;
                                setAutoWatch(newVal);
                                if (newVal) {
                                  try { await invoke("start_watcher", { path: "D:\\myproject" }); } catch (e) { console.error(e); }
                                }
                              }}
                              className={cn(
                                "relative w-12 h-6 rounded-full transition-colors shadow-inner",
                                autoWatch ? "bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.6)]" : "bg-slate-800"
                              )}
                            >
                              <motion.div
                                animate={{ x: autoWatch ? 26 : 2 }}
                                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
                              />
                            </button>
                          </div>
                        </div>
                        
                        {/* Neural Indexer Component */}
                        <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-900/10 border border-purple-500/20 rounded-3xl mt-4">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20">
                              <Search className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold">Neural Semantic Indexer</h4>
                              <p className="text-sm text-slate-400">Scan folders into the Oasis Vector Database</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <input 
                              type="text" 
                              value={indexPath}
                              onChange={(e) => setIndexPath(e.target.value)}
                              placeholder="e.g. D:\myproject\scout-racer" 
                              className="flex-1 bg-black/40 border border-white/10 outline-none text-sm text-white placeholder:text-slate-600 py-3 px-4 rounded-xl"
                            />
                            <button 
                              onClick={async () => {
                                setIsIndexing(true);
                                setIndexStatus("idle");
                                try {
                                  const count: number = await invoke("index_folder", { path: indexPath });
                                  setIndexCount(count);
                                  setIndexStatus("success");
                                } catch (e) {
                                  setIndexStatus("error");
                                }
                                setIsIndexing(false);
                              }}
                              disabled={isIndexing}
                              className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap",
                                isIndexing ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-500 shadow-xl"
                              )}
                            >
                              <RefreshCw className={cn("w-4 h-4", isIndexing && "animate-spin")} />
                              {isIndexing ? "Embedding..." : "Index Folder"}
                            </button>
                          </div>
                          
                          {indexStatus === "success" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-medium">
                              Successfully vectorized {indexCount} files. It is now searchable via CTRL + SHIFT + SPACE.
                            </motion.div>
                          )}
                          {indexStatus === "error" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                              Failed to index folder. Ensure Ollama is running natively.
                            </motion.div>
                          )}
                        </div>

                        {syncStatus === "success" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Neural Synchonization Successful. Your context is now in the cloud.</span>
                          </motion.div>
                        )}

                        {syncStatus === "error" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400"
                          >
                            <span className="text-sm font-medium">Pulse Interrupted. Check your network or GitHub permissions.</span>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Native Bridge Warning Overlays */}
        {!isNative && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-6"
          >
            <div className="bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 p-6 rounded-3xl flex items-center gap-6 shadow-2xl">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                <Bot className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-blue-400 mb-1 tracking-tight">Oasis Preview Mode</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are currently in the Web Portal. To engage Neural Sync, Hotkeys, and Crating, please launch the <span className="text-white font-bold">Oasis Shell Desktop App</span>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Native Bridge Warning Overlays */}
        {!isNative && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-6"
          >
            <div className="bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 p-6 rounded-3xl flex items-center gap-6 shadow-2xl">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                <Bot className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-blue-400 mb-1 tracking-tight">Oasis Preview Mode</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You are currently in the Web Portal. To engage Neural Sync, Hotkeys, and Crating, please launch the <span className="text-white font-bold">Oasis Shell Desktop App</span>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-12 flex gap-12 text-xs font-medium text-slate-600 uppercase tracking-widest"
        >
          <div className="flex gap-2 items-center">
            <Monitor className="w-4 h-4 text-blue-400" />
            {windowCount} Active Windows
          </div>
          <div className="flex gap-2 items-center">
            <RefreshCw className={cn("w-4 h-4", isSyncing ? "text-blue-400 animate-spin" : "text-slate-600")} />
            {isSyncing ? "Neural Pulse In Progress" : `Last Pulse: ${lastSync || "NEVER"}`}
          </div>
          <div className="flex gap-2 items-center">
            <CloudLightning className="w-4 h-4 text-indigo-400" />
            Neural Link Stable
          </div>
          <div className="text-slate-700">Oasis v0.1.0-alpha</div>
        </motion.div>

        {/* 3D Neural Link Graph Overlay */}
        <AnimatePresence>
          {showGraph && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-3xl flex items-center justify-center cursor-move"
            >
              <div className="absolute top-10 left-10 z-[70] pointer-events-none">
                <h2 className="text-4xl font-bold flex items-center gap-4 text-white">
                  <Activity className="w-10 h-10 text-indigo-500 animate-pulse" />
                  Neural Cortex Array
                </h2>
                <p className="text-slate-400 mt-2 max-w-sm text-sm leading-relaxed">
                  Real-time 3D Semantic Map of <span className="text-indigo-400 font-bold">D:\myproject</span>. 
                  Nodes physically pull together based on mathematical Cosine Similarity in their code logic.
                </p>
              </div>
              
              <button 
                onClick={() => setShowGraph(false)}
                className="absolute top-10 right-10 z-[70] w-14 h-14 bg-white/5 hover:bg-red-500/80 rounded-full flex items-center justify-center transition-all text-white border border-white/20 shadow-2xl"
              >
                <Plus className="w-8 h-8 rotate-45" />
              </button>
              
              <div className="w-full h-full">
                <ForceGraph3D
                  graphData={graphData}
                  nodeAutoColorBy="group"
                  nodeRelSize={8}
                  backgroundColor="#00000000"
                  linkColor={() => 'rgba(99,102,241,0.3)'}
                  linkWidth={2}
                  nodeLabel="id"
                  enableNodeDrag={true}
                  showNavInfo={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next-Gen File Vault Overlay */}
        <AnimatePresence>
          {showVault && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-3xl overflow-y-auto custom-scrollbar p-10"
            >
              <div className="max-w-7xl mx-auto mt-10">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-4xl font-bold flex items-center gap-4 text-white">
                    <FolderOpen className="w-10 h-10 text-emerald-400" />
                    Neural File Vault
                  </h2>
                  <button 
                    onClick={() => setShowVault(false)}
                    className="w-14 h-14 bg-white/5 hover:bg-red-500/80 rounded-full flex items-center justify-center transition-all text-white border border-white/20 shadow-2xl"
                  >
                    <Plus className="w-8 h-8 rotate-45" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {vaultFiles.map((file, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-2xl"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl group-hover:bg-emerald-500 transition-colors">
                          <FileCode2 className="w-6 h-6 text-emerald-300 group-hover:text-white" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="text-lg font-bold text-white truncate">{file.filename}</h3>
                          <p className="text-xs text-slate-500 truncate mt-1">{file.filepath}</p>
                        </div>
                      </div>
                      <div className="bg-black/50 p-4 rounded-xl border border-white/5 h-24 overflow-hidden">
                        <code className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                          {file.snippet}
                        </code>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-emerald-300 font-semibold uppercase tracking-wider border border-emerald-500/20">Semantic Match</span>
                      </div>
                    </motion.div>
                  ))}
                  {vaultFiles.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-500">
                      <FolderOpen className="w-16 h-16 mb-4 opacity-50" />
                      <p>Vault is empty. Auto-Watcher is waiting for files to be assimilated.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Assistant Bubble */}
        <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4 z-50">
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="w-80 h-[450px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold tracking-tight">Neural Link</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                  </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-black/10">
                  {messages.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={cn(
                        "p-4 rounded-2xl text-[13px] leading-relaxed max-w-[90%] shadow-lg",
                        msg.role === "user"
                          ? "bg-blue-600 text-white self-end ml-auto rounded-tr-none shadow-blue-600/20"
                          : "bg-white/5 border border-white/5 text-slate-300 self-start rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/40">
                  <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
                    <input
                      type="text"
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      onKeyDown={handleAssistantChat}
                      placeholder="Neural Command..."
                      className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 py-2"
                    />
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openVault}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] bg-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white"
          >
            <FolderOpen className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGraph(true)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] bg-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white"
          >
            <Activity className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSync}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl",
              isSyncing ? "bg-blue-600/20 text-blue-400" : "bg-white/5 backdrop-blur-xl border border-white/10 text-yellow-400 hover:bg-yellow-400/10"
            )}
          >
            <Zap className={cn("w-5 h-5", isSyncing && "animate-pulse")} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAI(!showAI)}
            className={cn(
              "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500",
              showAI ? "bg-blue-600 text-white rotate-90" : "bg-white/10 backdrop-blur-xl text-white border border-white/10 hover:bg-white/20 shadow-blue-500/10"
            )}
          >
            {showAI ? <Plus className="w-8 h-8 rotate-45" /> : <Bot className="w-8 h-8" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default App;
