import { useEffect, useRef } from 'react';
import { useSystemStore } from '../lib/systemStore';
import { invokeSafe } from '../lib/tauri';

export const useHeuristicGuardian = () => {
  const { 
    hardwareStatus, ventureIntegrity, 
    setNotification, setPendingManifests, pendingManifests,
    isMirroring 
  } = useSystemStore();

  const lastTriggerTime = useRef<number>(0);
  const COOLDOWN_MS = 300000; // 5 minutes

  useEffect(() => {
    if (!hardwareStatus) return;

    const now = Date.now();
    if (now - lastTriggerTime.current < COOLDOWN_MS) return;

    let anomalyCategory = '';
    if (hardwareStatus.cpu_load > 85) {
      anomalyCategory = 'CPU_SPIKE';
    } else if (hardwareStatus.mem_used > 90) {
      anomalyCategory = 'MEM_LEAK';
    } else if (ventureIntegrity < 40) {
      anomalyCategory = 'INTEGRITY_DROP';
    }

    if (anomalyCategory) {
      lastTriggerTime.current = now;
      handleSynthesis(anomalyCategory);
    }
  }, [hardwareStatus?.cpu_load, hardwareStatus?.mem_used, ventureIntegrity]);

  const handleSynthesis = async (category: string) => {
    try {
      setNotification(`Anomaly Detected: Initiating Heuristic Neural Mitigation for ${category}...`);
      
      const manifest = await invokeSafe('derive_mitigation_macro', { 
        anomaly_category: category, 
        current_metrics: hardwareStatus 
      }) as any;

      if (manifest) {
        setPendingManifests([manifest, ...pendingManifests]);
        setNotification("Heuristic Mitigation Manifested in Global Forge. Awaiting Founder Signature.");
      }
    } catch (e) {
      console.error("Heuristic Synthesis Breach:", e);
    }
  };
};
