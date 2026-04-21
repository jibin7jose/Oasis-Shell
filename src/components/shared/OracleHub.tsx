import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, TrendingDown, Activity, Clock, Zap, Target, BarChart3, Binary } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";

export const OracleHub: React.FC = () => {
    const [pulse, setPulse] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchPulse = async () => {
        setIsUpdating(true);
        try {
            const data = await invokeSafe("get_oracle_pulse");
            setPulse(data);
        } catch (e) {
            console.error("Oracle Breach", e);
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        fetchPulse();
        const interval = setInterval(fetchPulse, 60000 * 5); // 5 minute polling
        return () => clearInterval(interval);
    }, []);

    if (!pulse) return null;

    const isBull = pulse.sentiment.includes("BULL");
    const isBreach = pulse.sentiment.includes("BREACH");

    return (
        <div className="flex items-center gap-6 px-8 py-3 bg-black/40 backdrop-blur-2xl border-x border-white/5 h-full group">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isBull ? 'bg-emerald-500/10 text-emerald-400' : isBreach ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <Activity className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Oracle Sentiment</span>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isBull ? 'text-emerald-400' : isBreach ? 'text-red-400' : 'text-amber-400'}`}>
                        {pulse.sentiment}
                    </span>
                </div>
            </div>

            <div className="h-8 w-px bg-white/5" />

            <div className="flex items-center gap-8 overflow-hidden">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-400">BTC</span>
                    <span className="text-[10px] font-black text-white px-2 py-0.5 bg-white/5 rounded-md font-mono">
                        ${pulse.btc_usd.toLocaleString()}
                    </span>
                    {isBull ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-400">ETH</span>
                    <span className="text-[10px] font-black text-white px-2 py-0.5 bg-white/5 rounded-md font-mono">
                        ${pulse.eth_usd.toLocaleString()}
                    </span>
                    <TrendingUp className="w-3 h-3 text-emerald-500 opacity-50" />
                </div>

                <div className="flex items-center gap-3 group-hover:translate-x-0 translate-x-32 transition-transform duration-700">
                    <span className="text-[9px] font-bold text-slate-400">TECH_MOMENTUM</span>
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pulse.tech_momentum * 100}%` }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                    Last Sync: {new Date(pulse.timestamp).toLocaleTimeString()}
                </span>
                <Globe className="w-3 h-3 text-slate-600" />
            </div>
        </div>
    );
};


