import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';
import { invokeSafe } from '../../lib/tauri';

export const ProductivityHeatmap: React.FC = () => {
    const [usage, setUsage] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const data = await invokeSafe('get_app_usage_analytics') as any[];
                setUsage(data);
            } catch (e) {
                console.error("Failed to fetch app usage", e);
            }
        };

        fetchUsage();
        const interval = setInterval(fetchUsage, 5000);
        return () => clearInterval(interval);
    }, []);

    const totalSeconds = usage.reduce((acc, curr) => acc + curr.focus_time_seconds, 0);

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const h = Math.floor(m / 60);
        if (h > 0) return `${h}h ${m % 60}m`;
        return `${m}m`;
    };

    return (
        <div className="w-full glass rounded-3xl p-8 border border-white/5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Productivity Heatmap</h3>
                </div>
                <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-4 py-2 rounded-xl">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-bold">{formatTime(totalSeconds)}</span>
                </div>
            </div>

            <div className="space-y-4">
                {usage.slice(0, 8).map((app, i) => {
                    const percentage = totalSeconds > 0 ? (app.focus_time_seconds / totalSeconds) * 100 : 0;
                    
                    return (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 truncate w-1/2">{app.exe_name}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase">{formatTime(app.focus_time_seconds)}</span>
                            </div>
                            <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                                />
                            </div>
                        </div>
                    );
                })}

                {usage.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm font-bold">
                        Tracking active windows...
                    </div>
                )}
            </div>
        </div>
    );
};
