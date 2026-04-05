import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Book, ChevronRight, FileText, 
  Shield, Zap, Cpu, Code2, 
  Search, Terminal, Database, Bot
} from "lucide-react";

interface DocumentationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function DocumentationPanel({ isOpen, onClose }: DocumentationPanelProps) {
    const [selectedChapter, setSelectedChapter] = useState('Overview');

    const chapters = [
        { id: 'Overview', title: 'Oasis Kernel Overview', icon: Cpu, color: 'indigo' },
        { id: 'Features', title: 'Strategic OS Features', icon: Zap, color: 'emerald' },
        { id: 'Architecture', title: 'Rust-Foundry Architecture', icon: Shield, color: 'rose' },
        { id: 'PhasePlan', title: 'Implementation Roadmap', icon: FileText, color: 'amber' },
        { id: 'GolemLogic', title: 'Golem Workforce Logic', icon: Bot, color: 'indigo' }
    ];

    const contentMap: Record<string, any> = {
        'Overview': {
            title: 'Oasis Shell V7.4 // Founders Edition',
            description: 'The Oasis Shell is an AI-native, memory-safe operating layer built on the Rust Foundry. It prioritizes zero-drift orchestration and high-fidelity visual telemetry.',
            points: [
                'Memory Management: Guaranteed 100% safety via Rust Borrow Checker.',
                'Intent Engine: Neural transcript resolution for real-time orchestration.',
                'Telemetry: Strategic Node monitoring with oscillating pulse heartbeats.'
            ]
        },
        'Features': {
            title: 'Strategic Neural Capabilities',
            description: 'Oasis leverages a multi-pane executive command center to provide absolute visibility over startup operations.',
            points: [
                'Asset Vault: Liquid capital matrix tracking ($1.8M capacity).',
                'Golem Workforce: Autonomous agents managing market sync and vault seals.',
                'Visionary Portal: Strategic bridge for venture synthesis.'
            ]
        },
        'Architecture': {
            title: 'Rust Foundry Infrastructure',
            description: 'Unlike legacy C-based systems, Oasis uses a memory-safe kernel architecture that eliminates 70% of potential security vulnerabilities.',
            points: [
                'Tauri V2 Platform: Cross-platform industrial performance.',
                'Vite Frontend: High-speed React hydration with Tailwind 4 styling.',
                'Sentinel Vault: AES-GCM (v25) encrypted archival hub.'
            ]
        }
    };

    const chapter = contentMap[selectedChapter] || contentMap['Overview'];

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-12 pointer-events-none"
        >
            <div className="w-full max-w-6xl h-full glass rounded-[3rem] border border-white/5 shadow-2xl flex overflow-hidden pointer-events-auto">
                {/* SIDEBAR */}
                <div className="w-80 border-r border-white/5 p-10 flex flex-col gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                            <Book className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight uppercase">Manual Hub</h2>
                    </div>

                    <div className="flex flex-col gap-3">
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
                                    <span className={cn("text-xs font-bold uppercase tracking-widest", selectedChapter === chap.id ? "text-white" : "text-slate-500")}>{chap.id}</span>
                                </div>
                                <ChevronRight className={cn("w-3 h-3 transition-transform", selectedChapter === chap.id ? "text-white rotate-90" : "text-slate-700")} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col p-16 gap-10 overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-4">
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 w-fit rounded-full">Foundation Prime // Oasis OS</div>
                            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight max-w-2xl">{chapter.title}</h1>
                            <p className="text-slate-400 leading-relaxed max-w-xl">{chapter.description}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {chapter.points.map((point: string, i: number) => (
                            <div key={i} className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-all group">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                    <Code2 className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="text-sm font-bold text-white leading-relaxed">{point}</div>
                            </div>
                        ))}
                    </div>

                    {/* TERMINAL FOOTER SNIPPET */}
                    <div className="mt-auto p-8 bg-black/40 rounded-3xl border border-white/5 flex flex-col gap-4 font-mono text-xs">
                        <div className="flex items-center gap-3 text-slate-500">
                           <Terminal className="w-4 h-4" />
                           <span>Registry Check // Version 7.4.24</span>
                        </div>
                        <div className="text-emerald-500 opacity-80">
                           oasisshell.exe -load --chapter {selectedChapter.toLowerCase()} --verbose
                        </div>
                        <div className="text-white opacity-60">
                           [Oasis Pulse] Initializing Documentation Manifest v1.0.1...
                           <br/>[Oasis Pulse] Rendering High-Fidelity Knowledge Hub... SUCCESS.
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
