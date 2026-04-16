import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, File, HardDrive, ChevronRight, CornerLeftUp, FileCode, FileText, Image as ImageIcon, Video, Archive, FolderOpen, Activity, Skull } from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { FileInfo } from '../../lib/contracts';
import { useSystemStore } from '../../lib/systemStore';

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const formatDate = (unixSeconds: number) => {
  if (!unixSeconds) return '--';
  return new Date(unixSeconds * 1000).toLocaleString();
};

const getFileIcon = (filename: string, isDir: boolean) => {
  if (isDir) return <Folder className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />;
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'rs':
    case 'py':
    case 'json':
    case 'html':
    case 'css':
      return <FileCode className="w-5 h-5 text-emerald-400" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <ImageIcon className="w-5 h-5 text-amber-400" />;
    case 'mp4':
    case 'mkv':
    case 'webm':
      return <Video className="w-5 h-5 text-rose-400" />;
    case 'zip':
    case 'tar':
    case 'gz':
    case 'rar':
      return <Archive className="w-5 h-5 text-orange-400" />;
    case 'txt':
    case 'md':
    case 'csv':
      return <FileText className="w-5 h-5 text-slate-300" />;
    default:
      return <File className="w-5 h-5 text-slate-400" />;
  }
};

export const FileExplorerPanel: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputPath, setInputPath] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: FileInfo } | null>(null);
  const [isRenaming, setIsRenaming] = useState<{ path: string, name: string } | null>(null);
  
  const { setNotification, isVaultAuthenticated, setShowVault } = useSystemStore();

  const fetchDirectory = async (path: string = '') => {
    setLoading(true);
    try {
      const res = await invokeSafe('read_directory', { path: path || null }) as FileInfo[];
      setFiles(res);
      // Auto-update path if backend resolved empty to home dir
      if (!path && res.length > 0) {
        const firstPath = res[0].path;
        const separator = firstPath.includes('\\') ? '\\' : '/';
        const parentPath = firstPath.substring(0, firstPath.lastIndexOf(separator));
        setCurrentPath(parentPath);
        setInputPath(parentPath);
      } else if (path) {
        setCurrentPath(path);
        setInputPath(path);
      }
    } catch (e: any) {
      setNotification(`Filesystem Error: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const handleNavigate = (file: FileInfo) => {
    if (file.is_dir) {
      fetchDirectory(file.path);
    } else {
      handleLaunch(file.path);
    }
  };

  const handleLaunch = async (path: string) => {
    try {
      await invokeSafe('launch_path', { path });
      setNotification(`Launched Executive Process: ${path.split(/[\\/]/).pop()}`);
    } catch (e) {
      setNotification(`Launch Failure: ${e}`);
    }
  };

  const handleContextClick = (e: React.MouseEvent, file: FileInfo) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleDelete = async (file: FileInfo) => {
    setContextMenu(null);
    if (!isVaultAuthenticated) {
      setNotification("FOUNDER SIGNATURE REQUIRED: Unlock Sentinel Vault to purge assets.");
      setShowVault(true);
      return;
    }

    try {
      await invokeSafe('delete_path', { path: file.path });
      setNotification(`Asset Purged: ${file.name}`);
      fetchDirectory(currentPath);
    } catch (e) {
      setNotification(`Purge Failure: ${e}`);
    }
  };

  const startRename = (file: FileInfo) => {
    setContextMenu(null);
    if (!isVaultAuthenticated) {
      setNotification("FOUNDER SIGNATURE REQUIRED: Unlock Sentinel Vault to re-designate assets.");
      setShowVault(true);
      return;
    }
    setIsRenaming({ path: file.path, name: file.name });
  };

  const submitRename = async () => {
    if (!isRenaming) return;
    try {
      await invokeSafe('rename_path', { path: isRenaming.path, newName: isRenaming.name });
      setNotification(`Asset Re-designated: ${isRenaming.name}`);
      setIsRenaming(null);
      fetchDirectory(currentPath);
    } catch (e) {
      setNotification(`Re-designation Failure: ${e}`);
    }
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parts = currentPath.split(separator);
    if (parts.length > 1) {
      parts.pop(); // Remove current
      let parent = parts.join(separator);
      // Handle Windows drive root edge case like "C:" -> "C:\"
      if (parent.endsWith(':') && separator === '\\') parent += '\\';
      if (!parent) parent = separator; // Linux root
      fetchDirectory(parent);
    }
  };

  const handlePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDirectory(inputPath);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header and Path Bar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <HardDrive className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Native File Explorer</h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Host Filesystem Navigation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={navigateUp}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            title="Go Up"
          >
            <CornerLeftUp className="w-4 h-4 text-slate-300" />
          </button>
          <form className="flex-1 flex" onSubmit={handlePathSubmit}>
            <div className="flex-1 relative flex items-center bg-black/40 border border-white/10 rounded-lg overflow-hidden">
              <div className="px-3 flex items-center justify-center text-slate-500">
                <ChevronRight className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-slate-200 py-2 pr-4 font-mono"
                placeholder="C:\..."
                spellCheck={false}
              />
            </div>
          </form>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar border border-white/5 rounded-xl bg-black/20">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest sticky top-0 bg-slate-900/90 backdrop-blur z-10">
          <div className="w-6"></div>
          <div>Name</div>
          <div className="text-right w-24">Date Modified</div>
          <div className="text-right w-20">Size</div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <HardDrive className="w-8 h-8 text-indigo-500 animate-pulse" />
              <div className="text-xs text-indigo-400 uppercase tracking-widest font-black">Reading Host Disk...</div>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm italic">Empty Directory</div>
        ) : (
          <AnimatePresence>
            <div className="flex flex-col">
              {files.map((file, idx) => (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.5) }}
                  onDoubleClick={() => handleNavigate(file)}
                  onContextMenu={(e) => handleContextClick(e, file)}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors items-center group relative"
                >
                  <div className="w-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getFileIcon(file.name, file.is_dir)}
                  </div>
                  <div className="text-sm font-medium text-slate-200 truncate pr-4">
                    {isRenaming?.path === file.path ? (
                      <input 
                        autoFocus
                        value={isRenaming.name}
                        onChange={(e) => setIsRenaming({ ...isRenaming, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitRename();
                          if (e.key === 'Escape') setIsRenaming(null);
                        }}
                        onBlur={() => setIsRenaming(null)}
                        className="bg-indigo-500/20 border border-indigo-500/40 rounded px-2 py-0.5 outline-none w-full text-white"
                      />
                    ) : file.name}
                  </div>
                  <div className="text-[10px] text-slate-500 text-right w-24 tabular-nums">
                    {formatDate(file.last_modified)}
                  </div>
                  <div className="text-[10px] text-slate-500 text-right w-20 font-mono">
                    {file.is_dir ? '--' : formatBytes(file.size)}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Context Menu Overlay */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div 
              className="fixed inset-0 z-[100]" 
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="fixed z-[101] w-48 glass rounded-xl border border-white/10 shadow-2xl p-2 flex flex-col gap-1 overflow-hidden"
            >
              <button 
                onClick={() => { handleNavigate(contextMenu.file); setContextMenu(null); }}
                className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <FolderOpen className="w-3 h-3 text-indigo-400" /> Open / Launch
              </button>
              <div className="h-px bg-white/5 mx-2 my-1" />
              <button 
                onClick={() => startRename(contextMenu.file)}
                className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <Activity className="w-3 h-3 text-emerald-400" /> Re-designate
              </button>
              <button 
                onClick={() => handleDelete(contextMenu.file)}
                className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Skull className="w-3 h-3" /> Purge Asset
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="text-[10px] text-slate-500 flex items-center gap-2 uppercase tracking-widest font-bold">
          <HardDrive className="w-3 h-3 text-indigo-400" />
          Native Filesystem Link Active
        </div>
        <div className="text-[10px] font-bold text-slate-400">
          {files.length} Item{files.length !== 1 && 's'}
        </div>
      </div>
    </div>
  );
};
