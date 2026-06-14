import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, ChevronRight, Zap, Trash2, Sparkles, Plus } from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { cn } from '../../lib/utils';
import { FalconIcon } from '../icons/FalconIcon';

import { useTerminalStore, TerminalLine } from '../../lib/terminalStore';

interface TerminalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stressColor?: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export function TerminalInstance({ tabId, isActive, stressColor = '#6366f1' }: { tabId: string; isActive: boolean; stressColor?: string }) {
  const [input, setInput] = useState('');
  
  const tab = useTerminalStore(state => state.tabs.find(t => t.id === tabId));
  const setTabLines = useTerminalStore(state => state.setTabLines);
  const setTabCwd = useTerminalStore(state => state.updateTabCwd);
  const addTabHistory = useTerminalStore(state => state.addTabHistory);
  
  const lines = tab?.lines || [];
  const history = tab?.history || [];
  const cwd = tab?.cwd || 'C:\\';

  const setLines = (updater: any) => {
    if (typeof updater === 'function') {
      const currentLines = useTerminalStore.getState().tabs.find(t => t.id === tabId)?.lines || [];
      setTabLines(tabId, updater(currentLines));
    } else {
      setTabLines(tabId, updater);
    }
  };

  const setCwd = (newCwd: string) => setTabCwd(tabId, newCwd);

  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const currentSessionRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when opened or active
  useEffect(() => {
    if (isActive && inputRef.current) inputRef.current.focus();
  }, [isActive]);

  // Fetch initial directory
  useEffect(() => {
    if (cwd === 'C:\\') {
      import('@tauri-apps/api/path').then(({ appDir }) => {
        appDir().then(dir => setCwd(dir)).catch(() => setCwd('C:\\'));
      });
    }
  }, []);

  // Listen for streaming terminal output from Rust
  useEffect(() => {
    let unlistenFn: (() => void) | undefined;
    let isMounted = true;

    const setupListener = async () => {
      const { listen } = await import('@tauri-apps/api/event');
      unlistenFn = await listen<{ session: string; line: string; kind: 'input' | 'output' | 'error' | 'done' }>(
        'terminal-stdout',
        (event) => {
          if (!isMounted) return;
          const { session, line, kind } = event.payload;
          if (session !== currentSessionRef.current) return;

          if (kind === 'done') {
            setIsExecuting(false);
            currentSessionRef.current = null;
            setLines((prev: TerminalLine[]) => [...prev, {
              id: `${session}-done`,
              type: 'meta',
              content: '─── Command complete ─────────────────────',
              timestamp: ''
            }]);
            return;
          }
          if (!line) return;
          
          // Strip ANSI codes to ensure regex works even if terminal outputs colored text
          const cleanLine = line.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();

          // Smart error detection for stdout streams that print errors
          const isError = kind === 'error' || 
            (kind === 'output' && /error|failed|exception|unknown command|not found|is not recognized/i.test(cleanLine));

          setLines((prev: TerminalLine[]) => [...prev, {
            id: `${session}-${Date.now()}-${Math.random()}`,
            type: isError ? 'error' : kind === 'input' ? 'input' : 'output',
            content: line,
            timestamp: new Date().toLocaleTimeString(),
          }]);
        }
      );
    };

    setupListener();

    return () => {
      isMounted = false;
      if (unlistenFn) unlistenFn();
    };
  }, []);

  // Listen for file drop
  useEffect(() => {
    let unlistenDrop: (() => void) | undefined;
    let isMounted = true;

    const setupDropListener = async () => {
      const { listen } = await import('@tauri-apps/api/event');
      unlistenDrop = await listen<{ paths: string[] }>('tauri://file-drop', (event: any) => {
        if (!isMounted || !isActive) return;
        const paths = event.payload as string[];
        if (paths && paths.length > 0) {
          const formattedPaths = paths.map((p: string) => p.includes(' ') ? `"${p}"` : p).join(' ');
          setInput(prev => prev ? `${prev} ${formattedPaths} ` : `${formattedPaths} `);
          if (inputRef.current) inputRef.current.focus();
        }
      });
    };

    setupDropListener();

    const handleInternalDrop = (e: any) => {
      if (!isActive) return;
      const path = e.detail;
      if (path) {
        const formatted = path.includes(' ') ? `"${path}"` : path;
        setInput(prev => prev ? `${prev} ${formatted} ` : `${formatted} `);
        if (inputRef.current) inputRef.current.focus();
      }
    };
    window.addEventListener('oasis-terminal-drop', handleInternalDrop);

    return () => {
      isMounted = false;
      if (unlistenDrop) unlistenDrop();
      window.removeEventListener('oasis-terminal-drop', handleInternalDrop);
    };
  }, [isActive]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    const cmdText = input.trim();
    const parts = cmdText.split(' ');
    let cmd = parts[0];
    let args = parts.slice(1);

    addTabHistory(tabId, cmdText);
    setHistoryIndex(-1);
    setInput('');
    setIsExecuting(true);

    // Immediately print what the user actually typed
    setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'in', type: 'input', content: `$ ${cmdText}`, timestamp: '' }]);

    // Native Oasis Commands Interceptor
    if (cmd === 'warp' || cmd === 'cd') {
      const targetDir = args.join(' ');
      if (targetDir) {
        const newCwd = targetDir === '..' 
          ? cwd.substring(0, cwd.lastIndexOf('\\')) || 'C:\\'
          : targetDir.includes('\\') || targetDir.includes('/') ? targetDir : `${cwd}\\${targetDir}`;
        setCwd(newCwd);
        setLines((prev: TerminalLine[]) => [...prev, 
          { id: Date.now() + 'out', type: 'output', content: `Warped to ${newCwd}`, timestamp: '' },
          { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }
        ]);
      } else {
        setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }]);
      }
      setIsExecuting(false);
      return;
    }

    if (cmd === 'scan') {
      try {
        const targetPath = args.length > 0 ? (args[0].includes('\\') || args[0].includes('/') ? args.join(' ') : `${cwd}\\${args.join(' ')}`) : cwd;
        const files = await invokeSafe('read_directory', { path: targetPath }) as any[];
        if (!files) throw new Error('Directory not found or access denied.');
        const output = files.map(f => `${f.is_dir ? '📁' : '📄'} ${f.name}   ${f.is_dir ? '' : '(' + formatBytes(f.size || 0) + ')'}`).join('\n');
        setLines((prev: TerminalLine[]) => [...prev, 
          { id: Date.now() + 'out', type: 'output', content: output || 'Directory is empty.', timestamp: '' },
          { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }
        ]);
      } catch (err: any) {
        setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'err', type: 'error', content: err.toString(), timestamp: '' }]);
      }
      setIsExecuting(false);
      return;
    }

    if (cmd === 'open' || cmd === 'launch') {
      const targetPath = args.length > 0 ? (args[0].includes('\\') || args[0].includes('/') ? args.join(' ') : `${cwd}\\${args.join(' ')}`) : null;
      if (!targetPath) {
        setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'err', type: 'error', content: 'Please specify a file to open.', timestamp: '' }]);
        setIsExecuting(false);
        return;
      }
      
      cmd = 'Start-Process';
      args = [`"${targetPath}"`];
    }

    if (cmd === 'clear' || cmd === 'cls') {
      useTerminalStore.getState().clearTabLines(tabId);
      setIsExecuting(false);
      return;
    }

    if (cmd === 'history') {
      const hist = useTerminalStore.getState().tabs.find(t => t.id === tabId)?.history || [];
      const out = hist.map((h, i) => `${i + 1}  ${h}`).join('\n');
      setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'out', type: 'output', content: out || 'No history.', timestamp: '' }, { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }]);
      setIsExecuting(false);
      return;
    }

    const rawArgs = args.join(' ');
    switch (cmd) {
      case 'find': cmd = 'Get-ChildItem'; args = ['-Recurse', '-Filter', `*${rawArgs}*`, '|', 'Select-Object', 'FullName']; break;
      case 'details': cmd = 'Get-ItemProperty'; args = [rawArgs ? `"${rawArgs}"` : '.', '|', 'Format-List', '*']; break;
      case 'mkdir': case 'md': cmd = 'New-Item'; args = ['-ItemType', 'Directory', '-Force', '-Path', `"${rawArgs}"`]; break;
      case 'touch': cmd = 'New-Item'; args = ['-ItemType', 'File', '-Force', '-Path', `"${rawArgs}"`]; break;
      case 'cat': cmd = 'Get-Content'; args = [`"${rawArgs}"`]; break;
      case 'rm': case 'del': case 'delete': case 'remove': cmd = 'Remove-Item'; args = ['-Force', '-Recurse', `"${rawArgs}"`]; break;
      case 'cp': case 'copy': cmd = 'Copy-Item'; args = [rawArgs]; break;
      case 'mv': case 'rename': case 'move': cmd = 'Move-Item'; args = [rawArgs]; break;
      case 'ps': case 'top': case 'processes': cmd = 'Get-Process'; args = ['|', 'Sort-Object', 'CPU', '-Descending', '|', 'Select-Object', '-First', '20']; break;
      case 'kill': cmd = 'Stop-Process'; args = ['-Force', '-Id', rawArgs]; break;
      case 'sysinfo': case 'neofetch': cmd = 'Get-ComputerInfo'; args = ['|', 'Select-Object', 'OsName,OsArchitecture,WindowsVersion,CsProcessors,CsTotalPhysicalMemory']; break;
      case 'whoami': cmd = 'whoami'; args = []; break;
      case 'time': case 'date': cmd = 'Get-Date'; args = []; break;
      case 'ip': case 'ipconfig': cmd = 'Get-NetIPAddress'; args = ['|', 'Format-Table']; break;
      case 'ping': cmd = 'ping'; args = [rawArgs]; break;
      case 'tree': cmd = 'tree'; args = ['/F', rawArgs ? `"${rawArgs}"` : `"${cwd}"`]; break;
      case 'hash': case 'checksum': cmd = 'Get-FileHash'; args = [`"${rawArgs}"`]; break;
      case 'uptime': cmd = '(Get-Date)'; args = ['-', '(Get-CimInstance', 'Win32_OperatingSystem).LastBootUpTime']; break;
      case 'ports': case 'netstat': cmd = 'Get-NetTCPConnection'; args = ['|', 'Where-Object', 'State', '-eq', '"Listen"']; break;
      case 'env': cmd = 'Get-ChildItem'; args = ['Env:']; break;
      case 'wifi': cmd = 'netsh'; args = ['wlan', 'show', 'interfaces']; break;
      case 'download': case 'wget': case 'curl': 
        const dParts = rawArgs.split(' ');
        cmd = 'Invoke-WebRequest'; args = ['-Uri', dParts[0], '-OutFile', dParts[1] || 'downloaded_file']; 
        break;
      case 'zip': case 'compress': cmd = 'Compress-Archive'; args = ['-Path', rawArgs.split(' ')[0], '-DestinationPath', rawArgs.split(' ')[1] || 'archive.zip']; break;
      case 'unzip': case 'extract': cmd = 'Expand-Archive'; args = ['-Path', rawArgs.split(' ')[0], '-DestinationPath', rawArgs.split(' ')[1] || '.']; break;
      case 'base64': cmd = '[Convert]::ToBase64String([IO.File]::ReadAllBytes('; args = [`"${rawArgs}"))`]; break;
      case 'guid': case 'uuid': cmd = '[guid]::NewGuid()'; args = []; break;
      case 'df': case 'diskspace': cmd = 'Get-Volume'; args = []; break;
      case 'mac': case 'getmac': cmd = 'getmac'; args = []; break;
      case 'battery': cmd = 'Get-CimInstance'; args = ['-ClassName', 'Win32_Battery']; break;
      case 'dns': cmd = 'ipconfig'; args = ['/displaydns']; break;
      case 'flushdns': cmd = 'ipconfig'; args = ['/flushdns']; break;
      case 'services': cmd = 'Get-Service'; args = ['|', 'Where-Object', 'Status', '-eq', '"Running"']; break;
      case 'start-service': cmd = 'Start-Service'; args = ['-Name', rawArgs]; break;
      case 'stop-service': cmd = 'Stop-Service'; args = ['-Name', rawArgs]; break;
      case 'drivers': cmd = 'driverquery'; args = []; break;
      case 'reboot': case 'restart': cmd = 'Restart-Computer'; args = []; break;
      case 'shutdown': cmd = 'Stop-Computer'; args = []; break;
      case 'lock': cmd = 'rundll32.exe'; args = ['user32.dll,LockWorkStation']; break;
      case 'clip': cmd = 'Set-Clipboard'; args = ['-Value', `"${rawArgs}"`]; break;
      case 'paste': cmd = 'Get-Clipboard'; args = []; break;
      case 'admin': case 'elevate': cmd = 'Start-Process'; args = ['powershell', '-Verb', 'runAs']; break;
      case 'route': case 'routes': cmd = 'route'; args = ['print']; break;
      case 'arp': cmd = 'arp'; args = ['-a']; break;
      case 'hosts': cmd = 'Get-Content'; args = ['C:\\Windows\\System32\\drivers\\etc\\hosts']; break;
      
      // --- THE 100+ COMMAND EXPANSION PACK ---
      // File & Text Processing
      case 'head': cmd = 'Get-Content'; args = [`"${rawArgs}"`, '-TotalCount', '10']; break;
      case 'tail': cmd = 'Get-Content'; args = [`"${rawArgs}"`, '-Tail', '10']; break;
      case 'grep': cmd = 'Select-String'; args = ['-Pattern', `"${args[0]}"`, '-Path', `"${args.slice(1).join(' ')}"`]; break;
      case 'pwd': cmd = 'Get-Location'; args = []; break;
      case 'ls': case 'dir': cmd = 'Get-ChildItem'; args = [rawArgs]; break;
      case 'll': cmd = 'Get-ChildItem'; args = ['-Force', rawArgs]; break;
      case 'la': cmd = 'Get-ChildItem'; args = ['-Force', '-Hidden', rawArgs]; break;
      case 'sort': cmd = 'Get-Content'; args = [`"${rawArgs}"`, '|', 'Sort-Object']; break;
      case 'uniq': cmd = 'Get-Content'; args = [`"${rawArgs}"`, '|', 'Sort-Object', '-Unique']; break;
      case 'wc': cmd = 'Get-Content'; args = [`"${rawArgs}"`, '|', 'Measure-Object', '-Line', '-Word', '-Character']; break;
      case 'diff': case 'compare': cmd = 'Compare-Object'; args = ['-ReferenceObject', `(Get-Content "${args[0]}")`, '-DifferenceObject', `(Get-Content "${args[1]}")`]; break;
      case 'append': cmd = 'Add-Content'; args = ['-Path', `"${args[0]}"`, '-Value', `"${args.slice(1).join(' ')}"`]; break;
      case 'read': cmd = 'Get-Content'; args = [`"${rawArgs}"`]; break;

      // Hardware & System
      case 'cpu': cmd = 'Get-CimInstance'; args = ['Win32_Processor', '|', 'Select-Object', 'Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed']; break;
      case 'ram': case 'memory': cmd = 'Get-CimInstance'; args = ['Win32_PhysicalMemory', '|', 'Select-Object', 'Capacity,Speed,Manufacturer']; break;
      case 'gpu': cmd = 'Get-CimInstance'; args = ['Win32_VideoController', '|', 'Select-Object', 'Name,AdapterRAM,DriverVersion']; break;
      case 'motherboard': case 'board': cmd = 'Get-CimInstance'; args = ['Win32_BaseBoard', '|', 'Select-Object', 'Manufacturer,Product,SerialNumber']; break;
      case 'bios': cmd = 'Get-CimInstance'; args = ['Win32_BIOS', '|', 'Select-Object', 'Manufacturer,Name,Version,ReleaseDate']; break;
      case 'disk': case 'disks': cmd = 'Get-Disk'; args = []; break;
      case 'partitions': cmd = 'Get-Partition'; args = []; break;
      case 'usb': cmd = 'Get-PnpDevice'; args = ['-Class', 'USB']; break;
      case 'printers': cmd = 'Get-Printer'; args = []; break;
      case 'monitors': cmd = 'Get-CimInstance'; args = ['Win32_DesktopMonitor']; break;
      case 'hostname': cmd = 'hostname'; args = []; break;
      case 'os': cmd = 'Get-CimInstance'; args = ['Win32_OperatingSystem', '|', 'Select-Object', 'Caption,Version,OSArchitecture,InstallDate']; break;
      case 'users': cmd = 'Get-LocalUser'; args = []; break;
      case 'groups': cmd = 'Get-LocalGroup'; args = []; break;
      
      // Networking
      case 'nslookup': cmd = 'nslookup'; args = [rawArgs]; break;
      case 'tracert': case 'trace': cmd = 'tracert'; args = [rawArgs]; break;
      case 'pathping': cmd = 'pathping'; args = [rawArgs]; break;
      case 'nbtstat': cmd = 'nbtstat'; args = ['-n']; break;
      case 'adapters': case 'nics': cmd = 'Get-NetAdapter'; args = []; break;
      case 'firewall': cmd = 'Get-NetFirewallProfile'; args = []; break;
      case 'connections': cmd = 'netstat'; args = ['-ano']; break;
      case 'publicip': cmd = 'Invoke-RestMethod'; args = ['-Uri', 'https://api.ipify.org']; break;
      
      // Developer / Hash
      case 'md5': cmd = 'Get-FileHash'; args = [`"${rawArgs}"`, '-Algorithm', 'MD5']; break;
      case 'sha1': cmd = 'Get-FileHash'; args = [`"${rawArgs}"`, '-Algorithm', 'SHA1']; break;
      case 'sha256': cmd = 'Get-FileHash'; args = [`"${rawArgs}"`, '-Algorithm', 'SHA256']; break;
      case 'hex': cmd = 'Format-Hex'; args = [`"${rawArgs}"`]; break;
      case 'random': cmd = 'Get-Random'; args = ['-Minimum', '1', '-Maximum', rawArgs || '100']; break;
      case 'calc': cmd = 'Invoke-Expression'; args = [rawArgs]; break;
      
      // Admin / Event Logs / Tasks
      case 'logs': case 'events': cmd = 'Get-EventLog'; args = ['-LogName', 'System', '-Newest', '20']; break;
      case 'tasks': cmd = 'Get-ScheduledTask'; args = ['|', 'Where-Object', 'State', '-eq', '"Ready"']; break;
      case 'killall': cmd = 'Stop-Process'; args = ['-Name', `"${rawArgs}"`, '-Force']; break;
      case 'sleep': cmd = 'rundll32.exe'; args = ['powrprof.dll,SetSuspendState', '0,1,0']; break;
      case 'logoff': cmd = 'logoff'; args = []; break;
      case 'uac': cmd = 'UserAccountControlSettings'; args = []; break;
      case 'reg': cmd = 'reg'; args = [rawArgs]; break;
    }

    if (cmd === 'view') {
      try {
        const targetPath = args.length > 0 ? (args[0].includes('\\') || args[0].includes('/') ? args.join(' ') : `${cwd}\\${args.join(' ')}`) : null;
        if (!targetPath) throw new Error('Please specify a file to view.');
        const text = await invokeSafe('read_file_text', { path: targetPath }) as string;
        if (text === null) throw new Error('File not found or access denied.');
        setLines((prev: TerminalLine[]) => [...prev, 
          { id: Date.now() + 'out', type: 'output', content: text, timestamp: '' },
          { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }
        ]);
      } catch (err: any) {
        setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'err', type: 'error', content: err.toString(), timestamp: '' }]);
      }
      setIsExecuting(false);
      return;
    }

    if (cmd === 'purge') {
      try {
        const targetPath = args.length > 0 ? (args[0].includes('\\') || args[0].includes('/') ? args.join(' ') : `${cwd}\\${args.join(' ')}`) : null;
        if (!targetPath) throw new Error('Please specify a file to purge.');
        await invokeSafe('delete_path', { path: targetPath });
        setLines((prev: TerminalLine[]) => [...prev, 
          { id: Date.now() + 'out', type: 'output', content: `[Vault] Purged ${targetPath}`, timestamp: '' },
          { id: Date.now() + 'done', type: 'meta', content: '─── Command complete ─────────────────────', timestamp: '' }
        ]);
      } catch (err: any) {
        setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'err', type: 'error', content: err.toString(), timestamp: '' }]);
      }
      setIsExecuting(false);
      return;
    }

    const sessionId = `term-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    currentSessionRef.current = sessionId;

    try {
      const returnedSessionId = await invokeSafe('execute_cli_directive', { sessionId, cmd, args, cwd }) as string | null;
      
      if (!returnedSessionId) {
        setIsExecuting(false);
        setLines((prev: TerminalLine[]) => [...prev, {
          id: Date.now().toString(),
          type: 'error',
          content: 'Failed to spawn command.',
          timestamp: new Date().toLocaleTimeString(),
        }]);
      }
    } catch (err: any) {
      setIsExecuting(false);
      setLines((prev: TerminalLine[]) => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: `Backend Error: ${err.toString()}\n(If you just updated the code, please restart your Tauri dev server!)`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  };

  const handleStopCommand = () => {
    setIsExecuting(false);
    setLines((prev: TerminalLine[]) => [...prev, {
      id: Date.now() + 'kill',
      type: 'error',
      content: '^C (Process Detached)',
      timestamp: ''
    }]);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIdx);
      setInput(history[history.length - 1 - newIdx] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIdx);
      setInput(newIdx === -1 ? '' : history[history.length - 1 - newIdx] ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!input.trim()) return;
      
      const parts = input.split(' ');
      const lastPart = parts[parts.length - 1];
      if (!lastPart) return;
      
      const cleanPath = lastPart.replace(/"/g, '');
      let searchDir = cwd;
      let partial = cleanPath;
      
      if (cleanPath.includes('\\') || cleanPath.includes('/')) {
         const lastSlash = Math.max(cleanPath.lastIndexOf('\\'), cleanPath.lastIndexOf('/'));
         searchDir = cleanPath.substring(0, lastSlash);
         partial = cleanPath.substring(lastSlash + 1);
         if (searchDir === '' || /^[a-zA-Z]:$/.test(searchDir)) searchDir += '\\';
      }
      
      try {
        const files = await invokeSafe('read_directory', { path: searchDir }) as any[];
        if (files) {
          const match = files.find(f => f.name.toLowerCase().startsWith(partial.toLowerCase()));
          if (match) {
            const separator = searchDir.endsWith('\\') || searchDir.endsWith('/') ? '' : '\\';
            let newLastPart = `${searchDir}${separator}${match.name}`;
            if (newLastPart.includes(' ')) newLastPart = `"${newLastPart}"`;
            
            parts[parts.length - 1] = newLastPart;
            setInput(parts.join(' ') + (match.is_dir ? '\\' : ' '));
          } else {
            console.log(`Autocomplete: No match for "${partial}" in "${searchDir}"`);
          }
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }
  };

  const triggerHealProtocol = async (errorContent: string) => {
    if (isHealing) return;
    setIsHealing(true);
    const healId1 = Date.now() + 'h1';
    setLines((prev: TerminalLine[]) => [...prev, { id: healId1, type: 'meta', content: '[AURA-HEAL] Analyzing stack trace via Neural Engine...', timestamp: '' }]);
    
    try {
      const response = await invokeSafe('analyze_terminal_error', { errorText: errorContent }) as string;
      
      const responseText = response.trim();
      let cleanResponse = responseText;
      
      const commandMatch = responseText.match(/<command>([\s\S]*?)<\/command>/);
      if (commandMatch && commandMatch[1]) {
        setInput(commandMatch[1].trim());
        cleanResponse = responseText.replace(/<\/?command>/g, '`');
      }

      const healId2 = Date.now() + 'h2';
      setLines((prev: TerminalLine[]) => [...prev, { id: healId2, type: 'output', content: `✓ AI Analysis: ${cleanResponse}`, timestamp: '' }]);

    } catch (e) {
      setLines((prev: TerminalLine[]) => [...prev, { id: Date.now() + 'err', type: 'error', content: '[AURA-HEAL] Neural Engine offline or failed.', timestamp: '' }]);
    } finally {
      setIsHealing(false);
    }

    if (inputRef.current) inputRef.current.focus();
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input':  return 'text-indigo-300 font-bold';
      case 'output': return 'text-emerald-300/90';
      case 'error':  return 'text-red-400';
      case 'meta':   return 'text-slate-500';
      case 'done':   return 'text-slate-600';
    }
  };

  return (
    <div 
      className={cn("flex flex-col h-full w-full absolute inset-0 z-10", !isActive && "hidden")}
      onDragEnter={(e: any) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; }}
      onDragOver={(e: any) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; }}
      onDrop={(e: any) => {
        e.preventDefault();
        e.stopPropagation();
        
        const plainData = e.dataTransfer.getData('text/plain');
        const globalData = (window as any).__OASIS_DRAGGED_FILE__;
        
        let filePaths = [];
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
           for (let i = 0; i < e.dataTransfer.files.length; i++) {
               // In Tauri, native files have a .path property.
               filePaths.push(e.dataTransfer.files[i].path || e.dataTransfer.files[i].name);
           }
        }
        const filesData = filePaths.join(' ');
        
        const path = plainData || globalData || filesData;
        
        setLines((prev: any[]) => [...prev, { id: Date.now() + 'd1', type: 'meta', content: `[DEBUG] Drop Event Fired. Plain: '${plainData}', Global: '${globalData}', Files: '${filesData}'`, timestamp: '' }]);

        if (path) {
          const formatted = path.includes(' ') ? `"${path}"` : path;
          setInput(prev => prev ? `${prev} ${formatted} ` : `${formatted} `);
          if (inputRef.current) inputRef.current.focus();
          (window as any).__OASIS_DRAGGED_FILE__ = null;
        } else {
          setLines((prev: any[]) => [...prev, { id: Date.now() + 'd2', type: 'error', content: `[DEBUG] Drag failed. No path found. DataTransfer types: ${e.dataTransfer.types.join(', ')}`, timestamp: '' }]);
        }
      }}
    >
      <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 bg-black/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-slate-500" />
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            {cwd ? cwd : 'Oasis Shell'}
          </span>
          {isExecuting && (
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">Running</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => useTerminalStore.getState().clearTabLines(tabId)}
            className="p-1.5 text-slate-600 hover:text-slate-300 transition-colors"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-4 font-mono text-[12px] leading-relaxed space-y-0.5 no-scrollbar"
          >
            {lines.map((line, index) => {
              const isLastErrorInBlock = line.type === 'error' && lines[index + 1]?.type !== 'error';
              
              const getFullErrorContext = () => {
                let context = '';
                let i = index;
                while (i >= 0 && lines[i].type === 'error') {
                  context = lines[i].content + '\n' + context;
                  i--;
                }
                return context.trim();
              };

              return (
                <div key={line.id} className={cn('flex flex-col gap-1', lineColor(line.type))}>
                  <div className="flex gap-3 items-start">
                    {line.type === 'input' && (
                      <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-400" />
                    )}
                    {line.type === 'error' && (
                      <span className="flex-shrink-0 text-red-500">!</span>
                    )}
                    {(line.type === 'output' || line.type === 'meta' || line.type === 'done') && (
                      <span className="flex-shrink-0 w-3" />
                    )}
                    <span className="break-all">{line.content}</span>
                  </div>
                  {isLastErrorInBlock && (
                    <div className="pl-6 py-1">
                      <button
                        onClick={() => triggerHealProtocol(getFullErrorContext())}
                        disabled={isHealing}
                        className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/20 text-red-300 rounded text-[10px] uppercase font-bold tracking-widest transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className={cn("w-3 h-3", isHealing && "animate-pulse")} />
                        {isHealing ? 'Healing...' : 'Diagnose & Fix'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {isExecuting && (
              <div className="flex gap-2 items-center text-emerald-400/60 mt-1">
                <span className="w-3" />
                <span className="animate-pulse text-[11px]">▋</span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleCommand}
            className="flex items-center gap-3 px-6 py-3 border-t border-white/5 flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: stressColor }} />
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder={isExecuting ? 'Command running…' : 'Enter command…'}
              className="flex-1 bg-transparent font-mono text-[12px] text-white outline-none placeholder:text-slate-700 disabled:opacity-40"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={isExecuting ? handleStopCommand : (e) => { e.preventDefault(); handleCommand(e as any); }}
              disabled={!isExecuting && !input.trim()}
              className={cn("p-1.5 rounded-lg transition-all", (!isExecuting && !input.trim()) && "opacity-30")}
              title={isExecuting ? 'Stop Command' : 'Run Command'}
            >
              <FalconIcon className={cn("w-4 h-4 transition-all duration-300", isExecuting ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-110" : "text-white hover:text-[#6366f1]")} />
            </button>
          </form>
    </div>
  );
}

export function TerminalPanel({ isOpen, onClose, stressColor = '#6366f1' }: TerminalPanelProps) {
  const tabs = useTerminalStore(state => state.tabs);
  const activeTabId = useTerminalStore(state => state.activeTabId);
  const addTab = useTerminalStore(state => state.addTab);
  const removeTabAction = useTerminalStore(state => state.removeTab);
  const setActiveTab = useTerminalStore(state => state.setActiveTab);

  const removeTab = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation();
    removeTabAction(idToRemove);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed bottom-0 left-20 md:left-24 right-0 h-[45vh] z-[300] flex flex-col"
          onDragEnter={(e: any) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; }}
          onDragOver={(e: any) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = 'copy'; }}
          onDrop={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            const path = e.dataTransfer.getData('text/plain') || (window as any).__OASIS_DRAGGED_FILE__;
            if (path) {
              window.dispatchEvent(new CustomEvent('oasis-terminal-drop', { detail: path }));
              (window as any).__OASIS_DRAGGED_FILE__ = null;
            }
          }}
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.97) 0%, rgba(2,4,20,0.99) 100%)',
            borderTop: `1px solid ${stressColor}40`,
            boxShadow: `0 -20px 60px rgba(0,0,0,0.8), 0 -4px 20px ${stressColor}20`,
          }}
        >
          <div className="flex justify-between items-center bg-black/40 border-b border-white/5 pl-2 pr-4 flex-shrink-0 pt-1">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs cursor-pointer border-t border-l border-r transition-all group",
                    activeTabId === tab.id
                      ? "bg-[#0a0a0f] border-white/10 text-white"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                  )}
                >
                  <TerminalIcon className="w-3 h-3" />
                  <span>{tab.name}</span>
                  <button
                    onClick={(e) => removeTab(e, tab.id)}
                    className="p-0.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addTab()}
                className="p-1.5 ml-1 text-slate-500 hover:text-white rounded transition-colors"
                title="New Terminal Instance"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Instances */}
          <div className="flex-1 relative overflow-hidden bg-[#0a0a0f]">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={cn(
                  "absolute inset-0 h-full",
                  activeTabId === tab.id ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                )}
              >
                <TerminalInstance tabId={tab.id} isActive={activeTabId === tab.id} stressColor={stressColor} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
