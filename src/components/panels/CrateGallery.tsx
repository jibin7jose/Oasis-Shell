import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, X, Zap, Trash2, Clock, Globe, AppWindow, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WindowInfo } from './SystemPanel';

export interface ContextCrate {
  id?: number;
  name: string;
  description: string;
  aura_color: string;
  apps: string; // JSON string of WindowInfo[]
  timestamp: string;
}

interface CrateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  crates: ContextCrate[];
  onLaunch: (id: number) => void;
  onSave: () => void;
  onDelete: (id: number) => void;
  onExport: (id: number) => void;
  isSaving?: boolean;
}

export default function CrateGallery({ 
  isOpen, 
  onClose, 
  crates, 
  onLaunch, 
  onSave, 
  onDelete, 
  onExport,
  isSaving = false 
}: CrateGalleryProps) {
  
  const parseApps = (appsJson: string): WindowInfo[] => {
    try {
      return JSON.parse(appsJson);
    } catch (e) {
      return [];
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[5000] bg-indigo-950/20 backdrop-blur-3xl flex items-center justify-center p-24"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="max-w-6xl w-full h-[80vh] glass-bright border border-indigo-500/30 rounded-[4rem] flex flex-col overflow-hidden shadow-5xl relative"
          >
            {/* DECORATIVE BACKGROUND GLOW */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            
            <header className="px-16 pt-16 pb-10 border-b border-white/5 flex items-center justify-between relative z-10">
              <div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3 block animate-pulse">Neural Workspace Persistence</span>
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Context Crate Gallery</h2>
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className={cn(
                    "px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20",
                    isSaving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Plus className={cn("w-5 h-5", isSaving && "animate-spin")} />
                  {isSaving ? "Crating..." : "Snapshot Workspace"}
                </button>
                <button
                  onClick={onClose}
                  className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
                >
                  <X className="w-8 h-8 text-slate-500 group-hover:text-white transition-colors" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-16 py-12 custom-scrollbar relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {crates.map((crate, i) => {
                  const apps = parseApps(crate.apps);
                  return (
                    <motion.div
                      key={crate.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white/[0.02] p-8 rounded-[3rem] border border-white/5 hover:border-indigo-500/40 transition-all relative overflow-hidden flex flex-col"
                    >
                        <div className="flex gap-2">
                          <button 
                            onClick={() => crate.id && onExport(crate.id)}
                            title="Export Manifest"
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                          >
                            <Globe size={18} />
                          </button>
                          <button 
                            onClick={() => crate.id && onDelete(crate.id)}
                            title="Purge Crate"
                            className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-all">
                          <Box className="w-7 h-7 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-white transition-colors line-clamp-1">{crate.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <Clock size={12} />
                            {new Date(crate.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed mb-6 italic opacity-80 group-hover:opacity-100 transition-opacity">
                        "{crate.description}"
                      </p>

                      <div className="flex-1 space-y-3 mb-8">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Neural Entities</span>
                        <div className="flex flex-wrap gap-2">
                          {apps.slice(0, 4).map((app, idx) => (
                            <div key={idx} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300 font-medium flex items-center gap-2">
                              <AppWindow size={12} className="text-indigo-400/60" />
                              {app.title.length > 20 ? app.title.substring(0, 20) + '...' : app.title}
                            </div>
                          ))}
                          {apps.length > 4 && (
                            <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-black">
                              +{apps.length - 4} MORE
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => crate.id && onLaunch(crate.id)}
                        style={{ boxShadow: `0 0 40px -10px ${crate.aura_color}20` }}
                        className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 scale-0 group-hover:scale-100 transition-all duration-700" style={{ background: `radial-gradient(circle, ${crate.aura_color} 0%, transparent 70%)` }} />
                        <Zap size={18} style={{ color: crate.aura_color }} className="group-hover:animate-pulse" />
                        Restore Environment
                      </button>
                    </motion.div>
                  );
                })}

                {crates.length === 0 && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-20 border-2 border-dashed border-white/10 rounded-[3rem]">
                    <Box className="w-20 h-20 text-white mb-6 animate-pulse" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">No Context Crates Manifested</h3>
                    <p className="text-sm text-slate-400 mt-2">Take a snapshot of your current operating state to begin.</p>
                  </div>
                )}
              </div>
            </div>

            <footer className="p-10 border-t border-white/5 bg-black/20 flex items-center justify-between px-16 relative z-10">
              <div className="flex items-center gap-4">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Oasis Persistent Ledger Sync: OK</span>
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                TOTAL_CRATES: {crates.length} // ALL_SYSTEMS_NOMINAL
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
