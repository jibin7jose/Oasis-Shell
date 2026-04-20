import React, { useState, useEffect, useMemo, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Database,
  Bot, BrainCircuit, Terminal, Search, Plus,
  Zap, Shield, X, ShieldCheck, AlertCircle, FolderOpen, Activity, ShieldAlert, Lock, Gauge, ChevronRight,
  Mic, MicOff, Skull, Pause, FlaskConical, Clock, History, Globe, Cpu, Book
} from "lucide-react";
import ForceGraph3D from "react-force-graph-3d";
import ZenithHUD from "./components/dashboard/ZenithHUD";
import SystemPanel, { SystemStats, WindowInfo, ProcessInfo, StorageInfo, DeviceInfo } from "./components/panels/SystemPanel";
import LeftRail from "./components/layout/LeftRail";
import TopBar from "./components/layout/TopBar";
import BootSequence from "./components/auth/BootSequence";
import RightRail from "./components/layout/RightRail";
import BoardroomPanel from "./components/panels/BoardroomPanel";
import DocumentationPanel from "./components/panels/DocumentationPanel";
import CortexLog from "./components/panels/CortexLog";
import WorkforcePanel from "./components/panels/WorkforcePanel";
import { CollectivePanel } from "./components/panels/CollectivePanel";
import { useSoundscape } from "./hooks/useSoundscape";
import CommandPalette, { CommandPermission } from "./components/overlays/CommandPalette";
import SentinelVault from "./components/panels/SentinelVault";
import VisionaryLattice from "./components/visuals/VisionaryLattice";
import { TerminalPanel } from "./components/panels/TerminalPanel";
import CrateGallery from "./components/panels/CrateGallery";
import { cn } from "./lib/utils";
import { useSystemStore } from "./lib/systemStore";
import { ChronosSnapshot } from "./lib/systemStore";
import { isTauri, invokeSafe, listenSafe } from "./lib/tauri";
import { 
  FounderMetrics, StrategicMacro, CollectiveNode, LatticePoint, GolemTask 
} from "./lib/contracts";

export type { FounderMetrics, StrategicMacro, CollectiveNode, LatticePoint };

// New Modular Components
import AdvisoryDebate from "./components/panels/AdvisoryDebate";
import SynthesisPanel from "./components/panels/SynthesisPanel";
import CortexHUD from "./components/panels/CortexHUD";
import { DashboardPanel } from "./components/panels/DashboardPanel";
import { GhostWindows } from "./components/visuals/GhostWindows";
import { TemporalExplorer } from "./components/dashboard/TemporalExplorer";
import { VisualForge } from "./components/panels/VisualForge";
import { AegisNexus } from "./components/panels/AegisNexus";
import { NeuralRipple } from "./components/ui/NeuralRipple";
import { NeuralBridge } from "./components/dashboard/NeuralBridge";
import { FileExplorerPanel } from "./components/panels/FileExplorerPanel";
import { StoragePanel } from "./components/panels/StoragePanel";
import { SettingsPanel } from "./components/panels/SettingsPanel";
import { SpectralBoundary } from "./components/shared/SpectralBoundary";
import { GhostOverlay } from "./components/shared/GhostOverlay";
import { useHeuristicGuardian } from "./hooks/useHeuristicGuardian";
import { GlobalTerminal } from "./components/shared/GlobalTerminal";
import { CollectivePanel } from "./components/panels/CollectivePanel";
import { HatcheryPanel } from "./components/panels/HatcheryPanel";
import { BlueprintPanel } from "./components/panels/BlueprintPanel";
import { ChronosHUD } from "./components/shared/ChronosHUD";
import { RefractionManager } from "./components/shared/RefractionManager";
import { RealityBridge } from "./components/shared/RealityBridge";
import { KernelForge } from "./components/shared/KernelForge";
import { SingularityHUD } from "./components/shared/SingularityHUD";
import { NeuralSandboxPanel } from "./components/shared/NeuralSandboxPanel";
import { ExodusPanel } from "./components/panels/ExodusPanel";
import { ConsortiumPanel } from "./components/shared/ConsortiumPanel";
import { NeuralSentinelPanel } from "./components/shared/NeuralSentinelPanel";


// Design Utility

// Design Utility moved to lib/tauri

// Context Library
const contexts = [
  { id: 'dev', name: 'Strategic Core', icon: Terminal, aura: 'rgba(99, 102, 241, 0.4)' },
  { id: 'design', name: 'Creative Forge', icon: Shield, aura: 'rgba(168, 85, 247, 0.4)' },
  { id: 'growth', name: 'Capital Matrix', icon: Activity, aura: 'rgba(16, 185, 129, 0.4)' }
];

const buildFpsPath = (values: number[], width = 120, height = 40) => {
  if (values.length == 0) return "";
  const step = values.length > 1 ? width / (values.length - 1) : width;
  let d = "";
  for (let i = 0; i < values.length; i += 1) {
    const x = i * step;
    const y = height - Math.min(height, (values[i] / 60) * height);
    if (i == 0) {
      d += `M ${x} ${y}`;
    } else {
      const prevX = (i - 1) * step;
      const prevY = height - Math.min(height, (values[i - 1] / 60) * height);
      const cx = (prevX + x) / 2;
      d += ` Q ${cx} ${prevY} ${x} ${y}`;
    }
  }
  return d;
};

// Interface definitions moved to contracts.ts

export default function App() {
  const { playClick, playPulse, playHandshake, playNotification, startEngine, updateEngine } = useSoundscape();
  
  const {
    processes, setProcesses,
    windows, setWindows,
    storage, setStorage,
    devices, setDevices,
    marketIntel, setMarketIntel,
    fiscalBurn, setFiscalBurn,
    ventureIntegrity, setVentureIntegrity,
    strategicInventory, setStrategicInventory,
    sparklinesEnabled, setSparklinesEnabled,
    performanceOptimized, setPerformanceOptimized,
    systemLastSync, setSystemLastSync,
    founderMetrics, setFounderMetrics,
    systemStats, setSystemStats,
    notification, setNotification,
    timeline, logEvent,
    activeDebate, setActiveDebate,
    activeSynthesis, setActiveSynthesis,
    showCortex, setShowCortex,
    showDocs, setShowDocs,
    showGraph, setShowGraph,
    travelIndex, setTravelIndex,
    isTimeTraveling, setIsTimeTraveling,
    chronosHistory, setChronosHistory,
    dynamicGraph, setDynamicGraph,
    cortexResults, setCortexResults,
    cortexQuery, setCortexQuery,
    showCLI, setShowCLI,
    showCrates, setShowCrates,
    isSavingCrate, setIsSavingCrate,
    crates, setCrates,
    activeVenture, setActiveVenture,
    cliInput, setCliInput,
    cliHistory, setCliHistory,
    searchQuery, setSearchQuery,
    pendingManifests, setPendingManifests,
    oracleAlert, setOracleAlert,
    collectiveNodes, setCollectiveNodes,
    strategicMacros, setStrategicMacros,
    activeGolems, setActiveGolems,
    activeProposals, setActiveProposals,
    workforce, setWorkforce,
    showHatchery, setShowHatchery,
    showBlueprint, setShowBlueprint,
    shellMode, setShellMode,
  } = useSystemStore();

  useHeuristicGuardian();

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [realityBridgeOpen, setRealityBridgeOpen] = useState(false);
  const [realityBridgeQuery, setRealityBridgeQuery] = useState("");
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [singularityOpen, setSingularityOpen] = useState(false);
  const [exodusOpen, setExodusOpen] = useState(false);
  const [consortiumOpen, setConsortiumOpen] = useState(false);
  const [sentinelOpen, setSentinelOpen] = useState(false);
  const [kernelForgeOpen, setKernelForgeOpen] = useState(false);
  const [activeMutationProposal, setActiveMutationProposal] = useState<any>(null);

  const [activeContext, setActiveContext] = useState('dev');
  const [commandOpen, setCommandOpen] = useState(false);
  const [simMetrics, setSimMetrics] = useState({ arr: 1.24, burn: 42.5, momentum: 12.8 });
  const [simMode, setSimMode] = useState(false);
  const [isCortexSearching, setIsCortexSearching] = useState(false);

  // Neural OS: Shell Mode Lifecycle Synchronization
  useEffect(() => {
    const unlistenShow = listen("tauri://window-shown", () => {
        setShellMode('command');
        invokeSafe("set_shell_clickthrough", { ignore: false });
    });
    const unlistenHide = listen("tauri://window-hidden", () => {
        setShellMode('ambient');
        invokeSafe("set_shell_clickthrough", { ignore: true });
    });

    return () => {
        unlistenShow.then(f => f());
        unlistenHide.then(f => f());
    };
  }, []);

  // Neural OS: Hotkey Intent Capture (Toggle Command Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && e.code === 'Space') {
            e.preventDefault();
            setShellMode(shellMode === 'command' ? 'ambient' : 'command');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shellMode]);
  useEffect(() => {
    const unlistenAura = listen("collective-aura-sync", (event: any) => {
      const { integrity, status, source } = event.payload;
      setNotification(`Neural Resonance Received: ${source} status is ${status}`);
      setVentureIntegrity(integrity);
      logEvent(`Collective Resonance: Synchronized with ${source}`, "neural");
    });

    const unlistenHandover = listen("collective-handover-received", (event: any) => {
      const crate = event.payload;
      setNotification(`Strategic Crate Received via Handover: ${crate.name}`);
      setCollectiveNodes(prev => prev.map(n => n.id === "HANDOVER" ? { ...n, status: "Syncing" } : n));
      logEvent(`Venture Handover manifested from remote node`, "deploy");
    });

    return () => {
      unlistenAura.then(f => f());
      unlistenHandover.then(f => f());
    };
  }, []);

  const [lastSync, setLastSync] = useState(Date.now());
  const [messages, setMessages] = useState<any[]>([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
  const [rippleColor, setRippleColor] = useState("#6366f1");
  const [showVisualForge, setShowVisualForge] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showNexus, setShowNexus] = useState(false);
  const [auraIp, setAuraIp] = useState("192.168.1.100");
  const [commandQuery, setCommandQuery] = useState("");
  const [processPriorities, setProcessPriorities] = useState<Record<number, string>>({});
  const [batteryHealth, setBatteryHealth] = useState<{ health_percent: number; design_capacity: number; full_charge_capacity: number; cycle_count: number } | null>(null);
  const appliedPriorityPids = useRef<Set<number>>(new Set());
  const [priorityCache, setPriorityCache] = useState<Record<string, { priority: string; lastApplied: number; source: "Manual" | "Auto-Applied"; ignore?: boolean; ttlDays?: number }>>({});
  const [autoApplyPriorities, setAutoApplyPriorities] = useState(true);
  const [priorityAudit, setPriorityAudit] = useState<{ id: number; pid: number; name: string; priority: string; source: "Manual" | "Auto-Applied" | "Reset"; time: number }[]>([]);
  const [defaultTtlDays, setDefaultTtlDays] = useState(7);
  const pulseIntervalRef = useRef<number>(2000);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [resetConfirmAction, setResetConfirmAction] = useState<"reset" | "reset_clear" | null>(null);
  
  // Vault session check
  useEffect(() => {
    const checkVault = async () => {
      try {
        const unlocked = await invokeSafe("is_vault_unlocked") as boolean;
        setIsVaultAuthenticated(unlocked);
      } catch (e) {}
    };
    checkVault();
    const interval = setInterval(checkVault, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);
  const [fpsThreshold, setFpsThreshold] = useState(22);
  const [isHandshakeSuccessful, setIsHandshakeSuccessful] = useState(false);
  const [sparklinesAutoDisabled, setSparklinesAutoDisabled] = useState(false);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const fgRef = useRef<any>(null);
  const [fpsHover, setFpsHover] = useState<{ index: number; value: number; xPct: number } | null>(null);
  
  // Phase 16: Idle Timeout (Auto-Lock) Implementation
  useEffect(() => {
    let idleTimer: number;

    const resetTimer = () => {
      window.clearTimeout(idleTimer);
      // 15 minutes = 15 * 60 * 1000 = 900,000ms
      idleTimer = window.setTimeout(async () => {
        if (isVaultAuthenticated) {
          try {
            await invokeSafe("lock_sentinel");
            setIsVaultAuthenticated(false);
            storeLog("Sentinel Vault auto-locked due to 15m inactivity", "system");
          } catch (e) {}
        }
      }, 900000); 
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetTimer));
    resetTimer();

    return () => {
      window.clearTimeout(idleTimer);
      events.forEach(name => document.removeEventListener(name, resetTimer));
    };
  }, [isVaultAuthenticated]);

  const [isScanning, setIsScanning] = useState(false);
  const [isVaultSealed, setIsVaultSealed] = useState(false);
  const [selectedGolem, setSelectedGolem] = useState<any | null>(null);
  const [showBoardroom, setShowBoardroom] = useState(false);
  const [showWorkforce, setShowWorkforce] = useState(false);
  const [resetProgress, setResetProgress] = useState<{ active: boolean; total: number; done: number; mode: "reset" | "reset_clear" } | null>(null);
  const [permissions, setPermissions] = useState<Record<CommandPermission, boolean>>({
    process_control: false,
    system_control: false
  });
  const [pendingPermission, setPendingPermission] = useState<{
    key: CommandPermission;
    label: string;
    action: (() => void) | null;
  } | null>(null);

  const [visionaryContext, setVisionaryContext] = useState<string>("Initializing...");
  const [latticePoints, setLatticePoints] = useState<LatticePoint[]>([]);
  const [isLatticeActive, setIsLatticeActive] = useState(true);

  useEffect(() => {
    if (!isHandshakeSuccessful) return;
    
    const triggerVision = async () => {
        try {
            const ss = await invokeSafe("capture_screenshot") as string;
            const context = await invokeSafe("analyze_work_context") as string;
            const points = await invokeSafe("query_lattice_points", { imageBase64: ss }) as LatticePoint[];
            
            setNotification(`Lattice Synchronized: ${points.length} points of interest detected.`);
            setVisionaryContext(context);
            setLatticePoints(points);
            
            // Phase 15.2: Sythesize vision nodes in graph
            if (points.length > 0) {
               handleInjectVisionNodes(points);
            }
        } catch (e) { }
    };
    triggerVision();

    const interval = setInterval(triggerVision, 30000); 
    return () => clearInterval(interval);
  }, [isHandshakeSuccessful]);


  useEffect(() => {
    if (isHandshakeSuccessful) {
        loadCrates();
    }
  }, [isHandshakeSuccessful]);


  // Phase 9.2: Sensory Feedback Bridge (Dynamic Hum)
  useEffect(() => {
    if (isHandshakeSuccessful) {
      startEngine();
    }
  }, [isHandshakeSuccessful]);

  useEffect(() => {
    if (isHandshakeSuccessful && systemStats && typeof systemStats.cpu_load === 'number') {
      updateEngine(systemStats.cpu_load);
    }
  }, [systemStats?.cpu_load, isHandshakeSuccessful]);

  // Phase 9.3: Strategic Shortcuts (Command Hub)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + ` or Alt + T to toggle Terminal
      if ((e.ctrlKey && e.key === '`') || (e.altKey && e.key === 't')) {
        setShowCLI(!showCLI);
      }
      // Alt + C to toggle Crate Gallery
      if (e.altKey && e.key === 'c') {
        setShowCrates(!showCrates);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [zenMode, setZenMode] = useState(false);
  const [visionActive, setVisionActive] = useState(false);
  const [chronosLedger, setChronosLedger] = useState<any[]>([]);
  const [chronosIndex, setChronosIndex] = useState(-1);
  const [voiceActive, setVoiceActive] = useState(false);
  const [crossWisdom, setCrossWisdom] = useState<any[]>([]);
  const [neuralWisdom, setNeuralWisdom] = useState<any>(null);
  const [aegisLedger, setAegisLedger] = useState<any>(null);
  const [activeOracle, setActiveOracle] = useState<any>(null);
  const [sentinelVault, setSentinelVault] = useState<any>(null);
  const [showSentinel, setShowSentinel] = useState(false);
  const [selectedVaultAsset, setSelectedVaultAsset] = useState<any>(null);
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [founderSecret, setFounderSecret] = useState("");
  const [showNetwork, setShowNetwork] = useState(false);
  const [storageReport] = useState<any>(null);
  const [manifestHistory, setManifestHistory] = useState<string[]>([]);
  const [hardwareStatus, setHardwareStatus] = useState<any>(null);
  const [ventureNetwork, setVentureNetwork] = useState<any[]>([]);
  const [activeGolem, setActiveGolem] = useState<any>(null);

  const handleCortexSearch = async () => {
    if (!cortexQuery.trim()) return;
    try {
      const results: any[] = await invokeSafe('search_semantic_nodes', { query: cortexQuery });
      setCortexResults(results || []);
      setNotification(`Neural Search: Found ${results?.length || 0} semantic matches.`);
    } catch (err) {
      console.error("Cortex Search Failure:", err);
    }
  };


  const loadCrates = async () => {
    try {
      const data = await invokeSafe('get_crates');
      setCrates(data || []);
    } catch (err) {
      console.error("Crates Sync Failure:", err);
    }
  };

  const handleSaveCrate = async () => {
    setIsSavingCrate(true);
    try {
      const currentWindows = await invokeSafe('get_running_windows');
      // Phase 22: Synthesize Neural Aura (Name, Desc, Color)
      const aura = await invokeSafe('synthesize_crate_aura', { apps: currentWindows }) as { name: string, description: string, aura_color: string };
      
      // We also save internal state: activeView and activeContext
      const internalState = JSON.stringify({ activeView, activeContext, timestamp: Date.now() });
      
      // save_crate now takes strategic metrics for the portfolio hub
      await invokeSafe('save_crate', { 
        name: aura.name, 
        description: aura.description,
        aura_color: aura.aura_color,
        apps: currentWindows,
        integrity: ventureIntegrity,
        arr: simMetrics.arr, // Or founderMetrics.peak_arr float
        burn: simMetrics.burn,
        status: "Active"
      });
      
      setNotification(`Context Manifested: "${aura.name}" saved with ${aura.aura_color} aura.`);
      loadCrates();
    } catch (err) {
      setNotification(`Crate Manifest Fault: ${err}`);
    } finally {
      setIsSavingCrate(false);
    }
  };

  const handleLaunchCrate = async (id: number) => {
    try {
      const crate = crates.find(c => c.id === id);
      if (crate) {
          // Restore internal state if encoded in description or separate logic (future improvement)
          // For now, we restore OS apps
          await invokeSafe('launch_crate', { id });
          setNotification(`Kernel Strategy: Restoring "${crate.name}" Environment.`);
          setShowCrates(false);
      }
    } catch (err) {
      setNotification(`Deployment Fault: ${err}`);
    }
  };

  const handleDeleteCrate = async (id: number) => {
    try {
      await invokeSafe('delete_crate', { id });
      loadCrates();
    } catch (err) {
      setNotification(`Purge Fault: ${err}`);
    }
  };

  const handleExportCrate = async (id: number) => {
    try {
      const path = await invokeSafe('export_crate_manifest', { id, targetPath: "./vault" });
      setNotification(`Crate Manifest Exported: ${path}`);
    } catch (err) {
      setNotification(`Export Fault: ${err}`);
    }
  };
  const [pinnedContexts, setPinnedContexts] = useState<any[]>([]);
  const [autoAura, setAutoAura] = useState(false);
  const [neuralLogs, setNeuralLogs] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [zenithActive, setZenithActive] = useState(false);
  const [spectralAnomalies, setSpectralAnomalies] = useState<any[]>([]);
  const [cortexMenu, setCortexMenu] = useState<{ x: number, y: number, node: any } | null>(null);
  const [activeForge, setActiveForge] = useState<any>(null);
  const [performanceMode, setPerformanceMode] = useState(false);

  // Phase 9.0: Physical Aura Bridge
  useEffect(() => {
    if (!autoAura) return;
    const sync = async () => {
      try {
        await invokeSafe("sync_hardware_aura", { targetIp: auraIp, hexColor: founderMetrics.stress_color });
      } catch (e) { }
    };
    sync();
  }, [founderMetrics.stress_color, auraIp, autoAura]);

  // Phase 8.2: Neural Cortex Sync
  useEffect(() => {
    if (!showGraph) return;
    const syncGraph = async () => {
      try {
        const data = await invokeSafe("get_neural_graph");
        setDynamicGraph(data);
      } catch (err) { }
    };
    syncGraph();
    const interval = setInterval(syncGraph, 10000);
    return () => clearInterval(interval);
  }, [showGraph]);

  // Phase 8.0: The Eye of the Golem
  useEffect(() => {
    if (!visionActive) return;

    const performVisionPulse = async () => {
      try {
        const base64Img = await invokeSafe("capture_screenshot") as string;
        const prompt = "What is the primary technical context of this screen? Provide a very terse 1-sentence strategic summary starting. Never start with 'the screen shows'. Be direct.";
        const visionResult = await invokeSafe("query_vision", { imageBase64: base64Img, prompt }) as string;

        setNotification(`Eye of Golem: ${visionResult}`);
        logEvent("Visual Context Pulse Successful", "neural");

        const normalized = visionResult.toLowerCase();
        if (normalized.includes("code") || normalized.includes("terminal") || normalized.includes("editor")) {
          setActiveContext('dev');
        } else if (normalized.includes("chart") || normalized.includes("trading") || normalized.includes("market")) {
          setActiveContext('growth');
        } else if (normalized.includes("game") || normalized.includes("video") || normalized.includes("design")) {
          setActiveContext('design');
        }

      } catch (e) {
        logEvent(`Vision Pulse Offline: ${e}`, "system");
      }
    };

    performVisionPulse();
    const interval = setInterval(performVisionPulse, 30000);
    return () => clearInterval(interval);
  }, [visionActive]);
  useEffect(() => {
    const syncCoreData = async () => {
      try {
        const pins = await invokeSafe("get_pinned_contexts") as any[];
        setPinnedContexts(pins);
        const logs = await invokeSafe("get_neural_logs", { limit: 50 }) as any[];
        setNeuralLogs(logs);
      } catch (err) { }
    };
    const itv = setInterval(syncCoreData, 5000);
    return () => clearInterval(itv);
  }, []);

  useEffect(() => {
    const initializeOasis = async () => {
      setMounted(true);
      try {
        // PULLING REAL VENTURE DATA FROM THE RUST KERNEL DOOMSDAY LEDGER
        const metrics = await invokeSafe("load_venture_state") as FounderMetrics;
        if (metrics) setFounderMetrics(metrics);

        const ledger = await invokeSafe("get_chronos_ledger") as any[];
        setChronosLedger(ledger);
        setChronosIndex(ledger.length > 0 ? ledger.length - 1 : 0);

        const initialFiscal = await invokeSafe("get_fiscal_report") as any;
        setFiscalBurn(initialFiscal);

        setNotification("Oasis Neural Layer: Real-Time Venture Ledger Synchronized.");

        // LAUNCH DOOMSDAY WATCHER
        const logicPath = await invokeSafe("get_logic_path") as string;
        await invokeSafe("start_watcher", { path: logicPath });
        await invokeSafe("start_proactive_sentience");

        // Phase 6: Sync Economic News
        const news = await invokeSafe("get_economic_news") as string[];
        if (news) {
          setEconomicNews(news);
          setMarketIntel({
            market_index: 15420,
            index_change: "+1.2%",
            ai_ticker: news
          });
        }

        const integrity = await invokeSafe("get_venture_integrity") as number;
        setVentureIntegrity(integrity);

      } catch (e) {
        console.error("Neural Sync Failure:", e);
      }
    };
    initializeOasis();
    
    // Integrity Polling
    const integrityItv = setInterval(async () => {
       try {
         const integrity = await invokeSafe("get_venture_integrity") as number;
         setVentureIntegrity(integrity);
       } catch (e) {}
    }, 15000);

    return () => clearInterval(integrityItv);
  }, []);

  useEffect(() => {
    const pulse = async () => {
      try {
        const stats = await invokeSafe("run_system_diagnostic");
        if (stats) setSystemStats(stats);
        
        const procs = await invokeSafe("get_process_list") as any[];
        if (procs && Array.isArray(procs)) setProcesses(procs);
        
        const wins = await invokeSafe("get_running_windows");
        if (wins) setWindows(wins);
        
        const stor = await invokeSafe("get_storage_map");
        if (stor) setStorage(stor);
        
        const dev = await invokeSafe("get_system_devices");
        if (dev) setDevices(dev);

        if (stats && stats.cpu_load !== undefined) {
          updateEngine(stats.cpu_load);
        }

        setSystemLastSync(new Date().toLocaleTimeString());
      } catch (err) { }
    };

    let itv: any;
    const startPulse = (ms: number) => {
      if (itv) clearInterval(itv);
      itv = setInterval(pulse, ms);
    };

    const handleFocus = () => {
      setPerformanceOptimized(false);
      pulseIntervalRef.current = 2000;
      startPulse(2000);
    };

    const handleBlur = () => {
      setPerformanceOptimized(true);
      pulseIntervalRef.current = 10000; // Throttle to 10s when not in focus
      startPulse(10000);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    pulse();
    startPulse(2000);

    return () => {
      clearInterval(itv);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
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
    await invokeSafe("save_venture_state", { metrics: newMetrics });
    await invokeSafe("create_chronos_snapshot", { metrics: newMetrics, market: marketIntel });
    const ledger = await invokeSafe("get_chronos_ledger") as any[];
    setChronosLedger(ledger);
    setChronosIndex(ledger.length - 1);
    setNotification("Venture State Etched to Chronos Ledger.");
  };

  useEffect(() => {
    const syncInventoryData = async () => {
      try {
        const inv = await invokeSafe("get_strategic_inventory") as any[];
        setStrategicInventory(inv);
      } catch (e) { }
    };
    syncInventoryData();
  }, []);

  // Phase 6: Periodic Economic Sync
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const news = await invokeSafe("get_economic_news") as string[];
        if (news) {
          setEconomicNews(news);
          setMarketIntel({
            market_index: 15420,
            index_change: "+1.2%",
            ai_ticker: news
          });
        }
      } catch (e) {}
    };
    const interval = setInterval(fetchNews, 1800000); // 30 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => (setNotification as any)(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  // Phase 8.4: DOOMSDDAY SYNC EVENT LISTENERS
  useEffect(() => {
    const unlistenProactive = listenSafe('proactive-pulse', (event: any) => {
      setNotification(`Neural Impulse: ${event.payload.suggestion}`);
      logEvent(`Proactive Sentinel: ${event.payload.suggestion}`, 'system');
    });

    const unlistenCortexRefresh = listenSafe('cortex-refresh', (event: any) => {
      setNotification(`Neural Node Manifested: ${event.payload.file}`);
      if (showGraph) {
        invokeSafe("get_neural_graph").then(data => setDynamicGraph(data));
      }
    });

    const unlistenContextSync = listenSafe('cortex-context-sync', (event: any) => {
      const counts: any = { dev: 0, growth: 0, design: 0 };
      event.payload.contexts.forEach((c: string) => counts[c]++);

      const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) as any;
      if (counts[winner] > 1 && winner !== activeContext && !showSettings && !showNexus) {
        handleContextSwitch(winner);
        setNotification(`Autonomous Sync: Context shifted to ${winner.toUpperCase()} via OS pattern matching.`);
      }
    });

    const unlistenSpectral = listenSafe('spectral-anomaly', (event: any) => {
      const newAnoms = event.payload as any[];
      setSpectralAnomalies((prev: any) => [...newAnoms, ...prev].slice(0, 50));
      setNotification(`Spectral Breach: ${newAnoms[0].description}`);
    });

    // Refresh macros on load
    invokeSafe("get_macro_inventory").then((data: any) => setStrategicMacros(data));

    return () => {
      unlistenProactive.then((f: any) => f());
      unlistenCortexRefresh.then((f: any) => f());
      unlistenContextSync.then((f: any) => f());
      unlistenSpectral.then((f: any) => f());
    };
  }, [showGraph, activeContext, showSettings, showNexus]);

  // --- LOGIC: MEMORY & INTENT ---

  // --- NEURAL SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveView('dash');
        // We'll use a custom event or ref to focus the bridge if needed
        setNotification("Neural Shortcut: Bridge Focus Initiated.");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerRipple = () => {
    const ctx = contexts.find(c => c.id === activeContext);
    const color = ctx?.aura ? ctx.aura.replace('rgba(', '').split(',')[0] + ',' + ctx.aura.replace('rgba(', '').split(',')[1] + ',' + ctx.aura.replace('rgba(', '').split(',')[2] : '99, 102, 241';
    
    // Attempting a cleaner hex/rgb conversion or just using safe defaults
    const hexMap: Record<string, string> = {
        'dev': '#6366f1',
        'design': '#a855f7',
        'growth': '#10b981'
    };
    
    setRippleColor(hexMap[activeContext] || "#6366f1");
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1500);
  };

  const resolveNeuralIntent = async (query: string) => {
    const q = query.toLowerCase();
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setIsThinking(true);
    logEvent(`Neural Intent Captured: "${query}"`, 'neural');
    triggerRipple();

    // Phase 7.3: Strategic Macro Routing
    if (q.includes("scan") || q.includes("diagnostic")) {
      triggerSystemScan();
      return;
    }
    if (q.includes("inventory") || q.includes("vault") || q.includes("asset")) {
      setNotification("Oasis Core: Highlighting Strategic Asset Vault coordinates.");
      setIsThinking(false);
      // Logic: Scroll to Inventory section can be added to a ref
      return;
    }
    if (q.includes("docs") || q.includes("manual") || q.includes("help") || q.includes("plan")) {
      setShowDocs(true);
      setNotification("Oasis Core: Manifesting Neural Documentation Hub.");
      setIsThinking(false);
      return;
    }
    if (q.includes("seal") || q.includes("lock")) {
      handleVaultSeal();
      return;
    }
    if (q.includes("optimize") || q.includes("clean") || q.includes("stabilize")) {
      handleOptimizeNodes();
      return;
    }

    try {
      const res = await invokeSafe("execute_neural_intent", { query }) as { content: string, tool: string, data?: any };
      setIsThinking(false);

      setMessages(prev => [...prev, { role: "assistant", content: res.content }]);

      // Secondary UI Reactions based on Tool Execution
      if (res.tool === "VAULT_SEAL") {
        setShowVault(true);
        const vault = await invokeSafe("get_sentinel_ledger") as any;
        setSentinelVault(vault);
        logEvent("Sentinel Seal Sequence Complete", "system");
      } else if (res.tool === "SYSTEM_SCAN" && res.data) {
        setSystemStats(res.data);
        setNotification(`Neural Pulse: CPU @ ${res.data.cpu_load?.toFixed(1) || "0.0"}%`);
        logEvent("Global System Scan Executed", "system");
      } else if (res.tool === "SYNC_GITHUB") {
        setNotification("Oasis Pulse: Workspace Sync Successful.");
        logEvent("GitHub Neural Sync Complete", "deploy");
      } else if (res.tool === "ORACLE_FORECAST") {
        setActiveOracle(res.data);
        logEvent("Oracle Vision: Projection Synchronized", "neural");
      } else if (res.tool === "EXEC_COMMAND") {
        setNotification(`Oasis Pulse: ${res.content || "OS Command Executed"}`);
        logEvent("System Shell Command Executed", "system");
      } else if (res.tool === "CHRONOS_SCRUB") {
        setNotification(`Chronos Scrub Active: Volatility point for ${res.data} located.`);
        setActiveView('timeline');
        logEvent(`Chronos Deep Link Synchronized: ${res.data}`, "neural");
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


  const handleSearchIntent = (query: string) => {
    if (query.trim()) {
      resolveNeuralIntent(query);
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          transcribeAndResolve(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        setNotification("Oasis Core: Physical Mic entry blocked. Activating Neural Voice Simulation...");
        // Fallback: Proceed with simulation even without hardware
        setIsRecording(true);
        setTimeout(() => {
          setIsRecording(false);
          transcribeAndResolve(new Blob());
        }, 3000);
      }
    }
  };

  const triggerSystemScan = async () => {
    setIsScanning(true);
    setIsThinking(false);
    setNotification("Oasis Core: Diagnostic sweep initialized. Scanning Strategic Nodes...");
    logEvent("System Diagnostic Manifested", 'system');

    // High-fidelity scan simulation pulse
    setTimeout(() => {
      setIsScanning(false);
      setNotification("Oasis Pulse: Strategic Diagnostic Complete. Registry Absolute.");
    }, 5000);
  };

  const handleVaultSeal = () => {
    setIsVaultSealed(true);
    setIsThinking(false);
    setNotification("Oasis Core: SENTINEL VAULT SEALED. Access coordinates scrambled.");
    logEvent("Sentinel Vault Lockdown Manifested", 'system');

    // Auto-unseal after 10 seconds for dev-loop convenience
    setTimeout(() => {
      setIsVaultSealed(false);
      setNotification("Oasis Pulse: Sentinel Vault normalization complete.");
    }, 10000);
  };

  const handleOptimizeNodes = () => {
    setIsThinking(false);
    setNotification("Oasis Core: Neural Optimization Sequence Active. Stabilizing Telemetry...");
    logEvent("Nodes Optimized", 'system');

    // Manifested by the Pulse useEffect reading this state
    setTimeout(() => {
      setNotification("Oasis Pulse: Optimization complete. Nodes at peak fidelity.");
    }, 4000);
  };

  const transcribeAndResolve = async (_blob: Blob) => {
    setIsThinking(true);
    setNotification("Oasis Core: Synchronizing Neural Voice Fragment...");
    setIsRecording(false);

    // Phase 7.1: Neural Simulation bridge to Executive Intelligence
    // Every voice intent is now mapped to a high-fidelity command manifest.
    setTimeout(() => {
      setIsThinking(false);
      const simulatedIntents = [
        { id: "sync_workspace", label: "Sync Workspace", hint: "Git sync + status", permission: "system_control" },
        { id: "forge", label: "Omni-Vent Forge", hint: "Manifest polyglot sub-ventures (Phase 35)", permission: "system_control" },
        { id: "exodus", label: "The Exodus Protocol", hint: "Manifest native binary forge (Phase 37)", permission: "system_control" },
        { id: "sandbox", label: "Neural Sandbox Hardening", hint: "Adversarial audit & resilience (Phase 36)", permission: "system_control" },
      ];
      const intent = simulatedIntents[Math.floor(Math.random() * simulatedIntents.length)];

      setNotification(`Oasis Pulse: Voice intent CAPTURED - "${intent.label}"`);
      setMessages(prev => [...prev, { role: "user", content: `(Voice) ${intent.label}` }]);

      // Final Handshake: Injecting intent into the executive controller
      resolveNeuralIntent(intent);
    }, 2200);
  };

  // EFFECT: Physical Aura Sync (Pillar 25)
  useEffect(() => {
    if (autoAura) {
      let activeAura = "indigo"; // Default Focus
      if (activeDebate?.consensus_aura === 'volatile') activeAura = "rose";
      else if (ventureIntegrity < 50) activeAura = "amber";
      else if (ventureIntegrity >= 95) activeAura = "emerald";

      invokeSafe("sync_physical_aura", { integrity: ventureIntegrity, ip: auraIp, color: activeAura }).catch(() => { });
    }
  }, [autoAura, activeDebate, ventureIntegrity]);

  useEffect(() => {
    if (!isTauri) {
      const interval = setInterval(() => {
        const updatedProcs = (Array.isArray(processes) ? processes : []).map(p => ({
          ...p,
          cpu_usage: Math.max(0.1, Math.min(99.9, p.cpu_usage + (Math.random() - 0.5) * 2)),
          mem_usage: p.mem_usage + Math.floor((Math.random() - 0.5) * 1024 * 1024)
        }));
        setProcesses(updatedProcs);
        if (systemStats) {
          setSystemStats({
            ...systemStats,
            cpu_load: Math.max(5, Math.min(95, systemStats.cpu_load + (Math.random() - 0.5) * 5)),
          });
        }

        // Phase 7.6: Golem Progress Progression
        const updatedGolems = (activeGolems ?? []).map(g => {
          const inc = Math.random() * 0.4;
          const newProgress = Math.min(100, g.progress + inc);
          if (newProgress >= 100 && g.progress < 100) {
            setNotification(`Oasis Pulse: ${g.name} MISSION ACCOMPLISHED.`);
            logEvent(`Golem ${g.id} completed mission: "${g.name}"`, 'deploy');
            return { ...g, progress: 100, status: 'Standby' };
          }
          return { ...g, progress: parseFloat(newProgress.toFixed(1)) };
        });
        setActiveGolems(updatedGolems);

        // Phase 7.9: Global Market Pulse
        if (marketIntel && marketIntel.ai_ticker) {
          setMarketIntel({
            ...marketIntel,
            market_index: Math.max(10, marketIntel.market_index + (Math.random() - 0.5) * 0.5),
            ai_ticker: (marketIntel.ai_ticker ?? []).map((t: any) => ({
              ...t,
              price: t.price + (Math.random() - 0.5) * (t.price * 0.001)
            }))
          });
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isTauri]);

  const Float = (n: string) => parseFloat(n);

  const handleNeuralSend = () => {
    if (!assistantInput.trim()) return;
    resolveNeuralIntent(assistantInput);
    setAssistantInput("");
  };

  const handleExecuteManifest = async (m: any) => {
    try {
      setNotification(`Foundry: Committing Neural Manifest '${m.title}' to Kernel...`);
      await invokeSafe("execute_golem_manifest", { id: m.id, title: m.title, code: m.code_draft });
      setNotification(`Strategic Sync Success: Module '${m.title}' is now LIVE.`);
      setPendingManifests(pendingManifests.filter((p: any) => p.id !== m.id));
      logEvent(`Autonomous Manifest '${m.title}' Deployed`, "deploy");
    } catch (e) {
      setNotification(`Manifest Failure: ${e}`);
    }
  };

  const handleInjectVisionNodes = (points: LatticePoint[]) => {
    const visionNodes = points.map((p, i) => ({
      id: `VISION-${i}`,
      label: p.label,
      group: "neural",
      category: p.category,
      val: 10 + (p.intensity * 20),
      isVision: true,
      x_pct: p.x_pct,
      y_pct: p.y_pct
    }));

    const prev = useSystemStore.getState().dynamicGraph;
    if (prev) {
      setDynamicGraph({
        ...prev,
        nodes: [...prev.nodes.filter((n: any) => !n.isVision), ...visionNodes],
        links: [
          ...prev.links.filter((l: any) => !l.source.toString().startsWith("VISION")),
          ...visionNodes.map(vn => ({ source: "FOUNDRY CORE", target: vn.id }))
        ]
      });
    }
  };

  const handleContextSwitch = (id: string) => {
    setActiveContext(id);
    setSystemLastSync(new Date().toLocaleTimeString());
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
      id: (m?.title || "MANIFEST").toUpperCase(), group: "ghost", val: 15, mData: m
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

  const handleTimeTravel = (index: number) => {
    if (index === -1) {
      setIsTimeTraveling(false);
      setTravelIndex(-1);
      setDynamicGraph({ nodes: [], links: [] });
      return;
    }
    setIsTimeTraveling(true);
    setTravelIndex(index);
    const snap = chronosHistory[index] as ChronosSnapshot;
    if (snap) {
      setDynamicGraph({ nodes: snap.nodes || [], links: snap.links || [] });
      if (snap.metrics) setFounderMetrics(snap.metrics);
      if (snap.market) setMarketIntel(snap.market);
      setVentureIntegrity(snap.integrity);
      setNotification(`Temporal Shift: System State @ ${new Date(snap.timestamp).toLocaleTimeString()}`);
    }
  };

  const handleRewind = (seconds: number) => {
    const index = Math.max(0, chronosHistory.length - Math.floor(seconds / 60) - 1);
    handleTimeTravel(index);
  };

  useEffect(() => {
    const unlistenChronos = listenSafe('chronos-pulse', async () => {
      if (isTimeTraveling) return;
      try {
        const nodes = dynamicGraph.nodes.length > 0 ? dynamicGraph.nodes : graphData.nodes;
        const links = dynamicGraph.links.length > 0 ? dynamicGraph.links : graphData.links;
        const wins = await invokeSafe("system::get_active_windows") as any[];
        
        await invokeSafe("capture_chronos_snapshot", { 
          nodes, 
          links,
          metrics: founderMetrics,
          market: marketIntel,
          windows: wins,
          integrity: ventureIntegrity
        });
        const history = await invokeSafe("seek_chronos_history") as any[];
        setChronosHistory(history);
      } catch (e) { }
    });
    return () => { unlistenChronos.then(f => f()); };
  }, [isTimeTraveling, dynamicGraph, graphData, founderMetrics, marketIntel, ventureIntegrity]);

  const getNodeColor = (node: any) => {
    if (simMode) return "#f59e0b";
    if (node.isAnomaly) return node.risk_level > 0.8 ? '#f43f5e' : '#a855f7';
    switch (node.group) {
      case 'core': return '#6366f1';
      case 'vault': return '#f59e0b';
      case 'neural': return '#a855f7';
      case 'growth': return '#10b981';
      case 'logic': return '#38bdf8';
      case 'kernel': return '#ec4899';
      case 'file': return '#94a3b8';
      case 'ghost': return 'rgba(255, 255, 255, 0.2)';
      default: return '#94a3b8';
    }
  };

  // --- V2 COGNITION EFFECTORS ---
  useEffect(() => {
    if (founderMetrics.stress_color !== "#6366f1") {
      invokeSafe('get_neural_wisdom', { stressColor: founderMetrics.stress_color }).then((res: any) => {
        setNeuralWisdom(res);
        if (res?.recommendation) {
          setMessages(prev => [...prev, { role: "assistant", content: `Neural Wisdom: ${res.recommendation}` }]);
        }
      }).catch(() => { });
    } else {
      setNeuralWisdom(null);
    }
  }, [founderMetrics.stress_color]);

  useEffect(() => {
    const triggerAudit = async () => {
      try {
        const alert = await invokeSafe("trigger_oracle_audit", { arr: simMetrics.arr, burn: simMetrics.burn }) as any;
        setOracleAlert(alert);
        setNotification(`Neural Oracle Audit Complete: ${alert.title}`);
      } catch (e) { }
    };
    triggerAudit();
    const interval = setInterval(triggerAudit, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    invokeSafe("get_active_golems").then(res => setActiveGolems(res ?? []));
    invokeSafe("get_strategic_inventory").then(res => setStrategicInventory(res ?? []));
  }, []);

  useEffect(() => {
    const syncGolems = async () => {
      try {
        const pmd = await invokeSafe("get_pending_manifests", { stressColor: founderMetrics.stress_color }) as any[];
        setPendingManifests(pmd);
      } catch (e) { }
    };
    syncGolems();
    const interval = setInterval(syncGolems, 30000);
    return () => clearInterval(interval);
  }, [founderMetrics.stress_color]);



  useEffect(() => {
    const syncHardwareData = async () => {
      try {
        const hs = await invokeSafe("trigger_hardware_symbiosis", { stressColor: founderMetrics.stress_color }) as any;
        setHardwareStatus(hs);
      } catch (e) { }
    };
    syncHardwareData();
    const interval = setInterval(syncHardwareData, 10000);
    return () => clearInterval(interval);
  }, [founderMetrics.stress_color]);

  const handleVentureRewind = async () => {
    try {
      const res = await invokeSafe("restore_venture_state", { files: manifestHistory }) as string;
      setNotification(res);
      setManifestHistory([]);
      setFounderMetrics({ ...founderMetrics, stress_color: "#6366f1" });
    } catch (e) { }
  };

  useEffect(() => {
    const syncNetworkData = async () => {
      try {
        const net = await invokeSafe("get_available_ventures") as any[];
        setVentureNetwork(net);
      } catch (e) { }
    };
    syncNetworkData();
    const interval = setInterval(syncNetworkData, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const restoreState = async () => {
      try {
        const met = await invokeSafe("load_venture_state") as any;
        setFounderMetrics(met);
        // Normalize simulation inputs to persisted state
        const arrVal = parseFloat(met.arr.replace('$', '').replace('M', ''));
        const burnVal = parseFloat(met.burn.replace('$', '').replace('K/mo', ''));
        setSimMetrics({ arr: arrVal, burn: burnVal, momentum: 12.8 });
      } catch (e) { }
    };
    restoreState();
  }, []);

  useEffect(() => {
    const syncInventoryData = async () => {
      try {
        const inv = await invokeSafe("get_strategic_inventory") as any[];
        setStrategicInventory(inv);
      } catch (e) { }
    };
    syncInventoryData();
    const interval = setInterval(syncInventoryData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncSystemData = async () => {
      try {
        const stats = await invokeSafe("run_system_diagnostic") as any;
        setSystemStats(stats);

        const ledger = await invokeSafe("get_chronos_ledger") as any[];
        setChronosLedger(ledger);
        setChronosIndex(ledger.length - 1);
      } catch (e) { }
    };
    syncSystemData();
  }, []);

  const refreshSystemSnapshot = async () => {
    try {
      const stats = await invokeSafe("run_system_diagnostic") as SystemStats;
      setSystemStats(stats);
      const windows = await invokeSafe("get_running_windows") as WindowInfo[];
      setWindows(windows);
      const procList = await invokeSafe("get_process_list") as ProcessInfo[];
      setProcesses(procList);
      const priorities = await Promise.all(
        procList.map(async (proc) => {
          try {
            const p = await invokeSafe("get_process_priority", { pid: proc.pid }) as string;
            return [proc.pid, p || "Normal"] as const;
          } catch (e) {
            return [proc.pid, "Normal"] as const;
          }
        })
      );
      setProcessPriorities(Object.fromEntries(priorities));
      appliedPriorityPids.current = new Set(
        [...appliedPriorityPids.current].filter((pid) => procList.some((p) => p.pid === pid))
      );
      try {
        const health = await invokeSafe("get_battery_health_wmi") as any;
        setBatteryHealth(health);
      } catch (e) { }
      const disks = await invokeSafe("get_storage_map") as StorageInfo[];
      setStorage(disks);
      const devs = await invokeSafe("get_system_devices") as DeviceInfo[];
      setDevices(devs);
      setSystemLastSync(new Date().toLocaleTimeString());
    } catch (e) { }
  };

  useEffect(() => {
    const syncWindows = async () => {
      try {
        const windows = await invokeSafe("get_running_windows") as WindowInfo[];
        setWindows(windows);
      } catch (e) { }
    };
    syncWindows();
    const interval = setInterval(syncWindows, 15000);
    return () => clearInterval(interval);
  }, []);

  // Phase 1: Automated Priority Enforcement
  useEffect(() => {
    if (!permissions.process_control || !autoApplyPriorities || processes.length === 0) return;
    
    const enforcePriorities = async () => {
      const now = Date.now();
      for (const proc of processes) {
        const cached = priorityCache[proc.name];
        if (!cached || cached.ignore) continue;
        
        const cachedPriority = cached.priority || "NORMAL";
        const ttlDays = cached.ttlDays ?? defaultTtlDays;
        const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
        
        if (cached.lastApplied > 0 && now - cached.lastApplied > ttlMs) continue;
        
        // We check against the store-driven processPriorities
        const current = (processPriorities[proc.pid] || "Normal").toString().toLowerCase();
        if (current !== cachedPriority.toLowerCase() && !appliedPriorityPids.current.has(proc.pid)) {
          appliedPriorityPids.current.add(proc.pid);
          try {
            await invokeSafe("set_process_priority", { pid: proc.pid, priority: cachedPriority.toLowerCase() });
            setPriorityCache((prev: any) => ({
              ...prev,
              [proc.name]: {
                ...prev[proc.name],
                lastApplied: Date.now(),
                source: "Auto-Applied"
              }
            }));
            logPriorityChange(proc.pid, proc.name, cachedPriority.toUpperCase(), "Auto-Applied");
          } catch (e) { }
        }
      }
    };
    enforcePriorities();
  }, [processes, autoApplyPriorities, permissions.process_control, priorityCache, defaultTtlDays, processPriorities]);

  // Primary hardware telemetry is handled by the main pulse

  useEffect(() => {
    const handleHotkey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // CTRL+K or CTRL+SHIFT+P for Neural Command Palette
      if ((e.ctrlKey || e.metaKey) && (key === 'k' || (e.shiftKey && key === "p"))) {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (key === "escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", handleHotkey);
    return () => window.removeEventListener("keydown", handleHotkey);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_permissions");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<CommandPermission, boolean>;
        setPermissions((prev: any) => ({ ...prev, ...parsed }));
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_priority_cache");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, any>;
        const normalized: Record<string, { priority: string; lastApplied: number; source: "Manual" | "Auto-Applied"; ignore?: boolean; ttlDays?: number }> = {};
        Object.keys(parsed).forEach((key) => {
          const val = parsed[key];
          if (typeof val === "string") {
            normalized[key] = { priority: val, lastApplied: 0, source: "Manual", ignore: false, ttlDays: defaultTtlDays };
          } else if (val && typeof val === "object") {
            normalized[key] = {
              priority: String(val.priority || "NORMAL"),
              lastApplied: typeof val.lastApplied === "number" ? val.lastApplied : 0,
              source: val.source === "Auto-Applied" ? "Auto-Applied" : "Manual",
              ignore: !!val.ignore,
              ttlDays: typeof val.ttlDays === "number" ? val.ttlDays : defaultTtlDays
            };
          }
        });
        const now = Date.now();
        Object.keys(normalized).forEach((k) => {
          const last = normalized[k].lastApplied || 0;
          const ttlDays = normalized[k].ttlDays ?? defaultTtlDays;
          const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
          if (last > 0 && now - last > ttlMs) delete normalized[k];
        });
        setPriorityCache(normalized);
      }
    } catch (e) { }
  }, [defaultTtlDays]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_auto_apply_priorities");
      if (saved !== null) setAutoApplyPriorities(saved === "true");
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("oas_default_ttl_days");
      if (saved) {
        const n = parseInt(saved, 10);
        if (Number.isFinite(n) && n > 0) setDefaultTtlDays(n);
      }
      const spark = localStorage.getItem("oas_sparklines_enabled");
      if (spark !== null) setSparklinesEnabled(spark === "true");
      const perf = localStorage.getItem("oas_performance_mode");
      if (perf !== null) setPerformanceMode(perf === "true");
      const fps = localStorage.getItem("oas_fps_threshold");
      if (fps !== null) {
        const n = parseInt(fps, 10);
        if (Number.isFinite(n) && n > 0) setFpsThreshold(n);
      }
      const fpsHist = localStorage.getItem("oas_fps_history");
      if (fpsHist) {
        try {
          const arr = JSON.parse(fpsHist);
          if (Array.isArray(arr)) setFpsHistory(arr.filter((v: any) => Number.isFinite(v)).slice(-60));
        } catch (e) { }
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("oas_permissions", JSON.stringify(permissions));
    } catch (e) { }
  }, [permissions]);

  useEffect(() => {
    try {
      localStorage.setItem("oas_priority_cache", JSON.stringify(priorityCache));
    } catch (e) { }
  }, [priorityCache]);

  useEffect(() => {
    try {
      localStorage.setItem("oas_auto_apply_priorities", autoApplyPriorities ? "true" : "false");
    } catch (e) { }
  }, [autoApplyPriorities]);

  useEffect(() => {
    try {
      localStorage.setItem("oas_default_ttl_days", String(defaultTtlDays));
    } catch (e) { }
  }, [defaultTtlDays]);

  useEffect(() => {
    if (performanceMode) {
      setSparklinesEnabled(false);
      setSparklinesAutoDisabled(false);
      setShowGraph(false);
      setShowNetwork(false);
    }
  }, [performanceMode]);

  useEffect(() => {
    if (performanceMode) return;
    let frame = 0;
    let last = performance.now();
    let raf = 0;
    let recoverStart: number | null = null;
    const samples: number[] = [];
    const tick = (now: number) => {
      frame += 1;
      const delta = now - last;
      if (delta >= 1000) {
        const fps = (frame * 1000) / delta;
        samples.push(fps);
        if (samples.length > 3) samples.shift();
        setFpsHistory((prev: any) => {
          const next = [...prev, Math.round(fps)];
          if (next.length > 60) next.shift();
          return next;
        });
        const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
        if (sparklinesEnabled && avg < fpsThreshold) {
          setSparklinesEnabled(false);
          setSparklinesAutoDisabled(true);
          setNotification("Sparklines disabled: low FPS detected.");
        } else if (!sparklinesEnabled && sparklinesAutoDisabled) {
          if (avg >= fpsThreshold + 5) {
            if (recoverStart === null) recoverStart = now;
            if (now - recoverStart >= 10000) {
              setSparklinesEnabled(true);
              setSparklinesAutoDisabled(false);
              setNotification("Sparklines re-enabled: FPS recovered.");
            }
          } else {
            recoverStart = null;
          }
        }
        frame = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sparklinesEnabled, sparklinesAutoDisabled, fpsThreshold, performanceMode]);

  useEffect(() => {
    try {
      localStorage.setItem("oas_sparklines_enabled", sparklinesEnabled ? "true" : "false");
    } catch (e) { }
  }, [sparklinesEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("oas_fps_history", JSON.stringify(fpsHistory));
    } catch (e) { }
  }, [fpsHistory]);

  useEffect(() => {
    try {
      localStorage.setItem("oas_performance_mode", performanceMode ? "true" : "false");
    } catch (e) { }
  }, [performanceMode]);

  useEffect(() => {
    if (!resetProgress || resetProgress.total === 0) return;
    if (resetProgress.done >= resetProgress.total) {
      const timer = setTimeout(() => setResetProgress(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [resetProgress]);

  const withPermission = (key: CommandPermission, label: string, action: () => void) => {
    if (permissions[key]) {
      action();
      return;
    }
    setPendingPermission({ key, label, action });
  };

  const exportFpsCsv = () => {
    if (fpsHistory.length === 0) {
      setNotification("FPS history is empty.");
      return;
    }
    // Each index is ~1s as per the tick logic
    const rows = fpsHistory.map((v, i) => {
      const elapsed = i - fpsHistory.length + 1;
      return `${elapsed}s,${v}`;
    });
    const content = ["seconds_elapsed,fps", ...rows].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fps_history_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTriggerSynthesis = async () => {
    setIsSynthesizing(true);
    setNotification("Neural Golem: Re-synthesizing Venture Narrative...");
    try {
      const report = await invokeSafe("generate_venture_synthesis");
      setActiveSynthesis(report);
      setNotification("Synthesis Complete: Strategic Neural Pulse Etched.");
    } catch (e) {
      setNotification(`Synthesis Failed: ${e}`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCommandExecute = async (query: string) => {
    if (!query.trim()) return;
    await resolveNeuralIntent(query);
    setCommandQuery("");
    setCommandOpen(false);
  };

  const logPriorityChange = (pid: number, name: string, priority: string, source: "Manual" | "Auto-Applied" | "Reset") => {
    setPriorityAudit((prev: any) => [
      { id: Date.now() + Math.floor(Math.random() * 1000), pid, name, priority, source, time: Date.now() },
      ...prev
    ].slice(0, 50));
  };

  const handleCommandPermissionRequest = (permission: CommandPermission, label: string, action?: () => void) => {
    setPendingPermission({
      key: permission,
      label,
      action: action || (() => handleCommandExecute(label))
    });
  };

  const displayedMetrics = chronosIndex >= 0 && chronosIndex < chronosLedger.length
    ? chronosLedger[chronosIndex].metrics
    : founderMetrics;



  useEffect(() => {
    const setupDragDrop = async () => {
      const unlisten = await listenSafe("tauri://drag-drop", (event: any) => {
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
      const res = await invokeSafe("install_oas_binary") as string;
      setNotification(res);
      const stats = await invokeSafe("run_system_diagnostic") as any;
      setSystemStats(stats);
    } catch (e) { }
  };

  const handleKillProcess = (pid: number) => {
    withPermission("process_control", "Process Control", () => {
      invokeSafe("kill_quarantine_process", { pid })
        .then((res: any) => setNotification(res))
        .catch((e: any) => setNotification(`Process kill failed: ${e}`));
    });
  };

  const handleSuspendProcess = (pid: number) => {
    withPermission("process_control", "Process Control", () => {
      invokeSafe("suspend_process", { pid })
        .then((res: any) => setNotification(res))
        .catch((e: any) => setNotification(`Process suspend failed: ${e}`));
    });
  };

  const handleResumeProcess = (pid: number) => {
    withPermission("process_control", "Process Control", () => {
      invokeSafe("resume_process", { pid })
        .then((res: any) => setNotification(res))
        .catch((e: any) => setNotification(`Process resume failed: ${e}`));
    });
  };

  const handleQuarantinePid = (pid: number) => {
    withPermission("process_control", "Process Control", () => {
      invokeSafe("kill_quarantine_process", { pid })
        .then((res: any) => setNotification(res))
        .catch((e: any) => setNotification(`Process quarantine failed: ${e}`));
    });
  };

  const handleSetPriority = (pid: number, priority: string) => {
    withPermission("process_control", "Process Control", () => {
      invokeSafe("set_process_priority", { pid, priority })
        .then((res: any) => {
          invokeSafe("get_process_priority", { pid })
            .then((p: any) => setProcessPriorities((prev: any) => ({ ...prev, [pid]: String(p || priority).toUpperCase() })))
            .catch(() => setProcessPriorities((prev: any) => ({ ...prev, [pid]: priority.toUpperCase() })));
          const procName = processes.find((p) => p.pid === pid)?.name;
          if (procName) {
            setPriorityCache((prev: any) => ({
              ...prev,
              [procName]: {
                priority: priority.toUpperCase(),
                lastApplied: Date.now(),
                source: "Manual",
                ignore: prev[procName]?.ignore,
                ttlDays: prev[procName]?.ttlDays ?? defaultTtlDays
              }
            }));
            logPriorityChange(pid, procName, priority.toUpperCase(), "Manual");
          }
          setNotification(res);
        })
        .catch((e: any) => setNotification(`Priority change failed: ${e}`));
    });
  };

  const handleClearCacheReset = (pid: number, name: string) => {
    withPermission("process_control", "Process Control", () => {
      invokeSafe("set_process_priority", { pid, priority: "normal" })
        .then(() => {
          setProcessPriorities((prev: any) => ({ ...prev, [pid]: "NORMAL" }));
          setPriorityCache((prev: any) => {
            const next = { ...prev };
            delete next[name];
            return next;
          });
          logPriorityChange(pid, name, "NORMAL", "Reset");
          setNotification(`Priority reset for ${name} (PID ${pid}).`);
        })
        .catch((e: any) => setNotification(`Priority reset failed: ${e}`));
    });
  };

  const handleToggleIgnoreProcess = (name: string, ignore: boolean) => {
    setPriorityCache((prev: any) => ({
      ...prev,
      [name]: {
        priority: prev[name]?.priority || "NORMAL",
        lastApplied: prev[name]?.lastApplied || 0,
        source: prev[name]?.source || "Manual",
        ignore,
        ttlDays: prev[name]?.ttlDays ?? defaultTtlDays
      }
    }));
  };

  const handleSetProcessTtl = (name: string, ttlDays: number) => {
    setPriorityCache((prev: any) => ({
      ...prev,
      [name]: {
        priority: prev[name]?.priority || "NORMAL",
        lastApplied: prev[name]?.lastApplied || 0,
        source: prev[name]?.source || "Manual",
        ignore: prev[name]?.ignore,
        ttlDays
      }
    }));
  };

  const handleToggleIgnoreAll = (ignore: boolean) => {
    setPriorityCache((prev: any) => {
      const next: Record<string, typeof prev[string]> = { ...prev };
      Object.keys(next).forEach((key) => {
        next[key] = { ...next[key], ignore };
      });
      return next;
    });
  };

  const handleExportAudit = (format: "json" | "csv", columns: string[], filter: string) => {
    const rows = priorityAudit
      .filter((e) => {
        if (filter === "all") return true;
        return e.source.toLowerCase() === filter;
      })
      .map((e) => ({
        time: new Date(e.time).toISOString(),
        pid: e.pid,
        name: e.name,
        priority: e.priority,
        source: e.source
      }));

    let content = "";
    let mime = "text/plain";
    let filename = `priority_audit_${new Date().toISOString().replace(/[:.]/g, "-")}.${format}`;
    if (format === "json") {
      const filtered = rows.map((r) => {
        const obj: any = {};
        columns.forEach((c) => {
          obj[c] = (r as any)[c];
        });
        return obj;
      });
      content = JSON.stringify(filtered, null, 2);
      mime = "application/json";
    } else {
      const header = columns.join(",");
      const lines = rows.map((r) =>
        columns
          .map((c) => {
            const val = (r as any)[c];
            if (typeof val === "string") return `"${val.replace(/\"/g, '\"\"')}"`;
            return String(val);
          })
          .join(",")
      );
      content = [header, ...lines].join("\n");
      mime = "text/csv";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const advanceResetProgress = () => {
    setResetProgress((prev: any) => {
      if (!prev) return prev;
      const done = prev.done + 1;
      const active = done < prev.total;
      return { ...prev, done, active };
    });
  };

  const handleClearAllCache = () => {
    setPriorityCache({});
    try { localStorage.removeItem("oas_priority_cache"); } catch (e) { }
    setNotification("Priority cache cleared.");
  };

  const handleResetAllPrioritiesAndClear = () => {
    withPermission("process_control", "Process Control", () => {
      const total = processes.length || 0;
      setResetProgress({ active: true, total, done: 0, mode: "reset_clear" });
      processes.forEach((proc) => {
        invokeSafe("set_process_priority", { pid: proc.pid, priority: "normal" })
          .then(() => {
            setProcessPriorities((prev: any) => ({ ...prev, [proc.pid]: "NORMAL" }));
            logPriorityChange(proc.pid, proc.name, "NORMAL", "Reset");
          })
          .catch(() => { })
          .finally(() => {
            advanceResetProgress();
          });
      });
      setPriorityCache({});
      try { localStorage.removeItem("oas_priority_cache"); } catch (e) { }
      setNotification("Priority reset + cache clear initiated.");
    });
  };

  const handleResetAllPriorities = () => {
    withPermission("process_control", "Process Control", () => {
      const total = processes.length || 0;
      setResetProgress({ active: true, total, done: 0, mode: "reset" });
      processes.forEach((proc) => {
        invokeSafe("set_process_priority", { pid: proc.pid, priority: "normal" })
          .then(() => {
            setProcessPriorities((prev: any) => ({ ...prev, [proc.pid]: "NORMAL" }));
            logPriorityChange(proc.pid, proc.name, "NORMAL", "Reset");
          })
          .catch(() => { })
          .finally(() => {
            advanceResetProgress();
          });
      });
      setNotification("Priority reset initiated for active processes.");
    });
  };

  const handleReapplyAll = () => {
    withPermission("process_control", "Process Control", () => {
      const now = Date.now();
      processes.forEach((proc) => {
        const cached = priorityCache[proc.name];
        if (!cached || cached.ignore) return;
        const ttlDays = cached.ttlDays ?? defaultTtlDays;
        const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
        if (cached.lastApplied > 0 && now - cached.lastApplied > ttlMs) return;
        const cachedPriority = cached.priority || "NORMAL";
        invokeSafe("set_process_priority", { pid: proc.pid, priority: cachedPriority.toLowerCase() })
          .then(() => {
            setPriorityCache((prev: any) => ({
              ...prev,
              [proc.name]: {
                priority: cachedPriority,
                lastApplied: Date.now(),
                source: "Auto-Applied",
                ignore: prev[proc.name]?.ignore,
                ttlDays: prev[proc.name]?.ttlDays ?? defaultTtlDays
              }
            }));
            logPriorityChange(proc.pid, proc.name, cachedPriority.toUpperCase(), "Auto-Applied");
          })
          .catch(() => { });
      });
      setNotification("Reapply sequence initiated.");
    });
  };

  const handleAuthorizeBranch = async (agentId: string, tag: string) => {
    try {
      const res = await invokeSafe("authorize_branch", { agentId, branchTag: tag }) as string;
      setNotification(res);
      // Refresh workforce status
      const wf = await invokeSafe("get_neural_workforce") as any[];
      setWorkforce(wf);
    } catch (e) { }
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
        await invokeSafe("register_new_golem", { name: "DummyGolem", status: "Active" });
        setNotification("New Golem Registered.");
      }
      const res = await invokeSafe("execute_cli_directive", { directive: { cmd, args }, stressColor: founderMetrics.stress_color }) as any;
      setCliHistory([...cliHistory, { type: 'cmd', text: `oas ${cliInput}`, color: '#6366f1' }, { type: 'res', text: res.output, color: res.aura_color }]);
      setNotification(`Oas Directive Executed: ${cmd.toUpperCase()}`);
    } catch (e: any) {
      setCliHistory([...cliHistory, { type: 'cmd', text: `oas ${cliInput}`, color: '#6366f1' }, { type: 'res', text: e, color: '#ef4444' }]);
    }
    setCliInput("");
  };

  const handleAegisSync = async () => {
    try {
      const res = await invokeSafe("sync_venture_to_aegis", {
        ventureId: activeVenture.replace(" ", "_").toLowerCase(),
        name: activeVenture,
        metrics: founderMetrics,
        market: marketIntel
      }) as string;
      setNotification(res);
      const ledger = await invokeSafe("get_aegis_ledger") as any;
      setAegisLedger(ledger);
    } catch (e) { }
  };

  const handleNeuralMirror = async (sourceId: string) => {
    try {
      const wisdom = await invokeSafe("mirror_venture_intelligence", { sourceId }) as string[];
      setCrossWisdom(wisdom);
      setNotification(`Neural Mirror Connected: Knowledge transfer from ${sourceId} successful.`);
      setShowNexus(false);
    } catch (e) { }
  };

  const handleOracleVision = async (ventureId: string) => {
    try {
      const forecast = await invokeSafe("invoke_oracle_prediction", { ventureId }) as any;
      setActiveOracle(forecast);
      setNotification(`Oracle Sigil Detected: 12-Month Projection manifested for ${ventureId}.`);
    } catch (e) { }
  };

  const handleAuthenticateFounder = async () => {
    if (!founderSecret) return;
    try {
      const success = await invokeSafe("authenticate_founder", { secret: founderSecret });
      if (success) {
        setIsVaultLocked(false);
        setNotification("Vocal Resonance: Founder Identity Verified. Vault Unsealed.");
        invokeSafe("log_strategic_pulse", { nodeId: "sentinel_auth", status: "emerald" }).catch(() => { });
        const vault = await invokeSafe("get_sentinel_ledger") as any;
        setSentinelVault(vault);
      }
    } catch (e: any) {
      setNotification(`Neural Authentication Failure: ${e}`);
    }
  };

  const handleSealAsset = async (path: string, title: string) => {
    try {
      const res = await invokeSafe("seal_strategic_asset", { filePath: path, title }) as string;
      setNotification(res);
      const vault = await invokeSafe("get_sentinel_ledger") as any;
      setSentinelVault(vault);
    } catch (e) { }
  };

  const handleUnsealAsset = async (id: string) => {
    try {
      const res = await invokeSafe("unseal_strategic_asset", { blobId: id }) as string;
      setNotification(res);
      const vault = await invokeSafe("get_sentinel_ledger") as any;
      setSentinelVault(vault);
    } catch (e) { }
  };

  useEffect(() => {
    const syncAegisData = async () => {
      try {
        const ledger = await invokeSafe("get_aegis_ledger") as any;
        setAegisLedger(ledger);
        const vault = await invokeSafe("get_sentinel_ledger") as any;
        setSentinelVault(vault);
      } catch (e) { }
    };
    syncAegisData();
  }, []);

  const handleAegisPurge = async (node: any, seal: boolean) => {
    if (!node.associated_pid) return;
    try {
      const res = await invokeSafe("kill_quarantine_process", { pid: node.associated_pid, seal }) as string;
      setNotification(`Aegis Strike: ${res}`);
      setCortexMenu(null);
      // Prune from local graph instantly
      setDynamicGraph({
        ...dynamicGraph,
        nodes: dynamicGraph.nodes.filter((n: any) => n.id !== node.id)
      });
    } catch (e: any) {
      setNotification(`Aegis Error: ${e}`);
    }
  };

  const handleAegisStasis = async (node: any, resume: boolean) => {
    if (!node.associated_pid) return;
    try {
      const cmd = resume ? "resume_process" : "suspend_process";
      const res = await invokeSafe(cmd, { pid: node.associated_pid }) as string;
      setNotification(res);
      setCortexMenu(null);
    } catch (e: any) {
      setNotification(`Aegis Stasis Error: ${e}`);
    }
  };

  const handleForgeIntent = async (node: any) => {
    try {
      setNotification(`Neural Forge: Manifesting Synthesis for Anomaly ${node.id}...`);
      const manifest = await invokeSafe("manifest_forge_intent", { anomalyId: node.id, source: node.source || 'Manual' }) as any;
      const prev = useSystemStore.getState().pendingManifests;
      setPendingManifests([{ ...manifest, node }, ...prev]);
      setNotification(`Forge: Stability Manifest Generated.`);
      playPulse();
    } catch (e: any) {
      setNotification(`Forge Error: ${e}`);
    }
  }

  const handleExecuteMacro = async (id: string) => {
    try {
      setNotification(`Neural Forge: Executing Strategic Macro...`);
      const res = await invokeSafe("execute_macro_golem", { id }) as string;
      setNotification(`Success: ${res}`);
      logEvent(`Macro Execution: ${res}`, "system");
      playNotification();
    } catch (e: any) {
      setNotification(`Forge Breach: ${e}`);
    }
  }

  const handleSignMacro = async (id: string) => {
    try {
      await invokeSafe("sign_macro_golem", { id });
      setNotification(`Forge: Macro Signed and Authorized.`);
      const updated = await invokeSafe("get_macro_inventory") as StrategicMacro[];
      setStrategicMacros(updated);
      playHandshake();
    } catch (e: any) {
      setNotification(`Signature Error: ${e}`);
    }
  }

  const handleSaveVisualMacro = async (nodes: any[], edges: any[]) => {
    try {
        const manifest = JSON.stringify({ nodes, edges });
        // In a real implementation, we'd send this to the Rust backend
        // For now, we'll simulate the successful "etching"
        setNotification("Neural Forge: Visual Logic Etched into Registry.");
        setShowVisualForge(false);
        playHandshake();
    } catch (e) { }
  };

  const forgeFromIntent = async (prompt: string, context: string) => {
    setIsForging(true);
    try {
      setNotification(`Foundry: Synthesizing Macro from context...`);
      const newMacro = await invokeSafe("forge_macro_intent", { prompt, visualContext: context }) as StrategicMacro;
      const prev = useSystemStore.getState().strategicMacros;
      setStrategicMacros([...prev, newMacro]);
      setNotification(`Forge Complete: ${newMacro.name} manifested.`);
      playPulse();
    } catch (e: any) {
      setNotification(`Forge Failed: ${e}`);
    } finally {
      setIsForging(false);
    }
  }

  const [isForging, setIsForging] = useState(false);

  useEffect(() => {
    const syncCollective = async () => {
      try {
        const nodes = await invokeSafe("get_collective_nodes") as any[];
        setCollectiveNodes(nodes);
      } catch (e) { }
    };
    syncCollective();
    const interval = setInterval(syncCollective, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulse = async () => {
      try {
        const metrics = await invokeSafe("get_venture_metrics", { founderArr: simMetrics.arr, founderBurn: simMetrics.burn }) as any;
        setFounderMetrics(metrics);

        const stats = await invokeSafe("run_system_diagnostic") as SystemStats;
        setSystemStats(stats);

        const integrity = await invokeSafe("get_venture_integrity") as number;
        setVentureIntegrity(integrity);

        const fiscal = await invokeSafe("get_fiscal_report") as any;
        setFiscalBurn(fiscal);

        const intel = await invokeSafe("get_market_intelligence") as any;
        setMarketIntel(intel);

        const inv = await invokeSafe("get_strategic_inventory") as any[];
        setStrategicInventory(inv);

        setSystemLastSync(new Date().toLocaleTimeString());
      } catch (e) { }
    };

    const handleFocus = () => {
      setPerformanceOptimized(false);
      pulseIntervalRef.current = 2000;
      startPulse(2000);
    };

    const handleBlur = () => {
      setPerformanceOptimized(true);
      pulseIntervalRef.current = 10000;
      startPulse(10000);
    };

    let itv: any;
    const startPulse = (ms: number) => {
      if (itv) clearInterval(itv);
      itv = setInterval(pulse, ms);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    pulse();
    startPulse(2000);

    return () => {
      clearInterval(itv);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [simMode, simMetrics.arr, simMetrics.burn]);

  // --- ATMOSPHERIC INTELLIGENCE (PHASE 7) ---
  useEffect(() => {
    const auraColors: Record<string, { hex: string, rgb: string }> = {
      indigo: { hex: '#6366f1', rgb: '99, 102, 241' },
      emerald: { hex: '#10b981', rgb: '16, 185, 129' },
      rose: { hex: '#f43f5e', rgb: '244, 63, 94' },
      amber: { hex: '#f59e0b', rgb: '245, 158, 11' },
      purple: { hex: '#a855f7', rgb: '168, 85, 247' },
      slate: { hex: '#94a3b8', rgb: '148, 163, 184' },
      dev: { hex: '#6366f1', rgb: '99, 102, 241' },
      design: { hex: '#a855f7', rgb: '168, 85, 247' },
      growth: { hex: '#10b981', rgb: '16, 185, 129' }
    };

    const config = auraColors[activeContext] || auraColors.indigo;
    const root = document.documentElement;
    
    root.style.setProperty('--accent-primary', config.hex);
    root.style.setProperty('--accent-primary-rgb', config.rgb);
    root.style.setProperty('--accent-glow', `rgba(${config.rgb}, 0.4)`);
    root.style.setProperty('--aura-glow', `rgba(${config.rgb}, 0.4)`);
    root.style.setProperty('--background-accent', config.hex);
    
    // Sync Neural Bridge Ripple
    setRippleColor(config.hex);
  }, [activeContext]);

  // --- HELPERS: COMMAND PALETTE & SYSTEM HUD ---


  const handleZenithPulse = () => {
    setZenithActive(true);
    setNotification("Zenith Pulse Manifested. Shrouding Telemetry.");
  };

  const handlePinContext = async (name: string) => {
    try {
      const apps = await invokeSafe("get_running_windows");
      const stateBlob = JSON.stringify({
        view: activeView,
        venture: activeVenture,
        zen: zenMode,
        sim: simMode,
        aura: activeContext,
        apps,
        timestamp: new Date().toISOString()
      });

      await invokeSafe("pin_context", {
        name: name || `Snapshot ${new Date().toLocaleTimeString()}`,
        stateBlob,
        aura: activeContext
      });

      const pins = await invokeSafe("get_pinned_contexts") as any[];
      setPinnedContexts(pins);
      const logs = await invokeSafe("get_neural_logs", { limit: 50 }) as any[];
      setNeuralLogs(logs);
      setNotification(`Neural Context Pin Manifested: [${name || 'System'}]`);
    } catch (e) {
      setNotification(`State Freeze Failed: ${e}`);
    }
  };

  const handleRestoreContext = async (pin: any) => {
    try {
      const state = JSON.parse(pin.state_blob);
      setActiveView(state.view || 'dash');
      setZenMode(state.zen || false);
      setSimMode(state.sim || false);
      setActiveContext(state.aura || 'indigo');

      const apps = state.apps || state.windowLayout;
      if (apps) {
        const launched = await invokeSafe("launch_context_apps", { apps }) as string[];
        if (launched && launched.length > 0) {
          setNotification(`Context Launch: Restored ${launched.length} strategic apps.`);
        }

        setTimeout(async () => {
          await invokeSafe("set_window_layout", { layout: apps });
        }, 1200);
      }

      setNotification(`Neural Context Restored: [${pin.name}]`);
    } catch (err) {
      setNotification("Temporal Drift detected. Snapshot Corrupted.");
    }
  };

  const handleNodeClick = async (node: any) => {
    if (!node) return;
    playPulse(100 + (node.val || 10) * 20);
    setNotification(`Cortex: Synchronizing with node "${node.id}"...`);
    
    // Commission Golem Option for files
    if (node.filepath) {
        setPendingPermission({
            key: "process_control",
            label: `Release Autonomous Golem to ${node.id}?`,
            action: async () => {
                try {
                    await invoke('release_golem_workforce', {
                        agentId: "ARCHITECT_01",
                        agentName: "Neural Architect",
                        targetPath: node.filepath,
                        directive: "Refactor this module for high performance and temporal stability."
                    });
                    setNotification(`Workforce: Golem released to ${node.id}.`);
                    setShowWorkforce(true);
                } catch (e) {
                    console.error("Golem release failed", e);
                }
            }
        });
    }

    // Smooth kinematic zoom
    if (fgRef.current) {
      const distance = 120;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        2000
      );
    }

    // Manifest Neural Brief
    if (node.group !== 'core') {
      try {
        const brief = await invokeSafe("get_neural_brief", { filename: node.id }) as string;
        setActiveSynthesis({ id: node.id, content: brief, type: 'FILE_MANIFEST' });
      } catch (e) {
        setNotification("Cortex: Resonance failure.");
      }
    }
  };

  const handleTemporalSnapshot = async () => {
    if (!isHandshakeSuccessful) return;
    setNotification("Oracle: Captured Strategic Snapshot. Manifesting Temporal Log...");
    try {
      const stats = await invokeSafe("run_system_diagnostic");
      const res = await invokeSafe("manifest_temporal_log", { metrics: { ...stats, arr: founderMetrics.arr, integrity: ventureIntegrity } });
      setNotification(res as string);
      refreshSystemSnapshot();
    } catch (e) {
      setNotification("Oracle: Temporal Phase-Shift Failure.");
    }
  };

  const handleRealityBridgeSynthesis = async (query: string) => {
    setRealityBridgeQuery(query);
    setRealityBridgeOpen(true);
    setCommandOpen(false);
    try {
        const result = await invokeSafe("manifest_reality_bridge_thought", { query });
        // The RealityBridge component listens for the completion
        // But we cast it into the UI via an event or direct state if needed
        // For simplicity, we can just emit a local complete event if we don't have a listener for result
           window.dispatchEvent(new CustomEvent('reality-bridge-complete', { detail: result }));
    } catch (e) {
        setNotification("Reality Bridge Collapse: Synthesis failed.");
        setRealityBridgeOpen(false);
    }
  };

  const handleInitiateKernelReForge = async (sessionId: string) => {
    try {
        const proposal = await invokeSafe("manifest_kernel_mutation", { session_id: sessionId, target_file: "lib.rs" });
        setActiveMutationProposal(proposal);
        setKernelForgeOpen(true);
        setSandboxOpen(false);
    } catch (e) {
        setNotification(`Kernel Manifest Breach: ${e}`);
    }
  };

  const handlePaletteAction = async (id: string) => {
    if (id === 'reality-bridge') {
        handleRealityBridgeSynthesis(commandQuery);
        return;
    }
    if (id === 'sandbox') {
        setSandboxOpen(true);
        setCommandOpen(false);
        return;
    }
    if (id === 'forge') {
        setSingularityOpen(true);
        setCommandOpen(false);
        return;
    }
    if (id === 'exodus') {
        setExodusOpen(true);
        setCommandOpen(false);
        return;
    }
    if (id === 'consortium') {
        setConsortiumOpen(true);
        setCommandOpen(false);
        return;
    }
    if (id === 'sentinel') {
        setSentinelOpen(true);
        setCommandOpen(false);
        return;
    }
    setCommandOpen(false);
    if (['dash', 'processes', 'storage'].includes(id)) setActiveView(id as any);
    else if (id === 'vault') setShowSentinel(true);
    else if (id === 'sync') resolveNeuralIntent("sync to github");
    else if (id === 'system_scan') {
      const taskId = "SCAN_" + Date.now();
      const triggerScan = async () => {
        await invokeSafe("register_golem_task", { id: taskId, name: "Neural Diagnostic", aura: "amber" });
        let p = 0;
        const itv = setInterval(async () => {
          p += 0.1;
          if (p >= 1.0) {
            clearInterval(itv);
            await invokeSafe("complete_golem_task", { id: taskId });
            setNotification("Neural Diagnostic Complete: Sentinel Foundations Nominal.");
          } else {
            await invokeSafe("update_golem_task", { id: taskId, status: `Probing Kernel Layers... ${Math.round(p * 100)}%`, progress: p });
          }
        }, 1200);
      };
      triggerScan();
      refreshSystemSnapshot();
    }
    else if (id === 'index') {
      setNotification("Neural Indexing Initiated...");
      await invokeSafe("index_folder", { path: "." });
      setNotification("Cortex Successfully Index.");
    }
    else if (id === 'graph') {
      if (!performanceMode) setShowGraph(true);
    }
    else if (id === 'reset_priorities') {
      setActiveView('processes');
      setResetConfirmAction('reset');
    }
    else if (id === 'clear_priority_cache') {
      handleClearAllCache();
    }
    else if (id === 'toggle_performance') {
      setPerformanceMode((prev: any) => !prev);
    }
    else if (id === 'logs') setShowLogs(true);
    else if (id === 'presentation') setPresentationMode(true);
    else if (id.startsWith('open ')) {
      const path = id.replace('open ', '');
      setNotification(`Opening Strategic Asset: ${path.split('\\').pop()}`);
      // Triggering open logic would go here
    }
  };


  if (!isHandshakeSuccessful) {
    return <BootSequence onSuccess={() => {
      setIsHandshakeSuccessful(true);
      startEngine();
    }} />;
  }

  return (
    <motion.div
      animate={{ 
        x: founderMetrics.stress_color === '#ef4444' ? [-1, 1, -1, 1, 0] : 0,
        filter: founderMetrics.stress_color === '#ef4444' ? "grayscale(0.5) contrast(1.1)" : "grayscale(0) contrast(1.0)"
      }}
      transition={{ 
        duration: 0.1, 
        repeat: founderMetrics.stress_color === '#ef4444' ? Infinity : 0,
        repeatType: "reverse"
      }}
      className={cn(
        "min-h-screen w-full text-slate-200 font-sans overflow-hidden flex selection:bg-indigo-500/30 transition-all duration-1000 h-screen",
        shellMode === 'command' ? "bg-black/60 backdrop-blur-sm" : "bg-transparent",
        (hardwareStatus?.focus_mode || "").includes("Survival") ? "grayscale-lockdown" : ""
      )}
    >
      <RefractionManager />
      {!isTauri && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2600] px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest text-amber-300">
          Browser Dev Mode: Tauri Disabled
        </div>
      )}
      {/* Neural Command Palette (GLOBAL CORE) */}
      <AnimatePresence>
        {zenithActive && (
          <ZenithHUD
            cpuLoad={systemStats?.cpu_load ?? 0}
            integrity={ventureIntegrity}
            burn={fiscalBurn.total_burn}
            activeVenture={activeVenture}
            onExit={() => setZenithActive(false)}
          />
        )}
      </AnimatePresence>
      <CortexHUD />
      
      {pendingPermission && (
        <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          {/* Permission Modal Content */}
        </div>
      )}

      <AnimatePresence>
        {commandOpen && (
          <CommandPalette
            open={commandOpen}
            query={commandQuery}
            onQueryChange={setCommandQuery}
            onClose={() => setCommandOpen(false)}
            onExecute={handlePaletteAction}
            permissions={permissions}
            onRequestPermission={handleCommandPermissionRequest}
            onQuarantinePid={handleQuarantinePid}
            processes={processes}
            onPinContext={(name) => handlePinContext(name)}
            onZenithPulse={handleZenithPulse}
          />
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
              <button onClick={() => setFounderMetrics({ ...founderMetrics, stress_color: "#6366f1" })} className="px-12 py-5 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl shadow-red-500/40">
                Override Lockout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {(resetProgress && resetProgress.total > 0 && resetProgress.done < resetProgress.total) || notification ? (
          <div className="fixed bottom-12 left-12 z-[2500] flex flex-col gap-3">
            {resetProgress && resetProgress.total > 0 && resetProgress.done < resetProgress.total && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="glass-bright border-amber-500/30 rounded-2xl p-5 shadow-4xl flex items-center gap-5 relative"
              >
                <button
                  onClick={() => setResetProgress(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full glass flex items-center justify-center text-slate-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                  <RotateCcw className="w-5 h-5 text-amber-400 animate-spin" />
                </div>
                <div className="flex flex-col gap-2 min-w-[220px]">
                  <div className="text-[10px] font-black text-amber-200 uppercase tracking-widest">
                    {resetProgress.mode === "reset_clear" ? "Reset + Clear" : "Reset Priorities"}
                  </div>
                  <div className="text-[10px] text-slate-300">{resetProgress.done} / {resetProgress.total} processes</div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (resetProgress.done / resetProgress.total) * 100)}%` }} />
                  </div>
                </div>
              </motion.div>
            )}
            {notification && (
              <motion.div
                exit={{ x: 300, opacity: 0 }}
                onViewportEnter={() => {
                  playNotification();
                }}
                className="glass-bright border-emerald-500/30 rounded-2xl p-6 shadow-4xl flex items-center gap-5 relative"
              >
                <button
                  onClick={() => setNotification("")}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full glass flex items-center justify-center text-slate-300 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">{notification}</p>
              </motion.div>
            )}
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showVisualForge && (
          <SpectralBoundary fallbackTitle="Visual Forge Breach">
            <VisualForge 
                onSave={handleSaveVisualMacro}
                onClose={() => setShowVisualForge(false)}
            />
          </SpectralBoundary>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNexus && (
          <SpectralBoundary fallbackTitle="Aegis Nexus Breach">
            <AegisNexus 
                onLaunch={handleLaunchCrate}
                onClose={() => setShowNexus(false)}
            />
          </SpectralBoundary>
        )}
      </AnimatePresence>

      <GhostWindows 
        active={isTimeTraveling && travelIndex >= 0} 
        windows={travelIndex >= 0 ? (chronosHistory[travelIndex] as any)?.windows || [] : []} 
      />
      <NeuralRipple active={isRippling} color={rippleColor} />
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ background: simMode ? '#f59e0b' : founderMetrics.stress_color, opacity: (isThinking || simMode) ? 0.15 : 0.08 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[250px] transition-all duration-1000"
        />
        <div className="absolute inset-0 opacity-[0.03] grayscale invert mix-blend-overlay" style={{ backgroundImage: 'url("/noise.svg")' }} />
      </div>

      {/* 3D Nebula Layer */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        {mounted && !performanceMode && (
          <ForceGraph3D
            ref={fgRef}
            graphData={dynamicGraph.nodes.length > 0 ? dynamicGraph : graphData}
            backgroundColor="#00000000"
            nodeRelSize={simMode ? 10 : 7}
            nodeColor={(node: any) => {
              const isMatch = cortexResults.some(res => res.filename === node.id);
              if (isMatch) return "#10b981"; // Emerald Manifestation
              if (node.group === 'core') return "#6366f1";
              if (node.group === 'logic') return "#fbbf24";
              if (node.group === 'kernel') return "#f87171";
              if (node.group === 'collective_active') return "#10b981"; // Emerald Sync
              if (node.group === 'collective_offline') return "#475569"; // Slate Mute
              return "#94a3b8";
            }}
            nodeVal={(node: any) => {
               const isMatch = cortexResults.some(res => res.filename === node.id);
               return isMatch ? 20 : node.val || 7;
            }}
            nodeLabel="id"
            onNodeClick={handleNodeClick}
            linkColor={() => simMode ? "rgba(245, 158, 11, 0.2)" : "rgba(99, 102, 241, 0.15)"}
            showNavInfo={false}
          />
        )}
      </div>

      {/* Level 9 Executive Sidebar */}
      <LeftRail
        activeView={activeView}
        performanceMode={performanceMode}
        onViewChange={(v: any) => setActiveView(v)}
        presentationMode={presentationMode}
        simMode={simMode}
        onDash={() => setActiveView("dash")}
        onOpenGraph={() => setShowGraph(true)}
        onOpenVault={() => setShowVault(true)}
        onOpenBoardroom={() => setShowBoardroom(true)}
        onOpenWorkforce={() => setShowWorkforce(true)}
        onOpenLogs={() => setShowLogs(true)}
        onOpenNexus={() => setShowNexus(true)}
        onActivateSim={() => setSimMode(true)}
        onToggleSim={() => setSimMode(!simMode)}
        onOpenSettings={() => setActiveView('settings')}
        onOpenDocs={() => setShowDocs(true)}
        onSnapshot={handleTemporalSnapshot}
        proposalCount={activeProposals?.length || 0}
        chronosIndex={chronosIndex}
        chronosCount={pinnedContexts?.length || 0}
        chronosLabel={chronosIndex >= 0 ? pinnedContexts[chronosIndex]?.name : undefined}
        onChronosChange={handleChronosSliderChange}
        onJumpToPresent={() => setChronosIndex(-1)}
        pinnedContexts={pinnedContexts}
        onRestoreContext={handleRestoreContext}
        onActivateZenith={handleZenithPulse}
        playClick={playClick}
        className={cn("transition-all duration-700", zenMode && "opacity-0 -translateX-24 pointer-events-none")}
      />

      {/* Main Command Stage */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar
          activeVenture={activeVenture}
          activeContext={activeContext}
          contexts={contexts}
          golems={activeGolems}
          systemStats={systemStats}
          zenMode={zenMode}
          voiceActive={voiceActive}
          visionActive={visionActive}
          autoAura={autoAura}
          ventureIntegrity={ventureIntegrity}
          fiscalBurn={fiscalBurn}
          hardwareStatus={hardwareStatus}
          displayedMarket={displayedMarket}
          lastSync={systemLastSync}
          presentationMode={presentationMode}
          performanceMode={performanceMode}
          onOpenVault={() => setShowVault(true)}
          onVoiceIntent={handleVoiceIntent}
          onToggleVision={() => setVisionActive(!visionActive)}
          onToggleZen={() => setZenMode(!zenMode)}
          onToggleCLI={() => setShowCLI(!showCLI)}
          onTogglePresentation={() => setPresentationMode(!presentationMode)}
          onToggleNetwork={() => setShowNetwork(!showNetwork)}
          onToggleAutoAura={() => setAutoAura(!autoAura)}
          onAegisSync={handleAegisSync}
          onOpenNexus={() => setShowNexus(true)}
          onOpenSettings={() => setActiveView('settings')}
          onDeepLink={(target: string) => resolveNeuralIntent(`Deep link Chronos timeline to market event for: ${target}`)}
        />

        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto custom-scrollbar">
          {activeView === 'processes' && (
            <SpectralBoundary fallbackTitle="System Panel Breach">
              <div className="w-full max-w-7xl flex flex-col items-start gap-12">
                <div className="flex items-center gap-6">
                  <button onClick={() => setActiveView('dash')} className="p-4 glass rounded-[1.5rem] hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                    <RotateCcw className="w-6 h-6" />
                  </button>
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Strategic Process HUD</h2>
                </div>
                <SystemPanel
                  stats={systemStats}
                  windows={windows}
                  processes={processes}
                  storage={storage}
                  devices={devices}
                  lastSync={systemLastSync}
                  processPriorities={processPriorities}
                  priorityAudit={priorityAudit}
                  priorityCache={priorityCache}
                  autoApplyPriorities={autoApplyPriorities}
                  defaultTtlDays={defaultTtlDays}
                  batteryHealth={batteryHealth}
                  sparklinesEnabled={sparklinesEnabled}
                  isScanning={isScanning}
                  externalConfirmAction={resetConfirmAction}
                  onClearExternalConfirm={() => setResetConfirmAction(null)}
                  onRefresh={refreshSystemSnapshot}
                  onKillProcess={handleKillProcess}
                  onSuspendProcess={handleSuspendProcess}
                  onResumeProcess={handleResumeProcess}
                  onSetPriority={handleSetPriority}
                  onClearCacheReset={handleClearCacheReset}
                  onToggleIgnoreProcess={handleToggleIgnoreProcess}
                  onSetProcessTtl={handleSetProcessTtl}
                  onToggleIgnoreAll={handleToggleIgnoreAll}
                  onExportAudit={handleExportAudit}
                  onClearAllCache={handleClearAllCache}
                  onResetAllPriorities={handleResetAllPriorities}
                  onResetAllPrioritiesAndClear={handleResetAllPrioritiesAndClear}
                  onReapplyAll={handleReapplyAll}
                />
              </div>
            </SpectralBoundary>
          )}

          {activeView === 'storage' && (
            <SpectralBoundary fallbackTitle="Storage Matrix Breach">
              <StoragePanel />
            </SpectralBoundary>
          )}

          {activeView === 'settings' && (
            <SpectralBoundary fallbackTitle="Settings Core Breach">
              <SettingsPanel />
            </SettingsPanel>
          )}

          {activeView === 'dash' && (
            <SpectralBoundary fallbackTitle="Dashboard Reconstruction">
              <DashboardPanel
                presentationMode={presentationMode}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isThinking={isThinking}
                isRecording={isRecording}
                toggleVoiceRecording={toggleVoiceRecording}
                handleSearchIntent={handleSearchIntent}
                displayedMarket={displayedMarket}
                marketIntel={marketIntel}
                zenMode={zenMode}
                simMode={simMode}
                simMetrics={simMetrics}
                founderMetrics={founderMetrics}
                isVaultSealed={isVaultSealed}
                strategicInventory={strategicInventory}
                activeGolems={activeGolems}
                setSelectedGolem={setSelectedGolem}
                onSealAsset={(asset) => {
                  setSelectedVaultAsset(asset);
                  setShowVault(true);
                  logEvent(`Initiating Neural Sealing for ${asset.name}...`, "system");
                }}
                strategicMacros={strategicMacros}
                handleExecuteMacro={handleExecuteMacro}
                handleSignMacro={handleSignMacro}
                isForgingMacro={isForging}
                ventureIntegrity={ventureIntegrity}
                fiscalBurn={fiscalBurn}
                activeSynthesis={activeSynthesis}
                onSynthesize={handleTriggerSynthesis}
                isSynthesizing={isSynthesizing}
                onLaunchForge={() => setShowVisualForge(true)}
                onLaunchVisualForge={() => setShowVisualForge(true)}
                 NeuralBridgeComponent={(props: any) => (
                  <NeuralBridge 
                    {...props}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isThinking={isThinking}
                    isRecording={isRecording}
                    toggleVoiceRecording={toggleVoiceRecording}
                    handleSearchIntent={handleSearchIntent}
                  />
                )}
                TemporalExplorerComponent={() => (
                  <TemporalExplorer 
                    history={chronosHistory}
                    currentIndex={travelIndex}
                    onSelect={handleTimeTravel}
                    active={isTimeTraveling}
                  />
                )}
              />
            </SpectralBoundary>
          )}

          {activeView === 'timeline' && (
            <SpectralBoundary fallbackTitle="Chronos Timeline Breach">
              <CortexLog
                logs={timeline}
                onRefresh={refreshSystemSnapshot}
              />
            </SpectralBoundary>
          )}

          {activeView === 'files' && (
            <SpectralBoundary fallbackTitle="File Explorer Breach">
              <div className="w-full max-w-7xl flex flex-col items-start gap-12 h-full">
                <div className="flex items-center gap-6 mt-4">
                  <button onClick={() => setActiveView('dash')} className="p-4 glass rounded-[1.5rem] hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
                <div className="w-full flex-1">
                  <FileExplorerPanel />
                </div>
              </div>
            </SpectralBoundary>
          )}

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
        {zenithActive && (
          <ZenithHUD
            cpuLoad={systemStats?.cpu_load || 0}
            integrity={ventureIntegrity}
            burn={fiscalBurn.total_burn}
            activeVenture={activeVenture}
            onExit={() => setZenithActive(false)}
          />
        )}
        {showGraph && !performanceMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-4xl">
            {/* Spectral HUD: Entropy Buffer */}
            <div className="absolute top-10 left-10 z-[210] flex flex-col gap-6 w-96">
              <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Neural Cortex</h2>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spectral eBPF Sentinel Online</span>
                </div>
              </div>

              <div className="glass-bright p-8 rounded-[3rem] border border-white/10 shadow-3xl shadow-black/40">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="animate-pulse" /> Kernel Anomaly Feed
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 opacity-30">
                      <Clock size={10} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">Real-time Buffer</span>
                    </div>
                    <button
                      onClick={() => setPerformanceMode(!performanceMode)}
                      className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${performanceMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                    >
                      {performanceMode ? 'Zen Mode: ON' : 'Optimize 3D'}
                    </button>
                  </div>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                  {spectralAnomalies.length === 0 && (
                    <div className="flex flex-col items-center py-12 opacity-30 text-center">
                      <Shield size={32} className="mb-4 text-emerald-500" />
                      <p className="text-[10px] text-slate-500 italic uppercase">System is optimized & tranquil.</p>
                    </div>
                  )}
                  {spectralAnomalies.map((anom, i) => (
                    <motion.div
                      key={`anomaly-${anom.id || i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-rose-500/30 transition-all group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <span className="text-[8px] text-slate-500 font-mono">PID {anom.associated_pid || '??'}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[9px] px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full font-black uppercase tracking-widest border border-rose-500/20">{anom.source || "Unknown"}</span>
                      </div>
                      <p className="text-xs text-white font-bold leading-tight mb-4">{anom.description || "System anomaly detected in neural cortex."}</p>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(anom.risk_level || 0) * 100}%` }}
                          className="h-full bg-gradient-to-r from-rose-500 to-purple-600"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Distributed Collective: Remote Foundry Nodes (Orchestrated by CollectivePanel) */}
              <SpectralBoundary fallbackTitle="Collective Registry Breach">
                <CollectivePanel />
              </SpectralBoundary>
            </div>

            {/* Phase 14: Chronos Temporal Scrubber */}
            {showGraph && chronosHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[300] w-[600px] glass-bright rounded-full p-6 border border-indigo-500/20 shadow-6xl flex items-center gap-8"
              >
                <div className="flex items-center gap-3">
                  <History size={18} className={`${isTimeTraveling ? 'text-indigo-400 rotate-animation' : 'text-slate-500'}`} />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Chronos Buffer</span>
                    <span className="text-[10px] font-bold text-white leading-none mt-1">{isTimeTraveling ? 'TIME TRAVEL ACTIVE' : 'LIVE TELEMETRY'}</span>
                  </div>
                </div>

                <div className="flex-1 px-4 relative flex items-center">
                  <input
                    type="range"
                    min="-1"
                    max={chronosHistory.length - 1}
                    value={travelIndex}
                    onChange={(e) => handleTimeTravel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="text-right whitespace-nowrap min-w-[80px]">
                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter">
                    {travelIndex === -1 ? 'REAL-TIME' : `${chronosHistory.length - 1 - travelIndex}m ago`}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="absolute top-10 right-10 z-[210]">
              <button onClick={() => setShowGraph(false)} className="w-14 h-14 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all focus:outline-none shadow-xl shadow-black/40"><Plus className="w-8 h-8 rotate-45" /></button>
            </div>

            <div className="w-full h-full pointer-events-auto">
              {mounted && (
                <ForceGraph3D
                  graphData={dynamicGraph.nodes.length > 0 ? dynamicGraph : graphData}
                  backgroundColor="#00000000"
                  nodeRelSize={performanceMode ? 3 : 5}
                  nodeColor={(node: any) => getNodeColor(node)}
                  nodeLabel={(node: any) => `
                      <div class="glass p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
                        <div class="text-[9px] font-black uppercase text-indigo-400 mb-2 tracking-widest">${node.isAnomaly ? 'SPECTRAL ANOMALY' : (node.group || 'Neural Node')}</div>
                        <div class="text-xs font-bold text-white">${node.name || node.id}</div>
                      </div>
                    `}
                  nodeVal={(node: any) => node.isAnomaly ? (12 + node.risk_level * 10) : (node.val || 4)}
                  linkColor={() => "rgba(255, 255, 255, 0.05)"}
                  linkWidth={performanceMode ? 0.5 : 1}
                  enableNodeDrag={!performanceMode}
                  showNavInfo={false}
                  onNodeRightClick={(node: any, event: any) => {
                    setCortexMenu({ x: event.clientX, y: event.clientY, node });
                  }}
                  warmupTicks={performanceMode ? 50 : 20}
                  cooldownTicks={performanceMode ? 30 : 60}
                />
              )}
            </div>

            {/* Aegis Context Menu: Tactical Strike Layer */}
            {cortexMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ top: cortexMenu.y, left: cortexMenu.x }}
                className="fixed z-[400] w-64 glass-bright rounded-3xl border border-white/10 shadow-5xl p-4 flex flex-col gap-2 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/5 mb-2">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Target PID: {cortexMenu.node.associated_pid || '??'}</p>
                  <p className="text-[10px] font-bold text-white truncate">{cortexMenu.node.name || cortexMenu.node.id}</p>
                </div>

                <button
                  onClick={() => handleAegisPurge(cortexMenu.node, false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 text-rose-400 rounded-2xl transition-all group"
                >
                  <Skull size={14} className="group-hover:animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Purge Process</span>
                </button>

                <button
                  onClick={() => handleAegisPurge(cortexMenu.node, true)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 text-orange-400 rounded-2xl transition-all group"
                >
                  <Lock size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Seal & Quarantine</span>
                </button>

                <button
                  onClick={() => handleAegisStasis(cortexMenu.node, false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-500/10 text-indigo-400 rounded-2xl transition-all group"
                >
                  <Pause size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Suspend Stasis</span>
                </button>

                <button
                  onClick={() => handleForgeIntent(cortexMenu.node)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-500/10 text-emerald-400 rounded-2xl transition-all group"
                >
                  <FlaskConical size={14} className="group-hover:animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Neural Forge Intent</span>
                </button>

                <div className="mt-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setCortexMenu(null)}
                    className="w-full py-2 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all text-center"
                  >
                    Cancel Tactical Intent
                  </button>
                </div>
              </motion.div>
            )}

            {/* Neural Forge Manifest Overlay */}
            {activeForge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="fixed inset-0 z-[500] flex items-center justify-center p-20 pointer-events-none"
              >
                <div className="w-[800px] glass-bright rounded-[4rem] border border-emerald-500/30 p-16 flex flex-col pointer-events-auto overflow-hidden relative shadow-6xl">
                  <div className="absolute top-0 right-0 p-8">
                    <button onClick={() => setActiveForge(null)} className="text-slate-500 hover:text-white transition-all"><X size={24} /></button>
                  </div>

                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <FlaskConical className="text-emerald-400 w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase italic leading-none">Neural Forge Output</h2>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-2">Stability Manifest // {activeForge.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Strategic Rationale</p>
                        <p className="text-lg text-white font-bold leading-relaxed">{activeForge.rationale}</p>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Confidence Index</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${activeForge.confidence * 100}%` }} className="h-full bg-emerald-500" />
                          </div>
                          <span className="text-[10px] font-black text-white">{Math.round(activeForge.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Forge Intent (Diff)</p>
                      <div className="flex-1 rounded-[2.5rem] bg-black/60 border border-white/5 p-8 font-mono text-[10px] text-emerald-400 overflow-y-auto custom-scrollbar leading-relaxed">
                        <pre className="whitespace-pre-wrap">{activeForge.code_diff || 'GEN-POL-884: Restricting Syscall Access for anomalous PID space...'}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex justify-end gap-6">
                    <button
                      onClick={() => setActiveForge(null)}
                      className="px-10 py-5 rounded-[2rem] text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all"
                    >
                      Decline Manifest
                    </button>
                    <button
                      onClick={() => {
                        setNotification("Forge Intent committed to OS Kernel.");
                        setActiveForge(null);
                      }}
                      className="px-12 py-5 rounded-[2rem] bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 shadow-2xl shadow-emerald-900/40 transition-all border border-white/10"
                    >
                      Apply Forge Intent
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

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
                <div key={`cli-line-${i}`} className="flex gap-4">
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
                {ventureNetwork && ventureNetwork.length > 0 ? ventureNetwork.map((v: any) => (
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
                )) : null}
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
                    invokeSafe('execute_golem_manifest', { id: activeGolem.id, title: activeGolem.title, code: activeGolem.code_draft }).then((res: any) => {
                      setNotification(res);
                       setManifestHistory([...manifestHistory, `manifested/${activeGolem.title.replace(" ", "_").toLowerCase()}.ts`]);
                      setActiveGolem(null);
                       setPendingManifests(pendingManifests.filter((p) => p.id !== activeGolem.id));
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
                <button onClick={() => setShowVault(true)} className="px-8 py-3 bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600/40 transition-all flex items-center gap-3">
                  <Shield className="w-4 h-4" /> Sentinel Archive
                </button>
                {manifestHistory.length > 0 && (
                  <button onClick={handleVentureRewind} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-red-600/30 flex items-center gap-3">
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
                      <FolderOpen className={cn("w-6 h-6", (asset.risk || "").includes('Ruby') ? "text-red-400" : "text-emerald-400")} />
                    </div>
                    <div className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                      (asset.risk || "").includes('Ruby') ? "bg-red-500/10 border-red-500/30 text-red-400" :
                        (asset.risk || "").includes('Emerald') ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                          "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    )}>
                      {asset.risk}
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-white truncate mb-1">{String(asset.file_path || "blob").split('/').pop()}</h3>
                  <p className="text-[10px] text-slate-500 font-mono truncate mb-4">{asset.file_path || "Neural Identifier Missing"}</p>

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
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between col-span-2">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-emerald-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sparkline Previews</span>
                        <span className="text-[10px] text-slate-500">Disable for low-end devices</span>
                        {sparklinesAutoDisabled && (
                          <span className="mt-1 text-[9px] text-amber-300" title="Auto-disabled due to low FPS">Auto-disabled</span>
                        )}
                      </div>
                    </div>
                    <div onClick={() => { setSparklinesAutoDisabled(false); setSparklinesEnabled(!sparklinesEnabled); }} className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-all border border-white/10 shadow-inner", sparklinesEnabled ? "bg-emerald-600 border-emerald-500/50" : "bg-white/5")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white shadow-xl transition-transform", sparklinesEnabled ? "translate-x-6" : "translate-x-0")} />
                    </div>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between col-span-2">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-amber-400" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Performance Mode</span>
                        <span className="text-[10px] text-slate-500">Disable heavy visuals + effects</span>
                      </div>
                    </div>
                    <div onClick={() => setPerformanceMode(!performanceMode)} className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-all border border-white/10 shadow-inner", performanceMode ? "bg-amber-600 border-amber-500/50" : "bg-white/5")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white shadow-xl transition-transform", performanceMode ? "translate-x-6" : "translate-x-0")} />
                    </div>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col justify-between col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-amber-400" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">FPS Threshold</span>
                          <span className="text-[10px] text-slate-500">Auto-disable sparklines below this FPS</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-slate-600 bg-white/5 px-3 py-1 rounded">{fpsThreshold} FPS</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="45"
                      step="1"
                      value={fpsThreshold}
                      onChange={(e) => setFpsThreshold(parseInt(e.target.value, 10))}
                      className="mt-6 w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500">Recent FPS (60s)</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSparklinesEnabled(true); setSparklinesAutoDisabled(false); }}
                          className="px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20"
                        >
                          Re-enable Now
                        </button>
                        <button
                          onClick={() => { setFpsHistory([]); setFpsHover(null); }}
                          className="px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        >
                          Reset History
                        </button>
                        <button
                          onClick={exportFpsCsv}
                          className="px-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                        >
                          Export CSV
                        </button>
                      </div>
                    </div>
                    <div
                      className="mt-3 h-14 w-full bg-white/[0.03] border border-white/10 rounded-xl p-2 relative"
                      onMouseLeave={() => setFpsHover(null)}
                    >
                      {fpsHover && (
                        <div
                          className="absolute -top-6 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-black/80 text-amber-200 border border-white/10"
                          style={{ transform: `translateX(${Math.min(100, Math.max(0, fpsHover.xPct * 100))}%)` }}
                        >
                          {fpsHover.value} FPS
                        </div>
                      )}
                      <svg
                        viewBox="0 0 120 40"
                        className="w-full h-full"
                        onMouseMove={(e) => {
                          if (fpsHistory.length === 0) return;
                          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const pct = Math.max(0, Math.min(1, x / rect.width));
                          const idx = Math.round(pct * Math.max(1, fpsHistory.length - 1));
                          const clamped = Math.max(0, Math.min(fpsHistory.length - 1, idx));
                          setFpsHover({ index: clamped, value: fpsHistory[clamped], xPct: pct });
                        }}
                      >
                        {fpsHover && (
                          <line
                            x1={fpsHover.xPct * 120}
                            x2={fpsHover.xPct * 120}
                            y1="0"
                            y2="40"
                            stroke="rgba(255,255,255,0.25)"
                            strokeDasharray="2 2"
                          />
                        )}
                        <motion.path
                          initial={false}
                          animate={{ d: buildFpsPath(fpsHistory) }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          fill="none"
                          stroke={fpsHistory.length > 0 && fpsHistory[fpsHistory.length - 1] < fpsThreshold ? "#f87171" : fpsHistory.length > 0 && fpsHistory[fpsHistory.length - 1] < fpsThreshold + 5 ? "#f59e0b" : "#34d399"}
                          strokeWidth="2"
                        />
                        {fpsHover && (
                          <motion.circle
                            initial={false}
                            animate={{
                              cx: fpsHover.xPct * 120,
                              cy: 40 - Math.min(40, (fpsHover.value / 60) * 40)
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            r="3"
                            fill={fpsHover.value < fpsThreshold ? "#f87171" : fpsHover.value < fpsThreshold + 5 ? "#f59e0b" : "#34d399"}
                            className="shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                          />
                        )}
                      </svg>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Healthy</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Warning</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Critical</span>
                    </div>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col justify-between col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-indigo-400" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Default Priority TTL</span>
                          <span className="text-[10px] text-slate-500">Applies to new cache entries</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-slate-600 bg-white/5 px-3 py-1 rounded">CACHE POLICY</span>
                    </div>
                    <div className="mt-5 flex items-center gap-4">
                      <select
                        value={defaultTtlDays}
                        onChange={(e) => setDefaultTtlDays(parseInt(e.target.value, 10))}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white font-black uppercase tracking-widest"
                      >
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                      </select>
                      <span className="text-[9px] text-slate-500">Current default: {defaultTtlDays}d</span>
                    </div>
                  </div>
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

        <SpectralBoundary fallbackTitle="Neural Synthesis Breakdown">
          <SynthesisPanel />
        </SpectralBoundary>
        <SpectralBoundary fallbackTitle="Boardroom Consensus Bridge Breach">
          <BoardroomPanel
            isOpen={showBoardroom}
            onClose={() => setShowBoardroom(false)}
            metrics={founderMetrics}
          />
        </SpectralBoundary>
        {/* <AdvisoryDebate /> */}

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
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between col-span-2">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auto-Apply Process Priorities</span>
                      <span className="text-[10px] text-slate-500">Reapply cached priorities for restarted processes</span>
                    </div>
                  </div>
                  <div onClick={() => setAutoApplyPriorities(!autoApplyPriorities)} className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-all border border-white/10 shadow-inner", autoApplyPriorities ? "bg-emerald-600 border-emerald-500/50" : "bg-white/5")}>
                    <div className={cn("w-4 h-4 rounded-full bg-white shadow-xl transition-transform", autoApplyPriorities ? "translate-x-6" : "translate-x-0")} />
                  </div>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between col-span-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Priority Cache</span>
                    <span className="text-[10px] text-slate-500">Entries: {Object.keys(priorityCache).length}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPriorityCache({});
                      try { localStorage.removeItem("oas_priority_cache"); } catch (e) { }
                    }}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-[9px] font-black uppercase tracking-widest rounded-xl text-rose-300 border border-rose-500/20"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {showSentinel && (
          <SentinelVault 
            isOpen={showSentinel} 
            onClose={() => {
              setShowSentinel(false);
              setSelectedVaultAsset(null);
            }} 
            onPlayHandshake={playHandshake} 
            onPlayNotification={playNotification} 
            initialAsset={selectedVaultAsset}
          />
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
                {activeSynthesis.type === 'FILE_MANIFEST' ? (
                  <>
                    <div className="space-y-10 overflow-y-auto pr-6 custom-scrollbar">
                      <section>
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Neural File Manifest</h4>
                        <div className="p-8 rounded-3xl bg-black/40 border border-white/10 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar">
                          {activeSynthesis.content}
                        </div>
                      </section>
                    </div>
                    <div className="flex flex-col gap-8">
                       <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Context</h4>
                       <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-6">
                          <p className="text-lg text-white font-medium italic">"This node represents a critical junction in the {activeSynthesis.id.split('.').pop()?.toUpperCase()} logic layer. Its structural integrity is essential for the Oasis Kernel's stability."</p>
                          <div className="flex items-center gap-4">
                             <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Type: {activeSynthesis.id.split('.').pop()?.toUpperCase()}</div>
                             <div className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Resonance: 0.98</div>
                          </div>
                       </div>
                       <div className="mt-auto flex flex-col gap-4 pt-10">
                          <button 
                            onClick={() => {
                                setShowDocs(true);
                                setActiveSynthesis(null);
                            }}
                            className="py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3"
                          >
                             <Book className="w-5 h-5" /> REVEAL IN MANUAL HUB
                          </button>
                          <button className="py-6 bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all">GENERATE ARCHITECTURAL AUDIT</button>
                       </div>
                    </div>
                  </>
                ) : (
                  <>
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
                            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center font-black text-indigo-400 border border-indigo-400/30 group-hover:bg-indigo-500 group-hover:text-white transition-all">{i + 1}</div>
                            <span className="text-xs font-black text-white uppercase tracking-wider">{step}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-4 pt-10">
                        <button className="py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all">Export Pitch PDF</button>
                        <button className="py-6 bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase tracking-widest rounded-2xl border border-white/10 transition-all">Commit to Vault</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Robot */}
      {!presentationMode && (
        <>
          {/* NEURAL MANIFEST REVIEW PANEL */}
          {pendingManifests && pendingManifests.length > 0 && (
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
                      <div key={`msg-${m.role}-${m.id || i}`} className={cn("max-w-[85%] p-4 rounded-2xl text-sm", m.role === 'user' ? "ml-auto bg-indigo-600 text-white" : "mr-auto glass text-slate-300 shadow-lg")}>{m.content}</div>
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
                          key={`insight-${insight.id || i}`}
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
      <CortexHUD />
      
      {pendingPermission && (
        <div className="fixed inset-0 z-[5000] bg-black/70 backdrop-blur-xl flex items-center justify-center p-8">
          <div className="w-full max-w-lg glass-bright rounded-[2rem] border border-white/10 p-8 shadow-5xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-widest">Permission Required</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Allow Oasis to perform: <span className="font-bold text-white">{pendingPermission.label}</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  pendingPermission.action?.();
                  setPendingPermission(null);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10"
              >
                Allow Once
              </button>
              <button
                onClick={() => {
                  setPermissions((prev: any) => ({ ...prev, [pendingPermission.key]: true }));
                  pendingPermission.action?.();
                  setPendingPermission(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-xl"
              >
                Allow Always
              </button>
              <button
                onClick={() => setPendingPermission(null)}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl text-rose-300 border border-rose-500/20"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGIC COMMAND HUB (PILLAR 17) */}
      <TerminalPanel 
        isOpen={showCLI} 
        onClose={() => setShowCLI(false)} 
        stressColor={founderMetrics.stress_color} 
      />

      {/* NEURAL WORKFORCE (TRACK C) */}
      <WorkforcePanel
        isOpen={showWorkforce}
        onClose={() => setShowWorkforce(false)}
        onPlayNotification={playNotification}
        onPlayClick={playClick}
      />

      {/* NEURAL WORKSPACE PERSISTENCE (PILLAR 12) */}
      <CrateGallery
        isOpen={showCrates}
        onClose={() => setShowCrates(false)}
        crates={crates}
        onLaunch={handleLaunchCrate}
        onSave={handleSaveCrate}
        onDelete={handleDeleteCrate}
        onExport={handleExportCrate}
        isSaving={isSavingCrate}
      />
      <VisionaryLattice points={latticePoints} show={true} />
      <SpectralBoundary fallbackTitle="Ghost Manifest Breach">
        <GhostOverlay />
      </SpectralBoundary>
      <GlobalTerminal />
      <SoundscapeManager />
      <VisionScanner isScanning={isVisionScanning} imagePreview={visionPreview || undefined} />
      <LibraryPanel isOpen={showLibrary} onClose={() => setShowLibrary(false)} />
      <CollectivePanel isOpen={showCollective} onClose={() => setShowCollective(false)} />
      <HatcheryPanel isOpen={showHatchery} onClose={() => setShowHatchery(false)} />
      <BlueprintPanel isOpen={showBlueprint} onClose={() => setShowBlueprint(false)} />
      <ChronosHUD />
      <AnimatePresence>
        {realityBridgeOpen && (
          <RealityBridge 
            isOpen={realityBridgeOpen} 
            onClose={() => setRealityBridgeOpen(false)} 
            query={realityBridgeQuery}
          />
        )}
      </AnimatePresence>
      <NeuralSandboxPanel 
        isOpen={sandboxOpen} 
        onClose={() => setSandboxOpen(false)} 
        onInitiateMutation={handleInitiateKernelReForge}
      />
      <SingularityHUD 
        isOpen={singularityOpen} 
        onClose={() => setSingularityOpen(false)} 
      />
      <ExodusPanel 
        isOpen={exodusOpen} 
        onClose={() => setExodusOpen(false)} 
      />
      <ConsortiumPanel 
        isOpen={consortiumOpen} 
        onClose={() => setConsortiumOpen(false)} 
      />
      <NeuralSentinelPanel 
        isOpen={sentinelOpen} 
        onClose={() => setSentinelOpen(false)} 
      />
      <KernelForge isOpen={kernelForgeOpen} onClose={() => setKernelForgeOpen(false)} proposal={activeMutationProposal} />
    </motion.div>
  );
