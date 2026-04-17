import React from 'react';
import { SearchIntent } from '../dashboard/SearchIntent';
import { MarketTicker } from '../dashboard/MarketTicker';
import { StatGrid } from '../dashboard/StatGrid';
import { InventoryMatrix } from '../dashboard/InventoryMatrix';
import { GolemMatrix } from '../dashboard/GolemMatrix';
import { ForgePanel } from './ForgePanel';
import { VentureHealthRadar } from '../dashboard/VentureHealthRadar';
import { NeuralWisdomFeed } from '../dashboard/NeuralWisdomFeed';
import { GolemTask, StrategicMacro, FounderMetrics } from '../../lib/contracts';

interface DashboardPanelProps {
  presentationMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isThinking: boolean;
  isRecording: boolean;
  toggleVoiceRecording: () => void;
  handleSearchIntent: (e: React.KeyboardEvent) => void;
  displayedMarket: any;
  marketIntel: any;
  zenMode: boolean;
  simMode: boolean;
  simMetrics: any;
  founderMetrics: FounderMetrics;
  isVaultSealed: boolean;
  strategicInventory: any[];
  activeGolems: GolemTask[];
  setSelectedGolem: (golem: any) => void;
  onSealAsset: (asset: any) => void;
  strategicMacros: StrategicMacro[];
  handleExecuteMacro: (id: string) => void;
  handleSignMacro: (id: string) => void;
  isForgingMacro: boolean;
  ventureIntegrity: number;
  fiscalBurn: { total_burn: number; token_load: number; status: string };
  activeSynthesis: any | null;
  onSynthesize: () => void;
  isSynthesizing: boolean;
  NeuralBridgeComponent?: React.ComponentType<any>;
  TemporalExplorerComponent?: React.ComponentType<any>;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  presentationMode,
  searchQuery,
  setSearchQuery,
  isThinking,
  isRecording,
  toggleVoiceRecording,
  handleSearchIntent,
  displayedMarket,
  marketIntel,
  zenMode,
  simMode,
  simMetrics,
  founderMetrics,
  isVaultSealed,
  strategicInventory,
  activeGolems,
  setSelectedGolem,
  onSealAsset,
  strategicMacros,
  handleExecuteMacro,
  handleSignMacro,
  isForgingMacro,
  ventureIntegrity,
  fiscalBurn,
  activeSynthesis,
  onSynthesize,
  isSynthesizing,
  NeuralBridgeComponent,
  TemporalExplorerComponent,
}) => {
  return (
    <>
      {!presentationMode && (
        NeuralBridgeComponent ? <NeuralBridgeComponent /> : (
            <SearchIntent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isThinking={isThinking}
            isRecording={isRecording}
            toggleVoiceRecording={toggleVoiceRecording}
            handleSearchIntent={handleSearchIntent}
            />
        )
      )}

      <MarketTicker
        displayedMarket={displayedMarket}
        marketIntel={marketIntel}
        zenMode={zenMode}
      />

      <StatGrid
        simMode={simMode}
        simMetrics={simMetrics}
        founderMetrics={founderMetrics}
        zenMode={zenMode}
      />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <InventoryMatrix
          isVaultSealed={isVaultSealed}
          strategicInventory={strategicInventory}
          zenMode={zenMode}
          onSealAsset={onSealAsset}
        />

        <GolemMatrix
          activeGolems={activeGolems}
          setSelectedGolem={setSelectedGolem}
          zenMode={zenMode}
        />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <VentureHealthRadar 
          data={[
            { label: "Integrity", value: ventureIntegrity },
            { label: "Fiscal", value: Math.max(0, 100 - (fiscalBurn.total_burn * 10)) },
            { label: "System", value: 92 }, // Placeholder for now
            { label: "Security", value: isVaultSealed ? 100 : 40 },
            { label: "Market", value: activeSynthesis ? (activeSynthesis.confidence_score * 100) : 50 }
          ]}
        />
        
        <NeuralWisdomFeed 
          report={activeSynthesis}
          onSynthesize={onSynthesize}
          isSynthesizing={isSynthesizing}
        />
      </div>

      <div className="w-full max-w-5xl mb-12">
        <ForgePanel 
          macros={strategicMacros}
          onExecute={handleExecuteMacro}
          onSign={handleSignMacro}
          isForging={isForgingMacro}
        />
      </div>

      {TemporalExplorerComponent && <TemporalExplorerComponent />}
    </>
  );
};
