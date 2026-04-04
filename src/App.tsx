import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Cpu, RotateCcw,
  Bot, BrainCircuit, Terminal, Search, Trash2, Plus,
  Zap, Shield, X, ShieldCheck, AlertCircle, FolderOpen, Activity, LayoutDashboard, ShieldAlert, Lock
} from "lucide-react";
import ForceGraph3D from "react-force-graph-3d";
import SystemPanel, { SystemStats, WindowInfo } from "./components/panels/SystemPanel";
import LeftRail from "./components/layout/LeftRail";
import TopBar from "./components/layout/TopBar";
import CommandPalette from "./components/overlays/CommandPalette";

// Design Utility
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// Context Library
const contexts = [
  { id: 'dev', name: 'Strategic Core', icon: Terminal, aura: 'rgba(99, 102, 241, 0.4)' },
  { id: 'design', name: 'Creative Forge', icon: Shield, aura: 'rgba(168, 85, 247, 0.4)' },
  { id: 'growth', name: 'Capital Matrix', icon: Activity, aura: 'rgba(16, 185, 129, 0.4)' }
];

interface FounderMetrics {
  arr: string;
  burn: string;
  runway: string;
  momentum: string;
  stress_color: string;
}

export default function App() {
  // --- CORE STATE ---
  const [founderMetrics, setFounderMetrics] = useState<FounderMetrics>({
    arr: "$1.24M",
    burn: "$0.85M",
    runway: "14.2 Mo",
    momentum: "+12.8%",
    stress_color: "#10b981"
  });
  const [marketIntel, setMarketIntel] = useState<any>([
    { symbol: "OASIS_INDEX", price: "$1,421.40", change: "+2.4%" },
    { symbol: "SAP_COMP", price: "$42.50", change: "-1.1%" },
    { symbol: "GLOBAL_AI", price: "8,942.00", change: "+0.8%" }
  ]);
  const [simMetrics, setSimMetrics] = useState({ arr: 1.24, burn: 42.5, momentum: 12.8 });
  const [simMode, setSimMode] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([
    { id: 1, type: 'system', event: 'Oasis Foundry Kernel Initialized', time: '09:42:00' },
    { id: 2, type: 'neural', event: 'Venture Metrics Synced with Rust Kernel', time: '09:42:15' }
  ]);
  const [notification, setNotification] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showCLI, setShowCLI] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [auraIp, setAuraIp] = useState("192.168.1.100");
  const [activeContext, setActiveContext] = useState('dev');
  const [lastSync, setLastSync] = useState("");
  const [workforce, setWorkforce] = useState<any[]>([]);
  const [strategicInventory, setStrategicInventory] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [runningWindows, setRunningWindows] = useState<WindowInfo[]>([]);
  const [systemLastSync, setSystemLastSync] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  const [fiscalBurn, setFiscalBurn] = useState({ total_burn: 0.0, token_load: 0, status: 'NOMINAL' });

  useEffect(() => {
    const pulse = setInterval(async () => {
       try {
          const metrics = await invoke("get_venture_metrics") as any;
          setFounderMetrics(metrics);
          
          // Only pull full diagnostics if the panel is open or every 30s
          const stats = await invoke("run_system_diagnostic") as SystemStats;
          setSystemStats(stats);

          const integrity = await invoke("get_venture_integrity") as number;
          setVentureIntegrity(integrity);

          const fiscal = await invoke("get_fiscal_report") as any;
          setFiscalBurn(fiscal);
       } catch (e) {}
    }, 5000);
    return () => clearInterval(pulse);
  }, []);

  const [zenMode, setZenMode] = useState(false);
  const [chronosLedger, setChronosLedger] = useState<any[]>([]);
  const [chronosIndex, setChronosIndex] = useState(-1);
  const [voiceActive, setVoiceActive] = useState(false);
  const [crossWisdom, setCrossWisdom] = useState<any[]>([]);
  const [neuralWisdom, setNeuralWisdom] = useState<any>(null);
  const [aegisLedger, setAegisLedger] = useState<any>(null);
  const [activeOracle, setActiveOracle] = useState<any>(null);
  const [sentinelVault, setSentinelVault] = useState<any>(null);
  const [showNexus, setShowNexus] = useState(false);
  const [showSentinel, setShowSentinel] = useState(false);
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [founderSecret, setFounderSecret] = useState("");
  const [activeVenture /*, setActiveVenture */] = useState("Oasis Core (Alpha)");
  const [cliInput, setCliInput] = useState("");
  const [cliHistory, setCliHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingManifests, setPendingManifests] = useState<any[]>([]);
  const [oracleAlert, setOracleAlert] = useState<any>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showCortex, setShowCortex] = useState(false);
  const [cortexResults, setCortexResults] = useState<any[]>([]);
  const [ventureNetwork, setVentureNetwork] = useState<any[]>([]);
  const [manifestHistory, setManifestHistory] = useState<string[]>([]);
  const [hardwareStatus, setHardwareStatus] = useState<any>(null);
  const [activeGolem, setActiveGolem] = useState<any>(null);
  const [activeTasks, setActiveTasks] = useState<any[]>([
    { id: 'edge', name: 'Edge Cluster', status: 'Deployed', prog: 100, color: 'emerald' },
    { id: 'core', name: 'Core Stable', status: 'Active', prog: 100, color: 'indigo' },
    { id: 'arch', name: 'Architecture', status: 'Manifesting', prog: 65, color: 'purple' }
  ]);
  const [economicNews, setEconomicNews] = useState<string[]>([]);
  const [activeSynthesis, setActiveSynthesis] = useState<any>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [storageReport, setStorageReport] = useState<any>(null);
  const [activeDebate, setActiveDebate] = useState<any>(null);
  const [autoAura, setAutoAura] = useState(false);
  const [ventureIntegrity, setVentureIntegrity] = useState(100);
    const [activeView, setActiveView] = useState<'dash' | 'processes' | 'storage'>('dash');
  const [processes, setProcesses] = useState<any[]>([]);
  const [storage, setStorage] = useState<any[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Global Command Palette Key Listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(p => !p);
      }
      if (e.key === 'Escape') setShowCommandPalette(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const refreshSystemData = async () => {
    try {
      const p = await invoke("get_process_list") as any[];
      setProcesses(p);
      const s = await invoke("get_storage_map") as any[];
      setStorage(s);
    } catch (e) {}
  };

  useEffect(() => {
    if (activeView === 'processes' || activeView === 'storage') {
      const interval = setInterval(refreshSystemData, 3000);
      refreshSystemData();
      return () => clearInterval(interval);
    }
  }, [activeView]);


  useEffect(() => {
    const initializeOasis = async () => {
      setMounted(true);
      try {
        // PULLING REAL VENTURE DATA FROM THE RUST KERNEL DOOMSDAY LEDGER
        const metrics = await invoke("load_venture_state") as FounderMetrics;
        if (metrics) setFounderMetrics(metrics);
        
        const ledger = await invoke("get_chronos_ledger") as any[];
        setChronosLedger(ledger);
        setChronosIndex(ledger.length > 0 ? ledger.length - 1 : 0);

        const news = await invoke("get_economic_news") as string[];
        setEconomicNews(news);

        const wf = await invoke("get_neural_workforce", { marketIndex: 100.0 }) as any[];
        setWorkforce(wf);

        const initialFiscal = await invoke("get_fiscal_report") as any;
        setFiscalBurn(initialFiscal);

        setNotification("Oasis Neural Layer: Real-Time Venture Ledger Synchronized.");
      } catch (e) {
        console.error("Neural Sync Failure:", e);
      }
    };
    initializeOasis();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
       try {
         const integrity = await invoke("get_venture_integrity") as number;
         setVentureIntegrity(integrity);
       } catch(e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVoiceIntent = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onresult = (event: any) => {
       const transcript = event.results[0][0].transcript.toLowerCase();
       setNotification(`Oasis Resonating: "${transcript}"`);
       resolveNeuralIntent(transcript);
    };
    recognition.start();
  };

  const handleCommitSim = async () => {
    const newMetrics = { ...founderMetrics, arr: `$${simMetrics.arr}M`, burn: `$${simMetrics.burn}K/mo` };
    setFounderMetrics(newMetrics);
    setSimMode(false);
    
    // PERSIST & SNAPSHOT
    await invoke("save_venture_state", { metrics: newMetrics });
    await invoke("create_chronos_snapshot", { metrics: newMetrics, market: marketIntel });
    const ledger = await invoke("get_chronos_ledger") as any[];
    setChronosLedger(ledger);
    setChronosIndex(ledger.length - 1);
    setNotification("Venture State Etched to Chronos Ledger.");
  };

  useEffect(() => {
    const syncInventoryData = async () => {
      try {
        const inv = await invoke("get_strategic_inventory") as any[];
        setStrategicInventory(inv);
      } catch (e) {}
    };
    syncInventoryData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => (setNotification as any)(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // --- LOGIC: MEMORY & INTENT ---
  const logEvent = (event: string, type: 'neural' | 'deploy' | 'system') => {
    setTimeline(prev => [{ 
      id: Date.now(), 
      type, 
      event, 
      time: new Date().toLocaleTimeString() 
    }, ...prev].slice(0, 50));
  };

  const resolveNeuralIntent = async (query: string) => {
    const q = query.toLowerCase();
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setIsThinking(true);
    logEvent(`Neural Intent Captured: "${query}"`, 'neural');

    try {
      const res = await invoke("execute_neural_intent", { query }) as { content: string, tool: string, data?: any };
      setIsThinking(false);
      
      setMessages(prev => [...prev, { role: "assistant", content: res.content }]);
      
      // Secondary UI Reactions based on Tool Execution
      if (res.tool === "VAULT_SEAL") {
        setShowVault(true);
        const vault = await invoke("get_sentinel_ledger") as any;
        setSentinelVault(vault);
        logEvent("Sentinel Seal Sequence Complete", "system");
      } else if (res.tool === "SYSTEM_SCAN") {
        setSystemStats(res.data);
        setNotification(`Neural Pulse: CPU @ ${res.data.cpu_load.toFixed(1)}%`);
        logEvent("Global System Scan Executed", "system");
      } else if (res.tool === "SYNC_GITHUB") {
        setNotification("Oasis Pulse: Workspace Sync Successful.");
        logEvent("GitHub Neural Sync Complete", "deploy");
      } else if (res.tool === "ORACLE_FORECAST") {
        setActiveOracle(res.data);
        logEvent("Oracle Vision: Projection Synchronized", "neural");
      } else if (res.tool === "NONE") {
        // Fallback for custom logic not yet in the backend router
        if (q.includes("presentation") || q.includes("vision")) {
           setPresentationMode(true);
           logEvent("Visionary Portal Activated", "system");
        } else if (q.includes("graph") || q.includes("3d")) {
           setShowGraph(true);
           logEvent("Strategic Cortex Multi-Node Analysis", "system");
        }
      }
    } catch (e: any) {
      setIsThinking(false);
      setMessages(prev => [...prev, { role: "assistant", content: `Neural Error: ${e}` }]);
      setNotification(`Neural Intent Failure: ${e}`);
    }
    
    setSearchQuery("");
  };


  const handleSearchIntent = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      resolveNeuralIntent(searchQuery);
    }
  };

  // EFFECT: Physical Aura Sync (Pillar 25)
  useEffect(() => {
    if (autoAura) {
      let targetColor = "indigo"; // Default Focus
      if (activeDebate?.consensus_aura === 'volatile') targetColor = "rose";
      else if (ventureIntegrity < 50) targetColor = "amber";
      else if (ventureIntegrity >= 95) targetColor = "emerald";

        invoke("sync_physical_aura", { integrity: ventureIntegrity, ip: auraIp }).catch(() => {});
    }
  }, [autoAura, activeDebate, ventureIntegrity]);

  const handleNeuralSend = () => {
    if (!assistantInput.trim()) return;
    resolveNeuralIntent(assistantInput);
    setAssistantInput("");
  };

  const handleExecuteManifest = async (m: any) => {
    try {
      setNotification(`Foundry: Committing Neural Manifest '${m.title}' to Kernel...`);
      await invoke("execute_golem_manifest", { id: m.id, title: m.title, code: m.code_draft });
      setNotification(`Strategic Sync Success: Module '${m.title}' is now LIVE.`);
      setPendingManifests(prev => prev.filter(p => p.id !== m.id));
      logEvent(`Autonomous Manifest '${m.title}' Deployed`, "deploy");
    } catch (e) {
      setNotification(`Manifest Failure: ${e}`);
    }
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
    const triggerAudit = async () => {
      try {
        const alert = await invoke("trigger_oracle_audit", { arr: simMetrics.arr, burn: simMetrics.burn }) as any;
        setOracleAlert(alert);
        setNotification(`Neural Oracle Audit Complete: ${alert.title}`);
      } catch (e) {}
    };
    triggerAudit();
    const interval = setInterval(triggerAudit, 60000);
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

  useEffect(() => {
    const syncNewsData = async () => {
      try {
        const news = await invoke("get_economic_news") as string[];
        setEconomicNews(news);
      } catch (e) {}
    };
    syncNewsData();
    const interval = setInterval(syncNewsData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncHardwareData = async () => {
      try {
        const hs = await invoke("trigger_hardware_symbiosis", { stressColor: founderMetrics.stress_color }) as any;
        setHardwareStatus(hs);
      } catch (e) {}
    };
    syncHardwareData();
    const interval = setInterval(syncHardwareData, 10000);
    return () => clearInterval(interval);
  }, [founderMetrics.stress_color]);

  const handleRewind = async () => {
    try {
      const res = await invoke("restore_venture_state", { files: manifestHistory }) as string;
      setNotification(res);
      setManifestHistory([]);
      setFounderMetrics(prev => ({ ...prev, stress_color: "#6366f1" }));
    } catch (e) {}
  };

  useEffect(() => {
    const syncNetworkData = async () => {
      try {
        const net = await invoke("get_available_ventures") as any[];
        setVentureNetwork(net);
      } catch (e) {}
    };
    syncNetworkData();
    const interval = setInterval(syncNetworkData, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const restoreState = async () => {
      try {
        const met = await invoke("load_venture_state") as any;
        setFounderMetrics(met);
        // Normalize simulation inputs to persisted state
        const arrVal = parseFloat(met.arr.replace('$', '').replace('M', ''));
        const burnVal = parseFloat(met.burn.replace('$', '').replace('K/mo', ''));
        setSimMetrics({ arr: arrVal, burn: burnVal, momentum: 12.8 });
      } catch (e) {}
    };
    restoreState();
  }, []);

  useEffect(() => {
    const syncInventoryData = async () => {
      try {
        const inv = await invoke("get_strategic_inventory") as any[];
        setStrategicInventory(inv);
      } catch (e) {}
    };
    syncInventoryData();
    const interval = setInterval(syncInventoryData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncSystemData = async () => {
      try {
        const stats = await invoke("run_system_diagnostic") as any;
        setSystemStats(stats);
        
        const ledger = await invoke("get_chronos_ledger") as any[];
        setChronosLedger(ledger);
        setChronosIndex(ledger.length - 1);
      } catch (e) {}
    };
    syncSystemData();
  }, []);

  const refreshSystemSnapshot = async () => {
    try {
      const stats = await invoke("run_system_diagnostic") as SystemStats;
      setSystemStats(stats);
      const windows = await invoke("get_running_windows") as WindowInfo[];
      setRunningWindows(windows);
      setSystemLastSync(new Date().toLocaleTimeString());
    } catch (e) {}
  };

  useEffect(() => {
    const syncWindows = async () => {
      try {
        const windows = await invoke("get_running_windows") as WindowInfo[];
        setRunningWindows(windows);
      } catch (e) {}
    };
    syncWindows();
    const interval = setInterval(syncWindows, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleHotkey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === "p") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (key === "escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, []);

  const handleCommandExecute = async (query: string) => {
    if (!query.trim()) return;
    await resolveNeuralIntent(query);
    setCommandQuery("");
    setCommandOpen(false);
  };

  const displayedMetrics = chronosIndex >= 0 && chronosIndex < chronosLedger.length 
    ? chronosLedger[chronosIndex].metrics 
    : founderMetrics;
  
  if (displayedMetrics) console.log("Current Metrics Context Restored.");

  useEffect(() => {
    const setupDragDrop = async () => {
      const unlisten = await listen("tauri://drag-drop", (event: any) => {
        const paths = event.payload.paths;
        if (paths && paths.length > 0) {
          if (showSentinel && !isVaultLocked) {
            setNotification(`Sentinel: Sealing ${paths.length} targeted assets...`);
            paths.forEach((p: string) => {
               const title = p.split(/[\\/]/).pop() || "Strategic Asset";
               handleSealAsset(p, title);
            });
          } else {
            setNotification(`Neural Intent: Drag-drop detected. Open Sentinel to seal files.`);
          }
        }
      });
      return unlisten;
    };
    
    let unlistenFn: any;
    setupDragDrop().then(u => unlistenFn = u);
    return () => { if (unlistenFn) unlistenFn(); };
  }, [showSentinel, isVaultLocked]);

  const displayedMarket = chronosIndex >= 0 && chronosIndex < chronosLedger.length 
    ? chronosLedger[chronosIndex].market 
    : marketIntel;

  const handleInstallShell = async () => {
    try {
      const res = await invoke("install_oas_binary") as string;
      setNotification(res);
      const stats = await invoke("run_system_diagnostic") as any;
      setSystemStats(stats);
    } catch (e) {}
  };

  const handleAuthorizeBranch = async (agentId: string, tag: string) => {
    try {
      const res = await invoke("authorize_branch", { agentId, branchTag: tag }) as string;
      setNotification(res);
      // Refresh workforce status
      const wf = await invoke("get_neural_workforce") as any[];
      setWorkforce(wf);
    } catch (e) {}
  };

  const handleChronosSliderChange = (index: number) => {
    setChronosIndex(index);
    setNotification(`Temporal Rewind: Accessing Snapshot L_${index}`);
  };

  const handleCLICommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput) return;
    const [cmd, ...args] = cliInput.split(" ");
    try {
      if (cmd === "manifest" && args[0] === "golem") {
        await invoke("register_new_golem", { name: "DummyGolem", status: "Active" });
        setNotification("New Golem Registered.");
      }
      const res = await invoke("execute_cli_directive", { directive: { cmd, args }, stressColor: founderMetrics.stress_color }) as any;
      setCliHistory(prev => [...prev, { type: 'cmd', text: `oas ${cliInput}`, color: '#6366f1' }, { type: 'res', text: res.output, color: res.aura_color }]);
      setNotification(`Oas Directive Executed: ${cmd.toUpperCase()}`);
    } catch (e: any) {
      setCliHistory(prev => [...prev, { type: 'cmd', text: `oas ${cliInput}`, color: '#6366f1' }, { type: 'res', text: e, color: '#ef4444' }]);
    }
    setCliInput("");
  };

  const handleAegisSync = async () => {
    try {
      const res = await invoke("sync_venture_to_aegis", { 
        ventureId: activeVenture.replace(" ", "_").toLowerCase(),
        name: activeVenture,
        metrics: founderMetrics,
        market: marketIntel
      }) as string;
      setNotification(res);
      const ledger = await invoke("get_aegis_ledger") as any;
      setAegisLedger(ledger);
    } catch (e) {}
  };

  const handleNeuralMirror = async (sourceId: string) => {
    try {
      const wisdom = await invoke("mirror_venture_intelligence", { sourceId }) as string[];
      setCrossWisdom(wisdom);
      setNotification(`Neural Mirror Connected: Knowledge transfer from ${sourceId} successful.`);
      setShowNexus(false);
    } catch (e) {}
  };

  const handleOracleVision = async (ventureId: string) => {
    try {
      const forecast = await invoke("invoke_oracle_prediction", { ventureId }) as any;
      setActiveOracle(forecast);
      setNotification(`Oracle Sigil Detected: 12-Month Projection manifested for ${ventureId}.`);
    } catch (e) {}
  };

  const handleAuthenticateFounder = async () => {
    if (!founderSecret) return;
    try {
      const success = await invoke("authenticate_founder", { secret: founderSecret });
      if (success) {
        setIsVaultLocked(false);
        setNotification("Vocal Resonance: Founder Identity Verified. Vault Unsealed.");
        invoke("log_strategic_pulse", { nodeId: "sentinel_auth", status: "emerald" }).catch(() => {});
        const vault = await invoke("get_sentinel_ledger") as any;
        setSentinelVault(vault);
      }
    } catch (e: any) {
      setNotification(`Neural Authentication Failure: ${e}`);
    }
  };

  const handleSealAsset = async (path: string, title: string) => {
    try {
      const res = await invoke("seal_strategic_asset", { filePath: path, title }) as string;
      setNotification(res);
      const vault = await invoke("get_sentinel_ledger") as any;
      setSentinelVault(vault);
    } catch (e) {}
  };

  const handleUnsealAsset = async (id: string) => {
    try {
      const res = await invoke("unseal_strategic_asset", { blobId: id }) as string;
      setNotification(res);
      const vault = await invoke("get_sentinel_ledger") as any;
      setSentinelVault(vault);
    } catch (e) {}
  };

  useEffect(() => {
    const syncAegisData = async () => {
      try {
        const ledger = await invoke("get_aegis_ledger") as any;
        setAegisLedger(ledger);
        const vault = await invoke("get_sentinel_ledger") as any;
        setSentinelVault(vault);
      } catch (e) {}
    };
    syncAegisData();
  }, []);

  // --- SYNC: BRIDGE ---
  useEffect(() => {
    const syncFoundryData = async () => {
      try {
        const metrics = await invoke("get_venture_metrics", { founderArr: simMetrics.arr, founderBurn: simMetrics.burn }) as any;
        const intel = await invoke("get_market_intelligence") as any;
        setMarketIntel(intel);
        
        // Pass market index to workforce for reactor logic
        const wf = await invoke("get_neural_workforce", { marketIndex: intel.market_index || 100.0 }) as any[];
        setWorkforce(wf);

        if (!simMode) {
            setFounderMetrics({ ...metrics, stress_color: metrics.stress_color || "#6366f1" });
            invoke("save_venture_state", { metrics: { ...metrics, stress_color: metrics.stress_color || "#6366f1" } });
        }
        setLastSync(new Date().toLocaleTimeString());
      } catch (e) {
        if (!simMode) {
          setFounderMetrics({
            arr: "$1.24M", burn: "$42.5K/mo", runway: "18.4 Mo.", momentum: "+12.8%", stress_color: "#10b981"
          });
        }
        setLastSync(new Date().toLocaleTimeString() + " (Simulated)");
      }
    };
    syncFoundryData();
    const interval = setInterval(syncFoundryData, 10000);
    return () => clearInterval(interval);
  }, [simMode, simMetrics.arr, simMetrics.burn]);

  // --- HELPERS: COMMAND PALETTE & SYSTEM HUD ---
  const CommandPalette = () => {
    const [search, setSearch] = useState("");
    const actions = [
      { id: 'dash', label: 'Tactical Workspace: Dashboard', icon: LayoutDashboard },
      { id: 'processes', label: 'Neural Watch: Process HUD', icon: Cpu },
      { id: 'storage', label: 'Atlas: Storage Mapping', icon: Shield },
      { id: 'vault', label: 'Archive: Sentinel Vault', icon: Lock },
      { id: 'sync', label: 'Pulse: GitHub Workspace Sync', icon: RotateCcw },
    ];
    const filtered = actions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[5000] flex items-start justify-center pt-32 bg-black/60 backdrop-blur-md p-4"
        onClick={() => setShowCommandPalette(false)}
      >
        <motion.div 
          initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }}
          className="w-full max-w-2xl glass-bright border border-white/10 rounded-[2.5rem] overflow-hidden shadow-6xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-8 border-b border-white/5 flex items-center gap-6">
            <Search className="w-6 h-6 text-indigo-400" />
            <input 
              autoFocus placeholder="Neural Directive..."
              className="bg-transparent border-none outline-none text-2xl font-black w-full text-white placeholder:text-slate-700"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && filtered[0] && handlePaletteAction(filtered[0].id)}
            />
          </div>
          <div className="p-4 max-h-[450px] overflow-y-auto custom-scrollbar">
            {filtered.map(action => (
              <button key={action.id} onClick={() => handlePaletteAction(action.id)}
                className="w-full text-left p-5 hover:bg-white/5 rounded-3xl flex items-center gap-6 group transition-all"
              >
                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-indigo-500/20 text-slate-500 group-hover:text-indigo-400 transition-colors">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{action.id === 'dash' ? 'Primary Directive' : 'System Authority'}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const handlePaletteAction = (id: string) => {
    setShowCommandPalette(false);
    if (['dash', 'processes', 'storage'].includes(id)) setActiveView(id as any);
    else if (id === 'vault') setShowVault(true);
    else if (id === 'sync') resolveNeuralIntent("sync to github");
  };

  const SystemHUD = () => (
    <div className="w-full h-full flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {storage.map((disk, i) => (
          <div key={i} className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
             <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-2xl font-black text-white mb-1 uppercase italic tracking-tighter">{disk.name || "PRIMARY HOST"}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{disk.mount}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 text-indigo-400"><Shield className="w-7 h-7" /></div>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Allocated: {((disk.total - disk.available) / (1024**3)).toFixed(1)}GB</span>
                   <span className="text-indigo-400">{(disk.total / (1024**3)).toFixed(1)}GB Total</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${100 - disk.health_score}%` }}
                    className={cn("h-full", disk.health_score < 20 ? "bg-rose-500" : "bg-indigo-500 shadow-[0_0_15px_#6366f1]")} />
                </div>
             </div>
          </div>
        ))}
      </div>
      <div className="glass rounded-[4rem] border border-white/5 overflow-hidden flex-1 flex flex-col shadow-2xl">
          <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h3 className="text-xl font-black text-white uppercase tracking-[0.4em] flex items-center gap-6">
              <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
              OS Process Orchestrator
            </h3>
            <div className="flex gap-4">
              <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {processes.length} Active Nodes
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar border-t border-white/5">
            <table className="w-full text-left border-separate border-spacing-y-4">
               <thead>
                 <tr className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">
                    <th className="px-10">Neural PID</th>
                    <th className="px-10">Application Identity</th>
                    <th className="px-10">Load Sync</th>
                    <th className="px-10 text-center">Memory Block</th>
                    <th className="px-10 text-right">Directives</th>
                 </tr>
               </thead>
               <tbody>
                  {processes.map((proc, i) => (
                    <tr key={i} className="hover:bg-white/[0.03] transition-all group bg-white/[0.01]">
                      <td className="px-10 py-6 text-xs font-mono text-slate-500 rounded-l-[2rem]">{proc.pid}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-lg shadow-inner">
                              {proc.name.charAt(0).toUpperCase()}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-white text-lg tracking-tighter">{proc.name}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Authenticated Host App</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden shadow-inner">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(proc.cpu_usage, 100)}%` }} className="h-full bg-indigo-500" />
                           </div>
                           <span className="text-xs font-mono text-indigo-400 font-black">{proc.cpu_usage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center text-xs font-mono text-slate-400">
                        {(proc.mem_usage / (1024**2)).toFixed(1)} <span className="text-[10px] text-slate-600">MB</span>
                      </td>
                      <td className="px-10 py-6 text-right rounded-r-[2rem]">
                         <button onClick={async () => {
                            await invoke("kill_quarantine_process", { pid: proc.pid });
                            setNotification(`Sentinel: Quarantined ${proc.name}`);
                            refreshSystemData();
                          }} className="px-6 py-3 border border-red-500/20 text-red-500/40 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all opacity-0 group-hover:opacity-100">
                           Quarantine
                         </button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
      </div>
    </div>
  );




  return (
    <div 
        className={cn(
            "min-h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden flex selection:bg-indigo-500/30 transition-all duration-1000",
            hardwareStatus?.focus_mode.includes("Survival") ? "grayscale-lockdown" : ""
        )}
    >
      {/* Neural Command Palette (GLOBAL CORE) */}
      <AnimatePresence>
        {showCommandPalette && (
          <CommandPalette />
        )}
      </AnimatePresence>

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
                <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">{oracleAlert.body}</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest opacity-80">
                   <Globe className="w-4 h-4" /> Market Signal: {oracleAlert.economic_signal}
                </div>
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
        <div className="absolute inset-0 opacity-[0.03] grayscale invert mix-blend-overlay" style={{ backgroundImage: 'url("/noise.svg")' }} />
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
      <LeftRail
        presentationMode={presentationMode}
        simMode={simMode}
        onDash={() => handleContextSwitch("dev")}
        onOpenGraph={() => setShowGraph(true)}
        onOpenVault={() => setShowVault(true)}
        onOpenLogs={() => setShowLogs(true)}
        onActivateSim={() => setSimMode(true)}
        onToggleSim={() => setSimMode(!simMode)}
        onOpenSettings={() => setShowSettings(!showSettings)}
        chronosIndex={chronosIndex}
        chronosCount={chronosLedger.length}
        chronosLabel={(chronosLedger[chronosIndex] as any)?.timestamp?.split("T")[1]?.split(".")[0]}
        onChronosChange={handleChronosSliderChange}
        onJumpToPresent={() => setChronosIndex(chronosLedger.length - 1)}
      />

      {/* Main Command Stage */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
                <TopBar
          activeVenture={activeVenture}
          activeContext={activeContext}
          contexts={contexts}
          zenMode={zenMode}
          voiceActive={voiceActive}
          autoAura={autoAura}
          ventureIntegrity={ventureIntegrity}
          fiscalBurn={fiscalBurn}
          hardwareStatus={hardwareStatus}
          displayedMarket={displayedMarket}
          lastSync={lastSync}
          presentationMode={presentationMode}
          onOpenSentinel={() => setShowSentinel(true)}
          onVoiceIntent={handleVoiceIntent}
          onToggleZen={() => setZenMode(!zenMode)}
          onToggleCLI={() => setShowCLI(!showCLI)}
          onTogglePresentation={() => setPresentationMode(!presentationMode)}
          onToggleNetwork={() => setShowNetwork(!showNetwork)}
          onToggleAutoAura={() => setAutoAura(!autoAura)}
          onAegisSync={handleAegisSync}
          onOpenNexus={() => setShowNexus(true)}
        />

        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto custom-scrollbar">
            {activeView !== 'dash' && (
               <div className="w-full max-w-7xl flex flex-col items-start gap-12">
                  <div className="flex items-center gap-6">
                     <button onClick={() => setActiveView('dash')} className="p-4 glass rounded-[1.5rem] hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                        <RotateCcw className="w-6 h-6" />
                     </button>
                     <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                        {activeView === 'processes' ? 'Strategic Process HUD' : 'Host Storage Atlas'}
                     </h2>
                  </div>
                  <SystemHUD />
               </div>
            )}

            {activeView === 'dash' && <>

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

            {/* Global Venture Pulse Ticker (Enhanced with Economic Sentinel Pillar 25) */}
            <div className="flex gap-12 items-center overflow-hidden w-full max-w-5xl py-4 border-y border-white/5 bg-black/20 backdrop-blur-md px-12 rounded-[5rem] mb-12 group cursor-pointer relative">
               <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10" />
               <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10" />
               <div className="flex gap-12 items-center animate-marquee whitespace-nowrap group-hover:pause">
                  {marketIntel.map((m: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.symbol}</span>
                       <span className="text-sm font-bold text-white tracking-tight">{m.price}</span>
                       <span className={cn("text-[10px] font-black tracking-widest uppercase", m.change.startsWith('+') ? "text-emerald-500" : "text-red-500")}>
                          {m.change}
                       </span>
                    </div>
                  ))}
                  {economicNews.map((n: string, i: number) => (
                    <div key={i} className="flex gap-4 items-center pl-12 border-l border-white/10">
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                          <Globe className="w-4 h-4" /> Sentinel Insight
                       </span>
                       <span className="text-sm font-medium text-slate-400">{n}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
               {[
                 { label: 'Target ARR', val: simMode ? `$${simMetrics.arr}M` : founderMetrics.arr, icon: Activity },
                 { label: 'Burn Rate', val: simMode ? `$${simMetrics.burn}K` : founderMetrics.burn, icon: Zap },
                 { label: 'Projected Runway', val: founderMetrics.runway, icon: Shield },
                 { label: 'Growth Momentum', val: simMode ? `${simMetrics.momentum}%` : founderMetrics.momentum, icon: Activity }
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

            <SystemPanel
              stats={systemStats}
              windows={runningWindows}
              lastSync={systemLastSync}
              onRefresh={refreshSystemSnapshot}
            />

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
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/20 transition-all">
                               {agent.name.includes("Growth") ? <Globe className="w-5 h-5 text-indigo-400" /> : agent.name.includes("Architect") ? <Cpu className="w-5 h-5 text-purple-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-white uppercase tracking-wider">{agent.name}</h4>
                               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{agent.status}</span>
                            </div>
                         </div>
                         {agent.id !== "auditor" && agent.id !== "growth" && (
                            <button 
                              onClick={async () => {
                                await invoke("delete_golem", { id: agent.id });
                                setNotification(`Agent ${agent.name} Purged from Universe.`);
                                const wf = await invoke("get_neural_workforce", { marketIndex: 100 }) as any;
                                setWorkforce(wf);
                              }}
                              className="p-2 glass text-rose-400 hover:text-rose-500 transition-colors"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         )}
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {activeTasks.map((env) => (
                     <div key={env.id} className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 mb-1">
                           <span className="group-hover:text-indigo-400 transition-colors">{env.name}</span>
                           <span className={cn(env.prog < 100 ? "animate-pulse" : "", env.color === 'emerald' ? "text-emerald-500" : "text-indigo-400")}>{env.status}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex items-center">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${env.prog}%` }} className={cn("h-full transition-all duration-1000", env.color === 'emerald' ? "bg-emerald-500" : env.color === 'indigo' ? "bg-indigo-500" : "bg-purple-500")} />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-[7px] font-mono text-slate-700 tracking-tighter">OAS_NODE_{env.id.slice(-4).toUpperCase()}</span>
                           <span className="text-[8px] font-black text-slate-600">{env.prog}%</span>
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
            </>}
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

        {/* Oasis Shell: Strategic CLI Module (Phase 31) */}
        {showCLI && (
           <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[3000] w-[800px] h-[450px] glass-bright rounded-[3rem] p-12 flex flex-col border border-emerald-500/20 shadow-5xl shadow-emerald-900/10">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                 <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                   </div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Oasis Shell <span className="text-[10px] text-emerald-500/50 leading-none">v3.4.0-platform</span></h3>
                 </div>
                 <div className="flex items-center gap-6">
                    {systemStats && (
                       <div className="flex items-center gap-2 px-4 py-1.5 glass rounded-xl border-white/5">
                          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", systemStats.binary_sync ? "bg-emerald-500" : "bg-red-500")} />
                          <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">{systemStats.path_status}</span>
                       </div>
                    )}
                    <button onClick={handleInstallShell} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black text-white uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-600/20">
                       Deploy Global Shell
                    </button>
                    <button onClick={() => setShowCLI(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center text-white"><Plus className="w-6 h-6 rotate-45" /></button>
                 </div>
              </div>
              <div className="flex-1 w-full bg-black/40 rounded-3xl p-8 mb-6 font-mono text-sm overflow-y-auto custom-scrollbar space-y-3">
                 {cliHistory.map((h, i) => (
                   <div key={i} className="flex gap-4">
                      <span className="text-slate-600">[{h.type === 'cmd' ? '>' : '#'}]</span>
                      <span style={{ color: h.color }} className="font-bold tracking-tight">{h.text}</span>
                   </div>
                 ))}
                 <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
              </div>
              <form onSubmit={handleCLICommand} className="relative">
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-sm">{">"}</span>
                 <input 
                   autoFocus
                   value={cliInput}
                   onChange={(e) => setCliInput(e.target.value)}
                   type="text" 
                   className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 text-emerald-400 font-mono text-sm focus:outline-none focus:border-emerald-500/30 transition-all placeholder:text-slate-700"
                   placeholder="Enter directive: 'audit', 'manifest [module]', 'rewind'..."
                 />
              </form>
           </motion.div>
        )}

        {/* Venture Network Registry Portal (Phase 28) */}
        {showNetwork && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2500] bg-black/80 backdrop-blur-2xl flex items-center justify-end p-20">
              <div className="w-[500px] h-full glass-bright rounded-[3.5rem] p-12 flex flex-col items-center">
                 <div className="w-full flex justify-between items-center mb-12">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Venture Discovery</h3>
                    <button onClick={() => setShowNetwork(false)} className="w-10 h-10 glass rounded-full flex items-center justify-center text-white"><Plus className="w-6 h-6 rotate-45" /></button>
                 </div>
                 <div className="flex-1 w-full space-y-6 overflow-y-auto custom-scrollbar pr-4">
                    {ventureNetwork.map((v: any) => (
                      <div key={v.id} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <h4 className="text-lg font-black text-white uppercase tracking-tight">{v.name}</h4>
                               <p className="text-[10px] text-slate-500 font-mono tracking-widest">{v.path}</p>
                            </div>
                            <span className="text-xs font-black text-indigo-400">{v.peak_arr} PEAK</span>
                         </div>
                         <button onClick={() => handleNeuralMirror(v.id)} className="w-full py-4 bg-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">Mirror Neural Wisdom</button>
                      </div>
                    ))}
                 </div>
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
                            setManifestHistory(prev => [...prev, `manifested/${activeGolem.title.replace(" ", "_").toLowerCase()}.ts`]);
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
                <div>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Sentient Vault</h2>
                   <p className="text-sm text-slate-500 font-medium">Internal Strategic Archive & File Ledger</p>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setShowSentinel(true)} className="px-8 py-3 bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600/40 transition-all flex items-center gap-3">
                      <Shield className="w-4 h-4" /> Sentinel Archive
                   </button>
                   {manifestHistory.length > 0 && (
                      <button onClick={handleRewind} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-red-600/30 flex items-center gap-3">
                         <RotateCcw className="w-4 h-4" /> Rewind Strategy
                      </button>
                   )}
                   <button onClick={() => setShowVault(false)} className="w-14 h-14 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"><Plus className="w-8 h-8 rotate-45" /></button>
                </div>
             </div>

             <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pr-4">
                {strategicInventory.map((asset: any, i: number) => (
                   <motion.div 
                     key={asset.file_path}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="glass-bright rounded-3xl p-8 border border-white/5 relative group hover:border-indigo-500/30 transition-all cursor-pointer"
                   >
                      <div className="flex items-start justify-between mb-6">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-600/20 transition-all">
                            <FolderOpen className={cn("w-6 h-6", asset.risk.includes('Ruby') ? "text-red-400" : "text-emerald-400")} />
                         </div>
                         <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border", 
                           asset.risk.includes('Ruby') ? "bg-red-500/10 border-red-500/30 text-red-400" : 
                           asset.risk.includes('Emerald') ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                           "bg-amber-500/10 border-amber-500/30 text-amber-400"
                         )}>
                            {asset.risk}
                         </div>
                      </div>
                      <h3 className="text-sm font-black text-white truncate mb-1">{asset.file_path.split('/').pop()}</h3>
                      <p className="text-[10px] text-slate-500 font-mono truncate mb-4">{asset.file_path}</p>
                      
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                         <div>
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Strat Debt</span>
                            <span className="text-sm font-black text-white">{asset.debt}%</span>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Authorized By</span>
                             <span className="text-[10px] font-bold text-indigo-400">{asset.authorizer}</span>
                          </div>
                       </div>
                       <button onClick={() => handleSealAsset(asset.file_path, asset.file_path.split("/").pop() || "Strategic Asset")} className="w-full mt-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all border border-amber-500/20 flex items-center justify-center gap-2">
                          <Lock className="w-3 h-3" /> Seal within Sentinel
                       </button>
                    </motion.div>
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
                   {timeline.map((event: any) => (
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

        {showSettings && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[8000] flex items-center justify-center p-24 bg-[#020617]/60 backdrop-blur-5xl">
            <div className="w-full max-w-2xl glass-bright rounded-[3rem] p-16 border border-white/10 shadow-5xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px]" />
               <div className="flex items-center justify-between mb-12">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Foundry Configuration</span>
                     <h2 className="text-4xl font-black text-white tracking-tighter">Oasis Command Center</h2>
                  </div>
                  <button onClick={() => setShowSettings(false)} className="w-16 h-16 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border-white/10"><Plus size={32} className="rotate-45" /></button>
               </div>

               <div className="space-y-10">
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Globe className="w-5 h-5 text-indigo-400" />
                           <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">Physical Aura Bridge (WLED)</label>
                        </div>
                        <span className="text-[8px] font-mono text-slate-600 bg-white/5 px-3 py-1 rounded">V4.4.1 BRIDGE</span>
                     </div>
                     <div className="flex items-center glass rounded-2xl px-6 py-4 border-white/10">
                        <span className="text-[10px] font-black text-slate-500 mr-4 font-mono">TARGET_IP:</span>
                        <input value={auraIp} onChange={(e) => setAuraIp(e.target.value)} placeholder="192.168.1.XXX" className="bg-transparent border-none outline-none text-lg w-full text-white font-black tracking-tighter" />
                        <div className={cn("w-3 h-3 rounded-full animate-pulse shadow-sm", autoAura ? "bg-indigo-500 shadow-indigo-500/40" : "bg-white/10")} />
                     </div>
                     <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Configure your workspace luminosity bridge. The shell targets the raw UDP/JSON API of your WLED device to reflect venture integrity in physical space.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Neural Buffer</span>
                        <div className="flex items-end justify-between">
                           <span className="text-2xl font-black text-white">4.2GB</span>
                           <span className="text-[10px] font-bold text-emerald-400">OPTIMIZED</span>
                        </div>
                     </div>
                     <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Sentiment Accuracy</span>
                        <div className="flex items-end justify-between">
                           <span className="text-2xl font-black text-white">99.2%</span>
                           <span className="text-[10px] font-bold text-indigo-400">NOMINAL</span>
                        </div>
                     </div>
                  </div>
               </div>

               <button onClick={() => setShowSettings(false)} className="w-full mt-12 py-5 bg-white text-black font-black uppercase tracking-[0.25em] text-xs rounded-2xl shadow-xl shadow-white/10 hover:scale-105 transition-all">Save Core Config</button>
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

        {showNexus && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[5000] bg-[#020617]/95 backdrop-blur-4xl p-20 flex flex-col pt-10">
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse" />
              </div>
              <div className="relative z-10 flex items-center justify-between mb-16 px-12">
                 <div>
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">Aegis Nexus Portal</h2>
                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-3">
                       <Globe className="w-5 h-5" /> Portfolio Integrity: {aegisLedger?.global_integrity?.toFixed(1) || '0.0'} Index
                    </p>
                 </div>
                 <button onClick={() => setShowNexus(false)} className="w-16 h-16 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"><Plus className="w-8 h-8 rotate-45" /></button>
              </div>

              <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-12 overflow-y-auto custom-scrollbar">
                 {Object.values(aegisLedger?.ventures || {}).map((ven: any, i: number) => (
                    <motion.div 
                      key={ven.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-bright p-8 rounded-[3rem] border border-white/5 relative group hover:border-indigo-500/30 transition-all cursor-pointer shadow-3xl"
                    >
                       <div className="flex justify-between items-start mb-10">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-indigo-600/20 transition-all">
                             <Globe className="w-7 h-7 text-indigo-400" />
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Peaked ARR</span>
                             <span className="text-lg font-black text-white">{ven.metrics.arr}</span>
                          </div>
                       </div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{ven.name}</h3>
                       <p className="text-[10px] font-mono text-slate-500 mb-8">{ven.id}</p>
                       
                       <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1">Dominance</span>
                             <span className="text-sm font-black text-indigo-400">{ven.dominance_index.toFixed(1)}</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1">Sentiment</span>
                             <span className="text-[10px] font-bold text-emerald-400">{ven.market.sentiment}</span>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <button onClick={() => handleNeuralMirror(ven.id)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5">Mirror Intelligence</button>
                          <button onClick={() => handleOracleVision(ven.id)} className="flex-1 py-4 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all border border-amber-500/20 flex items-center justify-center gap-2">
                             <Zap className="w-3 h-3" /> Oracle Vision
                          </button>
                       </div>
                    </motion.div>
                 ))}
              </div>
          </motion.div>
        )}
        {activeOracle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-5xl flex items-center justify-center p-20">
              <div className="w-full max-w-5xl glass-bright rounded-[4rem] border border-amber-500/30 p-16 relative overflow-hidden flex flex-col h-[700px]">
                 <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
                 
                 <div className="relative z-10 flex justify-between items-start mb-16">
                    <div>
                       <span className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-2 block">Neural Oracle Prediction</span>
                       <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">{activeOracle.venture_id} / 2027</h2>
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                             <span className="text-[10px] font-black text-amber-500 uppercase">Confidence: 94.2%</span>
                          </div>
                          <span className="text-sm font-bold text-slate-400 italic">"Recommendation: {activeOracle.recommendation}"</span>
                       </div>
                    </div>
                    <button onClick={() => setActiveOracle(null)} className="w-16 h-16 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"><Plus className="w-8 h-8 rotate-45" /></button>
                 </div>

                 <div className="relative z-10 flex-1 grid grid-cols-12 gap-12">
                    <div className="col-span-8 flex flex-col justify-end">
                       <div className="flex items-end gap-x-2 h-64 mb-4">
                          {[42, 65, 89, 120, 156, 198, 245, 312, 398, 480, 590, 720].map((p: number, i: number) => (
                             <motion.div 
                                key={i} 
                                initial={{ height: 0 }} 
                                animate={{ height: `${(p / 720) * 100}%` }}
                                transition={{ delay: i * 0.05 }}
                                className="flex-1 bg-gradient-to-t from-amber-600/20 to-amber-500 rounded-t-lg relative group"
                             >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-bold text-white bg-black/80 px-2 py-1 rounded border border-white/10 whitespace-nowrap">{p}k</div>
                             </motion.div>
                          ))}
                       </div>
                       <div className="flex justify-between px-2">
                          {['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'].map(m => (
                             <span key={m} className="text-[8px] font-black text-slate-600 tracking-widest">{m}</span>
                          ))}
                       </div>
                    </div>

                    <div className="col-span-4 space-y-8 flex flex-col justify-center">
                       <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-2 text-center">Projected ARR (12M)</span>
                          <h4 className="text-4xl font-black text-white tracking-tighter text-center">{activeOracle.projected_arr || "$2.4M"}</h4>
                       </div>
                       <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 text-center">Reference Burn</span>
                          <h4 className="text-2xl font-black text-white tracking-tighter text-center">{activeOracle.projected_burn || "$42K/mo"}</h4>
                       </div>
                    </div>
                 </div>
              </div>
          </motion.div>
        )}
        {showSentinel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[7000] bg-[#020617]/98 backdrop-blur-5xl p-20 flex flex-col pt-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/30 to-amber-500/0 animate-pulse" />
               <div className="relative z-10 flex items-center justify-between mb-16 px-12">
                  <div>
                     <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2 font-mono">Sentinel Archive</h2>
                     <p className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" /> {isVaultLocked ? "Vault Locked / Neural Cipher Required" : `Security Resonance: ${sentinelVault?.security_resonance?.toFixed(2) || '1.00'} Index`}
                     </p>
                  </div>
                  <div className="flex items-center gap-6">
                     {isVaultLocked && (
                        <div className="flex items-center glass rounded-2xl px-6 py-3 border-amber-500/30 gap-4">
                           <Lock className="w-4 h-4 text-amber-500" />
                           <input 
                              type="password"
                              value={founderSecret} 
                              onChange={(e) => setFounderSecret(e.target.value)} 
                              onKeyDown={(e) => e.key === 'Enter' && handleAuthenticateFounder()}
                              placeholder="Input Founder Secret..." 
                              className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest w-48 text-white placeholder:text-amber-500/20" 
                           />
                           <button onClick={handleAuthenticateFounder} className="text-amber-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">Unlock</button>
                        </div>
                     )}
                     <button onClick={() => { setShowSentinel(false); setFounderSecret(""); }} className="w-16 h-16 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"><Plus size={32} className="rotate-45" /></button>
                  </div>
               </div>

               {isVaultLocked ? (
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-40">
                     <div className="w-32 h-32 rounded-[2.5rem] bg-amber-500/5 flex items-center justify-center border border-amber-500/20 mb-8 animate-pulse shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                        <ShieldAlert className="w-12 h-12 text-amber-500" />
                     </div>
                     <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Awaiting Founder Secret</h3>
                     <p className="text-sm text-slate-500 max-w-md text-center leading-relaxed">Pulse your unique neural identifier to derive the master cipher and unseal the Sentinel Archive.</p>
                  </div>
               ) : (
                  <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-12 overflow-y-auto custom-scrollbar pr-4">
                 {Object.values(sentinelVault?.blobs || {}).map((blob: any, i: number) => (
                    <motion.div 
                      key={blob.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-[#0f172a]/80 p-8 rounded-[3rem] border border-amber-500/10 relative group hover:border-amber-500/40 transition-all shadow-3xl"
                    >
                       <div className="flex justify-between items-start mb-10">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10 group-hover:bg-amber-600/20 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                             <Lock className="w-7 h-7 text-amber-400" />
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Encrypted Blob</span>
                             <span className="text-[10px] font-mono text-amber-500/60 font-bold">{blob.id}</span>
                          </div>
                       </div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{blob.title}</h3>
                       <p className="text-[10px] font-mono text-slate-500 mb-8 truncate">{blob.original_path}</p>
                       
                       <div className="pt-6 border-t border-white/5 flex gap-4">
                          <button onClick={() => handleUnsealAsset(blob.id)} className="flex-1 py-4 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-amber-500/20">Unseal Blueprint</button>
                       </div>
                    </motion.div>
                 ))}
                 
                 {/* EMPTY STATE */}
                 {(!sentinelVault?.blobs || Object.keys(sentinelVault.blobs).length === 0) && (
                   <div className="col-span-full flex flex-col items-center justify-center py-40 opacity-20 text-center">
                      <ShieldAlert className="w-20 h-20 text-white mb-6 mx-auto" />
                      <span className="text-sm font-black uppercase tracking-[0.4em] text-white">Vault Empty / Awaiting Seal</span>
                   </div>
                 )}
              </div>
            )}
          </motion.div>
        )}

        {activeSynthesis && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[8000] bg-indigo-950/40 backdrop-blur-5xl flex items-center justify-center p-20">
              <div className="w-full max-w-6xl glass-bright rounded-[4rem] border border-indigo-500/30 p-16 relative overflow-hidden flex flex-col h-[750px] shadow-6xl">
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                 
                 <div className="relative z-10 flex justify-between items-start mb-12">
                    <div>
                       <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 block animate-pulse">Neural Pitch Synthesis L_01</span>
                       <h2 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">Strategic Venture Narrative</h2>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                          <Bot className="w-5 h-5 text-indigo-400" /> Synthesis ID: {activeSynthesis.id}
                       </p>
                    </div>
                    <button onClick={() => setActiveSynthesis(null)} className="w-20 h-20 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border-white/10 shadow-2xl"><Plus size={40} className="rotate-45" /></button>
                 </div>

                 <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-16 overflow-hidden">
                    <div className="space-y-10 overflow-y-auto pr-6 custom-scrollbar">
                       <section>
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">The Narrative</h4>
                          <p className="text-xl text-white font-medium leading-relaxed italic border-l-4 border-indigo-500/40 pl-8 bg-white/5 p-8 rounded-3xl">
                             "{activeSynthesis.strategic_narrative}"
                          </p>
                       </section>
                       <section>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Market Correlation</h4>
                          <div className="p-8 rounded-3xl bg-black/20 border border-white/5">
                             <p className="text-sm text-slate-300 leading-relaxed font-mono">
                                {activeSynthesis.market_context}
                             </p>
                          </div>
                       </section>
                    </div>

                    <div className="flex flex-col gap-8">
                       <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Actionable Outreach</h4>
                       <div className="space-y-4">
                          {activeSynthesis.actionable_outreach.map((step: string, i: number) => (
                             <motion.div 
                               key={i} 
                               initial={{ opacity: 0, x: 20 }} 
                               animate={{ opacity: 1, x: 0 }} 
                               transition={{ delay: i * 0.2 }}
                               className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center gap-6 group hover:bg-indigo-500/10 transition-all"
                             >
                                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center font-black text-indigo-400 border border-indigo-400/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">{i+1}</div>
                                <span className="text-xs font-black text-white uppercase tracking-wider">{step}</span>
                             </motion.div>
                          ))}
                       </div>
                       
                       <div className="mt-auto grid grid-cols-2 gap-4 pt-10">
                          <button className="py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all">Export Pitch PDF</button>
                          <button className="py-6 bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all">Commit to Vault</button>
                       </div>
                    </div>
                 </div>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Floating Chat Robot */}
      {!presentationMode && (
        <>
           {/* NEURAL MANIFEST REVIEW PANEL */}
           {pendingManifests.length > 0 && (
             <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="fixed bottom-32 right-12 z-[1000] w-96 glass-bright rounded-[3rem] border border-indigo-500/30 p-8 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse"><Zap className="w-5 h-5 text-white" /></div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Proposal Ready</h3>
                   </div>
                   <button onClick={() => setPendingManifests([])} className="text-slate-500 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
                </div>
                <div className="space-y-6">
                   {pendingManifests.map((m: any) => (
                      <div key={m.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">{m.title}</h4>
                         <p className="text-[9px] text-slate-400 font-medium leading-relaxed mb-6 line-clamp-3">
                            {m.rationale}
                         </p>
                         <div className="flex gap-4">
                            <button onClick={() => handleExecuteManifest(m)} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20">Commit</button>
                            <button onClick={() => setPendingManifests([])} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all border border-white/10">Discard</button>
                         </div>
                      </div>
                   ))}
                </div>
             </motion.div>
           )}

           <div className={cn("fixed bottom-10 right-10 flex flex-col items-end gap-6 z-[600] transition-all", zenMode && "zen-hide")}>
           <AnimatePresence>
              {showAI && (
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="w-96 h-[550px] glass rounded-[2.5rem] border-white/10 shadow-3xl overflow-hidden flex flex-col mb-4">
                    <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">System Link</span>
                          <span className="text-[9px] text-slate-500 font-mono">{systemStats?.path_status || 'Initializing...'}</span>
                       </div>
                       <button onClick={handleInstallShell} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase rounded-lg">Deploy Global Shell</button>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                       {neuralWisdom && (
                         <div className={cn("p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 mb-4 transition-all", zenMode && "opacity-0")}>
                            <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">V4.1.0-RESONANCE</span>
                            </div>
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <span className="text-[10px] text-slate-300 leading-relaxed italic mb-6">"{neuralWisdom.recommendation}"</span>
                               
                               {/* STRATEGIC BRANCHES */}
                               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                 {neuralWisdom.agent?.branches?.map((branch: any) => (
                                   <button 
                                     key={branch.tag}
                                     onClick={() => handleAuthorizeBranch(neuralWisdom.agent.id, branch.tag)}
                                     className={cn(
                                       "p-3 rounded-xl border flex flex-col gap-1 transition-all text-left group",
                                       branch.tag === "emerald" || branch.tag === "organic" 
                                         ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10" 
                                         : "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10"
                                     )}
                                   >
                                     <span className={cn(
                                       "text-[8px] font-black uppercase tracking-[0.2em]",
                                       branch.tag === "emerald" || branch.tag === "organic" ? "text-emerald-400" : "text-rose-400"
                                     )}>{branch.title}</span>
                                     <span className="text-[9px] text-white/60 leading-tight">{branch.description}</span>
                                     <span className="mt-2 text-[7px] text-white/30 uppercase font-mono group-hover:text-white transition-colors">AUTHORIZE PATH â†’</span>
                                   </button>
                                 ))}
                               </div>
                             </div>
                            <p className="text-[10px] text-indigo-300 italic opacity-80">{neuralWisdom.insight}</p>
                            <div className="mt-4 pt-3 border-t border-indigo-500/20 text-[9px] font-bold text-indigo-400/60 uppercase">
                               Confidence: {(neuralWisdom.confidence * 100).toFixed(0)}%
                            </div>
                            <div className="space-y-3 mt-4">
                               <h6 className="text-[9px] font-black text-indigo-500/50 uppercase tracking-widest pl-1">Network Insights (CLI Platform)</h6>
                               {crossWisdom.map((w: string, i: number) => (
                                 <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 italic">
                                   "{w}"
                                 </div>
                               ))}
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
             {activeDebate && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[8500] bg-black/60 backdrop-blur-5xl flex items-center justify-center p-24">
              <div className="w-full max-w-7xl glass-bright rounded-[4rem] border border-white/10 p-16 relative overflow-hidden flex flex-col h-[800px] shadow-6xl">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
                 
                 <div className="flex justify-between items-start mb-16 px-4">
                    <div>
                        <span className={cn("text-xs font-black uppercase tracking-[0.4em] px-4 py-1 rounded-full border mb-4 inline-block", 
                           activeDebate.consensus_aura === 'volatile' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>Consensus Status: {activeDebate.consensus_aura}</span>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Strategic Advisory Debate</h2>
                    </div>
                    <button onClick={() => setActiveDebate(null)} className="w-20 h-20 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border-white/10 shadow-2xl"><Plus size={40} className="rotate-45" /></button>
                 </div>

                 <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden px-4">
                    {activeDebate.insights.map((insight: any, i: number) => (
                       <motion.div 
                         key={i} 
                         initial={{ opacity: 0, scale: 0.9, y: 30 }} 
                         animate={{ opacity: 1, scale: 1, y: 0 }} 
                         transition={{ delay: i * 0.15 }}
                         className="flex flex-col rounded-3xl p-8 bg-white/[0.03] border border-white/5 relative group hover:bg-white/5 transition-all overflow-hidden"
                       >
                          <div className={cn("absolute top-0 left-0 w-1 h-full", 
                             insight.persona.includes("ARCHITECT") ? "bg-amber-500" : 
                             insight.persona.includes("GROWTH") ? "bg-pink-500" : "bg-slate-400"
                          )} />
                          
                          <div className="flex items-center justify-between mb-8">
                             <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", 
                                insight.persona.includes("ARCHITECT") ? "text-amber-500" : 
                                insight.persona.includes("GROWTH") ? "text-pink-500" : "text-slate-400"
                             )}>{insight.persona}</span>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500">{insight.strategic_score}%</span>
                                <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-white/40" style={{ width: `${insight.strategic_score}%` }} />
                                </div>
                             </div>
                          </div>

                          <p className="text-sm text-slate-200 leading-relaxed font-medium mb-auto">
                             "{insight.perspective}"
                          </p>
                          
                          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                             <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Risk Index: {Math.round(insight.risk_impact * 100)}%</span>
                             <ShieldAlert className={cn("w-4 h-4", insight.risk_impact > 0.7 ? "text-rose-500" : "text-slate-500")} />
                          </div>
                       </motion.div>
                    ))}
                 </div>

                 <div className="mt-16 bg-white/5 p-8 rounded-[2rem] border border-white/10 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400 max-w-2xl px-4">Observe the conflicting perspectives between technical stability, market velocity, and catastrophic risk mitigation. Your tie-breaking decision is required for commit manifestation.</p>
                    <button className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-105 transition-all">Review & Commit</button>
                 </div>
              </div>
           </motion.div>
         )}
       </AnimatePresence>
           <button onClick={() => setShowAI(!showAI)} className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all">
             <Bot className="w-9 h-9" />
           </button>
        </div>
        </>
      )}
      {/* Directive: Cortex Semantic HUD (Pillar 21) */}
      <AnimatePresence>
        {showCortex && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-indigo-950/40 backdrop-blur-3xl flex items-center justify-center p-24"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-6xl w-full h-[85vh] glass-bright border border-indigo-500/30 rounded-[4rem] flex flex-col overflow-hidden shadow-5xl relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
              
              <header className="px-16 pt-16 pb-12 border-b border-white/5 flex items-center justify-between">
                <div>
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3 block animate-pulse">Neural Cortex Scan Active</span>
                   <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Semantic Intelligence HUD</h2>
                </div>
                <button 
                  onClick={() => setShowCortex(false)}
                  className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
                >
                   <X className="w-8 h-8 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-16 py-12 custom-scrollbar">
                <div className="grid grid-cols-1 gap-8">
                  {cortexResults.map((res: any, i: number) => (
                    <motion.div 
                      key={res.filepath}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 hover:border-indigo-500/40 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8">
                         <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Aura Relevance: {(res.score * 100).toFixed(1)}%</span>
                         </div>
                      </div>
                      
                      <div className="flex items-start gap-10">
                         <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-all">
                            <BrainCircuit className="w-10 h-10 text-indigo-500" />
                         </div>
                         <div className="flex-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-indigo-400 transition-colors">{res.filename}</h3>
                            <p className="text-xs font-mono text-slate-500 mb-8 border-l-2 border-indigo-500/20 pl-4">{res.filepath}</p>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium bg-white/5 p-6 rounded-2xl italic">"{res.preview}"</p>
                         </div>
                      </div>
                      
                      <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                         <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20">Open Neural Node</button>
                         <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Index Core</button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {cortexResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 opacity-20 text-center">
                       <BrainCircuit className="w-24 h-24 text-white mb-8 mx-auto animate-pulse" />
                       <span className="text-xl font-black uppercase tracking-[0.5em] text-white">No Semantic Matches In Cohort</span>
                    </div>
                  )}
                </div>
              </div>
              
              <footer className="p-10 border-t border-white/5 bg-black/20 text-center flex flex-col items-center gap-4">
                  {storageReport && (
                    <div className="flex items-center gap-4 py-2 px-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 animate-in fade-in slide-in-from-bottom-4">
                       <Database className="w-3 h-3 text-emerald-400" />
                       <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{storageReport.status} // {Math.round(storageReport.transferred_bytes / 1024)} KB SYNCED</span>
                    </div>
                  )}
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Oasis Shell Framework / Semantic Intelligence Engine V0.1.2_ALPHA</span>
                  <div className="flex gap-10 mt-2 opacity-30 grayscale hover:grayscale-0 transition-all">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-bold text-white uppercase">C: System Nominal</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[8px] font-bold text-white uppercase">D: Golem Space Ready</span>
                     </div>
                  </div>
               </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <CommandPalette
        open={commandOpen}
        query={commandQuery}
        onQueryChange={setCommandQuery}
        onClose={() => setCommandOpen(false)}
        onExecute={handleCommandExecute}
      />
    </div>
  );
}


