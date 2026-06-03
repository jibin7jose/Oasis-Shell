import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Telemetry {
  cpu_usage: number;
  ram_usage: number;
  disk_usage: number;
}

export const useHeuristicGuardian = (
  telemetry: Telemetry, 
  onAnomaly: (category: string, action: string) => void
) => {
  const lastTriggerTime = useRef<number>(0);
  const COOLDOWN_MS = 60000; // 1 minute cooldown for demo purposes

  useEffect(() => {
    if (!telemetry) return;

    const now = Date.now();
    if (now - lastTriggerTime.current < COOLDOWN_MS) return;

    let anomalyCategory = '';
    if (telemetry.cpu_usage > 85) {
      anomalyCategory = 'CPU_SPIKE';
    } else if (telemetry.ram_usage > 90) {
      anomalyCategory = 'MEM_LEAK';
    }

    if (anomalyCategory) {
      lastTriggerTime.current = now;
      handleSynthesis(anomalyCategory);
    }
  }, [telemetry.cpu_usage, telemetry.ram_usage]);

  const handleSynthesis = async (category: string) => {
    try {
      // We will pretend to ask Rust for a mitigation script, or just generate one natively.
      const action = category === 'CPU_SPIKE' 
        ? "Stop-Process -Name 'heavy_task' -Force" 
        : "Clear-ItemProperty -Path 'HKCU:\\Software' -Name 'MemoryCache'";
      
      onAnomaly(category, action);
    } catch (e) {
      console.error("Heuristic Synthesis Breach:", e);
    }
  };
};
