import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Plus, Search, BrainCircuit, Shield, Trash2, UploadCloud } from 'lucide-react';
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { useSystemStore } from "../../lib/systemStore";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

interface VaultNode {
  name: string;
  category: string;
  size: string;
  path?: string;
}

interface SentientVaultProps {
  show: boolean;
  onClose: () => void;
  vaultNodes: VaultNode[];
  setVaultNodes: React.Dispatch<React.SetStateAction<VaultNode[]>>;
  ragQuery: string;
  setRagQuery: (val: string) => void;
  ragAnswer: string;
  setRagAnswer: React.Dispatch<React.SetStateAction<string>>;
  isRagging: boolean;
  setIsRagging: (val: boolean) => void;
}

export const SentientVault: React.FC<SentientVaultProps> = ({
  show,
  onClose,
  vaultNodes,
  setVaultNodes,
  ragQuery,
  setRagQuery,
  ragAnswer,
  setRagAnswer,
  isRagging,
  setIsRagging
}) => {
  const { setNotification } = useSystemStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddAsset = async () => {
    try {
      const selected = await openDialog({
        multiple: true,
        title: 'Select Assets to Seal in Sentient Vault'
      });
      
      if (!selected) return;
      
      const files = Array.isArray(selected) ? selected : [selected];
      const newAssets: VaultNode[] = [];
      
      for (const filePath of files) {
        setNotification(`Importing ${filePath}...`);
        const node = await invoke("import_strategic_asset", { filePath }) as VaultNode;
        newAssets.push(node);
      }
      
      setVaultNodes(prev => [...newAssets, ...prev]);
      setNotification(`Imported ${newAssets.length} asset(s) and secured them in the Vault.`);
    } catch (e: any) {
      setNotification(`Failed to import asset: ${e}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Deprecated in favor of native dialog
  };

  const handleDelete = async (e: React.MouseEvent, node: VaultNode) => {
    e.stopPropagation();
    try {
      if (node.path) {
        await invoke("delete_strategic_asset", { filePath: node.path });
      }
      setVaultNodes(prev => prev.filter(n => n.name !== node.name));
      setNotification(`Deleted ${node.name} from the vault.`);
    } catch (err: any) {
      setNotification(`Failed to delete asset: ${err}`);
    }
  };

  const handleAccess = async (node: VaultNode) => {
    if (!node.path) {
      setNotification(`Cannot access ${node.name}: File path is unknown.`);
      return;
    }
    
    try {
      setNotification(`Decrypting and launching ${node.name}...`);
      await invoke("access_strategic_asset", { filePath: node.path });
    } catch (e: any) {
      setNotification(`Access denied: ${e.toString()}`);
    }
  };

  const handleRecover = async (e: React.MouseEvent, node: VaultNode) => {
    e.stopPropagation();
    if (!node.path) {
      setNotification(`Cannot recover ${node.name}: File is missing path.`);
      return;
    }
    
    try {
      const recoveredPath = await invoke("recover_strategic_asset", { filePath: node.path });
      setVaultNodes(prev => prev.filter(n => n.name !== node.name));
      setNotification(`Recovered to: ${recoveredPath}`);
    } catch (e: any) {
      setNotification(`Failed to recover asset: ${e}`);
    }
  };

  const handleVectorize = (node: VaultNode) => {
    setNotification(`Vectorizing ${node.name} into semantic space...`);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-3xl p-10 md:p-20 flex flex-col pt-10 overflow-hidden">
          {/* Background Vault Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" /> Foundry Protocol Activated
              </span>
              <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tighter flex items-center gap-4">
                <FolderOpen className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" /> Sentient Vault
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <button onClick={handleAddAsset} className="group flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white transition-all border border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                 <span className="text-xs font-bold uppercase tracking-widest">Add Asset</span>
                 <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
              <button onClick={onClose} className="group flex items-center gap-3 px-6 py-3 glass rounded-2xl text-white hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                 <span className="text-xs font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">Close</span>
                 <Plus className="w-6 h-6 rotate-45 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-90" />
              </button>
            </div>
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
                       
                       let unlistenVaultToken: any;
                       listen('llm-token', (event: any) => {
                         setRagAnswer(prev => prev + event.payload);
                       }).then(f => unlistenVaultToken = f);

                       try {
                          const answer = await invoke("rag_query", { query: ragQuery });
                          if (unlistenVaultToken) unlistenVaultToken();
                          setRagAnswer(answer as string);
                       } catch(err) {
                          if (unlistenVaultToken) unlistenVaultToken();
                          setRagAnswer("Error querying the Sentient Vault.");
                       }
                       setIsRagging(false);
                     }
                   }}
                   placeholder="Query the Sentient Vault (e.g., 'Extract Q3 metrics from reports')"
                   className="w-full bg-transparent px-6 h-20 text-xl font-light text-white placeholder:text-slate-500 outline-none transition-all leading-normal"
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
                className="w-full max-w-5xl mx-auto mb-12 relative z-10"
              >
                 <div className="p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl backdrop-blur-2xl shadow-[0_0_30px_rgba(99,102,241,0.15)] relative mt-4 max-h-[45vh] overflow-y-auto custom-scrollbar">
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
                className="glass-bright p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.02] transition-all duration-300 group flex flex-col justify-between min-h-[20rem] relative overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className={cn("p-4 rounded-2xl shadow-inner", node.category === 'Strategic' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : node.category === 'Technical' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20")}>
                    <Shield className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full border border-white/5">{node.size}</span>
                    <button 
                      onClick={(e) => handleRecover(e, node)} 
                      className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20 z-20"
                      title="Recover to Desktop"
                    >
                      <UploadCloud className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, node)} 
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20 z-20"
                      title="Remove from Vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="relative z-10 mt-8 flex-1 flex flex-col justify-end">
                  <div>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest block mb-2", node.category === 'Strategic' ? "text-amber-400/80" : node.category === 'Technical' ? "text-indigo-400/80" : "text-purple-400/80")}>
                      {node.category} Node
                    </span>
                    <h4 className="text-xl font-bold text-white leading-tight mb-4 break-words line-clamp-3">{node.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300 mt-auto pt-4 border-t border-white/5">
                    <button onClick={(e) => { e.stopPropagation(); handleAccess(node); }} className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-indigo-400 transition-colors z-20">Access</button>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <button onClick={(e) => { e.stopPropagation(); handleVectorize(node); }} className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-indigo-400 transition-colors z-20">Vectorize</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
