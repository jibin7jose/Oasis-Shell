import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, Brain, Zap, Activity, MessageSquare, Terminal, 
    Shield, Code, Globe, Sparkles, Send, Bot, Users,
    Search, GitBranch, Layers
} from 'lucide-react';
import { invokeSafe, listenSafe } from '../../lib/tauri';
import { useSystemStore } from '../../lib/systemStore';

interface Agent {
    id: string;
    name: string;
    persona: string;
    status: string;
    last_thought: string;
}

interface DebateState {
    task: string;
    persona_thoughts: Record<string, string>;
    final_verdict?: string;
}

const AgentNode: React.FC<{ agent: Agent; isActive: boolean; lastThought: string }> = ({ agent, isActive, lastThought }) => (
    <motion.div
        layout
        className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col h-full ${
            isActive 
            ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.1)]' 
            : 'bg-white/[0.02] border-white/10'
        }`}
    >
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                    agent.persona === 'Architect' ? 'bg-indigo-500/20 text-indigo-400' :
                    agent.persona === 'Strategist' ? 'bg-rose-500/20 text-rose-400' :
                    agent.persona === 'Sentinel' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-amber-500/20 text-amber-400'
                }`}>
                    {agent.persona === 'Architect' ? <Code className="w-6 h-6" /> :
                     agent.persona === 'Strategist' ? <Globe className="w-6 h-6" /> :
                     agent.persona === 'Sentinel' ? <Shield className="w-6 h-6" /> :
                     <Cpu className="w-6 h-6" />}
                </div>
                <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{agent.name}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{agent.persona}</p>
                </div>
            </div>
            {isActive && (
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Thinking</span>
                </div>
            )}
        </div>

        <div className="flex-1 bg-black/40 rounded-2xl p-5 border border-white/5 font-mono text-[11px] leading-relaxed relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Terminal className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-indigo-300/80 mb-2 font-black uppercase tracking-widest text-[9px]">Last Perspective:</div>
            <p className="text-slate-300 line-clamp-6">{lastThought || agent.last_thought}</p>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-slate-600" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Core Synchronized</span>
            </div>
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">v4.0.0</span>
        </div>
    </motion.div>
);

export const SingularityPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { logEvent, setNotification } = useSystemStore();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isDebating, setIsDebating] = useState(false);
    const [currentTask, setCurrentTask] = useState("");
    const [debateResult, setDebateResult] = useState<DebateState | null>(null);
    const [activePersona, setActivePersona] = useState<string | null>(null);
    const [agentThoughts, setAgentThoughts] = useState<Record<string, string>>({});
    const terminalRef = useRef<HTMLDivElement>(null);

    const refreshCollective = useCallback(async () => {
        try {
            const result = await invokeSafe('get_agent_collective') as Agent[];
            setAgents(result);
        } catch (e) {
            console.error("Collective Refresh Failure:", e);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshCollective();
            const unlisten = listenSafe('agent-thought', (event: any) => {
                const [persona, thought] = event.payload;
                setActivePersona(persona);
                setAgentThoughts(prev => ({ ...prev, [persona]: thought }));
            });
            return () => { unlisten.then(f => f()); };
        }
    }, [isOpen, refreshCollective]);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [agentThoughts, debateResult]);

    const initiateDebate = async () => {
        if (!currentTask) return;
        setIsDebating(true);
        setDebateResult(null);
        setAgentThoughts({});
        setNotification("Singularity: Agent Consensus Loop Initiated.");

        try {
            const result = await invokeSafe('invoke_golem_debate', { task: currentTask }) as DebateState;
            setDebateResult(result);
            logEvent("strategic_debate_complete", { task: currentTask });
        } catch (e) {
            setNotification("Singularity Failure: Neural loop fragmented.");
            console.error(e);
        } finally {
            setIsDebating(false);
            setActivePersona(null);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-12 overflow-hidden"
        >
            {/* Background Neural Interface */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
                <div className="absolute inset-x-0 top-0 h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2" />
                <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="w-full max-w-7xl h-full flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" 
                            />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Singularity Gateway</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-[0.5em]">Multi-Agent Orchestration Layer</p>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                <div className="flex items-center gap-2">
                                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{agents.length} Neural Agents Syncing</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="px-8 py-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all border border-white/5"
                    >
                        Disconnect Gateway
                    </button>
                </div>

                <div className="flex-1 flex gap-12 min-h-0">
                    {/* Left: Agent Grid */}
                    <div className="flex-1 flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[400px]">
                            {agents.map((agent) => (
                                <AgentNode 
                                    key={agent.id} 
                                    agent={agent} 
                                    isActive={activePersona === agent.id} 
                                    lastThought={agentThoughts[agent.persona] || ""}
                                />
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="mt-8 bg-white/[0.02] border border-white/5 p-8 rounded-[3rem] relative group focus-within:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <input 
                                    value={currentTask}
                                    onChange={(e) => setCurrentTask(e.target.value)}
                                    placeholder="Define a strategic mission for the collective collective..."
                                    className="flex-1 bg-transparent border-none text-xl font-medium text-white placeholder:text-slate-700 focus:outline-none focus:ring-0"
                                    onKeyDown={(e) => e.key === 'Enter' && initiateDebate()}
                                />
                                <button 
                                    onClick={initiateDebate}
                                    disabled={isDebating || !currentTask}
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-2xl flex items-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-indigo-500/10"
                                >
                                    <span className="text-[12px] font-black uppercase tracking-widest">Initiate Debate</span>
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Thought Trace Terminal */}
                    <div className="w-[450px] flex flex-col h-full">
                        <div className="bg-black/40 border border-white/10 rounded-[3rem] flex-1 flex flex-col overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Terminal className="w-5 h-5 text-emerald-400" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Thought Trace</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Streaming</span>
                                </div>
                            </div>

                            <div 
                                ref={terminalRef}
                                className="flex-1 overflow-y-auto p-10 font-mono text-[11px] leading-relaxed space-y-6 custom-scrollbar"
                            >
                                {debateResult ? (
                                    <div className="space-y-8">
                                        <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                            <p className="text-indigo-300/60 text-[9px] font-black uppercase mb-3 tracking-widest">The Mission:</p>
                                            <p className="text-white text-sm font-medium">{debateResult.task}</p>
                                        </div>

                                        {Object.entries(debateResult.persona_thoughts).map(([persona, thought], i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                key={persona} 
                                                className="relative pl-6 border-l-2 border-white/5"
                                            >
                                                <div className="absolute top-0 left-[-6px] w-3 h-3 rounded-full bg-slate-800 border-2 border-white/10" />
                                                <p className="text-[10px] font-black text-indigo-400 uppercase mb-2 tracking-widest">{persona} PERSPECTIVE</p>
                                                <p className="text-slate-400 leading-relaxed italic">"{thought}"</p>
                                            </motion.div>
                                        ))}

                                        {debateResult.final_verdict && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-8 rounded-[2rem] bg-indigo-500/20 border border-indigo-500/40 relative overflow-hidden group"
                                            >
                                                <div className="relative z-10">
                                                    <p className="text-indigo-400 text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3" /> Synthesis Manifest
                                                    </p>
                                                    <p className="text-white text-sm font-medium leading-relaxed italic">{debateResult.final_verdict}</p>
                                                </div>
                                                <motion.div 
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                    className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full" 
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                ) : isDebating ? (
                                    <div className="space-y-4 opacity-50">
                                        <div className="flex items-center gap-3 text-indigo-400">
                                            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Orchestrating Collective...</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-white/5 rounded-full" />
                                            <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                                            <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                        <MessageSquare className="w-12 h-12 mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Neural Stimulus</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Context */}
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Inference Engine</p>
                                <p className="text-[11px] font-black text-white uppercase">Gemma-3-Neural</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Orchestration</p>
                                <p className="text-[11px] font-black text-white uppercase">Collective v4</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
