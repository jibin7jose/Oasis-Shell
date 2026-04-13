import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Key, 
  FileLock, 
  Unlock, 
  Search,
  AlertTriangle,
  ChevronRight,
  Database,
  Fingerprint
} from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";

interface SentinelVaultProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayHandshake: () => void;
  onPlayNotification: () => void;
  initialAsset?: any;
}

interface EncryptedBlob {
  id: string;
  title: string;
  original_path: string;
  encrypted_path: string;
  timestamp: string;
  aura_intensity: number;
}

interface SentinelLedger {
  blobs: Record<string, EncryptedBlob>;
  security_resonance: number;
}

export default function SentinelVault({ isOpen, onClose, onPlayHandshake, onPlayNotification, initialAsset }: SentinelVaultProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [founderSecret, setFounderSecret] = useState("");
  const [ledger, setLedger] = useState<SentinelLedger | null>(null);
  const [isSealing, setIsSealing] = useState(false);
  const [sealingProgress, setSealingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'vault' | 'logs'>('vault');
  const [scanQuery, setScanQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [assetPath, setAssetPath] = useState("");
  const [assetTitle, setAssetTitle] = useState("");

  const fetchLedger = async () => {
    try {
      const res = await invokeSafe("get_sentinel_ledger") as SentinelLedger;
      setLedger(res);
    } catch (e) {
      console.error("Vault Ledger Sync Failed", e);
    }
  };

  const handleAuthenticate = async () => {
    try {
      setError(null);
      onPlayHandshake();
      await invokeSafe("authenticate_founder", { secret: founderSecret });
      setIsAuthenticated(true);
      onPlayNotification();
      fetchLedger();
    } catch (e: any) {
      setError(e.toString());
      setFounderSecret("");
    }
  };

  const handleSealAsset = async () => {
    if (!assetPath.trim() || !assetTitle.trim()) {
      setError("Provide a real file path and asset title before sealing.");
      return;
    }

    setError(null);
    setIsSealing(true);
    setSealingProgress(0);

    const interval = setInterval(() => {
      setSealingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    try {
      await invokeSafe("seal_strategic_asset", { filePath: assetPath.trim(), title: assetTitle.trim() });
      setTimeout(async () => {
        setIsSealing(false);
        setAssetPath("");
        setAssetTitle("");
      fetchLedger();
        onPlayNotification();
      }, 2500);
    } catch (e: any) {
      setIsSealing(false);
      setError(e.toString());
    }
  };

  const handleUnsealAsset = async (id: string) => {
    try {
      await invokeSafe("unseal_strategic_asset", { blobId: id });
      fetchLedger();
      onPlayNotification();
    } catch (e: any) {
      setError(e.toString());
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchLedger();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (initialAsset) {
      setAssetPath(`C:/Strategic/Inventory/${initialAsset.name.toLowerCase().replace(/\s+/g, '_')}.dat`);
      setAssetTitle(initialAsset.name);
    }
  }, [initialAsset]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[8000] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden"
    >
      <div className="w-full max-w-7xl h-full border border-white/10 rounded-[3rem] bg-[#050505] overflow-hidden flex flex-col relative shadow-[0_0_100px_rgba(0,0,0,1)]">
        {/* Cyber Background elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 pointer-events-none" />

        {/* Header */}
        <header className="px-12 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <ShieldCheck className={`w-8 h-8 ${isAuthenticated ? 'text-indigo-400' : 'text-slate-600'}`} />
                </div>
                {isAuthenticated && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#050505] flex items-center justify-center"
                  >
                    <Activity className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Sentinel Vault</h2>
                 <p className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.4em] mt-1">Zero-Knowledge Strategic Archival Layer</p>
              </div>
           </div>

           <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Vault Integrity</span>
                <span className="text-xl font-black text-white font-mono">{ledger?.security_resonance.toFixed(2) || "0.00"}</span>
              </div>
              <button onClick={onClose} className="p-4 hover:bg-white/5 text-slate-400 hover:text-white rounded-2xl transition-all border border-transparent hover:border-white/10">
                <Unlock className="w-6 h-6" />
              </button>
           </div>
        </header>

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-12 p-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="text-center space-y-4">
                <Lock className="w-16 h-16 text-indigo-500/20 mx-auto" />
                <h3 className="text-2xl font-black text-white uppercase tracking-widest">Authentication Required</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Please provide the founder-level neural key to unlock the Sentinel Archive and access encrypted assets.</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <p className="text-[10px] font-black uppercase tracking-widest">Setup Required</p>
                <p className="text-[10px] leading-relaxed mt-2">Set `OASIS_FOUNDER_SECRET` or `OASIS_MASTER_KEY` in your environment before using Sentinel Vault authentication.</p>
              </div>

              <div className="relative group">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500/40 group-focus-within:text-indigo-400 transition-all" />
                <input 
                  type="password"
                  value={founderSecret}
                  onChange={(e) => setFounderSecret(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                  autoFocus
                  placeholder="ENTER NEURAL HANDSHAKE..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white text-sm font-black tracking-[0.3em] outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                />
              </div>

              {error && (
                <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 text-rose-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-wider leading-relaxed">{error}</span>
                </div>
              )}

              <button 
                onClick={handleAuthenticate}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                Derive Neural Key
              </button>
            </motion.div>

            <div className="absolute bottom-12 text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em] flex items-center gap-4">
              <ShieldAlert className="w-3 h-3" /> Zero Knowledge Lockdown Active
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className="w-80 border-r border-white/5 bg-black/20 p-8 flex flex-col gap-8">
               <div className="space-y-2">
                 <button 
                   onClick={() => setActiveTab('vault')}
                   className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'vault' ? 'bg-indigo-500/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   <Database className="w-5 h-5" />
                   <span className="text-xs font-black uppercase tracking-widest">Asset Ledger</span>
                 </button>
                 <button 
                   onClick={() => setActiveTab('logs')}
                   className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-indigo-500/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   <Fingerprint className="w-5 h-5" />
                   <span className="text-xs font-black uppercase tracking-widest">Audit Logs</span>
                 </button>
               </div>

               <div className="mt-auto p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <Activity className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Resonance OK</span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-bold tracking-tighter">Your session is bound to founder-authorized hardware.</p>
               </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-12 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
               <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="SCAN LEDGER FOR BLOBS..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-6 text-xs text-white font-bold outline-none focus:border-white/20 transition-all"
                      value={scanQuery}
                      onChange={(e) => setScanQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleSealAsset}
                    disabled={isSealing}
                    className="px-8 py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-3"
                  >
                    <FileLock className="w-4 h-4" /> Seal Strategic Asset
                  </button>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Real File Path</label>
                    <input
                      type="text"
                      placeholder="D:\path\to\real-file.pdf"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-xs text-white font-bold outline-none focus:border-indigo-500/40 transition-all"
                      value={assetPath}
                      onChange={(e) => setAssetPath(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Asset Title</label>
                    <input
                      type="text"
                      placeholder="Founder Directive"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-xs text-white font-bold outline-none focus:border-indigo-500/40 transition-all"
                      value={assetTitle}
                      onChange={(e) => setAssetTitle(e.target.value)}
                    />
                  </div>
               </div>

               {error && isAuthenticated && (
                 <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 text-rose-400">
                   <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                   <span className="text-[10px] font-black uppercase tracking-wider leading-relaxed">{error}</span>
                 </div>
               )}

               <AnimatePresence>
                 {isSealing && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] p-10 space-y-6"
                   >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]" />
                           <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Deriving Neural Encryption Key...</span>
                        </div>
                        <span className="text-xs font-mono text-indigo-400">{sealingProgress}%</span>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-indigo-500 shadow-[0_0_20px_#6366f1]" 
                          animate={{ width: `${sealingProgress}%` }}
                        />
                     </div>
                     <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest text-center">AES-256-GCM Handshake in progress</p>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Asset List */}
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Sealed Strategic Assets</h4>
                  
                  {ledger && Object.values(ledger.blobs).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.values(ledger.blobs)
                        .filter(blob => blob.title.toLowerCase().includes(scanQuery.toLowerCase()))
                        .map((blob, index) => (
                        <div key={`${blob.id ?? blob.original_path ?? "blob"}-${index}`} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-all" />
                           
                           <div className="flex items-start justify-between mb-6">
                              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                 <Lock className="w-5 h-5 text-slate-400" />
                              </div>
                              <span className="text-[9px] font-mono text-slate-600 bg-white/5 px-3 py-1 rounded-lg">{blob.id}</span>
                           </div>

                           <h5 className="text-lg font-black text-white uppercase tracking-tight mb-1">{blob.title}</h5>
                           <p className="text-[9px] font-mono text-slate-500 mb-6 truncate">{blob.original_path}</p>

                           <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                              <div className="flex flex-col">
                                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sealed On</span>
                                 <span className="text-[9px] font-bold text-slate-400">{new Date(blob.timestamp).toLocaleDateString()}</span>
                              </div>
                              <button 
                                onClick={() => handleUnsealAsset(blob.id)}
                                className="p-3 bg-white/5 hover:bg-indigo-500 text-slate-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-indigo-400"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-4">
                       <Database className="w-8 h-8 text-slate-700" />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Assets Found in Archive</span>
                    </div>
                  )}
               </div>
            </main>
          </div>
        )}
      </div>
    </motion.div>
  );
}









