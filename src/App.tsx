import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Search, LayoutDashboard, FolderOpen, Activity,
  Settings, Zap, BrainCircuit, Shield, Terminal,
  Plus, Activity as PulseIcon, UploadCloud, Eye, Mic, MicOff, Clock, Image as ImageIcon
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
  const [isScanningScreen, setIsScanningScreen] = useState(false);
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
  const [showTimeMachine, setShowTimeMachine] = useState(false);
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
      } catch (e) {
        console.error("Failed to start memory agent:", e);
      }
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
      else if (q.includes("create") || q.includes("architect") || q.includes("build module")) {
        const title = query.replace(/create|architect|build module/gi, "").trim() || "New Dynamic Module";
        setDynamicModules(prev => [
          ...prev,
          { id: Date.now().toString(), title, type: 'manifested', content: `Autonomous architect manifested this module. Ready for ${title} integration.` }
        ]);
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
    setIsScanningScreen(true);
    try {
      const base64Image = await invoke("capture_screenshot") as string;
      const visionResult = await invoke("query_vision", { 
        imageBase64: base64Image, 
        prompt: "You are the Oasis Kernel. Describe precisely what the user is working on right now based on this screenshot of their desktop. Keep it concise." 
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
            { id: 'time', icon: Clock, label: 'Timeline' },
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
            className={cn(
              "w-full max-w-2xl rounded-[2.5rem] p-6 shadow-3xl transition-all duration-500 mb-12 relative overflow-hidden",
              isListening ? "glass bg-cyan-900/30 border border-cyan-500/40 shadow-[0_0_50px_rgba(34,211,238,0.15)]" : "glass-bright border border-white/5 hover:border-white/10"
            )}
          >
            {/* Voice Wave Animation Background */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                >
                  <div className="absolute w-96 h-96 bg-cyan-500/30 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '2s' }} />
                  <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent animate-ping opacity-50" style={{ animationDuration: '3s' }} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-5 px-4 py-2 relative z-10">
              {isListening ? (
                <Mic className="w-7 h-7 text-cyan-400 animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              ) : (
                <Search className={cn("w-7 h-7 transition-colors", isThinking ? "text-indigo-400 animate-pulse drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "text-slate-600")} />
              )}
              
              <input
                value={isListening ? voiceTranscript : searchQuery}
                onChange={(e) => !isListening && setSearchQuery(e.target.value)}
                onKeyDown={handleSearchIntent}
                placeholder={isListening ? "Listening... Speak your directive." : "Detecting Neural Intent..."}
                className={cn(
                  "bg-transparent border-none outline-none text-2xl w-full font-light transition-colors tracking-wide", 
                  isListening ? "text-cyan-100 placeholder:text-cyan-500/60" : "text-white placeholder:text-slate-700"
                )}
                readOnly={isListening}
              />
              
              {/* Voice Engine Mic Button */}
              <button
                onClick={startVoiceCapture}
                title="Activate Voice Command Engine"
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 flex-shrink-0 group",
                  isListening
                    ? "bg-cyan-500/20 border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] text-cyan-300"
                    : "bg-white/5 border border-white/10 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                )}
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full border border-cyan-400 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <span className="absolute inset-0 rounded-full border border-cyan-300 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                  </>
                )}
                {isListening ? (
                  <div className="flex items-center gap-[3px] h-4">
                    <div className="w-[3px] h-3 bg-cyan-400 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
                    <div className="w-[3px] h-4 bg-cyan-400 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '150ms' }} />
                    <div className="w-[3px] h-2 bg-cyan-400 rounded-full animate-[bounce_1s_infinite]" style={{ animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />
                )}
              </button>
              {!isListening && <kbd className="hidden md:flex bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enter</kbd>}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl overflow-hidden">
            {/* Ambient Nebula Glows */}
            <div className="absolute top-1/3 left-1/4 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/3 right-1/4 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            
            {/* Control Panel Overlay */}
            <div className="absolute top-10 left-10 z-[210] p-8 glass-bright border border-white/10 rounded-[2.5rem] w-80 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-xl pointer-events-auto">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                   <BrainCircuit className="w-6 h-6 text-indigo-400" />
                 </div>
                 <h2 className="text-xl font-bold text-white tracking-wide">Strategic Cortex</h2>
               </div>
               <p className="text-xs text-indigo-200/60 leading-relaxed mb-8">
                 Real-time visualization of your neural contexts, workspace dependencies, and knowledge architecture.
               </p>
               <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Nodes</span>
                   <span className="text-sm font-mono text-indigo-400">{graphData.nodes.length}</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural Links</span>
                   <span className="text-sm font-mono text-cyan-400">{graphData.links.length}</span>
                 </div>
               </div>
               
               <div className="mt-8 pt-6 border-t border-white/5">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Telemetry Online
                 </span>
               </div>
            </div>

            <button onClick={() => setShowGraph(false)} className="absolute top-10 right-10 z-[210] group flex items-center gap-3 px-6 py-3 glass rounded-2xl text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] pointer-events-auto">
               <span className="text-xs font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">Exit Cortex</span>
               <Plus className="w-6 h-6 rotate-45 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-90" />
            </button>

            <div className="w-full h-full relative z-[205] cursor-move">
              {mounted && (
                <ForceGraph3D
                  graphData={graphData}
                  backgroundColor="#00000000"
                  nodeRelSize={simMode ? 12 : 12}
                  nodeColor={getNodeColor}
                  nodeLabel="id"
                  linkColor={() => simMode ? "rgba(245, 158, 11, 0.4)" : "rgba(99, 102, 241, 0.4)"}
                  linkWidth={2}
                  nodeOpacity={0.9}
                  linkOpacity={0.4}
                />
              )}
            </div>
          </motion.div>
        )}

        {showVault && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-3xl p-10 md:p-20 flex flex-col pt-10 overflow-hidden">
            {/* Background Vault Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Foundry Protocol Activated</span>
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tighter flex items-center gap-4">
                  <FolderOpen className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" /> Sentient Vault
                </h2>
              </div>
              <button onClick={() => setShowVault(false)} className="group flex items-center gap-3 px-6 py-3 glass rounded-2xl text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                 <span className="text-xs font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">Close</span>
                 <Plus className="w-6 h-6 rotate-45 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-90" />
              </button>
            </div>
            
            <div className="w-full max-w-5xl mx-auto mb-12 relative z-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="pl-6 text-indigo-400">
                    <Search className="w-6 h-6" />
                  </div>
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
                     placeholder="Query the Sentient Vault (e.g., 'Extract Q3 metrics from reports')"
                     className="w-full bg-transparent px-6 py-6 text-xl font-light text-white placeholder:text-slate-500 outline-none transition-all"
                  />
                  {isRagging && (
                    <div className="pr-6">
                      <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {ragAnswer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="w-full max-w-5xl mx-auto mb-12 relative z-10 overflow-hidden"
                >
                   <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl backdrop-blur-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)] relative mt-4">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
                     <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-3">
                       <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-indigo-400"><BrainCircuit className="w-4 h-4" /></div> AI Synthesis
                     </h3>
                     <p className="text-lg text-indigo-50 font-light leading-relaxed whitespace-pre-wrap">{ragAnswer}</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto custom-scrollbar pr-4 pb-20 relative z-10">
              {vaultNodes.map((node, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  key={node.name} 
                  className="glass-bright p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.02] transition-all duration-300 group flex flex-col justify-between aspect-square relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className={cn("p-4 rounded-2xl shadow-inner", node.category === 'Strategic' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : node.category === 'Technical' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20")}>
                      <Shield className="w-7 h-7" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full border border-white/5">{node.size}</span>
                  </div>
                  
                  <div className="relative z-10 mt-8">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest block mb-2", node.category === 'Strategic' ? "text-amber-400/80" : node.category === 'Technical' ? "text-indigo-400/80" : "text-purple-400/80")}>
                      {node.category} Node
                    </span>
                    <h4 className="text-xl font-bold text-white leading-tight mb-4 line-clamp-2">{node.name}</h4>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-indigo-400 transition-colors">Access</button>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <button className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-indigo-400 transition-colors">Vectorize</button>
                    </div>
                  </div>
                </motion.div>
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
              className="fixed top-0 left-0 right-0 h-[65vh] z-[300] bg-black/80 backdrop-blur-3xl border-b border-indigo-500/30 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.6),0_10px_30px_rgba(99,102,241,0.2)] overflow-hidden"
            >
              {/* Terminal Ambient Glows */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Terminal Header */}
              <div className="flex items-center justify-between px-10 py-5 border-b border-white/10 bg-gradient-to-r from-black/60 via-indigo-950/20 to-black/60 relative z-10 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Terminal className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Foundry Command Center
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Kernel v0.1.0-alpha • Secure Neural Link</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={analyzeScreen} disabled={isThinking} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 rounded-xl border border-indigo-500/20 disabled:opacity-40 transition-all text-xs font-bold uppercase tracking-widest group shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" /> Trigger Vision Scan
                  </button>
                  <button onClick={() => setShowTerminal(false)} className="text-slate-400 hover:text-white p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
                    <Plus className="w-6 h-6 rotate-45 opacity-70 group-hover:opacity-100 group-hover:rotate-90 transition-all" />
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-6 relative z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:100px_100px] opacity-90 mix-blend-overlay flex flex-col">
                <div className="flex-1 flex flex-col justify-end space-y-6">
                  {messages.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className={cn("flex flex-col max-w-4xl", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest", msg.role === 'user' ? "text-indigo-400" : "text-purple-400")}>
                          {msg.role === 'user' ? 'Operator Directive' : 'Oasis Kernel Synthesized'}
                        </span>
                        {msg.role !== 'user' && <BrainCircuit className="w-3 h-3 text-purple-400" />}
                      </div>
                      <div className={cn(
                        "p-5 rounded-3xl text-sm font-mono whitespace-pre-wrap leading-relaxed shadow-lg relative overflow-hidden group",
                        msg.role === 'user' 
                          ? "bg-indigo-600/90 text-indigo-50 border border-indigo-400/30 rounded-tr-sm shadow-indigo-600/20" 
                          : "bg-black/40 text-purple-100 border border-purple-500/20 rounded-tl-sm backdrop-blur-md",
                        msg.content.includes("Analyze my screen") && "border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] bg-cyan-900/40"
                      )}>
                        {msg.role !== 'user' && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-indigo-500 opacity-50" />}
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isThinking && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col max-w-4xl mr-auto items-start">
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Oasis Kernel Processing <Activity className="w-3 h-3 animate-spin" />
                      </span>
                      <div className="flex items-center gap-2 p-5 bg-black/40 rounded-3xl rounded-tl-sm border border-purple-500/20 backdrop-blur-md">
                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{ animationDelay: '0.15s' }} />
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ animationDelay: '0.3s' }} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Terminal Input */}
              <div className="p-8 bg-gradient-to-b from-transparent to-black/80 border-t border-indigo-500/20 relative z-20 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                  <div className="relative flex items-center bg-black/60 border border-indigo-500/30 rounded-xl overflow-hidden shadow-2xl">
                    <span className="absolute left-6 text-indigo-400 font-mono font-bold flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> <span className="animate-pulse">❯</span>
                    </span>
                    <input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          resolveNeuralIntent(searchQuery);
                        }
                      }}
                      placeholder="Enter neural directive or execute system command..."
                      className="w-full bg-transparent py-5 pl-16 pr-8 text-indigo-50 font-mono text-sm outline-none transition-all placeholder:text-indigo-400/40"
                    />
                    <kbd className="absolute right-6 hidden md:flex bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-[9px] font-bold text-indigo-300 uppercase tracking-widest shadow-inner">Enter</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showLogs && (
          <motion.div initial={{ opacity: 0, x: 500 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-y-0 right-0 z-[400] w-[450px] bg-black/80 border-l border-white/5 p-12 backdrop-blur-3xl flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.6)]">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Activity className="w-3 h-3 animate-pulse" /> Foundry Ledger</span>
                <h2 className="text-3xl font-black text-white tracking-tighter">Cognitive Timeline</h2>
              </div>
              <button onClick={() => setShowLogs(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <div className="flex-1 relative overflow-y-auto custom-scrollbar pr-4 z-10">
              <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent" />
              <div className="space-y-8 pb-10">
                {timeline.map((event, i) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={event.id} className="relative pl-12 group">
                    <div className={cn("absolute left-0 w-8 h-8 rounded-full border-4 border-black flex items-center justify-center z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110", event.type === 'neural' ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : event.type === 'deploy' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-slate-600")}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                    <div className="glass-bright p-5 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 group-hover:bg-white/[0.03] transition-all relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-center mb-3 relative z-10">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-500" /> {event.time}</span>
                        <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border",
                          event.type === 'neural' ? "text-indigo-300 bg-indigo-500/10 border-indigo-500/20" :
                            event.type === 'deploy' ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" :
                              "text-slate-300 bg-slate-500/10 border-slate-500/20"
                        )}>{event.type}</span>
                      </div>
                      <p className="text-sm text-slate-200 font-light leading-relaxed relative z-10">{event.event}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div initial={{ opacity: 0, x: -500 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -500 }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-y-0 left-0 z-[400] w-[450px] bg-black/80 border-r border-white/5 p-12 backdrop-blur-3xl flex flex-col shadow-[30px_0_60px_rgba(0,0,0,0.6)]">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/10 via-transparent to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Settings className="w-3 h-3 animate-[spin_4s_linear_infinite]" /> System Configuration</span>
                <h2 className="text-3xl font-black text-white tracking-tighter">Kernel Settings</h2>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-12 h-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            
            <div className="flex-1 space-y-10 overflow-y-auto custom-scrollbar pr-4 z-10 pb-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Local AI Engine</h3>
                <div className="p-5 glass-bright rounded-3xl border border-white/5 space-y-4 hover:border-purple-500/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-purple-400" /> Inference Model</span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1.5 rounded-lg border border-purple-500/20 shadow-inner">gemma3:4b</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Embedding Model</span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 shadow-inner">nomic-embed-text</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Sentient Vault (Vector DB)</h3>
                <div className="p-5 glass-bright rounded-3xl border border-white/5 flex flex-col gap-5 hover:border-indigo-500/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white flex items-center gap-2"><FolderOpen className="w-4 h-4 text-indigo-400" /> Indexed Nodes</span>
                    <span className="text-[11px] font-bold text-slate-200 bg-white/5 px-3 py-1 rounded-lg border border-white/10">{vaultNodes.length} Files</span>
                  </div>
                  <button className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all border border-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    Purge All Vector Data
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hardware Telemetry Node</h3>
                <div className="p-5 glass-bright rounded-3xl border border-white/5 space-y-4 hover:border-cyan-500/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white flex items-center gap-2"><PulseIcon className="w-4 h-4 text-cyan-400" /> Polling Rate</span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1.5 rounded-lg border border-cyan-500/20">2000ms</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white flex items-center gap-2"><Shield className="w-4 h-4 text-slate-400" /> Background Process</span>
                    <div className="w-10 h-5 bg-cyan-500/20 border border-cyan-500/30 rounded-full relative shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                      <div className="absolute right-1 top-0.5 w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">System Boot Sequence</h3>
                <div className="p-5 glass-bright rounded-3xl border border-white/5 space-y-3 hover:border-white/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white">Initialize Oasis on Windows Startup</span>
                    <button 
                      onClick={async () => {
                        try {
                          if (autostart) { await disable(); setAutostart(false); }
                          else { await enable(); setAutostart(true); }
                        } catch(e) { console.error("Autostart Error:", e); }
                      }}
                      className={cn("w-12 h-6 rounded-full relative transition-all duration-300", autostart ? "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-white/10 border border-white/5")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md duration-300", autostart ? "left-7" : "left-1")} />
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
            className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-3xl glass-bright rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden border border-white/10 flex flex-col relative"
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />
              
              <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5 relative z-10 bg-black/20">
                <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
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
                    if (e.key === 'Escape') {
                      setShowCommandPalette(false);
                    }
                  }}
                  className="w-full bg-transparent border-none outline-none text-white text-xl font-light placeholder:text-slate-500/70"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 uppercase shadow-inner">Enter</kbd>
                  <kbd className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 uppercase shadow-inner">Esc</kbd>
                </div>
              </div>
              
              {/* Command Palette Suggestions */}
              <div className="p-4 bg-black/40 backdrop-blur-md relative z-10 flex flex-col gap-1">
                 <div className="px-4 py-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Suggested Directives</div>
                 {[
                   { icon: Terminal, label: 'Review code and push to origin', type: 'Git Automation' },
                   { icon: Shield, label: 'Access Technical Vault Nodes', type: 'Foundry Protocol' },
                   { icon: Eye, label: 'Trigger Omniscient Vision Scan', type: 'System Capability' }
                 ].map((suggestion, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => {
                        resolveNeuralIntent(suggestion.label);
                        setCommandInput("");
                        setShowCommandPalette(false);
                     }}
                     className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-indigo-500/20 group transition-all text-left border border-transparent hover:border-indigo-500/30"
                   >
                     <div className="flex items-center gap-4">
                       <div className="p-2 bg-white/5 group-hover:bg-indigo-500/30 rounded-lg border border-white/5 group-hover:border-indigo-400/50 transition-colors">
                         <suggestion.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 transition-colors" />
                       </div>
                       <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{suggestion.label}</span>
                     </div>
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{suggestion.type}</span>
                   </button>
                 ))}
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

      {/* Memory Time-Machine Modal */}
      <AnimatePresence>
        {showTimeMachine && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl"
          >
            <div className="w-full max-w-6xl h-[90vh] glass-bright rounded-[2rem] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.15)] relative">
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] grayscale mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
              
              {/* Vibrant Ambient Glows */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

              <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between z-10 bg-black/20">
                <div className="flex items-center gap-5">
                  <motion.div 
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", duration: 1 }}
                    className="p-4 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl text-purple-400 shadow-inner shadow-white/5 border border-white/10"
                  >
                    <Clock className="w-8 h-8" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                      Photographic Memory
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs tracking-widest uppercase border border-purple-500/30">Live Sync</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-1.5 font-medium">Autonomous cognitive snapshots of your digital workflow over time.</p>
                  </div>
                </div>
                <button onClick={() => setShowTimeMachine(false)} className="group flex items-center gap-2 text-slate-400 hover:text-white px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest text-xs font-bold border border-white/5 hover:border-white/10">
                  <span>Close</span>
                  <span className="opacity-50 group-hover:opacity-100">[ESC]</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar z-10">
                {photographicMemories.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-slate-500"
                  >
                    <div className="relative">
                      <ImageIcon className="w-24 h-24 mb-6 opacity-20" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">No Memories Recorded</h3>
                    <p className="text-sm opacity-60 max-w-sm text-center">The Sentient OS hasn't captured any visual context snapshots yet. Let it run in the background to build your timeline.</p>
                  </motion.div>
                ) : (
                  <div className="relative border-l-2 border-white/10 ml-8 pl-10 flex flex-col gap-12 pb-20">
                    {photographicMemories.map((mem, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4, type: "spring" }}
                        key={mem.id} 
                        className="relative group"
                      >
                        {/* Interactive Timeline Node */}
                        <div className="absolute -left-[49px] top-2 w-4 h-4 rounded-full bg-[#020617] border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-150 group-hover:border-white transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] z-20" />
                        
                        {/* Timeline connecting line glow on hover */}
                        <div className="absolute -left-[42px] top-6 bottom-[-48px] w-0.5 bg-gradient-to-b from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-white font-bold tracking-widest text-sm bg-purple-600/40 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/50 backdrop-blur-md">
                            {mem.timestamp}
                          </span>
                          <span className="text-slate-400 text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 bg-white/5 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Visual Context
                          </span>
                        </div>
                        
                        <div className="glass p-8 rounded-3xl border border-white/5 group-hover:border-purple-500/40 group-hover:bg-white/[0.04] transition-all duration-500 relative overflow-hidden shadow-lg hover:shadow-purple-900/20">
                           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                           
                           <p className="text-slate-300 leading-relaxed font-normal text-sm whitespace-pre-wrap relative z-10">
                            {mem.description}
                           </p>
                           
                           <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3 relative z-10">
                             <button className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold tracking-widest uppercase text-purple-300 transition-all flex items-center gap-2 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                               <Search className="w-4 h-4" /> Deep Dive
                             </button>
                             <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold tracking-widest uppercase text-slate-300 transition-all flex items-center gap-2 border border-white/5 hover:border-white/10">
                               <FolderOpen className="w-4 h-4" /> Restore Workspace
                             </button>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium In-App Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-10 right-10 z-[2000] w-96 glass-bright rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.2)] overflow-hidden group"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none" />
            
            <div className="p-5 flex items-start gap-4 relative z-10">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl text-indigo-400 border border-indigo-500/30 shadow-inner">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-white font-bold tracking-widest text-xs uppercase">{toast.title}</h4>
                <p className="text-slate-300 text-sm mt-1.5 leading-relaxed font-medium">{toast.body}</p>
              </div>
              <button 
                onClick={() => setToast(null)} 
                className="text-slate-400 hover:text-white transition-all p-1.5 bg-white/5 hover:bg-white/20 rounded-lg border border-transparent hover:border-white/10"
              >
                 <span className="text-xs font-bold px-1">✕</span>
              </button>
            </div>
            
            {/* Animated Countdown Progress Bar */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vision Inference Scanner Overlay */}
      <AnimatePresence>
        {isScanningScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] pointer-events-none flex flex-col items-center justify-center overflow-hidden"
          >
            {/* The scanning laser line */}
            <motion.div 
              initial={{ y: "-50vh" }}
              animate={{ y: "50vh" }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_30px_10px_rgba(34,211,238,0.5)] z-[3001]"
            />
            {/* Scan Overlay background */}
            <div className="absolute inset-0 bg-cyan-900/10 backdrop-blur-[2px] mix-blend-overlay" />
            
            {/* Scanner HUD target */}
            <div className="relative z-[3002] border border-cyan-500/50 rounded-3xl p-12 bg-black/40 backdrop-blur-md flex flex-col items-center">
               <Eye className="w-16 h-16 text-cyan-400 mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
               <h3 className="text-2xl font-bold text-white tracking-widest uppercase shadow-black drop-shadow-md">Omniscient Vision</h3>
               <p className="text-cyan-300 font-mono text-sm mt-2 flex items-center gap-2">
                 <Activity className="w-4 h-4 animate-spin" /> Analyzing Pixel Matrix...
               </p>
               
               {/* Corner brackets */}
               <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl" />
               <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl" />
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl" />
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
