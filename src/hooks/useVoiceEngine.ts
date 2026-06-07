import { useState } from 'react';

export function useVoiceEngine(
  logEvent: (event: string, type: any) => void,
  setMessages: (updater: (prev: any[]) => any[]) => void,
  resolveNeuralIntent: (query: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const startVoiceCapture = async () => {
    if (isListening) return;

    setIsListening(true);
    setVoiceTranscript("");
    logEvent("Local Voice Engine (Whisper) Activated", "neural");

    try {
      // Start the rust backend subprocess
      await import('@tauri-apps/api/core').then(core => core.invoke('start_voice_engine'));
      
      const { listen } = await import('@tauri-apps/api/event');
      
      listen('voice-transcript', (event: any) => {
        const text = event.payload as string;
        setVoiceTranscript(prev => {
          const newTranscript = prev ? `${prev} ${text}` : text;
          // Auto-resolve if it sounds like a complete thought or pauses
          // For now, let's just resolve it immediately if it has substance
          if (text.length > 5) {
             resolveNeuralIntent(text);
          }
          return newTranscript;
        });
      });

      listen('voice-engine-error', (event: any) => {
        console.error(event.payload);
        setIsListening(false);
        setMessages(prev => [...prev, { role: "assistant", content: event.payload }]);
      });
      
    } catch (e: any) {
      console.error(e);
      setIsListening(false);
      setMessages(prev => [...prev, { role: "assistant", content: `Voice Error: ${e.toString()}` }]);
    }
  };

  return {
    isListening,
    voiceTranscript,
    startVoiceCapture,
    setVoiceTranscript
  };
}
