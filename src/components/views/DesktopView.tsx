import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, File, HardDrive, FileCode, FileText, Image as ImageIcon, Video, Archive, FolderOpen, Activity, Trash2, Copy, Scissors, ClipboardPaste, Terminal } from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { FileInfo } from '../../lib/contracts';
import { useSystemStore } from '../../lib/systemStore';
import { useTerminalStore } from '../../lib/terminalStore';
import { cn } from '../../lib/utils';

const getFileIcon = (filename: string, isDir: boolean) => {
  if (isDir) return <Folder className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />;
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts': case 'tsx': case 'js': case 'jsx': case 'rs': case 'py': case 'json': case 'html': case 'css':
      return <FileCode className="w-8 h-8 text-emerald-400" />;
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp':
      return <ImageIcon className="w-8 h-8 text-amber-400" />;
    case 'mp4': case 'mkv': case 'webm':
      return <Video className="w-8 h-8 text-rose-400" />;
    case 'zip': case 'tar': case 'gz': case 'rar':
      return <Archive className="w-8 h-8 text-orange-400" />;
    case 'txt': case 'md': case 'csv':
      return <FileText className="w-8 h-8 text-slate-300" />;
    default:
      return <File className="w-8 h-8 text-slate-400" />;
  }
};

export const DesktopView: React.FC<{ setActiveView: (v: string) => void }> = ({ setActiveView }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [desktopPath, setDesktopPath] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: FileInfo | null } | null>(null);
  const [isRenaming, setIsRenaming] = useState<{ path: string, name: string } | null>(null);
  const [clipboard, setClipboard] = useState<{ type: 'copy'|'cut', file: FileInfo } | null>(null);
  
  const { setNotification, moveToRecycleBin, setShowTerminal } = useSystemStore();

  const fetchDesktop = async () => {
    try {
      const { homeDir } = await import('@tauri-apps/api/path');
      const home = await homeDir();
      const path = `${home}Desktop`;
      setDesktopPath(path);
      const res = await invokeSafe('read_directory', { path }) as FileInfo[];
      setFiles(res || []);
    } catch (e: any) {
      console.error("Desktop fetch failed:", e);
    }
  };

  useEffect(() => { fetchDesktop(); }, []);

  const handleLaunch = async (path: string) => {
    try { await invokeSafe('launch_path', { path }); } catch (e) { setNotification(`Launch Failure: ${e}`); }
  };

  const submitRename = async () => {
    if (!isRenaming) return;
    try {
      await invokeSafe('rename_path', { path: isRenaming.path, newName: isRenaming.name });
      setNotification(`Asset Re-designated: ${isRenaming.name}`);
      setIsRenaming(null);
      fetchDesktop();
    } catch (e) { setNotification(`Re-designation Failure: ${e}`); }
  };

  const handlePaste = async () => {
    if (!clipboard || !desktopPath) return;
    try {
      const destPath = `${desktopPath}\\${clipboard.file.name}`;
      if (clipboard.type === 'copy') {
        await invokeSafe('copy_path', { source: clipboard.file.path, destination: destPath });
        setNotification(`Asset Duplicated: ${clipboard.file.name}`);
      } else {
        await invokeSafe('move_path', { source: clipboard.file.path, destination: destPath });
        setNotification(`Asset Moved: ${clipboard.file.name}`);
        setClipboard(null);
      }
      fetchDesktop();
    } catch (e) { setNotification(`Transfer Failure: ${e}`); }
  };

  return (
    <div 
      className="absolute inset-0 z-0 p-8 pt-24"
      onDragOver={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={async (e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          const draggedPath = e.dataTransfer.getData('text/plain') || (window as any).__OASIS_DRAGGED_FILE__;
          if (draggedPath) {
            const targetName = draggedPath.split(/[\\/]/).pop();
            const destPath = `${desktopPath}\\${targetName}`;
            try {
              await invokeSafe('move_path', { source: draggedPath, destination: destPath });
              setNotification(`Moved ${targetName} to Desktop`);
              fetchDesktop();
            } catch (err) {
              setNotification(`Move Failed: ${err}`);
            }
          }
        }
      }}
      onContextMenu={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, file: null });
        }
      }}
      onClick={() => setContextMenu(null)}
    >
      <div className="flex flex-col flex-wrap gap-6 w-full max-h-[80vh] content-start items-start">
        {/* Fixed System Icons */}
        <button onClick={() => setActiveView('files')} className="flex flex-col items-center gap-2 group outline-none w-24">
          <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center glass group-hover:scale-105 transition-all shadow-lg">
            <HardDrive className="w-6 h-6 text-indigo-300 group-hover:text-white" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 text-center line-clamp-2">File Explorer</span>
        </button>
        <button onClick={() => setActiveView('recycle_bin')} className="flex flex-col items-center gap-2 group outline-none w-24">
          <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center glass group-hover:scale-105 transition-all shadow-lg">
            <Trash2 className="w-6 h-6 text-rose-300 group-hover:text-rose-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 text-center line-clamp-2">Recycle Bin</span>
        </button>

        {/* Dynamic Desktop Files */}
        {files.map(file => (
          <button
            key={file.path}
            draggable
            onDragStart={(e: any) => {
              if (e.altKey) {
                e.preventDefault();
                import('@crabnebula/tauri-plugin-drag').then(({ startDrag }) => {
                  startDrag({ item: [file.path], icon: file.path }).catch(() => {});
                });
              } else {
                e.dataTransfer.setData('text/plain', file.path);
                e.dataTransfer.effectAllowed = 'copyMove';
                (window as any).__OASIS_DRAGGED_FILE__ = file.path;
              }
            }}
            onDragOver={(e: any) => {
              if (file.is_dir) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                e.currentTarget.classList.add('bg-indigo-500/30');
              }
            }}
            onDragLeave={(e: any) => {
              e.currentTarget.classList.remove('bg-indigo-500/30');
            }}
            onDrop={async (e: any) => {
              e.currentTarget.classList.remove('bg-indigo-500/30');
              if (!file.is_dir) return;
              e.preventDefault();
              e.stopPropagation();
              const draggedPath = e.dataTransfer.getData('text/plain') || (window as any).__OASIS_DRAGGED_FILE__;
              if (draggedPath && draggedPath !== file.path) {
                const targetName = draggedPath.split(/[\\/]/).pop();
                const destPath = `${file.path}\\${targetName}`;
                try {
                  await invokeSafe('move_path', { source: draggedPath, destination: destPath });
                  setNotification(`Moved ${targetName} into ${file.name}`);
                  fetchDesktop();
                } catch (err) {
                  setNotification(`Move Failed: ${err}`);
                }
              }
            }}
            onDoubleClick={() => handleLaunch(file.path)}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, file }); }}
            className="flex flex-col items-center gap-2 group outline-none w-24 select-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-black/20 border border-transparent hover:border-white/10 hover:bg-black/40 flex items-center justify-center transition-all">
              {getFileIcon(file.name, file.is_dir)}
            </div>
            {isRenaming?.path === file.path ? (
              <input
                autoFocus
                value={isRenaming.name}
                onChange={e => setIsRenaming({ ...isRenaming, name: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') submitRename(); else if (e.key === 'Escape') setIsRenaming(null); }}
                onBlur={submitRename}
                onClick={e => e.stopPropagation()}
                className="w-full text-[11px] font-semibold text-center bg-black/60 border border-indigo-500 rounded px-1 outline-none text-white"
              />
            ) : (
              <span className="text-[11px] font-semibold text-slate-300 text-center line-clamp-2 drop-shadow-md break-all">
                {file.name}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed z-[101] w-48 glass rounded-xl border border-white/10 shadow-2xl p-2 flex flex-col gap-1 overflow-hidden"
          >
            {contextMenu.file ? (
              <>
                <button onClick={() => { handleLaunch(contextMenu.file!.path); setContextMenu(null); }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <FolderOpen className="w-3 h-3 text-indigo-400" /> Open
                </button>
                <button onClick={() => {
                  const ts = useTerminalStore.getState();
                  ts.updateTabCwd(ts.activeTabId, contextMenu.file!.is_dir ? contextMenu.file!.path : desktopPath);
                  setShowTerminal(true);
                  setContextMenu(null);
                }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <Terminal className="w-3 h-3 text-blue-400" /> Open in Terminal
                </button>
                <div className="h-px bg-white/5 mx-2 my-1" />
                <button onClick={() => { setClipboard({ type: 'copy', file: contextMenu.file! }); setContextMenu(null); setNotification(`Copied ${contextMenu.file!.name}`); }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <Copy className="w-3 h-3 text-slate-400" /> Copy
                </button>
                <button onClick={() => { setClipboard({ type: 'cut', file: contextMenu.file! }); setContextMenu(null); setNotification(`Cut ${contextMenu.file!.name}`); }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <Scissors className="w-3 h-3 text-amber-400" /> Cut
                </button>
                {clipboard && (
                  <button onClick={() => { handlePaste(); setContextMenu(null); }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                    <ClipboardPaste className="w-3 h-3 text-blue-400" /> Paste
                  </button>
                )}
                <div className="h-px bg-white/5 mx-2 my-1" />
                <button onClick={() => { setIsRenaming({ path: contextMenu.file!.path, name: contextMenu.file!.name }); setContextMenu(null); }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <Activity className="w-3 h-3 text-emerald-400" /> Rename
                </button>
                <button onClick={async () => {
                  moveToRecycleBin({ id: Math.random().toString(), name: contextMenu.file!.name, type: 'file', originalData: contextMenu.file! });
                  setNotification(`Moved to Recycle Bin: ${contextMenu.file!.name}`);
                  setFiles(prev => prev.filter(f => f.path !== contextMenu.file!.path));
                  setContextMenu(null);
                }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={() => {
                  const ts = useTerminalStore.getState();
                  ts.updateTabCwd(ts.activeTabId, desktopPath);
                  setShowTerminal(true);
                  setContextMenu(null);
                }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <Terminal className="w-3 h-3 text-blue-400" /> Open Terminal Here
                </button>
                {clipboard && (
                  <button onClick={() => { handlePaste(); setContextMenu(null); }} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                    <ClipboardPaste className="w-3 h-3 text-blue-400" /> Paste
                  </button>
                )}
                <button onClick={() => fetchDesktop()} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <Activity className="w-3 h-3 text-slate-400" /> Refresh
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
