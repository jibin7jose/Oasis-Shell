import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Search, LayoutDashboard, FolderOpen, Activity,
  Settings, Zap, BrainCircuit, Shield, Terminal,
  Plus, Activity as PulseIcon, UploadCloud, Eye
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

type TimelineType = 'neural' | 'deploy' | 'system';

type TimelineEvent = {
  id: number;
  type: TimelineType;
  event: string;
  time: string;
};

type VaultNode = {
  name: string;
  category: string;
  size: string;
};

type WindowInfo = {
  title: string;
  pid: number;
  exe_path: string;
};

type NeuralLog = {
  id?: number;
  event_type: string;
  message: string;
  timestamp: string;
};

type ContextCrate = {
  id?: number;
  name: string;
  timestamp: string;
  apps: string;
};

export default function App() {
  // --- CORE STATE ---
  const [activeContext, setActiveContext] = useState('dev');
  const [searchQuery, setSearchQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [lastSync, setLastSync] = useState("Never");
  const [showAI, setShowAI] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", content: "Oasis Neural Link Established." }]);
  const [proactiveAlert, setProactiveAlert] = useState<{suggestion: string, action: string} | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { 
    setMounted(true); 
    
    // Listen for backend Guardian signals
    const setupListener = async () => {
      const unlisten = await listen('proactive-pulse', (event: any) => {
        setProactiveAlert(event.payload);
      });
      return unlisten;
    };
    
    let unlistenFn: any;
    setupListener().then(f => unlistenFn = f);
    
    // File Drop Listeners for Knowledge Dropzone
    let unlistenDrop: any;
    let unlistenHover: any;
    let unlistenCancel: any;

    const setupFileDrop = async () => {
      unlistenHover = await listen('tauri://file-drop-hover', () => {
        setIsDragging(true);
      });
      unlistenDrop = await listen('tauri://file-drop', async (event: any) => {
        setIsDragging(false);
        const paths = event.payload as string[];
        if (paths && paths.length > 0) {
          handleFileDrop(paths);
        }
      });
      unlistenCancel = await listen('tauri://file-drop-cancelled', () => {
        setIsDragging(false);
      });
    };
    setupFileDrop();

    return () => {
      if (unlistenFn) unlistenFn();
      if (unlistenDrop) unlistenDrop();
      if (unlistenHover) unlistenHover();
      if (unlistenCancel) unlistenCancel();
    };
  }, []);

  // --- FEATURE STATE ---
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autostart, setAutostart] = useState(false);
  const [simMode, setSimMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [editingCrate, setEditingCrate] = useState<ContextCrate | null>(null);

  // RAG State
  const [ragQuery, setRagQuery] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [isRagging, setIsRagging] = useState(false);

  // Global Keybindings & Init
  useEffect(() => {
    (async () => {
      try {
        setAutostart(await isEnabled());
      } catch (e) {}
    })();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById('neural-input')?.focus();
      }
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    
    // Listen for global shortcut from Rust backend
    const unlisten = listen('toggle-sentient-terminal', () => {
      setShowTerminal(prev => !prev);
    });

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      unlisten.then(f => f());
    };
  }, []);

  const [founderMetrics, setFounderMetrics] = useState({
    arr: "$1.24M", burn: "$42.5K/mo", runway: "18.4 Mo.", momentum: "+12.8%"
  });
  const [telemetry, setTelemetry] = useState({ cpu_usage: 0, ram_usage: 0, disk_usage: 0 });

  const [marketIntel, setMarketIntel] = useState([
    { symbol: "OASIS_INDEX", price: "$1,421.40", change: "+2.4%" },
    { symbol: "SAP_COMP", price: "$42.50", change: "-1.1%" },
    { symbol: "GLOBAL_AI", price: "8,942.00", change: "+0.8%" }
  ]);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: 1, type: 'system', event: 'Oasis Foundry Kernel Initialized', time: '09:42:00' },
    { id: 2, type: 'neural', event: 'Venture Metrics Synced with Rust Kernel', time: '09:42:15' }
  ]);

  const [vaultNodes, setVaultNodes] = useState<VaultNode[]>([
    { name: 'Oasis_Whitepaper.pdf', category: 'Strategic', size: '1.2MB' },
    { name: 'Foundry_Kernel.rs', category: 'Technical', size: '45KB' },
    { name: 'Executive_Brand_Guide.fig', category: 'Creative', size: '8.4MB' },
    { name: 'Q3_Revenue_Projection.xlsx', category: 'Strategic', size: '220KB' },
    { name: 'Neural_Engine_Docs.md', category: 'Technical', size: '12KB' }
  ]);

  const [activeWindows, setActiveWindows] = useState<WindowInfo[]>([]);
  const [bridgeStatus, setBridgeStatus] = useState("Booting");
  const [contextCrates, setContextCrates] = useState<ContextCrate[]>([]);
  const [crateName, setCrateName] = useState("Active Workspace");
  const [crateBusy, setCrateBusy] = useState(false);
  const [crateError, setCrateError] = useState("");

  const [cronAgents, setCronAgents] = useState([
    { id: '1', title: 'System Guardian', prompt: 'Check if CPU usage is over 80%. If yes, warn me.', interval: 60000, active: false },
    { id: '2', title: 'Vault Sweeper', prompt: 'Find any new files in the Downloads folder and return their names.', interval: 300000, active: false }
  ]);
  const [newAgentTitle, setNewAgentTitle] = useState("");
  const [newAgentPrompt, setNewAgentPrompt] = useState("");

  const [simMetrics, setSimMetrics] = useState({
    arr: 1.24, burn: 42.5, momentum: 12.8
  });

  // --- LOGIC: MEMORY & INTENT ---
  const logEvent = (event: string, type: TimelineType) => {
    setTimeline(prev => [{
      id: Date.now(),
      type,
      event,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 50));
    invoke("log_event", { eventType: type, message: event }).catch(() => { });
  };

  const resolveNeuralIntent = (query: string) => {
    const q = query.toLowerCase();
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setIsThinking(true);
    logEvent(`Neural Intent Captured: "${query}"`, 'neural');

    setTimeout(() => {
      setIsThinking(false);
      
      // 1. Check for Launching a Crate specifically first
      if ((q.includes("launch") || q.includes("open")) && (q.includes("crate") || q.includes("workspace"))) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Auto-launching your most recent workspace..." }]);
        if (contextCrates.length > 0) {
          launchContextCrate(contextCrates[0]);
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: "Error: No saved workspaces available to launch." }]);
        }
      } 
      // 2. Check for traditional Deployments
      else if (q.includes("deploy") || (q.includes("launch") && !q.includes("workspace") && !q.includes("crate"))) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Deployment Sentinel Triggered. Syncing Edge Cluster..." }]);
        invoke('trigger_deploy', { env: 'Global' }).catch(() => { });
        logEvent("Deployment Sequence Alpha Initiated", "deploy");
      } 
      else if (q.includes("create") || q.includes("architect") || q.includes("build module")) {
        const title = query.replace(/create|architect|build module/gi, "").trim() || "New Dynamic Module";
        setDynamicModules(prev => [
          ...prev,
          { id: Date.now().toString(), title, type: 'manifested', content: `Autonomous architect manifested this module. Ready for ${title} integration.` }
        ]);
        setMessages(prev => [...prev, { role: "assistant", content: `Architect: Manifesting '${title}' strategic module...` }]);
        logEvent(`Autonomous Module '${title}' Scaffolding Complete`, "system");
      } else if (q.includes("sim") || q.includes("sandbox") || q.includes("project")) {
        setSimMode(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Initiating Strategic Venture Sandbox..." }]);
        logEvent("Venture Simulation Portal Opened", "system");
      } else if (q.includes("vault") || q.includes("files") || q.includes("open vault")) {
        setShowVault(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Accessing Sentient Vault Nodes..." }]);
        logEvent("Sentient Vault Portal Opened", "system");
      }
      // 3. Workspace Creation / Scanning
      else if (q.includes("crate") || q.includes("workspace")) {
        if (q.includes("save") || q.includes("create") || q.includes("new") || q.includes("scan")) {
          setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Auto-saving current workspace layout..." }]);
          logEvent("Autonomous Crate save initiated", "system");
          
          (async () => {
            try {
              const windows = await scanActiveWindows();
              if (windows && windows.length > 0) {
                let name = "Auto Workspace";
                try {
                  name = await invoke("generate_crate_name", { apps: windows }) as string;
                } catch (ollamaError) {
                  name = `${contexts.find(c => c.id === activeContext)?.name || "Oasis"} Workspace`;
                }
                const finalName = name.trim() || "Auto Workspace";
                await invoke("save_crate", { name: finalName, apps: windows });
                const crates = await invoke("get_crates") as ContextCrate[];
                setContextCrates(crates);
                logEvent(`Auto-created Crate: ${finalName}`, "system");
                setMessages(prev => [...prev, { role: "assistant", content: `Successfully secured workspace as: ${finalName}` }]);
              } else {
                setMessages(prev => [...prev, { role: "assistant", content: "Could not find any active windows to save." }]);
              }
            } catch (e) {
              setMessages(prev => [...prev, { role: "assistant", content: "Error while auto-saving the workspace." }]);
            }
          })();
        } else {
          scanActiveWindows();
          setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Scanning active workspace for Context Crate..." }]);
          logEvent("Context Crate scan initiated", "system");
        }
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
        // True LLM Intent Parsing & Action Execution
        setMessages(prev => [...prev, { role: "assistant", content: "Synthesizing neural intent..." }]);
        (async () => {
          try {
            const llmResponse = await invoke("rag_query", { query }) as string;
            
            // Parse for executable system commands
            const cmdMatch = llmResponse.match(/\[CMD\](.*?)\[\/CMD\]/is);
            if (cmdMatch && cmdMatch[1]) {
               const cmd = cmdMatch[1].trim();
               setMessages(prev => [...prev, { role: "assistant", content: `Neural Directive Authorized. Executing system command: \`${cmd}\`` }]);
               logEvent(`Autonomous System Command: ${cmd}`, 'deploy');
               
               try {
                 const execResult = await invoke("execute_neural_command", { command: cmd }) as string;
                 setMessages(prev => [...prev, { role: "assistant", content: `Execution Result:\n${execResult.substring(0, 500)}${execResult.length > 500 ? '...' : ''}` }]);
               } catch (execErr: any) {
                 setMessages(prev => [...prev, { role: "assistant", content: `Execution Failed: ${execErr}` }]);
               }
            } else {
               // Pure conversational or informational response
               setMessages(prev => [...prev, { role: "assistant", content: llmResponse }]);
               logEvent("Neural Response Synthesized", 'neural');
            }
          } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: `Foundry Logic: Directive '${query}' acknowledged but currently unmapped. (Local AI Node Offline)` }]);
          }
        })();
      }
    }, 800);
    setSearchQuery("");
  };

  const analyzeScreen = async () => {
    setMessages(prev => [...prev, { role: "user", content: "Analyze my screen and tell me what I am looking at." }]);
    setIsThinking(true);
    try {
      const base64Image = await invoke("capture_screenshot") as string;
      const visionResult = await invoke("query_vision", { 
        imageBase64: base64Image, 
        prompt: "You are the Oasis Kernel. Describe precisely what the user is working on right now based on this screenshot of their desktop. Keep it concise." 
      }) as string;
      
      setMessages(prev => [...prev, { role: "system", content: visionResult }]);
      logEvent("Omniscient Vision analysis complete", 'neural');
    } catch(err) {
      setMessages(prev => [...prev, { role: "system", content: "Vision capabilities offline or Ollama 'llava' model not running." }]);
    } finally {
      setIsThinking(false);
    }
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

  const loadContextCrates = async () => {
    const crates = await invoke("get_crates") as ContextCrate[];
    setContextCrates(crates);
    return crates;
  };

  const scanActiveWindows = async () => {
    setCrateBusy(true);
    setCrateError("");
    try {
      const windows = await invoke("get_running_windows") as WindowInfo[];
      setActiveWindows(windows);
      logEvent(`Window scanner captured ${windows.length} active apps`, "system");
      return windows;
    } catch (e) {
      setCrateError("Window scan failed");
      logEvent("Window scanner failed", "system");
      return activeWindows;
    } finally {
      setCrateBusy(false);
    }
  };

  const suggestCrateName = async () => {
    setCrateBusy(true);
    setCrateError("");
    try {
      const windows = activeWindows.length > 0 ? activeWindows : await scanActiveWindows();
      if (windows.length === 0) {
        setCrateError("No active windows found");
        return;
      }
      const name = await invoke("generate_crate_name", { apps: windows }) as string;
      setCrateName(name);
      logEvent(`Suggested Context Crate name: ${name}`, "neural");
    } catch (e) {
      const fallback = `${contexts.find(c => c.id === activeContext)?.name || "Oasis"} Workspace`;
      setCrateName(fallback);
      setCrateError("AI naming unavailable; fallback name applied");
      logEvent("Context Crate name fallback applied", "system");
    } finally {
      setCrateBusy(false);
    }
  };

  const saveActiveCrate = async () => {
    setCrateBusy(true);
    setCrateError("");
    try {
      const windows = activeWindows.length > 0 ? activeWindows : await scanActiveWindows();
      if (windows.length === 0) {
        setCrateError("No windows available to save");
        return;
      }
      await invoke("save_crate", { name: crateName.trim() || "Active Workspace", apps: windows });
      const crates = await invoke("get_crates") as ContextCrate[];
      setContextCrates(crates);
      logEvent(`Context Crate saved: ${crateName}`, "system");
    } catch (e) {
      setCrateError("Save failed");
      logEvent("Context Crate save failed", "system");
    } finally {
      setCrateBusy(false);
    }
  };

  const launchContextCrate = async (crate: ContextCrate) => {
    if (!crate.id) return;
    setCrateBusy(true);
    setCrateError("");
    try {
      await invoke("launch_crate", { id: crate.id });
      logEvent(`Context Crate launched: ${crate.name}`, "deploy");
    } catch (e) {
      setCrateError("Launch failed");
      logEvent(`Context Crate launch failed: ${crate.name}`, "system");
    } finally {
      setCrateBusy(false);
    }
  };

  const handleFileDrop = async (paths: string[]) => {
    setIsIndexing(true);
    setMessages(prev => [...prev, { role: "assistant", content: `Neural Intent: Processing ${paths.length} dropped items for semantic ingestion...` }]);
    logEvent(`Knowledge Ingestion Started for ${paths.length} items`, 'neural');
    
    try {
      for (const path of paths) {
        await invoke('index_folder', { path });
      }
      setMessages(prev => [...prev, { role: "assistant", content: `Successfully ingested and vectorized knowledge from dropped paths.` }]);
      logEvent(`Knowledge Vault updated via Drag-and-Drop`, 'system');
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error during Knowledge Ingestion.` }]);
      logEvent(`Knowledge Vault ingestion failed`, 'system');
    } finally {
      setIsIndexing(false);
    }
  };

  const deleteContextCrate = async (crate: ContextCrate) => {
    if (!crate.id) return;
    setCrateBusy(true);
    setCrateError("");
    try {
      await invoke("delete_crate", { id: crate.id });
      const crates = await invoke("get_crates") as ContextCrate[];
      setContextCrates(crates);
      logEvent(`Context Crate deleted: ${crate.name}`, "system");
    } catch (e) {
      setCrateError("Delete failed");
      logEvent(`Context Crate delete failed: ${crate.name}`, "system");
    } finally {
      setCrateBusy(false);
    }
  };

  const handleUpdateCrate = async () => {
    if (!editingCrate || !editingCrate.id) return;
    setCrateBusy(true);
    try {
      await invoke("update_crate", { 
        id: editingCrate.id, 
        name: editingCrate.name, 
        apps: JSON.parse(editingCrate.apps) 
      });
      setEditingCrate(null);
      const crates = await invoke("get_crates") as ContextCrate[];
      setContextCrates(crates);
      logEvent(`Context Crate updated: ${editingCrate.name}`, "system");
    } catch (e) {
      setCrateError("Update failed");
    } finally {
      setCrateBusy(false);
    }
  };

  const removeAppFromEditingCrate = (index: number) => {
    if (!editingCrate) return;
    try {
      const parsedApps = JSON.parse(editingCrate.apps);
      parsedApps.splice(index, 1);
      setEditingCrate({ ...editingCrate, apps: JSON.stringify(parsedApps) });
    } catch(e) {}
  };

  const exportCrate = (crate: ContextCrate) => {
    const payload = JSON.stringify({ name: crate.name, apps: crate.apps, type: "OasisCrateConfig" });
    navigator.clipboard.writeText(payload);
    logEvent(`Crate configuration exported to clipboard.`, 'system');
    setProactiveAlert({ suggestion: `Crate '${crate.name}' copied to clipboard! Share it with your team.`, action: "Dismiss" });
  };

  const importCrate = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const payload = JSON.parse(text);
      if (payload.type !== "OasisCrateConfig" || !payload.name || !payload.apps) throw new Error();
      
      setCrateBusy(true);
      await invoke("save_crate", { name: `${payload.name} (Imported)`, apps: JSON.parse(payload.apps) });
      const crates = await invoke("get_crates") as ContextCrate[];
      setContextCrates(crates);
      logEvent(`Imported Crate: ${payload.name}`, 'system');
      setProactiveAlert({ suggestion: `Successfully imported Crate: ${payload.name}`, action: "Dismiss" });
    } catch(e) {
      setCrateError("Invalid Crate JSON in clipboard.");
    } finally {
      setCrateBusy(false);
    }
  };

  // --- SYNC: BRIDGE ---
  useEffect(() => {
    const syncFoundryData = async () => {
      try {
        const metrics = await invoke("get_venture_metrics") as any;
        const intel = await invoke("get_market_intelligence") as any;
        const vault = await invoke("get_vault_nodes") as VaultNode[];
        const windows = await invoke("get_running_windows") as WindowInfo[];
        const logs = await invoke("get_logs") as NeuralLog[];
        const crates = await invoke("get_crates") as ContextCrate[];
        const hardware = await invoke("get_hardware_telemetry") as any;
        
        if (!simMode) setFounderMetrics(metrics);
        setMarketIntel(intel);
        setVaultNodes(vault);
        setActiveWindows(windows);
        setContextCrates(crates);
        setTelemetry(hardware);
        if (logs.length > 0) {
          setTimeline(logs.map((entry) => ({
            id: entry.id || Date.parse(entry.timestamp) || Date.now(),
            type: ['neural', 'deploy', 'system'].includes(entry.event_type) ? entry.event_type as TimelineType : 'system',
            event: entry.message,
            time: new Date(entry.timestamp).toLocaleTimeString()
          })).slice(0, 50));
        }
        setLastSync(new Date().toLocaleTimeString());
        setBridgeStatus("Native");
      } catch (e) {
        if (!simMode) {
          setFounderMetrics({
            arr: "$1.24M", burn: "$42.5K/mo", runway: "18.4 Mo.", momentum: "+12.8%"
          });
        }
        setLastSync(new Date().toLocaleTimeString() + " (Simulated)");
        setBridgeStatus("Simulated");
      }
    };
    syncFoundryData();
    const interval = setInterval(syncFoundryData, 2000); // Poll every 2s for lively telemetry!
    return () => clearInterval(interval);
  }, [simMode]);

  // --- CRON AGENTS ENGINE ---
  useEffect(() => {
    const intervals: any[] = [];
    
    cronAgents.forEach(agent => {
      if (agent.active) {
        const intervalId = setInterval(async () => {
          logEvent(`Cron Agent '${agent.title}' woke up.`, 'neural');
          try {
            const llmResponse = await invoke("rag_query", { query: agent.prompt }) as string;
            const cmdMatch = llmResponse.match(/\[CMD\](.*?)\[\/CMD\]/is);
            if (cmdMatch && cmdMatch[1]) {
               const cmd = cmdMatch[1].trim();
               logEvent(`Cron Agent '${agent.title}' executing: ${cmd}`, 'deploy');
               const execResult = await invoke("execute_neural_command", { command: cmd }) as string;
               if (!execResult.includes("no output")) {
                 setProactiveAlert({ suggestion: `Agent Output: ${execResult.substring(0, 100)}`, action: cmd });
               }
            } else {
               logEvent(`Cron Agent '${agent.title}' Report: ${llmResponse.substring(0, 100)}...`, 'system');
            }
          } catch(e) {
            logEvent(`Cron Agent '${agent.title}' failed execution.`, 'system');
          }
        }, agent.interval);
        intervals.push(intervalId);
      }
    });

    return () => intervals.forEach(id => clearInterval(id));
  }, [cronAgents]);

  // --- DATA: CORTEX ---
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

  const getNodeColor = (node: any) => {
    if (simMode) return "#f59e0b";
    switch (node.group) {
      case 'core': return '#6366f1';
      case 'capital': return '#f59e0b';
      case 'product': return '#a855f7';
      case 'growth': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const getCrateAppCount = (crate: ContextCrate) => {
    try {
      return JSON.parse(crate.apps).length;
    } catch {
      return 0;
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden flex selection:bg-indigo-500/30"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {/* Background Substrate */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ background: simMode ? '#f59e0b' : currentAura, opacity: (isThinking || simMode) ? 0.15 : 0.08 }}
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
            nodeColor={getNodeColor}
            nodeLabel="id"
            linkColor={() => simMode ? "rgba(245, 158, 11, 0.2)" : "rgba(99, 102, 241, 0.1)"}
            showNavInfo={false}
          />
        )}
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

      {/* Main Command Stage */}
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 w-full flex items-center justify-between px-12 border-b border-white/5 backdrop-blur-xl bg-white/[0.01]">
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Active Aura</span>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                {contexts.find(c => c.id === activeContext)?.name} Context
                <span className="ml-4 text-[9px] font-mono text-indigo-500/50 border border-indigo-500/20 px-2 py-0.5 rounded">V1.2.6-PRO</span>
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
            <div className="h-8 w-[1px] bg-white/5 mx-2" />
            <button onClick={() => resolveNeuralIntent("Sync Metrics")} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              Neural Sync
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto custom-scrollbar">
          {/* Neural Intent Bar */}
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

          {/* Proactive AI Cron Agents */}
          <div className="w-full max-w-5xl mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Autonomous Systems</span>
                <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                  <Bot className="w-6 h-6 text-purple-400" /> Proactive AI Agents
                </h3>
              </div>
              <button 
                onClick={() => {
                  if(newAgentTitle && newAgentPrompt) {
                    setCronAgents(prev => [...prev, { id: Date.now().toString(), title: newAgentTitle, prompt: newAgentPrompt, interval: 60000, active: true }]);
                    setNewAgentTitle("");
                    setNewAgentPrompt("");
                  }
                }}
                className="px-6 py-3 glass bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all"
              >
                + Deploy Agent
              </button>
            </div>
            
            {/* New Agent Input */}
            <div className="glass p-6 rounded-3xl border border-purple-500/20 mb-8 flex gap-4 bg-purple-500/5">
              <input 
                value={newAgentTitle} onChange={e => setNewAgentTitle(e.target.value)} 
                placeholder="Agent Name (e.g. Sweeper)" 
                className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-purple-500/50 w-1/4"
              />
              <input 
                value={newAgentPrompt} onChange={e => setNewAgentPrompt(e.target.value)} 
                placeholder="System Prompt (e.g. 'Check memory every minute and close edge')" 
                className="bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-purple-500/50 flex-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {cronAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  className={cn(
                    "glass rounded-[2rem] p-8 border relative overflow-hidden group min-h-[280px] flex flex-col justify-between transition-all duration-500",
                    agent.active ? "border-purple-500/40 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]" : "border-white/5 opacity-60"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 blur-[50px] transition-all",
                    agent.active ? "bg-purple-500/20" : "bg-transparent"
                  )} />
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn("w-3 h-3 rounded-full animate-pulse", agent.active ? "bg-purple-400" : "bg-slate-600")} />
                      <h3 className="text-lg font-bold tracking-tight text-white">{agent.title}</h3>
                    </div>
                    <button 
                      onClick={() => setCronAgents(prev => prev.map(a => a.id === agent.id ? { ...a, active: !a.active } : a))}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all border",
                        agent.active ? "text-red-400 bg-red-400/10 border-red-500/20 hover:bg-red-400/20" : "text-emerald-400 bg-emerald-400/10 border-emerald-500/20 hover:bg-emerald-400/20"
                      )}
                    >
                      {agent.active ? "Halt" : "Activate"}
                    </button>
                  </div>

                  <div className="flex-1 space-y-4 relative z-10">
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                      <p className="text-sm text-slate-300 leading-relaxed font-mono">
                        <span className="text-purple-400 font-bold block mb-2 text-[10px] uppercase tracking-widest">Directive:</span> 
                        {agent.prompt}
                      </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Interval: {agent.interval / 1000} Seconds
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hardware Telemetry Node */}
          <div className="w-full max-w-5xl glass p-8 rounded-[2rem] border border-white/5 mb-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Activity className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold tracking-tight text-white">Hardware Telemetry</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">Live Feed Active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Native Bridge', status: bridgeStatus, prog: bridgeStatus === 'Native' ? 100 : 45, color: bridgeStatus === 'Native' ? 'emerald' : 'purple' },
                { name: 'CPU Usage', status: `${telemetry.cpu_usage.toFixed(1)}%`, prog: Math.min(100, telemetry.cpu_usage), color: telemetry.cpu_usage > 80 ? 'red' : 'indigo' },
                { name: 'Memory Load', status: `${telemetry.ram_usage.toFixed(1)}%`, prog: Math.min(100, telemetry.ram_usage), color: telemetry.ram_usage > 85 ? 'red' : 'purple' }
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

          {/* Context Crates */}
          <div className="w-full max-w-5xl glass p-8 rounded-[2rem] border border-white/5 mb-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
              <div className="flex items-center gap-4">
                <FolderOpen className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-white">Context Crates</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeWindows.length} windows detected</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={scanActiveWindows} disabled={crateBusy} className="px-4 py-2 glass text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white rounded-xl border border-white/5 disabled:opacity-40">
                  Scan
                </button>
                <button onClick={suggestCrateName} disabled={crateBusy} className="px-4 py-2 glass text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white rounded-xl border border-white/5 disabled:opacity-40">
                  Name
                </button>
                <button onClick={importCrate} disabled={crateBusy} className="px-4 py-2 glass text-[10px] font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 rounded-xl border border-purple-500/30 disabled:opacity-40">
                  Import
                </button>
                <button onClick={saveActiveCrate} disabled={crateBusy} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl disabled:opacity-40">
                  Save
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
              <div className="space-y-5">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Crate Name</span>
                  <input
                    value={crateName}
                    onChange={(e) => setCrateName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                  {activeWindows.slice(0, 6).map((win) => (
                    <div key={`${win.pid}-${win.title}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3">
                      <span className="text-xs text-slate-300 truncate">{win.title}</span>
                      <span className="text-[9px] font-mono text-slate-500">{win.pid}</span>
                    </div>
                  ))}
                  {activeWindows.length === 0 && (
                    <div className="rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-xs text-slate-500">
                      No active windows scanned yet.
                    </div>
                  )}
                </div>
                {crateError && <p className="text-xs text-amber-400 font-medium">{crateError}</p>}
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2 perspective-1000">
                {contextCrates.map((crate) => {
                  const isEditing = editingCrate?.id === crate.id;
                  return (
                    <motion.div 
                      key={crate.id || crate.timestamp} 
                      className="relative w-full"
                      animate={{ rotateX: isEditing ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring" }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* FRONT OF CARD */}
                      <div 
                        className="glass-bright border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{crate.name}</h4>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {getCrateAppCount(crate)} apps saved
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingCrate(crate)} disabled={crateBusy || !crate.id} className="px-3 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 rounded-xl border border-purple-500/20 disabled:opacity-40 transition-colors">
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => exportCrate(crate)} disabled={crateBusy || !crate.id} className="px-3 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 rounded-xl border border-emerald-500/20 disabled:opacity-40 transition-colors" title="Export to Clipboard">
                            <UploadCloud className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteContextCrate(crate)} disabled={crateBusy || !crate.id} className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl border border-red-500/20 disabled:opacity-40 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                          </button>
                          <button onClick={() => launchContextCrate(crate)} disabled={crateBusy || !crate.id} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-emerald-500/20 disabled:opacity-40">
                            Launch
                          </button>
                        </div>
                      </div>

                      {/* BACK OF CARD (EDITOR) */}
                      {isEditing && (
                        <div 
                          className="absolute inset-0 glass-bright border border-indigo-500/30 rounded-2xl p-4 flex flex-col gap-3"
                          style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              value={editingCrate.name} 
                              onChange={(e) => setEditingCrate({ ...editingCrate, name: e.target.value })}
                              className="w-full bg-black/40 rounded-lg px-3 py-1.5 text-xs font-bold text-white outline-none border border-white/5 focus:border-indigo-500/50"
                            />
                            <button onClick={handleUpdateCrate} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold uppercase rounded-lg">Save</button>
                            <button onClick={() => setEditingCrate(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase rounded-lg">Cancel</button>
                          </div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                            {JSON.parse(editingCrate.apps || "[]").map((app: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-1.5 rounded-lg group">
                                <span className="text-[10px] text-slate-300 truncate max-w-[150px]">{app.title || "Unknown Window"}</span>
                                <button onClick={() => removeAppFromEditingCrate(idx)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Plus className="w-3 h-3 rotate-45" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {contextCrates.length === 0 && (
                  <div className="glass-bright border border-white/5 rounded-2xl p-6 text-sm text-slate-500">
                    Saved workspaces will appear here.
                  </div>
                )}
              </div>
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
            <div className="w-full h-full">
              {mounted && (
                <ForceGraph3D
                  graphData={graphData}
                  backgroundColor="#00000000"
                  nodeRelSize={simMode ? 10 : 10}
                  nodeColor={getNodeColor}
                  nodeLabel="id"
                  linkColor={() => simMode ? "rgba(245, 158, 11, 0.3)" : "rgba(99, 102, 241, 0.3)"}
                />
              )}
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
            
            <div className="w-full max-w-4xl mx-auto mb-10 relative">
              <input 
                 value={ragQuery}
                 onChange={e => setRagQuery(e.target.value)}
                 onKeyDown={async (e) => {
                   if (e.key === 'Enter' && ragQuery.trim()) {
                     setIsRagging(true);
                     setRagAnswer("");
                     try {
                        const answer = await invoke("rag_query", { query: ragQuery });
                        setRagAnswer(answer as string);
                     } catch(err) {
                        setRagAnswer("Error querying the Sentient Vault.");
                     }
                     setIsRagging(false);
                   }
                 }}
                 placeholder="Ask the Sentient Vault a question (e.g., 'What is our strategy?')"
                 className="w-full bg-black/40 backdrop-blur-md border border-indigo-500/30 rounded-2xl px-8 py-5 text-lg font-medium text-white placeholder:text-indigo-300/40 outline-none focus:border-indigo-400 transition-all shadow-xl shadow-indigo-500/10"
              />
              {isRagging && <div className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />}
            </div>

            <AnimatePresence>
              {ragAnswer && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-4xl mx-auto mb-12 p-8 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl backdrop-blur-xl"
                >
                   <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <BrainCircuit className="w-4 h-4" /> AI Synthesis
                   </h3>
                   <p className="text-base text-indigo-100/90 leading-relaxed">{ragAnswer}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pr-4">
              {vaultNodes.map((node) => (
                <div key={node.name} className="glass-bright p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all group flex flex-col justify-between aspect-square">
                  <div className="flex justify-between items-start">
                    <div className={cn("p-4 rounded-xl", node.category === 'Strategic' ? "bg-amber-500/10 text-amber-500" : node.category === 'Technical' ? "bg-indigo-500/10 text-indigo-500" : "bg-purple-500/10 text-purple-500")}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{node.size}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest block mb-2">{node.category}</span>
                    <h4 className="text-lg font-bold text-white truncate">{node.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quake-style Sentient Terminal */}
        <AnimatePresence>
          {showTerminal && (
            <motion.div 
              initial={{ y: "-100%", opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: "-100%", opacity: 0 }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 right-0 h-[60vh] z-[300] bg-black/90 backdrop-blur-3xl border-b border-indigo-500/30 flex flex-col shadow-2xl shadow-indigo-500/20"
            >
              <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Oasis Sentient Terminal</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={analyzeScreen} disabled={isThinking} className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-xl border border-indigo-500/20 disabled:opacity-40 transition-colors text-[10px] font-bold uppercase tracking-widest">
                    <Eye className="w-3.5 h-3.5" /> Analyze Screen
                  </button>
                  <button onClick={() => setShowTerminal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex flex-col max-w-4xl", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{msg.role === 'user' ? 'Operator' : 'Oasis Kernel'}</span>
                    <div className={cn("p-4 rounded-2xl text-sm font-mono whitespace-pre-wrap", msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white/5 text-indigo-100 border border-white/5", msg.content.includes("Analyze my screen") && "border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]")}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-center gap-2 p-4 bg-white/5 rounded-2xl w-fit border border-white/5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                )}
              </div>
              <div className="p-6 bg-black/50 border-t border-white/5">
                <div className="max-w-4xl mx-auto relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-mono font-bold">{">"}</span>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        resolveNeuralIntent(searchQuery);
                      }
                    }}
                    placeholder="Enter neural directive..."
                    className="w-full bg-transparent border border-indigo-500/30 rounded-xl py-4 pl-10 pr-6 text-indigo-100 font-mono outline-none focus:border-indigo-500 transition-all placeholder:text-indigo-900/50"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {showSettings && (
          <motion.div initial={{ opacity: 0, x: -500 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -500 }} className="fixed inset-y-0 left-0 z-[400] w-[450px] glass-bright border-r border-white/10 p-12 backdrop-blur-4xl flex flex-col shadow-[100px_0_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-12">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">System Configuration</span>
                <h2 className="text-3xl font-bold text-white tracking-tighter">Kernel Settings</h2>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            
            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-4">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Local AI Engine</h3>
                <div className="p-4 glass rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Inference Model</span>
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded border border-indigo-400/20">gemma3:4b</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Embedding Model</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">nomic-embed-text</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sentient Vault (Vector DB)</h3>
                <div className="p-4 glass rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Indexed Nodes</span>
                    <span className="text-xs font-bold text-slate-300">{vaultNodes.length} Files</span>
                  </div>
                  <button className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors border border-red-500/20">
                    Purge All Vector Data
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hardware Telemetry Node</h3>
                <div className="p-4 glass rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Polling Rate</span>
                    <span className="text-xs font-mono text-slate-300">2000ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Background Process</span>
                    <div className="w-8 h-4 bg-indigo-500 rounded-full relative">
                      <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full shadow" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Boot Sequence</h3>
                <div className="p-4 glass rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Initialize Oasis on Windows Startup</span>
                    <button 
                      onClick={async () => {
                        try {
                          if (autostart) { await disable(); setAutostart(false); }
                          else { await enable(); setAutostart(true); }
                        } catch(e) { console.error("Autostart Error:", e); }
                      }}
                      className={cn("w-12 h-6 rounded-full relative transition-colors", autostart ? "bg-indigo-500" : "bg-white/10")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow", autostart ? "left-7" : "left-1")} />
                    </button>
                  </div>
                </div>
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
                <button onClick={() => setSimMode(false)} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20">Commit Simulation</button>
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
      <div className="fixed bottom-10 right-10 flex flex-col items-end gap-6 z-[600]">
        <AnimatePresence>
          {showAI && (
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="w-96 h-[550px] glass rounded-[2.5rem] border-white/10 shadow-3xl overflow-hidden flex flex-col mb-4">
              <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Neural Link Stable</span>
                <div className="flex gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" /></div>
              </header>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
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
      {/* Guardian Notification HUD */}
      <AnimatePresence>
        {proactiveAlert && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-32 right-10 w-96 bg-[#0B0F19]/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-5 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] z-[700] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="flex gap-4 relative">
              <div className="p-3 bg-indigo-500/20 rounded-2xl shrink-0 h-fit border border-indigo-400/20">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Guardian Protocol</h4>
                <p className="text-sm text-indigo-200/80 leading-relaxed mb-4">
                  {proactiveAlert.suggestion}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      invoke("execute_neural_command", { command: `echo Authorizing action: ${proactiveAlert.action}`});
                      logEvent(`Guardian Executed: ${proactiveAlert.action}`, 'deploy');
                      setProactiveAlert(null);
                    }}
                    className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Authorize
                  </button>
                  <button 
                    onClick={() => setProactiveAlert(null)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global AI Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="w-full max-w-2xl glass-panel p-2 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                <Search className="w-5 h-5 text-indigo-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Ask Oasis or launch a command (e.g. 'Launch vscode crate')..."
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commandInput.trim()) {
                      resolveNeuralIntent(commandInput);
                      setCommandInput("");
                      setShowCommandPalette(false);
                    }
                  }}
                  className="w-full bg-transparent border-none outline-none text-white text-sm font-medium placeholder:text-slate-500"
                />
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold text-slate-400 uppercase">Enter</kbd>
                  <kbd className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold text-slate-400 uppercase">Esc</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag and Drop Knowledge Dropzone */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-indigo-900/40 backdrop-blur-md border-4 border-dashed border-indigo-500 m-4 rounded-[3rem]"
          >
            <div className="flex flex-col items-center justify-center p-12 bg-black/40 rounded-3xl backdrop-blur-xl">
              <FolderOpen className="w-24 h-24 text-indigo-400 mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-white tracking-widest uppercase mb-2">Knowledge Dropzone</h2>
              <p className="text-indigo-200 font-medium">Drop files or folders to vectorize into the Sentient Vault</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indexing Indicator */}
      <AnimatePresence>
        {isIndexing && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[2000] flex items-center gap-4 bg-indigo-600 px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/30"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">Ingesting Knowledge into Vector DB...</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
