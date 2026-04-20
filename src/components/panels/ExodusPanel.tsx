import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Rocket, Boxes, Cpu, Globe, Terminal as TerminalIcon, 
    CheckCircle2, XCircle, Loader2, FolderOpen, Zap, 
    BarChart3, ShieldCheck, ChevronRight, Activity, Clock
} from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { useSystemStore } from '../../lib/systemStore';

type BuildStatus = 'Idle' | 'Queued' | 'Compiling' | 'Packaging' | 'Success' | 'Failed';

interface BuildManifest {
    name: string;
    status: BuildStatus;
    logs: string[];
    output_path?: string;
    duration_ms: number;
    timestamp: string;
}

const StatusBadge: React.FC<{ status: BuildStatus }> = ({ status }) => {
    const config = {
        Idle: { color: 'text-slate-500 bg-slate-500/10', label: 'READY' },
        Queued: { color: 'text-amber-400 bg-amber-400/10', label: 'QUEUED' },
        Compiling: { color: 'text-violet-400 bg-violet-400/10', label: 'FORGING' },
        Packaging: { color: 'text-indigo-400 bg-indigo-400/10', label: 'PACKAGING' },
        Success: { color: 'text-emerald-400 bg-emerald-400/10', label: 'MANIFESTED' },
        Failed: { color: 'text-red-400 bg-red-400/10', label: 'ABORTED' },
    }[status];

    return (
        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase ${config.color}`}>
            {config.label}
        </div>
    );
};

const BuildTerminal: React.FC<{ logs: string[] }> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TerminalIcon className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Exodus Build Stream</span>
                </div>
            </div>
            <div 
                ref={scrollRef}
                className="flex-1 p-4 font-mono text-[10px] space-y-1 overflow-y-auto custom-scrollbar"
            >
                {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-20 italic">
                        <p>Waiting for forge manifestation...</p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className="text-slate-300">
                            <span className="text-slate-600 mr-2">[{i.toString().padStart(3, '0')}]</span>
                            {log.startsWith('ERR:') ? <span className="text-red-400">{log}</span> : log}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const ExodusPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logEvent, setNotification } = useSystemStore();
    const [ventures, setVentures] = useState<any[]>([]);
    const [builds, setBuilds] = useState<Record<string, BuildManifest>>({});
    const [activeVenture, setActiveVenture] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const ventureList = await invokeSafe('list_active_ventures') as any[];
            const buildList = await invokeSafe('get_all_build_manifests') as BuildManifest[];
            setVentures(ventureList);
            const buildMap = buildList.reduce((acc, b) => ({ ...acc, [b.name]: b }), {});
            setBuilds(buildMap);
        } catch (e) {
            console.error("Exodus Data Refresh Failure:", e);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshData();
            const interval = setInterval(refreshData, 2000);
            return () => clearInterval(interval);
        }
    }, [isOpen, refreshData]);

    const initiateForge = async (name: string) => {
        try {
            await invokeSafe('forge_venture_binary', { name });
            setActiveVenture(name);
            logEvent(`Initiated Exodus forge for [${name}]`, 'system');
            setNotification(`Exodus: Initiating binary forge for ${name}...`);
        } catch (e) {
            setNotification(`Forge Failure: ${e}`);
        }
    };

    const openFolder = async (path: string) => {
        try {
            await invokeSafe('open_strategic_asset', { path });
        } catch (e) {
            setNotification(`Path Breach: ${e}`);
        }
    };

    if (!isOpen) return null;

    const currentBuild = activeVenture ? builds[activeVenture] : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-12"
        >
            <div className="w-full max-w-7xl h-full flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <Rocket className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">The Exodus Protocol</h2>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Phase 37 // Native Binary Forge & Deployment Hub</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Deactivate Protocol
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 min-h-0">
                    {/* Left Rail — Venture Fleet */}
                    <div className="w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-slate-500" />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Fleet</h3>
                            </div>
                            {isRefreshing && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
                        </div>

                        <div className="space-y-3">
                            {ventures.map((v, i) => {
                                const b = builds[v.name];
                                const isCompiling = b?.status === 'Compiling' || b?.status === 'Packaging';
                                const isActive = activeVenture === v.name;

                                return (
                                    <motion.button
                                        key={v.name}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => setActiveVenture(v.name)}
                                        className={`w-full p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                                            isActive ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        {isCompiling && (
                                            <motion.div 
                                                className="absolute bottom-0 left-0 h-1 bg-indigo-500/30"
                                                animate={{ width: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                            />
                                        )}
                                        
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {v.forge_mode === 'rust-tauri' ? <Cpu className="w-4 h-4 text-violet-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
                                                <div>
                                                    <p className="text-[11px] font-black text-white">{v.name}</p>
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{v.forge_mode}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={b?.status || 'Idle'} />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 opacity-50">
                                                    <Clock className="w-3 h-3 text-slate-500" />
                                                    <span className="text-[9px] font-mono text-slate-400">
                                                        {b ? `${(b.duration_ms / 1000).toFixed(1)}s` : '--'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                disabled={isCompiling}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    initiateForge(v.name);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    isCompiling ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                                                }`}
                                            >
                                                Forge
                                            </button>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Pane — Forge Monitor */}
                    <div className="flex-1 flex flex-col gap-5">
                        {!activeVenture ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-5 opacity-30 p-12 text-center">
                                <Rocket className="w-16 h-16 text-slate-600 mb-2" />
                                <h4 className="text-xl font-black uppercase tracking-widest text-white">Select a Venture</h4>
                                <p className="text-slate-500 text-sm max-w-md italic">
                                    Initiate binary forging to manifest your sub-venture as a standalone native application or static build.
                                </p>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeVenture}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="flex-1 flex flex-col gap-6"
                                >
                                    {/* Active Build Status */}
                                    <div className="glass bg-white/[0.02] border-white/5 rounded-3xl p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                                                currentBuild?.status === 'Success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                                : currentBuild?.status === 'Failed' ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                                : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                            }`}>
                                                {currentBuild?.status === 'Success' ? <ShieldCheck className="w-7 h-7" /> : <Activity className={`w-7 h-7 ${currentBuild?.status === 'Compiling' ? 'animate-pulse' : ''}`} />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{activeVenture} // Exodus Status</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Build Session: {activeVenture}-{currentBuild?.timestamp?.slice(11, 19).replace(/:/g, '') || 'NA'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Duration: {currentBuild ? `${currentBuild.duration_ms}ms` : '--'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {currentBuild?.status === 'Success' && currentBuild.output_path && (
                                            <button 
                                                onClick={() => openFolder(currentBuild.output_path!)}
                                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                                            >
                                                <FolderOpen className="w-4 h-4" />
                                                Locate Assets
                                            </button>
                                        )}
                                    </div>

                                    {/* Log Stream */}
                                    <BuildTerminal logs={currentBuild?.logs || []} />

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-5">
                                        {[
                                            { label: 'Compiler Link', icon: Zap, value: 'LLVM / Node', color: 'text-amber-400' },
                                            { label: 'Integrity', icon: ShieldCheck, value: currentBuild?.status === 'Success' ? 'VERIFIED' : 'PENDING', color: 'text-emerald-400' },
                                            { label: 'Manifest Status', icon: BarChart3, value: currentBuild?.status || 'IDLE', color: 'text-indigo-400' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
                                                    <p className="text-[10px] font-black text-white mt-0.5">{stat.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
