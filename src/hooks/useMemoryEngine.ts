import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function useMemoryEngine() {
  const [photographicMemories, setPhotographicMemories] = useState<any[]>([]);

  const loadMemories = useCallback(async () => {
    try {
      const mems = await invoke("get_all_photographic_memories") as any[];
      setPhotographicMemories(mems);
    } catch(e) { 
      console.error("Failed to load photographic memories:", e); 
    }
  }, []);

  return {
    photographicMemories,
    loadMemories,
    setPhotographicMemories
  };
}
