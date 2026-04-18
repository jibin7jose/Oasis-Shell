import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSystemStore, ChronosSnapshot } from "../../lib/systemStore";
import { cn } from "../../lib/utils";
import { invokeSafe } from "../../lib/tauri";
import { FileText, Clock, HardDrive, Share2, Sparkles, X, Search, Zap, BrainCircuit, RotateCcw, Ghost } from "lucide-react";

const CortexHUD: React.FC = () => {
  const {
    showCortex,
    setShowCortex,
    cortexResults,
    setCortexResults,
    cortexQuery,
    setCortexQuery,
    setNotification,
    chronosHistory,
    travelIndex,
    isTimeTraveling,
    setDynamicGraph,
    setIsTimeTraveling,
    setTravelIndex,
    setFounderMetrics,
    setMarketIntel,
    setVentureIntegrity,
  } = useSystemStore();

  const handleCortexSearch = async () => {
    if (!cortexQuery.trim()) return;
    try {
      const results: any[] = await invokeSafe("search_semantic_nodes", { query: cortexQuery });
      setCortexResults(results || []);
      setNotification(`Neural Search: Found ${results?.length || 0} semantic matches.`);
    } catch (err) {
      console.error("Cortex Search Failure:", err);
    }
  };

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

  const handleReferenceNode = (path: string) => {
    navigator.clipboard.writeText(path);
    setNotification("Neural Node Reference Copied to Clipboard.");
  };

  const handleAnalyzeNode = async (res: any) => {
    try {
      setNotification(`Neuralizing Node: ${res.filename}...`);
      // We can trigger an AI brief manifestation here
      await invokeSafe("generate_venture_synthesis", { 
        context: `Analyzing neural node: ${res.filename} (${res.filepath}). Content preview: ${res.preview}` 
      });
      setNotification("Strategic Insight Manifested in Foundry.");
      setShowCortex(false); // Close to view synthesis
    } catch (err) {
      setNotification("Neuralization Failure. Check LLM Bridge.");
    }
  };

  const handleResuscitate = async () => {
    if (travelIndex < 0 || !chronosHistory[travelIndex]) return;
    try {
      setNotification("Initiating Temporal Resuscitation...");
      const snap = chronosHistory[travelIndex];
      await invokeSafe("resuscitate_ghost_snapshot", { windows: snap.windows || [] });
      setNotification("System Resuscitation Complete: Windows manifest restored.");
      logEvent(`System Resuscitation Manifested for snapshot vector ${snap.timestamp}`, "system");
    } catch (err) {
      setNotification("Resuscitation Failure: OS Link Refused.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
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
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3 block animate-pulse">
                  Neural Cortex Scan Active
                </span>
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Semantic Intelligence HUD</h2>
              </div>

              <div className="flex-1 max-w-xl mx-16">
                <div className="flex items-center glass-bright rounded-3xl px-8 py-5 border-indigo-500/30">
                  <Search className="w-6 h-6 text-indigo-400 mr-4" />
                  <input
                    value={cortexQuery}
                    onChange={(e) => setCortexQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCortexSearch()}
                    placeholder="Search Semantic Neural Cortex..."
                    className="bg-transparent border-none outline-none text-white w-full font-bold placeholder:text-slate-600 text-lg"
                  />
                  <button onClick={handleCortexSearch} className="text-indigo-400 hover:text-white transition-colors">
                    <Zap size={22} fill={cortexQuery.length > 0 ? "currentColor" : "none"} />
                  </button>
                </div>
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
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                          Aura Relevance: {(res.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-10">
                      <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-all">
                        <BrainCircuit className="w-10 h-10 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-indigo-400 transition-colors">
                          {res.filename}
                        </h3>
                        <div className="flex items-center gap-6 mb-6">
                          <p className="text-xs font-mono text-slate-500 border-l-2 border-indigo-500/20 pl-4 truncate max-w-sm">
                            {res.filepath}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                            <Clock size={12} className="text-indigo-500/50" />
                            {res.last_modified}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                            <HardDrive size={12} className="text-emerald-500/50" />
                            {formatSize(res.size)}
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium bg-white/5 p-6 rounded-2xl italic">
                          "{res.preview}"
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                      <button 
                        onClick={() => handleAnalyzeNode(res)}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                      >
                        <Sparkles size={14} /> Analyze Node
                      </button>
                      <button 
                        onClick={() => handleReferenceNode(res.filepath)}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                      >
                        <Share2 size={14} /> Reference
                      </button>
                      <button className="px-8 py-3 opacity-20 cursor-not-allowed text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                        Native View
                      </button>
                    </div>
                  </motion.div>
                ))}

                {cortexResults.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-40 opacity-20 text-center">
                    <BrainCircuit className="w-24 h-24 text-white mb-8 mx-auto animate-pulse" />
                    <span className="text-xl font-black uppercase tracking-[0.5em] text-white">
                      No Semantic Matches In Cohort
                    </span>
                  </div>
                )}
              </div>
            </div>

            <footer className="p-10 border-t border-white/5 bg-black/20 text-center flex flex-col items-center gap-6">
              {chronosHistory.length > 0 && (
                <div className="w-full max-w-4xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", isTimeTraveling ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isTimeTraveling ? "Chronos: Temporal View Active" : "Chronos: Real-Time Stream"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{chronosHistory.length} Snapshots Archived</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max={chronosHistory.length - 1}
                    value={travelIndex}
                    onChange={(e) => handleTimeTravel(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                  />
                  <div className="flex justify-between mt-2 px-1">
                    <span className="text-[9px] font-black text-slate-600 uppercase">Live</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase">Archival Origin</span>
                  </div>
                  {isTimeTraveling && (
                    <div className="mt-8 flex justify-center">
                       <button 
                         onClick={handleResuscitate}
                         className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-amber-900/40 flex items-center gap-3 group"
                       >
                         <RotateCcw size={16} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                         Resuscitate System State
                       </button>
                    </div>
                  )}
                </div>
              )}

              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                Oasis Shell Framework / Semantic Intelligence Engine V0.1.2_ALPHA
              </span>
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
  );
};

export default CortexHUD;
