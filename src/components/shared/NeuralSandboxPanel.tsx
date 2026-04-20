import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Zap, Activity, RefreshCw, CheckCircle2, XCircle,
    AlertTriangle, Globe, Cpu, Clock, Database, WifiOff, Wifi,
    HeartPulse, Bug, Wrench, BarChart3
} from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { useSystemStore } from '../../lib/systemStore';

const STATUS_COLORS = {
    nominal: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    offline: 'text-slate-500',
};

const IntegrityGauge: React.FC<{ value: number }> = ({ value }) => {
    const color = value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
    const label = value >= 80 ? 'NOMINAL' : value >= 50 ? 'DEGRADED' : 'CRITICAL';
    const dash = 2 * Math.PI * 54;
    const offset = dash - (dash * value) / 100;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                    <motion.circle
                        cx="60" cy="60" r="54" fill="none"
                        stroke={color} strokeWidth="10"
                        strokeDasharray={dash}
                        initial={{ strokeDashoffset: dash }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{value}</span>
                    <span className="text-[9px] font-black text-slate-500 tracking-widest">INTEGRITY</span>
                </div>
            </div>
            <span className="mt-3 text-[10px] font-black tracking-widest uppercase" style={{ color }}>{label}</span>
        </div>
    );
};

const SimCard: React.FC<{ sim: any; index: number }> = ({ sim, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 }}
        className={`p-5 rounded-2xl border transition-all ${
            sim.passed ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
        }`}
    >
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
                {sim.passed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                }
                <div>
                    <p className="text-[11px] font-black text-white tracking-tight">{sim.scenario}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{sim.recommendation}</p>
                    {sim.error && <p className="text-[9px] text-red-400 mt-0.5">⚠ {sim.error}</p>}
                </div>
            </div>
            <div className="flex-shrink-0 text-right">
                <div className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${sim.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {sim.passed ? 'PASS' : 'FAIL'}
                </div>
                <p className="text-[8px] font-mono text-slate-600 mt-1">{sim.latency_ms}ms</p>
            </div>
        </div>
    </motion.div>
);

const VentureHealthCard: React.FC<{ v: any; index: number; onInitiateMutation?: (name: string) => void }> = ({ v, index, onInitiateMutation }) => {
    const isNative = v.forge_mode === 'rust-tauri';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`p-5 rounded-2xl border ${
                v.drift_detected ? 'border-red-500/30 bg-red-500/5'
                : v.is_alive ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-slate-700 bg-white/[0.02]'
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isNative ? <Cpu className="w-4 h-4 text-violet-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
                    <div>
                        <p className="text-[11px] font-black text-white">{v.name}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{v.forge_mode}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {v.drift_detected && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                    <div className={`w-2 h-2 rounded-full ${v.is_alive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                <span className="text-slate-500">PID: {v.pid ?? 'NULL'}</span>
                <span className={v.drift_detected ? 'text-red-400' : v.is_alive ? 'text-emerald-400' : 'text-slate-600'}>
                    {v.drift_detected ? 'ZOMBIE' : v.is_alive ? 'ONLINE' : 'OFFLINE'}
                </span>
            </div>
            {v.drift_reason && (
                <div className="mt-2 space-y-2">
                   <p className="text-[8px] text-red-400/70 bg-red-500/10 px-3 py-1.5 rounded-lg">{v.drift_reason}</p>
                   {onInitiateMutation && (
                       <button 
                           onClick={() => onInitiateMutation(v.name)}
                           className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-[8px] font-black text-white uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                       >
                           <Wrench className="w-3 h-3" /> Initiate Re-Forge
                       </button>
                   )}
                </div>
            )}
        </motion.div>
    );
};

export const NeuralSandboxPanel: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    onInitiateMutation?: (name: string) => void;
}> = ({ isOpen, onClose, onInitiateMutation }) => {
    const { logEvent, setNotification } = useSystemStore();
    const [report, setReport] = useState<any>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const runAudit = useCallback(async () => {
        setIsAuditing(true);
        try {
            const data = await invokeSafe('run_sandbox_audit');
            setReport(data);
            setHasRun(true);
            logEvent(`Neural Sandbox Audit complete. Integrity: ${(data as any).overall_integrity}%`, 'system');
        } catch (e) {
            setNotification(`Sandbox Breach: ${e}`);
        } finally {
            setIsAuditing(false);
        }
    }, []);

    const runSimulation = useCallback(async () => {
        setIsSimulating(true);
        try {
            const sims = await invokeSafe('run_adversarial_simulation');
            setReport((prev: any) => prev ? { ...prev, simulations: sims } : { simulations: sims });
            const passed = (sims as any[]).filter(s => s.passed).length;
            logEvent(`Adversarial Simulation: ${passed}/${(sims as any[]).length} scenarios passed.`, 'neural');
        } catch (e) {
            setNotification(`Simulation Failure: ${e}`);
        } finally {
            setIsSimulating(false);
        }
    }, []);

    const recoverZombies = useCallback(async () => {
        setIsRecovering(true);
        try {
            const result = await invokeSafe('recover_dead_ventures') as string;
            setNotification(result);
            logEvent(result, 'system');
            await runAudit();
        } catch (e) {
            setNotification(`Recovery Failure: ${e}`);
        } finally {
            setIsRecovering(false);
        }
    }, [runAudit]);

    if (!isOpen) return null;

    const alerts = report?.critical_alerts ?? [];
    const sims = report?.simulations ?? [];
    const ventures = report?.venture_health ?? [];
    const hasDrift = ventures.some((v: any) => v.drift_detected);
    const passedSims = sims.filter((s: any) => s.passed).length;

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
                        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                            <ShieldAlert className="w-7 h-7 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Neural Sandbox</h2>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Phase 36 // Resilience & Adversarial Hardening Engine</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {hasDrift && (
                            <button
                                onClick={recoverZombies}
                                disabled={isRecovering}
                                className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                            >
                                <Wrench className={`w-3.5 h-3.5 ${isRecovering ? 'animate-spin' : ''}`} />
                                Auto-Recover
                            </button>
                        )}
                        <button
                            onClick={runSimulation}
                            disabled={isSimulating}
                            className="px-5 py-2.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                        >
                            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
                            Run Simulations
                        </button>
                        <button
                            onClick={runAudit}
                            disabled={isAuditing}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                            {isAuditing ? 'Auditing...' : 'Full Audit'}
                        </button>
                        <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all text-[10px] font-black uppercase tracking-widest">
                            Exit Sandbox
                        </button>
                    </div>
                </div>

                {!hasRun ? (
                    /* Pre-run CTA */
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                            <Bug className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">Sandbox Inactive</h3>
                            <p className="text-slate-500 text-sm max-w-lg">
                                Run a full system audit to detect zombie ventures, architectural drift, Oracle failures, and measure core pipeline latency.
                            </p>
                        </div>
                        <button
                            onClick={runAudit}
                            disabled={isAuditing}
                            className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.3em] rounded-3xl transition-all shadow-2xl shadow-emerald-900/40 flex items-center gap-4"
                        >
                            <ShieldAlert className="w-5 h-5" />
                            {isAuditing ? 'Scanning Systems...' : 'Initiate Neural Audit'}
                        </button>
                    </div>
                ) : (
                    /* Results grid */
                    <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden min-h-0">
                        {/* Left — Integrity + Alerts */}
                        <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar">
                            {/* Integrity gauge */}
                            <div className="glass bg-white/[0.02] border-white/5 rounded-3xl p-6 flex flex-col items-center gap-5">
                                <IntegrityGauge value={report?.overall_integrity ?? 0} />
                                <div className="w-full space-y-2">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Oracle Status</span>
                                        <span className={report?.oracle_reachable ? 'text-emerald-400' : 'text-red-400'}>
                                            {report?.oracle_reachable ? 'REACHABLE' : 'OFFLINE'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Simulations</span>
                                        <span className={passedSims === sims.length ? 'text-emerald-400' : 'text-amber-400'}>
                                            {passedSims}/{sims.length} PASS
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Zombie PIDs</span>
                                        <span className={report?.orphaned_processes?.length > 0 ? 'text-red-400' : 'text-emerald-400'}>
                                            {report?.orphaned_processes?.length ?? 0} DETECTED
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Critical alerts */}
                            <div className="glass bg-white/[0.02] border-white/5 rounded-3xl p-5 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Critical Alerts</h4>
                                </div>
                                {alerts.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-6 opacity-40">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">All Systems Nominal</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {alerts.map((alert: string, i: number) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[9px] text-red-300 leading-relaxed"
                                            >
                                                {alert}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Middle — Venture Health */}
                        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-2">
                                <HeartPulse className="w-4 h-4 text-violet-400" />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Venture Health Registry</h4>
                            </div>
                            {ventures.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-30">
                                    <Database className="w-10 h-10 text-slate-600 animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Ventures Registered</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ventures.map((v: any, i: number) => (
                                        <VentureHealthCard key={v.name} v={v} index={i} onInitiateMutation={onInitiateMutation} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right — Simulation Results */}
                        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-amber-400" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Adversarial Simulations</h4>
                                </div>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                                    {report?.timestamp ? new Date(report.timestamp).toLocaleTimeString() : ''}
                                </span>
                            </div>
                            {sims.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-30">
                                    <Zap className="w-10 h-10 text-slate-600 animate-pulse" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Simulations Run</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sims.map((sim: any, i: number) => (
                                        <SimCard key={sim.scenario} sim={sim} index={i} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
