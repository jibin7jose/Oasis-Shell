import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Activity } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface JarvisOverlayProps {
  show: boolean;
  onClose: () => void;
  resolveNeuralIntent: (q: string) => void;
}

export const JarvisOverlay: React.FC<JarvisOverlayProps> = ({ show, onClose, resolveNeuralIntent }) => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [pulseLevel, setPulseLevel] = useState(1);

  useEffect(() => {
    let unlisten: any;
    let errUnlisten: any;
    let recognition: any;

    if (show && !isListening) {
      setIsListening(true);
      setTranscript("");
      
      // Attempt Web Speech API first for maximum compatibility in Tauri WebView2
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
            setPulseLevel(1.8 + Math.random());
            setTimeout(() => setPulseLevel(1), 300);
            
            if (finalTranscript.length > 5) {
               resolveNeuralIntent(finalTranscript);
               // Auto close after successful intent
               setTimeout(() => onClose(), 2000);
            }
          }
        };
        
        recognition.start();
      } else {
        // Fallback to Rust whisper.cpp if Web Speech API is not available
        (async () => {
          try {
            unlisten = await listen('voice-transcript', (event: any) => {
              const text = event.payload as string;
              setTranscript(prev => prev ? `${prev} ${text}` : text);
              setPulseLevel(1.5 + Math.random() * 1.5);
              setTimeout(() => setPulseLevel(1), 300);

              if (text.length > 5) {
                 resolveNeuralIntent(text);
              }
            });

            errUnlisten = await listen('voice-engine-error', (event: any) => {
               setTranscript(`Error: ${event.payload}`);
            });
            
            await invoke('start_voice_engine');
          } catch (e) {
            console.error(e);
          }
        })();
      }
    }

    return () => {
      if (unlisten) unlisten();
      if (errUnlisten) errUnlisten();
      if (recognition) recognition.stop();
      setIsListening(false);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 z-[1000] bg-black/60 flex flex-col items-center justify-center font-sans overflow-hidden"
          onClick={onClose}
        >
          {/* Main JARVIS Orb */}
          <div className="relative flex items-center justify-center w-96 h-96">
            
            {/* Outer rotating rings */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360, scale: pulseLevel }}
              transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { type: "spring", bounce: 0.5 } }}
              className="absolute inset-4 border border-cyan-400/40 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.3)]"
            />
            
            {/* Inner Glowing Core */}
            <motion.div 
              animate={{ scale: pulseLevel }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="absolute w-32 h-32 bg-indigo-500/20 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(34,211,238,0.6)] border-4 border-cyan-400/50 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/40 to-indigo-600/40 rounded-full animate-pulse" />
              <Mic className="w-12 h-12 text-cyan-100 z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
            </motion.div>
          </div>

          {/* Transcription Text & Fallback Input */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 w-full max-w-2xl text-center px-8 flex flex-col items-center"
          >
            <p className="text-3xl font-light text-indigo-50 tracking-wide drop-shadow-[0_2px_10px_rgba(99,102,241,0.5)] h-12">
              {transcript || "Awaiting neural input..."}
            </p>
            
            <input 
              autoFocus
              className="mt-8 bg-transparent text-center border-b border-indigo-500/30 w-96 pb-2 text-cyan-200/50 outline-none focus:border-cyan-400 focus:text-cyan-100 transition-all placeholder:text-cyan-900"
              placeholder="Speak, or type intent..."
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  resolveNeuralIntent(e.currentTarget.value);
                  setTranscript(e.currentTarget.value);
                  setTimeout(() => onClose(), 1500);
                }
              }}
            />

            <div className="mt-8 flex items-center justify-center gap-3 text-cyan-400/60 font-mono text-xs uppercase tracking-[0.3em]">
              <Activity className="w-4 h-4 animate-pulse" />
              Listening
            </div>
          </motion.div>

          {/* Escape Hint */}
          <div className="absolute bottom-10 text-white/30 text-xs font-mono uppercase tracking-widest">
            Press ESC or Click to dismiss
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
