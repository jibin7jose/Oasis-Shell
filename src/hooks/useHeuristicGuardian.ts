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
      // Use the AI Core Engine to synthesize a mitigation script natively
      const prompt = `System anomaly detected: ${category}. Generate a single, safe PowerShell command to mitigate this issue. For a MEM_LEAK, you might clear standby list or restart a heavy generic service. For CPU_SPIKE, you might stop a generic heavy process. Return ONLY the raw powershell command string, no markdown, no explanation.`;
      
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma4:latest",
          prompt: prompt,
          stream: false
        })
      });
      
      const json = await response.json();
      let action = json.response || "echo 'Mitigation unavailable'";
      action = action.replace(/```powershell/gi, '').replace(/```/g, '').trim();
      
      onAnomaly(category, action);
    } catch (e) {
      console.error("Heuristic Synthesis Breach:", e);
      // Fallback
      onAnomaly(category, "echo 'AI mitigation failed, falling back to manual observation'");
    }
  };
};
