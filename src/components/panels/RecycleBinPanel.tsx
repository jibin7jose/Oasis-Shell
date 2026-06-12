import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, AlertTriangle, File, FolderOpen, Network, Trash } from 'lucide-react';
import { useSystemStore, RecycleBinItem } from '../../lib/systemStore';

export const RecycleBinPanel = () => {
  const { recycleBin, restoreFromRecycleBin, deletePermanently, emptyRecycleBin, setActiveView } = useSystemStore();
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [showConfirmEmpty, setShowConfirmEmpty] = React.useState(false);

  const handleSelect = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleRestoreSelected = () => {
    selectedItems.forEach(id => restoreFromRecycleBin(id));
    setSelectedItems([]);
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => deletePermanently(id));
    setSelectedItems([]);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  const getIcon = (type: RecycleBinItem['type']) => {
    switch (type) {
      case 'folder': return <FolderOpen className="w-6 h-6 text-yellow-400" />;
      case 'crate': return <Network className="w-6 h-6 text-indigo-400" />;
      case 'golem': return <Network className="w-6 h-6 text-purple-400" />;
      default: return <File className="w-6 h-6 text-slate-300" />;
    }
  };

  return (
    <div className="w-full max-w-5xl glass p-8 rounded-[2rem] border border-white/5 h-full min-h-[600px] flex flex-col relative z-50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <Trash2 className="w-8 h-8 text-rose-500" />
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-white">Recycle Bin</h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {recycleBin.length} items • Temporary Storage
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {selectedItems.length > 0 && (
            <>
              <button 
                onClick={handleRestoreSelected}
                className="px-4 py-2 bg-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-white rounded-xl border border-emerald-500/50 hover:bg-emerald-500/40 transition-all"
              >
                Restore Selected ({selectedItems.length})
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-rose-500/20 text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:text-white rounded-xl border border-rose-500/50 hover:bg-rose-500/40 transition-all"
              >
                Delete Selected
              </button>
            </>
          )}
          {recycleBin.length > 0 && (
            <button 
              onClick={() => setShowConfirmEmpty(true)}
              className="px-4 py-2 glass text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:text-white rounded-xl border border-white/5 hover:border-rose-500/50 transition-all"
            >
              Empty Bin
            </button>
          )}
          <button 
            onClick={() => setActiveView('desktop')}
            className="px-4 py-2 glass text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white rounded-xl border border-white/5"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {recycleBin.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 mt-20">
            <Trash className="w-16 h-16 opacity-20" />
            <p className="text-sm font-semibold uppercase tracking-widest">Recycle Bin is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {recycleBin.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleSelect(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedItems.includes(item.id) 
                      ? 'bg-indigo-500/20 border-indigo-500/50' 
                      : 'glass border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-black/20 rounded-lg">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="text-sm font-bold text-white truncate" title={item.name}>{item.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                        Deleted: {formatDate(item.deletedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <button 
                      onClick={(e) => { e.stopPropagation(); restoreFromRecycleBin(item.id); setSelectedItems(prev => prev.filter(i => i !== item.id)); }}
                      className="p-1.5 rounded-lg bg-black/20 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Restore"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePermanently(item.id); setSelectedItems(prev => prev.filter(i => i !== item.id)); }}
                      className="p-1.5 rounded-lg bg-black/20 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Empty Bin Confirmation Modal */}
      <AnimatePresence>
        {showConfirmEmpty && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[2rem]"
          >
            <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-rose-500/20 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Empty Recycle Bin?</h4>
                  <p className="text-sm text-slate-400 mt-1">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setShowConfirmEmpty(false)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    emptyRecycleBin();
                    setSelectedItems([]);
                    setShowConfirmEmpty(false);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
                >
                  Permanently Delete All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
