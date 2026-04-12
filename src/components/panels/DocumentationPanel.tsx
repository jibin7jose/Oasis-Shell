import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Book, ChevronRight, FileText, 
  Shield, Zap, Cpu, Code2, 
  Search, Terminal, Database, Bot, Activity, History
} from "lucide-react";
import { invokeSafe, isTauri } from "../../lib/tauri";

interface DocumentationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");




export default function DocumentationPanel({ isOpen, onClose }: DocumentationPanelProps) {
    const [chapters, setChapters] = useState<any[]>([]);
    const [selectedChapter, setSelectedChapter] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchIndex = async () => {
                try {
                    const idx = isTauri 
                        ? await invokeSafe<string[]>("get_documentation_index")
                        : ["overview", "architecture", "security", "roadmap"];
                    
                    const formatted = idx.map(id => ({
                        id,
                        title: id.startsWith('logs/') ? id.replace('logs/', '').replace(/_/g, ' @ ').toUpperCase() : (id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ').replace('-', ' ')),
                        icon: id.startsWith('logs/') ? History : (id.includes('security') ? Shield : (id.includes('arch') ? Database : (id.includes('road') ? Activity : Cpu))),
                        color: id.startsWith('logs/') ? 'slate' : (id.includes('security') ? 'rose' : (id.includes('road') ? 'emerald' : 'indigo'))
                    }));
                    setChapters(formatted);
                    if (formatted.length > 0 && !selectedChapter) {
                        setSelectedChapter(formatted[0].id);
                    }
                } catch (e) {
                    console.error("Manual Hub Sync Failed", e);
                }
            };
            fetchIndex();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedChapter) {
            const fetchContent = async () => {
                setIsLoading(true);
                try {
                    const content = isTauri 
                        ? await invokeSafe<string>("get_documentation_chapter", { id: selectedChapter })
                        : `<h1>${selectedChapter}</h1><p>This is a simulated manual entry for the ${selectedChapter} module.</p>`;
                    setHtmlContent(content);
                } catch (e) {
                    setHtmlContent(`<div class="p-12 glass border border-rose-500/20 text-rose-400 rounded-[2.5rem] bg-rose-500/5 font-bold uppercase tracking-widest text-xs text-center flex flex-col gap-4 items-center justify-center">
                        <Terminal className="w-8 h-8 opacity-50" />
                        Neural manifest for "${selectedChapter}" is currently restricted.
                    </div>`);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchContent();
        }
    }, [selectedChapter]);

    if (!isOpen) return null;

    const activeChapter = chapters.find(c => c.id === selectedChapter);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-12 pointer-events-none"
        >
            <div className="w-full max-w-6xl h-full glass-bright rounded-[3rem] border border-white/5 shadow-3xl shadow-black/60 flex overflow-hidden pointer-events-auto backdrop-blur-4xl">
                {/* SIDEBAR */}
                <div className="w-80 border-r border-white/5 p-10 flex flex-col gap-8 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                            <Book className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight uppercase">Manual Hub</h2>
                    </div>

                    <div className="flex flex-col gap-2">
                        {chapters.map((chap) => (
                            <div 
                                key={chap.id}
                                onClick={() => setSelectedChapter(chap.id)}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer group",
                                    selectedChapter === chap.id ? "bg-white/10 border border-white/10" : "hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <chap.icon className={cn("w-4 h-4", selectedChapter === chap.id ? `text-${chap.color}-400` : "text-slate-500")} />
                                    <span className={cn("text-xs font-bold uppercase tracking-widest", selectedChapter === chap.id ? "text-white" : "text-slate-500")}>{chap.title}</span>
                                </div>
                                <ChevronRight className={cn("w-3 h-3 transition-transform", selectedChapter === chap.id ? "text-white rotate-90" : "text-slate-700")} />
                            </div>
                        ))}

                        {chapters.length === 0 && (
                            <div className="animate-pulse flex flex-col gap-4 mt-8">
                                <div className="h-12 bg-white/5 rounded-2xl" />
                                <div className="h-12 bg-white/5 rounded-2xl" />
                                <div className="h-12 bg-white/5 rounded-2xl" />
                            </div>
                        )}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col p-16 overflow-y-auto no-scrollbar relative">
                    <div className="flex justify-between items-start mb-12">
                        <div className="flex flex-col gap-4">
                            <div className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 w-fit rounded-full", activeChapter ? `bg-${activeChapter.color}-500/10 text-${activeChapter.color}-400` : "bg-indigo-500/10 text-indigo-500")}>
                                Foundry Prime // Oasis OS // {selectedChapter}
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter leading-tight max-w-2xl uppercase italic">
                                {activeChapter?.title || "Retrieving..."}
                            </h1>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-slate-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={selectedChapter}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="prose prose-invert prose-p:text-slate-400 prose-headings:text-white prose-strong:text-indigo-400 prose-code:text-emerald-400 max-w-none"
                        >
                            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        </motion.div>
                    </AnimatePresence>

                    {/* TERMINAL FOOTER SNIPPET */}
                    <div className="mt-20 p-10 bg-black/40 rounded-3xl border border-white/5 flex flex-col gap-4 font-mono text-xs overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database className="w-20 h-20 text-indigo-500" />
                        </div>
                        <div className="flex items-center gap-3 text-slate-500">
                           <Terminal className="w-5 h-5" />
                           <span className="uppercase tracking-widest font-black">Registry Check // Channel: {selectedChapter}</span>
                        </div>
                        <div className="text-emerald-500 opacity-80 flex items-center gap-4">
                           <span className="animate-pulse">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬ÂÃƒâ€šÃ‚Â</span>
                           oasisshell.exe -load --chapter {selectedChapter.toLowerCase()} --source blog/docs/
                        </div>
                        <div className="text-white opacity-40">
                           [Oasis Pulse] Synchronizing Knowledge Hub with Foundry Documentation...
                           <br/>[Oasis Pulse] Manifesting dynamic HTML entities... SUCCESS.
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

