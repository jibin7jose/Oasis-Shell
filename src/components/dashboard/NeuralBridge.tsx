import React, { useEffect, useState } from 'react';
import { Search, Mic, MicOff, Sparkles, Zap, Shield, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { invokeSafe } from '../../lib/tauri';

interface PredictiveIntent {
  label: string;
  intent: string;
  type: 'warning' | 'performance' | 'security' | 'growth' | 'default';
}

interface NeuralBridgeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isThinking: boolean;
  isRecording: boolean;
  toggleVoiceRecording: () => void;
  handleSearchIntent: (e: React.KeyboardEvent | string) => void;
}

const getIntentIcon = (type: string) => {
  switch (type) {
    case 'warning': return <Zap className="w-3 h-3 text-amber-400" />;
    case 'performance': return <Sparkles className="w-3 h-3 text-indigo-400" />;
    case 'security': return <Shield className="w-3 h-3 text-rose-400" />;
    case 'growth': return <Globe className="w-3 h-3 text-emerald-400" />;
    default: return <Sparkles className="w-3 h-3 text-slate-400" />;
  }
};

export const NeuralBridge: React.FC<NeuralBridgeProps> = ({
  searchQuery,
  setSearchQuery,
  isThinking,
  isRecording,
  toggleVoiceRecording,
  handleSearchIntent,
}) => {
  const [predictions, setPredictions] = useState<PredictiveIntent[]>([]);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await invokeSafe("get_predictive_intents") as PredictiveIntent[];
        setPredictions(res);
      } catch (e) {}
    };
    fetchPredictions();
    const itv = setInterval(fetchPredictions, 30000);
    return () => clearInterval(itv);
  }, []);

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4 mb-12">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full glass-bright rounded-[2.5rem] p-6 shadow-3xl border border-white/5 hover:border-white/10 transition-all relative overflow-hidden"
      >
        <div className="flex items-center gap-5 px-4 py-2">
          <Search className={cn("w-7 h-7 transition-colors", isThinking ? "text-indigo-400 animate-pulse" : "text-slate-600")} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchIntent(searchQuery)}
            placeholder={isRecording ? "Listening to Neural Intent..." : "Detecting Neural Intent..."}
            className="bg-transparent border-none outline-none text-2xl w-full text-white placeholder:text-slate-700 font-light"
          />
          <button
            onClick={toggleVoiceRecording}
            className={cn(
              "p-4 rounded-full transition-all relative group overflow-hidden",
              isRecording ? "bg-rose-500/20 text-rose-500 shadow-[0_0_25px_-5px_var(--rose-500)]" : "bg-white/5 text-slate-500 hover:bg-white/10"
            )}
          >
            {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5 transition-transform group-hover:scale-110" />}
          </button>
        </div>

        {/* Neural Reasoning Hint */}
        {searchQuery.length > 3 && (
            <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-16 mt-2 overflow-hidden"
            >
                <div className="text-[10px] text-slate-500 font-medium italic truncate">
                    "Oasis is analyzing context to map intent: {searchQuery}..."
                </div>
            </motion.div>
        )}
      </motion.div>

      {/* Predictive Intent Bar */}
      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence>
          {predictions.map((pred, i) => (
            <motion.button
              key={pred.label}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSearchIntent(pred.intent)}
              className="px-5 py-2 glass-bright rounded-full border border-white/5 hover:border-white/20 hover:bg-white/5 flex items-center gap-2 transition-all group"
            >
              {getIntentIcon(pred.type)}
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">{pred.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
