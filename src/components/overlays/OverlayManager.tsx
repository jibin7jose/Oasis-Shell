import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../../lib/systemStore';

// Assuming all these exist and are exported
import { SentientVault } from '../panels/SentientVault';
import { SettingsPanel } from '../panels/SettingsPanel';
import DocumentationPanel from '../panels/DocumentationPanel';
import WorkforcePanel from '../panels/WorkforcePanel';
import { VentureSimulationPortal } from '../panels/VentureSimulationPortal';
import { AegisNexus } from '../panels/AegisNexus';
import SynthesisPanel from '../panels/SynthesisPanel';
import { StrategicCortex } from './StrategicCortex';
import { CommandTerminal } from '../panels/CommandTerminal';
import { CognitiveTimeline } from '../panels/CognitiveTimeline';

interface OverlayManagerProps {
  vaultNodes: any[];
  setVaultNodes: any;
  ragQuery: string;
  setRagQuery: any;
  ragAnswer: string;
  setRagAnswer: any;
  isRagging: boolean;
  setIsRagging: any;
  autostart: boolean;
  setAutostart: any;
  simMode: boolean;
  setSimMode: any;
  simMetrics: any;
  setSimMetrics: any;
  graphData: any;
  mounted: boolean;
  getNodeColor: any;
  contextCrates: any[];
  launchContextCrate: any;
  setShowVault: any;
  analyzeScreen: any;
  isThinking: boolean;
  messages: any[];
  searchQuery: string;
  setSearchQuery: any;
  resolveNeuralIntent: any;
  timeline: any[];
}

export const OverlayManager: React.FC<OverlayManagerProps> = ({
  vaultNodes, setVaultNodes, ragQuery, setRagQuery, ragAnswer, setRagAnswer, isRagging, setIsRagging,
  autostart, setAutostart, simMode, setSimMode, simMetrics, setSimMetrics,
  graphData, mounted, getNodeColor, contextCrates, launchContextCrate, setShowVault,
  analyzeScreen, isThinking, messages, searchQuery, setSearchQuery, resolveNeuralIntent, timeline
}) => {
  const { 
    showVault, showSettings, setShowSettings, showDocs, setShowDocs,
    showWorkforce, setShowWorkforce, showNexus, setShowNexus,
    activeSynthesis, setNotification, showGraph, setShowGraph,
    showTerminal, setShowTerminal, showLogs, setShowLogs
  } = useSystemStore();

  return (
    <AnimatePresence>
      {showGraph && (
        <StrategicCortex 
          graphData={graphData} mounted={mounted} simMode={simMode} 
          getNodeColor={getNodeColor} contextCrates={contextCrates} 
          launchContextCrate={launchContextCrate} setShowVault={setShowVault} 
          setShowGraph={setShowGraph} setRagQuery={setRagQuery}
        />
      )}

      <SentientVault show={showVault} onClose={() => setShowVault(false)} vaultNodes={vaultNodes} setVaultNodes={setVaultNodes} ragQuery={ragQuery} setRagQuery={setRagQuery} ragAnswer={ragAnswer} setRagAnswer={setRagAnswer} isRagging={isRagging} setIsRagging={setIsRagging} />
      <CommandTerminal show={showTerminal} onClose={() => setShowTerminal(false)} analyzeScreen={analyzeScreen} isThinking={isThinking} messages={messages} searchQuery={searchQuery} setSearchQuery={setSearchQuery} resolveNeuralIntent={resolveNeuralIntent} />
      <CognitiveTimeline show={showLogs} onClose={() => setShowLogs(false)} timeline={timeline} />
      <SettingsPanel show={showSettings} onClose={() => setShowSettings(false)} vaultNodesCount={vaultNodes.length} autostart={autostart} setAutostart={setAutostart} />
      <DocumentationPanel isOpen={showDocs} onClose={() => setShowDocs(false)} />
      <WorkforcePanel isOpen={showWorkforce} onClose={() => setShowWorkforce(false)} />
      <VentureSimulationPortal show={simMode} onClose={() => setSimMode(false)} metrics={simMetrics} setMetrics={setSimMetrics} />
      {showNexus && <AegisNexus onClose={() => setShowNexus(false)} onLaunch={(app) => setNotification(`Launching ${app}`)} />}
      {activeSynthesis && <SynthesisPanel onCommit={(node) => setVaultNodes((prev: any) => [...prev, node])} />}
    </AnimatePresence>
  );
};
