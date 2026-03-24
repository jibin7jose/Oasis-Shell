import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Code, Gamepad2, Globe, Settings, Search, Plus, Monitor, MessageSquare, Bot, RefreshCw, CheckCircle2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { cn } from "./lib/utils";

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

function App() {
  const [activeContext, setActiveContext] = useState("dev");
  const [searchQuery, setSearchQuery] = useState("");
  const [windowCount, setWindowCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState("Crates");
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [autoPulse, setAutoPulse] = useState(false);
  const [pulseInterval] = useState(15); // minutes
  const [crates, setCrates] = useState<any[]>([]);

  const repoUrl = "https://github.com/jibin7jose/Oasis-Shell.git";

  const fetchCrates = async () => {
    try {
      const data: any[] = await invoke("get_crates");
      setCrates(data.map(c => ({
        ...c,
        apps: JSON.parse(c.apps)
      })));
    } catch (e) {
      console.error("Failed to fetch crates", e);
    }
  };

  const createCrate = async () => {
    const name = prompt("Enter a name for your new Context Crate:");
    if (!name) return;

    try {
      const currentWindows = await invoke("get_running_windows");
      await invoke("save_crate", { name, apps: currentWindows });
      fetchCrates();
    } catch (e) {
      console.error("Failed to create crate", e);
    }
  };

  const launchCrate = async (id: number) => {
    try {
      await invoke("launch_crate", { id });
      setShowSettings(false);
    } catch (e) {
      console.error("Failed to launch crate", e);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus("idle");
    try {
      await invoke("sync_project");
      setSyncStatus("success");
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Sync failed", error);
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
    }
  };
  useEffect(() => {
    if (showSettings) {
      fetchCrates();
    }
  }, [showSettings]);

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

      // 2. Crate Intent
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
            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl group-focus-within:bg-blue-500/20 transition-all duration-500" />
            <div className="relative flex items-center bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 transition-all duration-300 group-focus-within:border-blue-500/40">
              <Search className="w-5 h-5 text-slate-400 mr-4" />
              <input 
                type="text" 
                placeholder="What are we doing today?"
                className="bg-transparent border-none outline-none w-full text-lg placeholder:text-slate-500"
                value={searchQuery}
                onKeyDown={handleSearchIntent}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="ml-4 px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase tracking-widest font-bold text-slate-500">
                Alt + Space
              </div>
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
                  onClick={() => setActiveContext(ctx.id)}
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
              onClick={() => setShowSettings(true)}
              className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl hover:bg-white/5 border border-dashed border-white/10 group"
            >
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-slate-300" />
            </motion.button>
          </div>
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
                    {["Crates", "AI Settings", "Appearance", "Oasis Pulse"].map(item => (
                      <button 
                        key={item} 
                        onClick={() => setActiveSettingTab(item)}
                        className={cn(
                        "text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                        activeSettingTab === item ? "bg-blue-500/10 text-blue-400" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                      )}>
                        {item === "Oasis Pulse" && <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />}
                        {item}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 overflow-y-auto">
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
          <div>Oasis v0.1.0-alpha</div>
        </motion.div>

        {/* AI Assistant Bubble */}
        <div className="fixed bottom-10 right-10 flex flex-col items-end gap-4 z-50">
          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="w-80 h-96 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold">Neural Intent Engine</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  <div className="bg-white/5 p-3 rounded-xl text-sm max-w-[80%]">
                    Hello! I'm ready to manage your contexts. What would you like to do?
                  </div>
                </div>
                <div className="p-4">
                  <input 
                    type="text" 
                    placeholder="Type a command..."
                    className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500/50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAI(!showAI)}
            className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 text-white"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default App;
