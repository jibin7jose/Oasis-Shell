import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Network, Share2, Globe, Shield, Zap, Activity, 
    RefreshCcw, Monitor, Terminal, Users, Database
} from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { useSystemStore } from '../../lib/systemStore';

interface MeshNode {
    id: string;
    ip: string;
    hostname: string;
    integrity: number;
    active_ventures: string[];
    last_seen: string;
    latency_ms: number;
    aura: string;
}

const NodeCard: React.FC<{ node: MeshNode; index: number }> = ({ node, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 relative overflow-hidden group transition-all"
        >
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-${node.aura === 'emerald' ? 'emerald' : 'indigo'}-500/50`} />
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <Monitor className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{node.hostname}</h4>
                        <p className="text-[10px] font-mono text-slate-500">{node.ip}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{node.integrity}% Integrity</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Live</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Ventures</span>
                        <Database className="w-3 h-3 text-slate-600" />
                    </div>
                    {node.active_ventures.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {node.active_ventures.map((v, i) => (
                                <span key={i} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[8px] font-black text-indigo-300 uppercase tracking-widest">
                                    {v}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[9px] text-slate-600 italic">No active sub-ventures detected.</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Latency</span>
                        </div>
                        <span className="text-xs font-mono text-white">{node.latency_ms}ms</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Security</span>
                        </div>
                        <span className="text-xs font-mono text-white">Encrypted</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Last Pulse: {new Date(node.last_seen).toLocaleTimeString()}</span>
                <button className="text-[9px] font-black text-indigo-500 hover:text-indigo-400 uppercase tracking-widest transition-colors flex items-center gap-1.5">
                    Sync Manifest <Share2 className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    );
};

export const ConsortiumPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logEvent, setNotification } = useSystemStore();
    const [nodes, setNodes] = useState<MeshNode[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    const refreshNodes = useCallback(async () => {
        setIsScanning(true);
        try {
            const result = await invokeSafe('get_consortium_nodes') as MeshNode[];
            setNodes(result);
        } catch (e) {
            console.error("Mesh Refresh Failure:", e);
        } finally {
            setTimeout(() => setIsScanning(false), 800);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshNodes();
            const interval = setInterval(refreshNodes, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, refreshNodes]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[8000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden"
        >
            {/* Background Neural Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
                <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="w-full max-w-7xl h-full flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Network className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">The Consortium Mesh</h2>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-[0.4em]">Decentralized Strategic Collective</p>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-indigo-500" />
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{nodes.length} Nodes Manifested</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={refreshNodes}
                            className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all ${isScanning ? 'animate-spin' : ''}`}
                        >
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onClose}
                            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all"
                        >
                            Deactivate Mesh view
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                    {nodes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-24 bg-white/[0.01] rounded-[4rem] border border-dashed border-white/5">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-32 h-32 rounded-full bg-indigo-500/5 flex items-center justify-center mb-8"
                            >
                                <Activity className="w-12 h-12 text-indigo-500/40" />
                            </motion.div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">Awaiting Peer Discovery...</h3>
                            <p className="text-slate-500 text-sm max-w-md italic font-medium leading-relaxed">
                                "The scout is broadcasting on port 4040. Peer nodes will manifest as they synchronize with the local pulse."
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Local Node always first */}
                            <NodeCard 
                                node={{
                                    id: 'local',
                                    ip: '127.0.0.1',
                                    hostname: 'Local Strategic Node (Master)',
                                    integrity: 100,
                                    active_ventures: ['Venture Management', 'Macro Engine'],
                                    last_seen: new Date().toISOString(),
                                    latency_ms: 0,
                                    aura: 'emerald'
                                }}
                                index={0}
                            />
                            {nodes.map((node, i) => (
                                <NodeCard key={node.id} node={node} index={i + 1} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="grid grid-cols-4 gap-6 mt-12 bg-white/[0.02] p-8 rounded-[3rem] border border-white/5">
                    {[
                        { label: 'Mesh Status', icon: Shield, value: 'STABLE', color: 'text-emerald-400' },
                        { label: 'Network Latency', icon: Activity, value: '14ms Avg', color: 'text-indigo-400' },
                        { label: 'Cluster Throughput', icon: Zap, value: '840 Mb/s', color: 'text-amber-400' },
                        { label: 'Collective Capacity', icon: Users, value: `${nodes.length + 1} Nodes`, color: 'text-violet-400' }
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-5">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-sm font-black text-white uppercase tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
