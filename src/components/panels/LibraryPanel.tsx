import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Search, Clock, Zap, BookOpen, Trash2, ChevronRight, Brain, Filter, Database } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

interface StrategicMemory {
    id: number;
    content: string;
    metadata: string;
    score: number;
    timestamp: string;
}

export const LibraryPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [memories, setMemories] = useState<StrategicMemory[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMemory, setSelectedMemory] = useState<StrategicMemory | null>(null);
    const { logEvent, setNotification } = useSystemStore();

    const fetchAllMemories = async () => {
        setIsSearching(true);
        try {
            // Reusing query_strategic_memory with a broad term or empty query if supported,
            // or we could add a list_strategic_memory command. 
            // For now, we perform a broad search.
            const res = await invokeSafe("query_strategic_memory", { query: query || "strategic" }) as StrategicMemory[];
            setMemories(res);
        } catch (e) {
            console.error("Library Retrieval Failure", e);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllMemories();
        }
    }, [isOpen]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        fetchAllMemories();
        logEvent(`Semantic Search initiated: ${query}`, "system");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed inset-0 z-[6000] flex items-center justify-center p-12 pointer-events-none"
                >
                    <div className="w-full max-w-6xl h-full glass border-indigo-500/20 shadow-5xl rounded-[3rem] overflow-hidden flex pointer-events-auto">
                        {/* Sidebar: Constellation Browser */}
                        <div className="w-80 border-r border-white/5 bg-black/20 flex flex-col">
                            <div className="p-8 border-b border-white/5">
                                <div className="flex items-center gap-3 text-indigo-400 mb-6">
                                    <Database className="w-5 h-5" />
                                    <h2 className="text-sm font-black uppercase tracking-[0.3em]">Infinite Archive</h2>
                                </div>
                                <form onSubmit={handleSearch} className="relative">
                                    <input 
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Semantic Search..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs focus:border-indigo-500/50 outline-none transition-all"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                </form>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {memories.map((memory) => (
                                    <button
                                        key={memory.id}
                                        onClick={() => setSelectedMemory(memory)}
                                        className={`w-full p-4 rounded-2xl text-left border transition-all flex flex-col gap-2 group ${
                                            selectedMemory?.id === memory.id 
                                            ? 'bg-indigo-500/10 border-indigo-500/40 shadow-xl' 
                                            : 'border-transparent hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{memory.timestamp}</span>
                                            <span className="text-[8px] font-bold text-slate-500">{memory.score ? `${(memory.score * 100).toFixed(0)}% Match` : ''}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-200">{memory.content}</p>
                                    </button>
                                ))}
                                {isSearching && <div className="p-4 text-center text-slate-500 text-[10px] uppercase tracking-widest animate-pulse">Retrieving Memories...</div>}
                            </div>
                        </div>

                        {/* Main Stage: Asset Manifestation */}
                        <div className="flex-1 flex flex-col bg-slate-900/40">
                            <div className="p-8 flex items-center justify-between border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                                        <BookOpen className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">Strategic Asset View</h3>
                                        <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Neural Recall Mechanism</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                                    <Trash2 className="w-5 h-5 text-slate-500 hover:text-rose-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                {selectedMemory ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="max-w-3xl mx-auto space-y-12"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                ID: {selectedMemory.id}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                <Clock className="w-4 h-4" />
                                                Archived {selectedMemory.timestamp}
                                            </div>
                                        </div>

                                        <div className="prose prose-invert prose-slate max-w-none">
                                            <p className="text-lg text-slate-300 leading-relaxed font-serif whitespace-pre-wrap italic">
                                                "{selectedMemory.content}"
                                            </p>
                                        </div>

                                        <div className="pt-12 border-t border-white/5 grid grid-cols-2 gap-8">
                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                                <div className="flex items-center gap-3 text-emerald-400">
                                                    <Brain className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Resonance</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                                    This memory was retrieved with a semantic resonance score of {(selectedMemory.score * 100).toFixed(2)}%. It remains a high-signal strategic asset.
                                                </p>
                                            </div>
                                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                                <div className="flex items-center gap-3 text-amber-400">
                                                    <Zap className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Founder Origin</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                                    Manifested through hardware-anchored biometric verification. Source: {selectedMemory.metadata}.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                                        <Database className="w-16 h-16 text-slate-500 mb-6" />
                                        <p className="text-sm text-slate-400 uppercase tracking-[0.4em] font-black">Select an Asset to Manifest</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
