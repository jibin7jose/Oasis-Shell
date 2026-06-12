import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Search, LayoutDashboard, FolderOpen, Activity,
  Settings, Zap, BrainCircuit, Shield, Terminal,
  Plus, Activity as PulseIcon, UploadCloud, Eye, Mic, MicOff, Clock, Image as ImageIcon,
  Minimize2, Maximize2
} from "lucide-react";
import ForceGraph3D from "react-force-graph-3d";
import { useHeuristicGuardian } from "./hooks/useHeuristicGuardian";
import { TimeMachineModal } from "./components/overlays/TimeMachineModal";
import { VisionScannerOverlay } from "./components/overlays/VisionScannerOverlay";
import { MainCommandStage } from "./components/layout/MainCommandStage";
import { GuardianHUD } from "./components/overlays/GuardianHUD";


import { CommandPalette } from "./components/overlays/CommandPalette";


import { PremiumToast } from "./components/overlays/PremiumToast";
import { HolographicAssistant } from "./components/overlays/HolographicAssistant";
import { CommandTerminal } from "./components/panels/CommandTerminal";
import { TerminalPanel } from "./components/panels/TerminalPanel";
import { ClipboardPanel } from "./components/panels/ClipboardPanel";
import WorkforcePanel from "./components/panels/WorkforcePanel";
import { SentientVault } from "./components/panels/SentientVault";
import { ClickableReality } from "./components/panels/ClickableReality";
import { SettingsPanel } from "./components/panels/SettingsPanel";
import { VentureSimulationPortal } from "./components/panels/VentureSimulationPortal";
import LeftRail from "./components/layout/LeftRail";
import { useSystemStore } from "./lib/systemStore";
import { CognitiveTimeline } from "./components/panels/CognitiveTimeline";
import SynthesisPanel from "./components/panels/SynthesisPanel";
import { AegisNexus } from "./components/panels/AegisNexus";
import { OverlayManager } from "./components/overlays/OverlayManager";
import { NeuralMesh } from "./components/shared/NeuralMesh";
import { useVoiceEngine } from "./hooks/useVoiceEngine";
import { useMemoryEngine } from "./hooks/useMemoryEngine";
import { JarvisOverlay } from "./components/overlays/JarvisOverlay";

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
  const { 
    activeView, setActiveView,
    showTerminal, setShowTerminal,
    showClipboard, setShowClipboard,
    showGraph, setShowGraph,
    showVault, setShowVault,
    showSettings, setShowSettings,
    showLogs, setShowLogs,
    showClickableReality, setShowClickableReality,
  } = useSystemStore();

  // --- CORE STATE ---
  const [activeContext, setActiveContext] = useState('dev');
  const [lockedApp, setLockedApp] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isScanningScreen, setIsScanningScreen] = useState(false);
  const [lastSync, setLastSync] = useState("Never");
  const [showAI, setShowAI] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);
  
  const toggleWidgetMode = async () => {
    try {
      await invoke("set_widget_mode", { enable: !isWidgetMode });
      setIsWidgetMode(!isWidgetMode);
    } catch (e) {
      console.error("Failed to toggle widget mode", e);
    }
  };

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

  const [showWorkforce, setShowWorkforce] = useState(false);
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [showJarvis, setShowJarvis] = useState(false);
  const [autostart, setAutostart] = useState(false);
  const [simMode, setSimMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [editingCrate, setEditingCrate] = useState<ContextCrate | null>(null);

  // RAG State
  const [ragQuery, setRagQuery] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [isRagging, setIsRagging] = useState(false);

  // Voice Engine State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  // In-App Notification State
  const [toast, setToast] = useState<{title: string, body: string, id: number} | null>(null);

  // Memory State
  const [photographicMemories, setPhotographicMemories] = useState<any[]>([]);

  const loadMemories = async () => {
    try {
      const mems = await invoke("get_all_photographic_memories") as any[];
      setPhotographicMemories(mems);
    } catch(e) { console.error(e); }
  };

  // Global Keybindings & Init
  useEffect(() => {
    (async () => {
      try {
        setAutostart(await isEnabled());
      } catch (e) {}
      try {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
          const permission = await requestPermission();
          permissionGranted = permission === 'granted';
        }
      } catch (e) {
        console.error("Failed to setup notifications:", e);
      }
      try {
        await invoke("start_photographic_memory");
        await invoke("start_cron_scheduler");
      } catch (e) {
        console.error("Failed to start background agents:", e);
      }
    })();

    const unlistenCron = listen('oasis-cron-snapshot', (e: any) => {
      notifyUser("Context Crate Secured", `Automated snapshot taken: ${e.payload}`);
      logEvent(`Auto-Snapshot Created: ${e.payload}`, 'system');
    });

    const unlistenVault = listen('vault-indexed', (e: any) => {
      notifyUser("Semantic Vault", `Indexed new file: ${e.payload.file}`);
      logEvent(`Autonomous Vault Indexed: ${e.payload.file}`, 'neural');
    });

    let unlistenOmnibar: () => void;
    listen('omnibar-focus', () => {
      setTimeout(() => document.getElementById('neural-input')?.focus(), 50);
    }).then(f => unlistenOmnibar = f);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K — focus neural intent bar
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        document.getElementById('neural-input')?.focus();
      }
      // Ctrl+` — toggle streaming terminal
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault();
        setShowTerminal(!showTerminal);
      }
      // Ctrl+Shift+T — also toggle terminal (VSCode muscle memory)
      if (e.key === 't' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setShowTerminal(!showTerminal);
      }
      // Ctrl+G — open Strategic Cortex graph
      if (e.key === 'g' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setShowGraph(!showGraph);
      }
      // Ctrl+Shift+V — open Clipboard History
      if (e.key.toLowerCase() === 'v' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setShowClipboard(!showClipboard);
      }
      // Ctrl+Shift+F — open Clickable Reality (Global OCR)
      if (e.key.toLowerCase() === 'f' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setShowClickableReality(!showClickableReality);
      }
      // Ctrl+Shift+J — open JARVIS Voice Assistant
      if (e.key.toLowerCase() === 'j' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setShowJarvis(!showJarvis);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowTerminal(false);
        setShowJarvis(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    
    // Listen for global shortcuts from Rust backend
    const unlistenTerminal = listen('toggle-sentient-terminal', () => {
      setShowTerminal(!showTerminal);
    });
    
    const unlistenPalette = listen('toggle-command-palette', () => {
      setShowCommandPalette(prev => !prev);
    });

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      unlistenTerminal.then(f => f());
      unlistenPalette.then(f => f());
      unlistenCron.then(f => f());
      if (unlistenOmnibar) unlistenOmnibar();
    };
  }, []);

  const [founderMetrics, setFounderMetrics] = useState({
    arr: "$1.24M", burn: "$42.5K/mo", runway: "18.4 Mo.", momentum: "+12.8%"
  });
  const [telemetry, setTelemetry] = useState({ cpu_usage: 0, ram_usage: 0, disk_usage: 0, network_up: 0, network_down: 0, gpu_usage: 0 });

  useHeuristicGuardian(telemetry, (category, action) => {
    setProactiveAlert({ suggestion: `Anomaly Detected: ${category}. Auto-mitigation ready.`, action });
    notifyUser(`Heuristic Guardian Alert`, `Detected ${category}. Review mitigation action.`);
  });

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
  const notifyUser = (title: string, body: string) => {
    // Show beautiful in-app toast
    setToast({ title, body, id: Date.now() });
    setTimeout(() => setToast(null), 5000);
    
    // Attempt native OS notification
    isPermissionGranted().then(granted => {
      if (granted) sendNotification({ title, body });
    });
  };

  const logEvent = (event: string, type: TimelineType, notify = false) => {
    setTimeline(prev => [{
      id: Date.now(),
      type,
      event,
      time: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 50));
    invoke("log_event", { eventType: type, message: event }).catch(() => { });
    if (notify) {
      notifyUser("Oasis OS Kernel", event);
    }
  };

  const resolveNeuralIntent = (query: string) => {
    const q = query.toLowerCase();
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setIsThinking(true);
    logEvent(`Neural Intent Captured: "${query}"`, 'neural');

    setTimeout(() => {
      setIsThinking(false);
      
      // 0. Semantic Memory check (Highest Priority)
      if (q.includes("recall ") || q.includes("do you remember") || q.includes("what was i looking at") || q.includes("what did i see")) {
        setMessages(prev => [...prev, { role: "assistant", content: "🔍 Memory Search: Accessing Sentient Vault..." }]);
        logEvent(`Memory Query: ${query}`, "neural");
        (async () => {
          try {
            const llmResponse = await invoke("query_photographic_memory", { query }) as string;
            setMessages(prev => [...prev, { role: "assistant", content: llmResponse }]);
          } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: `Memory retrieval failed: ${e}` }]);
          }
        })();
      }
      // 1. Check for Launching a Crate specifically first
      else if ((q.includes("launch") || q.includes("open")) && (q.includes("crate") || q.includes("workspace"))) {
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
        logEvent("Deployment Sequence Alpha Initiated", "deploy", true);
      } 
      else if (q.includes("git") || q.includes("commit") || q.includes("push") || q.includes("review code") || (q.includes("review") && q.includes("push")) || q.includes("review and push") || q.includes("code and push")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Code-Aware Sentinel activated. Analyzing Git status..." }]);
        logEvent("Git Automation Triggered", "deploy");
        (async () => {
          try {
            const gitStatus = await invoke("execute_neural_command", { command: "git status -s" }) as string;
            if (!gitStatus.trim() || gitStatus.includes("no output")) {
              setMessages(prev => [...prev, { role: "assistant", content: "Git status is clean. No code to review." }]);
              notifyUser("Git Sentinel", "Workspace is already clean.");
              return;
            }
            setMessages(prev => [...prev, { role: "assistant", content: `Uncommitted Changes Detected:\n${gitStatus}\n\nGenerating autonomous commit message...` }]);
            
            // Ask LLM to generate a commit message based on the diff
            const gitDiff = await invoke("execute_neural_command", { command: "git --no-pager diff" }) as string;
            const commitMessage = await invoke("generate_commit_message", { diff: gitDiff }) as string;
            
            setMessages(prev => [...prev, { role: "assistant", content: `Generated Commit: ${commitMessage.trim()}` }]);
            
            if (q.includes("push") || q.includes("commit")) {
               setMessages(prev => [...prev, { role: "assistant", content: "Pushing to remote origin..." }]);
               await invoke("execute_neural_command", { command: `git add . ; git commit -m "${commitMessage.trim().replace(/"/g, '')}" ; git push` });
               setMessages(prev => [...prev, { role: "assistant", content: "Codebase securely pushed to GitHub." }]);
               logEvent("Autonomous Git Push Complete", "system", true);
            }
          } catch(e) {
            setMessages(prev => [...prev, { role: "assistant", content: `Git execution failed: ${e}` }]);
          }
        })();
      }
      else if (q.includes('vision') || q.includes('look') || q.includes('see') || q.includes('screen')) { analyzeScreen(); } else if (q.includes("create") || q.includes("architect") || q.includes("build module")) {
        const title = query.replace(/create|architect|build module/gi, "").trim() || "New Dynamic Module";
        notifyUser('Architect', 'Manifesting module: ' + title);



        setMessages(prev => [...prev, { role: "assistant", content: `Architect: Manifesting '${title}' strategic module...` }]);
        logEvent(`Autonomous Module '${title}' Scaffolding Complete`, "system", true);
      } else if (q.includes("sim") || q.includes("sandbox") || q.includes("project")) {
        setSimMode(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Initiating Strategic Venture Sandbox..." }]);
        logEvent("Venture Simulation Portal Opened", "system");
      } else if (q.includes("vault") || q.includes("files") || q.includes("open vault")) {
        setShowVault(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Accessing Sentient Vault Nodes..." }]);
        logEvent("Sentient Vault Portal Opened", "system");
      } else if (q.includes("rewind") || q.includes("time machine") || q.includes("past") || q.includes("memory")) {
        loadMemories();
        setShowTimeMachine(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Opening Photographic Memory Archive..." }]);
        logEvent("Time Machine Initiated", "system");
      } else if (q.includes("arrange") || q.includes("organize") || q.includes("snap") || q.includes("split")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Initiating AI Window Telekinesis. Organizing workspace..." }]);
        logEvent("AI Window Telekinesis Triggered", "system", true);
        invoke("organize_workspace", { layoutMode: "code_split" }).catch(e => console.error(e));
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
      } else if (q.includes("photographic memory") || q.includes("recall") || q.includes("remember")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Querying Photographic Memory Engine..." }]);
        logEvent("Photographic Memory Engine Queried", "neural");
        (async () => {
          try {
            const memoryResponse = await invoke("query_photographic_memory", { query: q }) as string;
            setMessages(prev => [...prev, { role: "assistant", content: memoryResponse }]);
          } catch(e) {
            setMessages(prev => [...prev, { role: "assistant", content: `Memory query failed: ${e}` }]);
          }
        })();
      } else if ((q.includes("graph") || q.includes("cortex") || q.includes("3d")) && !q.includes("photograph")) {
        setShowGraph(true);
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Initiating 3D Strategic Cortex..." }]);
        logEvent("Strategic Cortex Visualization Launched", "system");
      } else if (q.includes("intel") || q.includes("market") || q.includes("competitors")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: Retrieving Global Market Intelligence..." }]);
        logEvent("Market Intelligence Bridge Synced", "system");
      } else if (q.includes("type ") || q.includes("press ") || q.includes("macro") || q.includes("start menu") || q.includes("ghost") || q.includes("book")) {
        setMessages(prev => [...prev, { role: "assistant", content: "Neural Intent: 'Ghost in the Machine' macro sequence initialized..." }]);
        logEvent("Neural Macro Injection Triggered", "deploy", true);
        
        let sequence = "";
        if (q.includes("book") && q.includes("flight")) {
           // Breathtaking automation demonstration bypassing Chrome profiles
           sequence = "key:win|sleep:500|text:flights to new york|sleep:800|key:enter";
        } else if (q.includes("type ")) {
           const textToType = q.split("type ")[1].trim();
           sequence = `text:${textToType}`;
        } else if (q.includes("press ")) {
           const keyToPress = q.split("press ")[1].trim();
           sequence = `key:${keyToPress}`;
        } else if (q.includes("start menu")) {
           sequence = "key:win";
        } else {
           // Default autonomous test sequence
           sequence = "key:win|sleep:500|text:notepad|sleep:500|key:enter|sleep:1000|text:Hello from Oasis Sentient OS! I am piloting your computer.";
        }
        
        invoke("execute_neural_macro", { macroSequence: sequence }).catch(e => console.error(e));
      } else if (q.includes("arr") || q.includes("runway") || q.includes("metrics")) {
        setMessages(prev => [...prev, { role: "assistant", content: `Neural Audit: Current ARR is ${founderMetrics.arr} with ${founderMetrics.runway} runway.` }]);
        logEvent("Executive Metrics Audit Completed", "neural");
      // 4. Semantic File Search — triggered by "find", "search files", "where is"
      } else if (q.includes("find ") || q.includes("search files") || q.includes("where is") || q.includes("locate ") || q.includes("show me")) {
        setMessages(prev => [...prev, { role: "assistant", content: `🔍 Semantic Search: Querying file index for "${query}"…` }]);
        logEvent(`Semantic Search: ${query}`, "neural");
        (async () => {
          try {
            const results = await invoke("semantic_search", { query }) as any;
            if (results && results.length > 0) {
              const formatted = results.slice(0, 8).map((r: any, i: number) =>
                `${i + 1}. **${r.filename}**\n   📁 ${r.filepath}\n   ${r.preview?.substring(0, 120) || ''}`
              ).join("\n\n");
              setMessages(prev => [...prev, {
                role: "assistant",
                content: `Found ${results.length} semantic match${results.length > 1 ? 'es' : ''}:\n\n${formatted}`
              }]);
            } else {
              setMessages(prev => [...prev, {
                role: "assistant",
                content: "No indexed files matched your query. Try indexing a folder first with: 'index [path]'"
              }]);
            }
          } catch (e) {
            // Semantic search offline — fallback to LLM
            setMessages(prev => [...prev, {
              role: "assistant",
              content: "Semantic search unavailable (ensure Ollama + nomic-embed-text model is running). Falling back to AI…"
            }]);
            try {
              const llmResponse = await invoke("rag_query", { query }) as string;
              setMessages(prev => [...prev, { role: "assistant", content: llmResponse }]);
            } catch {}
          }
        })();
      } else if (q.startsWith("index ")) {
        const folderPath = query.substring(6).trim();
        setMessages(prev => [...prev, { role: "assistant", content: `📂 Indexing folder: ${folderPath}…` }]);
        (async () => {
          try {
            const count = await invoke("index_folder", { path: folderPath }) as number;
            setMessages(prev => [...prev, { role: "assistant", content: `✅ Indexed ${count} files from ${folderPath}. Semantic search is now active.` }]);
            logEvent(`Semantic Index: ${count} files from ${folderPath}`, "system");
          } catch (e) {
            setMessages(prev => [...prev, { role: "assistant", content: `Indexing failed: ${e}` }]);
          }
        })();
      } else {
        // True LLM Intent Parsing & Action Execution
        setMessages(prev => [...prev, { role: "assistant", content: "" }]);
        let unlistenToken: any;
        listen('llm-token', (event: any) => {
          setMessages(prev => {
             const newMsgs = [...prev];
             if (newMsgs[newMsgs.length - 1].role === 'assistant') {
                newMsgs[newMsgs.length - 1].content += event.payload;
             }
             return newMsgs;
          });
        }).then(f => unlistenToken = f);

        (async () => {
          try {
            const llmResponse = await invoke("rag_query", { query }) as string;
            if (unlistenToken) unlistenToken();
            
            // Parse for executable system commands
            const cmdMatch = llmResponse.match(/\[CMD\](.*?)\[\/CMD\]/is);
            if (cmdMatch && cmdMatch[1]) {
               const cmd = cmdMatch[1].trim();
               setMessages(prev => {
                 const newMsgs = [...prev];
                 newMsgs[newMsgs.length - 1].content = `Neural Directive Authorized. Executing system command:\n\`${cmd}\``;
                 return newMsgs;
               });
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
    setIsScanningScreen(true);
    try {
      const base64Image = await invoke("capture_screenshot") as string;
      const visionResult = await invoke("query_vision", { 
        imageBase64: base64Image, 
        prompt: "You are the Oasis Sentient Kernel. Analyze this screenshot of the user's active workspace. Identify exactly what IDE, terminal, or browser they are using. If they are looking at code, aggressively search for syntax errors, logic bugs, or architectural flaws and explain how to fix them. If they are reading documentation or a webpage, summarize the core concept. Provide a highly technical, dense, and actionable summary." 
      }) as string;
      
      setMessages(prev => [...prev, { role: "system", content: visionResult }]);
      logEvent("Omniscient Vision analysis complete", 'neural');
      notifyUser("Vision Inference Complete", "Screen analysis has been processed.");
    } catch(err) {
      setMessages(prev => [...prev, { role: "system", content: "Vision capabilities offline or Ollama 'llava' model not running." }]);
      logEvent("Omniscient Vision offline", 'system', true);
      notifyUser("Vision Engine Offline", "Ensure Ollama and 'llava' model are running locally.");
    } finally {
      setIsThinking(false);
      setIsScanningScreen(false);
    }
  };

  const handleSearchIntent = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      resolveNeuralIntent(searchQuery);
    }
  };

  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: "assistant", content: "Voice Engine: Speech Recognition not supported in this browser context." }]);
      return;
    }
    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    setIsListening(true);
    setVoiceTranscript("");
    logEvent("Voice Command Engine Activated", "neural");

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      setVoiceTranscript(interim || final);
      if (final.trim()) {
        setIsListening(false);
        setVoiceTranscript("");
        resolveNeuralIntent(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setVoiceTranscript("");
      setMessages(prev => [...prev, { role: "assistant", content: `Voice Engine Error: ${event.error}` }]);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceTranscript("");
    };

    recognition.start();
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
    const initSync = async () => {
      try { await invoke('start_proactive_sentience'); await invoke('start_photographic_memory'); } catch(e) {}
      try {
        const metrics = await invoke("get_venture_metrics") as any;
        const intel = await invoke("get_market_intelligence") as any;
        const vault = await invoke("get_vault_nodes") as VaultNode[];
        const logs = await invoke("get_logs") as NeuralLog[];
        const crates = await invoke("get_crates") as ContextCrate[];
        
        if (!simMode) setFounderMetrics(metrics);
        setMarketIntel(intel);
        setVaultNodes(vault);
        setContextCrates(crates);
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
    initSync();

    let isMounted = true;
    let unlistenHardware: any;
    let unlistenWindows: any;
    let unlistenAura: any;

    const setupListeners = async () => {
      unlistenHardware = await listen("oasis-hardware-telemetry", (event: any) => {
        if (!isMounted) return;
        setTelemetry(event.payload);
        setLastSync(new Date().toLocaleTimeString());
        setBridgeStatus("Native");
      });

      unlistenWindows = await listen("oasis-windows-telemetry", (event: any) => {
        if (!isMounted) return;
        setActiveWindows(event.payload);
      });

      let lastSeenExe = "";
      unlistenAura = await listen("oasis-active-window", (event: any) => {
        if (!isMounted) return;
        const payload = event.payload as { exe: string, title: string };
        if (!payload || !payload.exe) return;
        const exe = payload.exe.toLowerCase();
        const title = payload.title ? payload.title.toLowerCase() : "";
        
        if (exe !== lastSeenExe && !exe.includes("oasis-shell")) {
          logEvent(`[Aura Debug] Focus shifted to: ${exe} (Title: ${title})`, 'system');
          lastSeenExe = exe;
        }

        let nextContext = null;
        let matchedAppName = null;
        
        if (exe.includes("code") || exe.includes("cursor") || exe.includes("idea") || exe.includes("devenv") || exe.includes("notepad") || title.includes("notepad")) {
          nextContext = "dev";
          matchedAppName = (exe.includes("notepad") || title.includes("notepad")) ? "Notepad" : "Code Editor";
        } else if (exe.includes("chrome") || exe.includes("msedge") || exe.includes("brave") || exe.includes("firefox")) {
          nextContext = "growth";
          matchedAppName = exe.includes("chrome") ? "Google Chrome" : "Browser";
        } else if (exe.includes("figma") || exe.includes("photoshop") || exe.includes("illustrator")) {
          nextContext = "design";
          matchedAppName = "Design Suite";
        }

        if (nextContext) {
          setLockedApp(matchedAppName);
          setActiveContext(prev => {
            if (prev !== nextContext) {
              logEvent(`Aura Shift: ${payload.exe} triggered ${nextContext.toUpperCase()}`, 'system');
              return nextContext as string;
            }
            return prev;
          });
        } else {
          // If the app is not a "locked" app, hide the banner so it doesn't get stuck
          setLockedApp(null);
        }
      });
    };

    setupListeners();

    return () => {
      isMounted = false;
      if (unlistenHardware) unlistenHardware();
      if (unlistenWindows) unlistenWindows();
      if (unlistenAura) unlistenAura();
    };
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
               logEvent(`Cron Agent '${agent.title}' executing: ${cmd}`, 'deploy', true);
               const execResult = await invoke("execute_neural_command", { command: cmd }) as string;
               if (!execResult.includes("no output")) {
                 setProactiveAlert({ suggestion: `Agent Output: ${execResult.substring(0, 100)}`, action: cmd });
                 notifyUser(`Agent Alert: ${agent.title}`, execResult.substring(0, 100));
               }
            } else {
               logEvent(`Cron Agent '${agent.title}' Report: ${llmResponse.substring(0, 100)}...`, 'system');
            }
          } catch(e) {
            logEvent(`Cron Agent '${agent.title}' failed execution.`, 'system', true);
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
      case 'crate': return '#f59e0b';
      case 'vault': return '#a855f7';
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

  if (isWidgetMode) {
    return (
      <div className="w-full h-full h-screen bg-black/60 backdrop-blur-3xl border-l border-r border-white/10 flex flex-col p-5 font-sans select-none overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.8)]" style={{ WebkitAppRegion: 'drag' } as any}>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
         
         <div className="flex items-center justify-between mb-8 relative z-10" style={{ WebkitAppRegion: 'no-drag' } as any}>
           <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]", isThinking ? "bg-amber-400 animate-pulse text-amber-400" : "bg-emerald-400 text-emerald-400")} />
              Oasis HUD
           </span>
           <button onClick={toggleWidgetMode} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
              <Maximize2 className="w-4 h-4" />
           </button>
         </div>

         {/* Telemetry */}
         <div className="space-y-6 relative z-10" style={{ WebkitAppRegion: 'no-drag' } as any}>
            {/* CPU */}
            <div>
               <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                 <span>System Load</span>
                 <span className={telemetry.cpu_usage > 85 ? "text-red-400 font-black" : ""}>{telemetry.cpu_usage.toFixed(1)}%</span>
               </div>
               <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                 <div className={cn("h-full transition-all duration-500 shadow-[0_0_10px_currentColor]", telemetry.cpu_usage > 85 ? "bg-red-500 text-red-500" : "bg-indigo-500 text-indigo-500")} style={{ width: `${Math.min(100, telemetry.cpu_usage)}%` }} />
               </div>
            </div>
            
            {/* RAM */}
            <div>
               <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                 <span>Memory Alloc</span>
                 <span className={telemetry.ram_usage > 90 ? "text-red-400 font-black" : ""}>{telemetry.ram_usage.toFixed(1)}%</span>
               </div>
               <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                 <div className={cn("h-full transition-all duration-500 shadow-[0_0_10px_currentColor]", telemetry.ram_usage > 90 ? "bg-red-500 text-red-500" : "bg-purple-500 text-purple-500")} style={{ width: `${Math.min(100, telemetry.ram_usage)}%` }} />
               </div>
            </div>
         </div>

         {/* Mini Neural Input */}
         <div className="mt-auto relative z-10" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <div className="relative">
              <Terminal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                onKeyDown={(e) => {
                   if(e.key === 'Enter') {
                      resolveNeuralIntent(e.currentTarget.value);
                      e.currentTarget.value = "";
                   }
                }}
                placeholder="Directive..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 shadow-inner placeholder:text-slate-600 transition-colors" 
              />
            </div>
         </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden flex selection:bg-indigo-500/30"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {/* Background Substrate */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ background: simMode ? '#f59e0b' : currentAura, opacity: (isThinking || simMode) ? 0.45 : 0.25 }}
          className="absolute top-[-20%] left-0 w-full h-[70%] rounded-[100%] blur-[200px] transition-all duration-1000"
        />
        <div className="absolute inset-0 opacity-[0.03] grayscale invert mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
        <NeuralMesh />
      </div>

      {/* Aura Shift Indicator Banner */}
      <AnimatePresence>
        {lockedApp && (
          <motion.div
            key={activeContext}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-3 pointer-events-none transition-all duration-500"
            style={{ backgroundColor: currentAura.replace('0.4', '0.15') }}
          >
             <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: currentAura.replace('0.4', '1'), color: currentAura.replace('0.4', '1') }} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                Aura Lock: {contexts.find(c => c.id === activeContext)?.name} <span className="opacity-50 ml-1">({lockedApp})</span>
             </span>
          </motion.div>
        )}
      </AnimatePresence>

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
      <LeftRail />


      {/* Main Command Stage */}
      <MainCommandStage contexts={contexts} activeContext={activeContext} lastSync={lastSync} marketIntel={marketIntel} resolveNeuralIntent={resolveNeuralIntent} isListening={isListening} voiceTranscript={voiceTranscript} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearchIntent={handleSearchIntent} isThinking={isThinking} startVoiceCapture={startVoiceCapture} simMode={simMode} simMetrics={simMetrics} founderMetrics={founderMetrics} cronAgents={cronAgents} setCronAgents={setCronAgents} newAgentTitle={newAgentTitle} setNewAgentTitle={setNewAgentTitle} newAgentPrompt={newAgentPrompt} setNewAgentPrompt={setNewAgentPrompt} bridgeStatus={bridgeStatus} telemetry={telemetry} crateError={crateError} crateName={crateName} setCrateName={setCrateName} saveActiveCrate={saveActiveCrate} scanActiveWindows={scanActiveWindows} suggestCrateName={suggestCrateName} importCrate={importCrate} crateBusy={crateBusy} activeWindows={activeWindows} contextCrates={contextCrates} editingCrate={editingCrate} setEditingCrate={setEditingCrate} exportCrate={exportCrate} deleteContextCrate={deleteContextCrate} launchContextCrate={launchContextCrate} handleUpdateCrate={handleUpdateCrate} removeAppFromEditingCrate={removeAppFromEditingCrate} getCrateAppCount={getCrateAppCount} handleContextSwitch={handleContextSwitch} />

      {/* OVERLAYS */}
      <OverlayManager 
        vaultNodes={vaultNodes} setVaultNodes={setVaultNodes}
        ragQuery={ragQuery} setRagQuery={setRagQuery}
        ragAnswer={ragAnswer} setRagAnswer={setRagAnswer}
        isRagging={isRagging} setIsRagging={setIsRagging}
        autostart={autostart} setAutostart={setAutostart}
        simMode={simMode} setSimMode={setSimMode}
        simMetrics={simMetrics} setSimMetrics={setSimMetrics}
        graphData={graphData} mounted={mounted} getNodeColor={getNodeColor}
        contextCrates={contextCrates} launchContextCrate={launchContextCrate}
        setShowVault={setShowVault} analyzeScreen={analyzeScreen}
        isThinking={isThinking} messages={messages} searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} resolveNeuralIntent={resolveNeuralIntent}
        timeline={timeline}
      />

      {/* Floating Holographic Assistant */}
      <HolographicAssistant showAI={showAI} setShowAI={setShowAI} messages={messages} isThinking={isThinking} assistantInput={assistantInput} setAssistantInput={setAssistantInput} handleNeuralSend={handleNeuralSend} />
      
      {/* Real Terminal Sandbox — controlled by Zustand + sidebar icon */}
      <TerminalPanel isOpen={showTerminal} onClose={() => setShowTerminal(false)} />
      <ClipboardPanel isOpen={showClipboard} onClose={() => setShowClipboard(false)} />

      {/* Guardian Notification HUD */}
      <GuardianHUD proactiveAlert={proactiveAlert} setProactiveAlert={setProactiveAlert} logEvent={logEvent} />
      {/* Global AI Command Palette */}
      <CommandPalette show={showCommandPalette} setShow={setShowCommandPalette} commandInput={commandInput} setCommandInput={setCommandInput} resolveNeuralIntent={resolveNeuralIntent} />
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

      <TimeMachineModal show={showTimeMachine} onClose={() => setShowTimeMachine(false)} memories={photographicMemories} />

      {/* Premium In-App Toast Notification */}
      <PremiumToast toast={toast} setToast={setToast} />
      <VisionScannerOverlay isScanning={isScanningScreen} />
      
      <JarvisOverlay 
        show={showJarvis} 
        onClose={() => setShowJarvis(false)} 
        resolveNeuralIntent={resolveNeuralIntent} 
      />

      {showClickableReality && (
        <ClickableReality onClose={() => setShowClickableReality(false)} />
      )}
    </div>
  );
}
