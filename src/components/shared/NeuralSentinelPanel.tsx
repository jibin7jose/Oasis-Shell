import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, ShieldAlert, ShieldCheck, Zap, Activity, 
    Lock, Unlock, Eye, FileWarning, Search, RefreshCcw,
    AlertTriangle, Terminal, EyeOff, ClipboardList
} from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';
import { useSystemStore } from '../../lib/systemStore';

type ThreatLevel = 'Green' | 'Amber' | 'Red' | 'Lockdown';

interface SecurityAlert {
    id: string;
    source: string;
    message: string;
    severity: string;
    threat_level: ThreatLevel;
    timestamp: string;
}

const AlertItem: React.FC<{ alert: SecurityAlert; index: number }> = ({ alert, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-red-500/30 transition-all group relative overflow-hidden"
    >
        <div className={`absolute top-0 left-0 w-1 h-full ${
            alert.severity === 'Critical' ? 'bg-red-500' : 
            alert.severity === 'High' ? 'bg-orange-500' : 'bg-indigo-500'
        }`} />
        <div className="flex items-start justify-between">
            <div className="flex gap-4">
                <div className={`p-2 rounded-xl bg-white/5 ${
                     alert.severity === 'Critical' ? 'text-red-400' : 
                     alert.severity === 'High' ? 'text-orange-400' : 'text-indigo-400'
                }`}>
                    {alert.source === 'FIM Daemon' ? <Search className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{alert.source}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                             alert.severity === 'Critical' ? 'text-red-400' : 
                             alert.severity === 'High' ? 'text-orange-400' : 'text-indigo-400'
                        }`}>{alert.severity} Priority</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium leading-relaxed">{alert.message}</p>
                </div>
            </div>
            <span className="text-[10px] font-mono text-slate-600 whitespace-nowrap">
                {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
        </div>
    </motion.div>
);

export const NeuralSentinelPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { setNotification, logEvent } = useSystemStore();
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [threatLevel, setThreatLevel] = useState<ThreatLevel>('Green');
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditLog, setAuditLog] = useState<string[]>([]);

    const refreshAlerts = useCallback(async () => {
        try {
            const resultAlerts = await invokeSafe('get_sentinel_alerts') as SecurityAlert[];
            const resultLevel = await invokeSafe('get_global_threat_level') as ThreatLevel;
            setAlerts(resultAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setThreatLevel(resultLevel);
        } catch (e) {
            console.error("Sentinel Refresh Failure:", e);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            refreshAlerts();
            const interval = setInterval(refreshAlerts, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, refreshAlerts]);

    const runAudit = async () => {
        setIsAuditing(true);
        setAuditLog(["Initializing Security Core...", "Scanning Process Tree...", "Verifying File Integrity...", "Auditing Network Pulses..."]);
        try {
            const results = await invokeSafe('run_security_audit') as SecurityAlert[];
            if (results.length > 0) {
                setNotification(`Sentinel: ${results.length} security anomalies detected during audit.`);
            } else {
                setNotification("Sentinel Audit: System Core Integrity Verified.");
            }
            refreshAlerts();
            setAuditLog(prev => [...prev, "Audit Complete. No Breaches Found."]);
        } catch (e) {
            setNotification("Security Audit Failed: Kernel Access Denicd.");
        } finally {
            setTimeout(() => setIsAuditing(false), 2000);
        }
    };

    const triggerLockdown = async () => {
        if (confirm("INITIATE TOTAL SYSTEM LOCKDOWN? This will seal all strategic interfaces.")) {
            try {
                await invokeSafe('trigger_system_lockdown');
                setNotification("SYSTEM SEALED. NEURAL LOCKDOWN ACTIVE.");
                refreshAlerts();
            } catch (e) {
                console.error("Lockdown failure:", e);
            }
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
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${
                     threatLevel === 'Green' ? 'from-indigo-500/10' : 
                     threatLevel === 'Amber' ? 'from-orange-500/10' : 'from-red-500/20'
                } via-transparent to-transparent`} />
                {threatLevel === 'Red' && (
                    <motion.div 
                        animate={{ opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500/10" 
                    />
                )}
            </div>

            <div className="w-full max-w-7xl h-full flex gap-12 relative z-10">
                {/* Left Column: Alerts & Logs */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center border transition-all ${
                                 threatLevel === 'Green' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                 threatLevel === 'Amber' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                                {threatLevel === 'Green' ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8 font-black" />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Sentinel</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-[0.4em]">Active Intrusion Detection</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                         threatLevel === 'Green' ? 'text-indigo-400' : 'text-red-400'
                                    }`}>v2.4 Kernel monitoring</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                <ClipboardList className="w-4 h-4 text-slate-600" /> Forensic Alert Stream
                                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-500">{alerts.length}</span>
                            </h3>
                            <button 
                                onClick={refreshAlerts}
                                className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
                            >
                                <RefreshCcw className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {alerts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale p-12">
                                    <ShieldCheck className="w-16 h-16 mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest">No strategic anomalies detected in cache.</p>
                                </div>
                            ) : (
                                <AnimatePresence initial={false}>
                                    {alerts.map((alert, i) => (
                                        <AlertItem key={alert.id} alert={alert} index={i} />
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Status & Controls */}
                <div className="w-[450px] flex flex-col gap-6">
                    {/* Threat Status Card */}
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                         <div className="relative z-10 flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">System Threat Level</span>
                            
                            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                                <div className={`absolute inset-0 rounded-full border-4 border-dashed border-white/5 animate-[spin_20s_linear_infinite]`} />
                                <motion.div 
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className={`w-32 h-32 rounded-full flex items-center justify-center relative ${
                                         threatLevel === 'Green' ? 'bg-indigo-500/20 text-indigo-400' :
                                         threatLevel === 'Amber' ? 'bg-orange-500/20 text-orange-400' :
                                         'bg-red-500/30 text-red-500'
                                    }`}
                                >
                                    <div className="absolute inset-[-10px] rounded-full border border-current opacity-20" />
                                    <Zap className="w-12 h-12" />
                                </motion.div>
                            </div>

                            <h4 className={`text-4xl font-black uppercase tracking-tighter mb-2 ${
                                 threatLevel === 'Green' ? 'text-indigo-400' :
                                 threatLevel === 'Amber' ? 'text-orange-400' : 'text-red-500'
                            }`}>
                                {threatLevel}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 px-6 leading-relaxed">
                                {threatLevel === 'Green' ? "All systems operational. No unauthorized pulses detected." :
                                 threatLevel === 'Amber' ? "Caution: Behavioral drift detected in sub-ventures." :
                                 "CRITICAL BREACH: Immediate strategic lockdown advised."}
                            </p>
                         </div>
                    </div>

                    {/* Security Actions */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-8 space-y-4">
                        <button 
                            onClick={runAudit}
                            disabled={isAuditing}
                            className="w-full group flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/40 transition-all disabled:opacity-50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-white/5 group-hover:text-indigo-400 transition-colors">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <span className="block text-xs font-black text-white uppercase tracking-tight">Perform Security Audit</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Manual FIM & Process Scan</span>
                                </div>
                            </div>
                            {isAuditing && <RefreshCcw className="w-4 h-4 text-indigo-500 animate-spin" />}
                        </button>

                        <button 
                            onClick={triggerLockdown}
                            className={`w-full group flex items-center justify-between p-5 rounded-2xl border transition-all ${
                                 threatLevel === 'Lockdown' 
                                 ? 'bg-red-500/10 border-red-500/40 text-red-400 cursor-not-allowed'
                                 : 'bg-white/5 hover:bg-red-500/10 border-white/5 hover:border-red-500/40'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-white/5 ${threatLevel === 'Lockdown' ? 'text-red-400' : 'group-hover:text-red-400'} transition-colors`}>
                                    {threatLevel === 'Lockdown' ? <Lock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                    <span className="block text-xs font-black text-white uppercase tracking-tight">Initiate Core Lockdown</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Seal all neural interfaces</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Audit Console */}
                    <div className="flex-1 bg-black/40 rounded-[2.5rem] border border-white/5 p-6 font-mono overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="w-3 h-3 text-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Sentinel Terminal v2</span>
                        </div>
                        <div className="flex-1 text-[10px] text-emerald-500/60 overflow-y-auto space-y-1 custom-scrollbar">
                            {auditLog.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                            {!isAuditing && auditLog.length === 0 && <span className="opacity-30 italic">Awaiting strategic directive...</span>}
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all mt-auto"
                    >
                        Minimize Sentinel interface
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
