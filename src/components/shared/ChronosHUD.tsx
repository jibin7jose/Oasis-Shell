import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Rewind, Play, FastForward, ShieldAlert, History, Ghost, Zap, Terminal } from 'lucide-react';
import { invokeSafe } from "../../lib/tauri";
import { useSystemStore } from "../../lib/systemStore";

export const ChronosHUD: React.FC = () => {
    const { 
        chronosHistory, setChronosHistory, 
        isTimeTraveling, setIsTimeTraveling,
        setVentureIntegrity, setMarketIntel, setFounderMetrics,
        logEvent, setNotification
    } = useSystemStore();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showGhostOverlay, setShowGhostOverlay] = useState(false);

    const fetchHistory = async () => {
        try {
            const rawHistory = await invokeSafe("seek_chronos_history");
            const history = Array.isArray(rawHistory) ? rawHistory : [];
            setChronosHistory(history);
            if (history.length > 0 && selectedIndex === 0) {
                setSelectedIndex(0);
            }
        } catch (e) {
            console.error("Chronos Sync Breach", e);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleScrub = (index: number) => {
        setSelectedIndex(index);
        setShowGhostOverlay(true);
        const snapshot = chronosHistory[index];
        if (snapshot) {
            // Apply Ghost state (Visual only)
            setVentureIntegrity(snapshot.integrity);
            if (snapshot.metrics) setFounderMetrics(snapshot.metrics);
        }
    };

    const engageTimeVoyage = async () => {
        const snapshot = chronosHistory[selectedIndex];
        if (!snapshot) return;

        setIsTimeTraveling(true);
        try {
            logEvent(`Initiating Temporal Restoration to ${snapshot.timestamp}`, "system");
            await invokeSafe("manifest_chronos_voyage", { timestamp: snapshot.timestamp });
            setNotification(`Temporal Voyage Complete. Reality synced to ${snapshot.timestamp}.`);
        } catch (e) {
            setNotification("Temporal Collapse: Coordinate mismatch.");
        } finally {
            setIsTimeTraveling(false);
            setShowGhostOverlay(false);
        }
    };

    if (chronosHistory.length === 0) return null;

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[800px] z-[9000] pointer-events-none"
        >
            <div className="glass border-white/10 bg-black/60 rounded-[2.5rem] p-6 shadow-5xl pointer-events-auto flex items-center gap-8">
                <div className="flex items-center gap-4 text-amber-500">
                    <History className={`w-6 h-6 ${isTimeTraveling ? 'animate-spin' : ''}`} />
                    <div className="h-8 w-px bg-white/10" />
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Forensic Timeline</span>
                        <span className="text-amber-400">{chronosHistory[selectedIndex]?.timestamp}</span>
                    </div>

                    <div className="relative h-12 flex items-center">
                        <input 
                            type="range"
                            min="0"
                            max={chronosHistory.length - 1}
                            value={selectedIndex}
                            onChange={(e) => handleScrub(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                        />
                        <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
                            {chronosHistory.map((_, i) => (
                                <div key={i} className={`w-0.5 h-3 rounded-full ${i === selectedIndex ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowGhostOverlay(!showGhostOverlay)}
                        className={`p-4 rounded-2xl transition-all ${showGhostOverlay ? 'bg-amber-500 text-black shadow-xl' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                        <Ghost className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={engageTimeVoyage}
                        disabled={isTimeTraveling}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        <Zap className={`w-4 h-4 ${isTimeTraveling ? 'animate-pulse' : ''}`} />
                        {isTimeTraveling ? 'Voyaging...' : 'Engage Voyage'}
                    </button>
                </div>
            </div>

            {/* Ghost Legend */}
            <AnimatePresence>
                {showGhostOverlay && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 px-6 py-3 bg-amber-500 text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Spectral Ghost Mode Active: System state is simulated
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

