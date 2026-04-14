import React from 'react';
import { SearchIntent } from '../dashboard/SearchIntent';
import { MarketTicker } from '../dashboard/MarketTicker';
import { StatGrid } from '../dashboard/StatGrid';
import { InventoryMatrix } from '../dashboard/InventoryMatrix';
import { GolemMatrix } from '../dashboard/GolemMatrix';
import { ForgePanel } from './ForgePanel';

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
  founderMetrics: any;
  isVaultSealed: boolean;
  strategicInventory: any[];
  activeGolems: any[];
  setSelectedGolem: (golem: any) => void;
  onSealAsset: (asset: any) => void;
  strategicMacros: any[];
  handleExecuteMacro: (id: string) => void;
  handleSignMacro: (id: string) => void;
  isForgingMacro: boolean;
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
}) => {
  return (
    <>
      {!presentationMode && (
        <SearchIntent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isThinking={isThinking}
          isRecording={isRecording}
          toggleVoiceRecording={toggleVoiceRecording}
          handleSearchIntent={handleSearchIntent}
        />
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

      <div className="w-full max-w-5xl mb-12">
        <ForgePanel 
          macros={strategicMacros}
          onExecute={handleExecuteMacro}
          onSign={handleSignMacro}
          isForging={isForgingMacro}
        />
      </div>
    </>
  );
};
