import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Shield, Activity as PulseIcon, Mic, Search, Bot, Briefcase, Plus, FolderOpen, Save, Settings, UploadCloud } from 'lucide-react';
import SystemPanel from '../panels/SystemPanel';
import { FileExplorerPanel } from '../panels/FileExplorerPanel';
import { StoragePanel } from '../panels/StoragePanel';
import BoardroomPanel from '../panels/BoardroomPanel';
import DocumentationPanel from '../panels/DocumentationPanel';
import { CognitiveTimeline } from '../panels/CognitiveTimeline';

import { useSystemStore } from '../../lib/systemStore';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export const MainCommandStage = (props: any) => {
  const { activeView, setActiveView, activeGolems } = useSystemStore();
  const {
    contexts, activeContext, lastSync, marketIntel, resolveNeuralIntent, isListening,
    voiceTranscript, searchQuery, setSearchQuery, handleSearchIntent, isThinking,
    startVoiceCapture, simMode, simMetrics, founderMetrics, cronAgents, setCronAgents,
    newAgentTitle, setNewAgentTitle, newAgentPrompt, setNewAgentPrompt, bridgeStatus,
    telemetry, crateError, crateName, setCrateName, saveActiveCrate, crateBusy,
    activeWindows, contextCrates, editingCrate, setEditingCrate, exportCrate,
    deleteContextCrate, launchContextCrate, handleUpdateCrate, removeAppFromEditingCrate,
    getCrateAppCount, handleContextSwitch, scanActiveWindows, suggestCrateName, importCrate
  } = props;

  React.useEffect(() => {
    let unlisten: any;
    const setup = async () => {
        try {
            const { invokeSafe } = await import('../../lib/tauri');
            const golems = await invokeSafe("get_active_golems");
            useSystemStore.getState().setActiveGolems(golems as any[]);
            const { listen } = await import('@tauri-apps/api/event');
            unlisten = await listen("oasis-golem-telemetry", (event: any) => {
                useSystemStore.getState().setActiveGolems(event.payload);
            });
        } catch (e) { console.error("Telemetry bridge failed", e); }
    };
    setup();
    return () => { if (unlisten) unlisten(); };
  }, []);

  return (
      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">

        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto no-scrollbar">
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
                id="neural-input"
                value={isListening ? voiceTranscript : searchQuery}
                onChange={(e) => !isListening && setSearchQuery(e.target.value)}
                onKeyDown={handleSearchIntent}
                placeholder={isListening ? "Listening... Speak your directive." : "Detecting Neural Intent..."}
                className={cn(
                  "bg-transparent border-none outline-none text-2xl w-full h-full py-2 font-light transition-colors tracking-wide", 
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

          {/* DYNAMIC VIEWS */}
          {activeView === 'dash' && (
            <>


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
                onClick={async () => {
                  if(newAgentTitle && newAgentPrompt) {
                    try {
                      const { invokeSafe } = await import('../../lib/tauri');
                      await invokeSafe("hatch_autonomous_golem", { 
                          name: newAgentTitle, 
                          mission: newAgentPrompt, 
                          aura: "indigo" 
                      });
                      setNewAgentTitle("");
                      setNewAgentPrompt("");
                    } catch (e) {
                      console.error("Failed to hatch golem", e);
                    }
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
              {activeGolems.map((agent: any) => (
                <motion.div
                  key={agent.id}
                  className={cn(
                    "glass rounded-[2rem] p-8 border relative overflow-hidden group min-h-[280px] flex flex-col justify-between transition-all duration-500",
                    "border-purple-500/40 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 blur-[50px] transition-all",
                    "bg-purple-500/20"
                  )} />
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={cn("w-3 h-3 rounded-full animate-pulse", "bg-purple-400")} />
                      <h3 className="text-lg font-bold tracking-tight text-white">{agent.name}</h3>
                    </div>
                    <button 
                      onClick={async () => {
                        const { invokeSafe } = await import('../../lib/tauri');
                        await invokeSafe("decommission_golem", { id: agent.id });
                      }}
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all border",
                        "text-red-400 bg-red-400/10 border-red-500/20 hover:bg-red-400/20"
                      )}
                    >
                      Halt
                    </button>
                  </div>

                  <div className="flex-1 space-y-4 relative z-10">
                    <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
                      <p className="text-sm text-slate-300 leading-relaxed font-mono">
                        <span className="text-purple-400 font-bold block mb-2 text-[10px] uppercase tracking-widest">Directive:</span> 
                        {agent.mission}
                      </p>
                    </div>
                    
                    {agent.thought_trace && (
                      <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/10">
                        <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar">
                          <span className="text-emerald-400 font-bold block mb-2 text-[10px] uppercase tracking-widest">Thought Trace:</span> 
                          {agent.thought_trace}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
            </>
          )}

          {/* DYNAMIC VIEWS */}
          {activeView === 'processes' && (
            <SystemPanel />
          )}

          {activeView === 'files' && (
            <div className="w-full max-w-5xl flex-1 min-h-[400px] mb-12">
              <FileExplorerPanel />
            </div>
          )}

          {activeView === 'storage' && (
            <div className="w-full max-w-5xl flex-1 min-h-[400px] mb-12">
              <StoragePanel />
            </div>
          )}

          {activeView === 'boardroom' && (
            <div className="w-full max-w-6xl flex-1 min-h-[500px] mb-12 relative z-[60]">
              <BoardroomPanel isOpen={true} onClose={() => setActiveView('dash')} metrics={{ revenue: 0, burnRate: 0, runway: 12, userGrowth: 0, activeUsers: 0 }} />
            </div>
          )}

          {activeView === 'docs' && (
            <div className="w-full max-w-6xl flex-1 min-h-[500px] mb-12 relative z-[60]">
              <DocumentationPanel isOpen={true} onClose={() => setActiveView('dash')} />
            </div>
          )}

          {activeView === 'timeline' && (
            <div className="w-full max-w-6xl flex-1 min-h-[500px] mb-12 relative z-[60]">
              <CognitiveTimeline show={true} onClose={() => setActiveView('dash')} timeline={[]} />
            </div>
          )}

          {/* Context Crates - Dash View Only */}
          {activeView === 'dash' && (
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
                  {activeWindows.slice(0, 6).map((win: any) => (
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
                {contextCrates.map((crate: any) => {
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
          )}

          <div className="flex gap-8 pb-12">
            {contexts.map((ctx: any) => {
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

  );
};
