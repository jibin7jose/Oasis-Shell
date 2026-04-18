import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Wifi, Globe, Zap, Shield, Cpu, Activity, Share2, Server, Terminal } from 'lucide-react';
import { useSystemStore } from "../../lib/systemStore";
import { listen } from "@tauri-apps/api/event";
import { invokeSafe } from "../../lib/tauri";

interface CollectiveNode {
    id: string;
    ip: string;
    port: number;
    hostname: string;
    status: string;
    last_pulse: string;
    aura: string;
    latency_ms: number;
}

export const CollectivePanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { collectiveNodes, setCollectiveNodes, logEvent, ventureIntegrity } = useSystemStore();
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        const unlisten = listen("collective-discovered", (event) => {
            logEvent(`New Command Node Manifested: ${event.payload}`, "system");
            // Refresh collective list from kernel if needed
        });
        return () => { unlisten.then(f => f()); };
    }, []);

    const handleAuraSync = async () => {
        setIsBroadcasting(true);
        try {
            await invokeSafe("collective_aura_sync", { 
                integrity: ventureIntegrity, 
                status: "RESONANCE_ESTABLISHED" 
            });
            logEvent("Distributed Aura Synchronization Manifested", "neural");
        } catch (e) {
            console.error("Collective Sync Breach", e);
        } finally {
            setTimeout(() => setIsBroadcasting(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 100 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 100 }}
                    className="fixed right-12 top-24 bottom-24 w-[400px] z-[5000] pointer-events-none"
                >
                    <div className="w-full h-full glass border-indigo-500/20 shadow-5xl rounded-[2.5rem] overflow-hidden flex flex-col pointer-events-auto">
                        <div className="p-8 border-b border-white/5 bg-black/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3 text-indigo-400">
                                    <Network className="w-5 h-5" />
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em]">Collective Resonance</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mesh Active</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleAuraSync}
                                disabled={isBroadcasting}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 border transition-all ${
                                    isBroadcasting 
                                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 animate-pulse' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-900/20'
                                }`}
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Broadcast Global Aura</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Connected Command Nodes</span>
                                {collectiveNodes.length > 0 ? (
                                    collectiveNodes.map((node) => (
                                        <div key={node.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 group hover:border-indigo-500/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Server className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-[11px] font-bold text-white tracking-tight">{node.hostname}</span>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                                    node.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                    {node.status}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500">
                                                <div className="flex items-center gap-1.5 uppercase">
                                                    <Wifi className="w-3 h-3" /> {node.ip}:{node.port}
                                                </div>
                                                <div className="flex items-center gap-1.5 uppercase">
                                                    <Activity className="w-3 h-3" /> {node.latency_ms}ms Latency
                                                </div>
                                            </div>
                                            <div className="pt-2 border-t border-white/5 flex gap-2">
                                                <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors">Handover Crate</button>
                                                <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors">Mirror Desktop</button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center opacity-30 flex flex-col items-center gap-4">
                                        <Globe className="w-12 h-12 text-slate-500 animate-spin-slow" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Scanning local resonance...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 border-t border-white/5">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <Shield className="w-4 h-4 text-indigo-400" />
                                <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                                    Strategic Mesh is encrypted via <span className="text-indigo-300">P2P Aura ID</span>. Node discovery is restricted to the local subnet.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
