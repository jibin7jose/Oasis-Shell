import React from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SearchIntentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isThinking: boolean;
  isRecording: boolean;
  toggleVoiceRecording: () => void;
  handleSearchIntent: (e: React.KeyboardEvent) => void;
}

export const SearchIntent: React.FC<SearchIntentProps> = ({
  searchQuery,
  setSearchQuery,
  isThinking,
  isRecording,
  toggleVoiceRecording,
  handleSearchIntent,
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-2xl glass-bright rounded-[2.5rem] p-6 shadow-3xl border border-white/5 hover:border-white/10 transition-all mb-12"
    >
      <div className="flex items-center gap-5 px-4 py-2">
        <Search 
          className={cn("w-7 h-7 transition-colors", isThinking && "animate-pulse")} 
          style={{ color: isThinking ? 'var(--accent-primary)' : '#475569' }}
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchIntent}
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
          {isRecording && (
            <motion.div
              layoutId="voice-ping"
              className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"
            />
          )}
        </button>
        <kbd className="hidden md:flex bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Enter</kbd>
      </div>
    </motion.div>
  );
};
