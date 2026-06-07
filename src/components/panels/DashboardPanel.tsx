import React from 'react';
import { useSystemStore } from '../../lib/systemStore';
import { Shield, Book, MessageSquareQuote, Users, History, Activity, Database, Target, BrainCircuit } from 'lucide-react';
import { SearchIntent } from '../dashboard/SearchIntent';
import { MarketTicker } from '../dashboard/MarketTicker';
import { StatGrid } from '../dashboard/StatGrid';
import { InventoryMatrix } from '../dashboard/InventoryMatrix';
import { GolemMatrix } from '../dashboard/GolemMatrix';
import { ForgePanel } from './ForgePanel';
import { VentureHealthRadar } from '../dashboard/VentureHealthRadar';
import { NeuralWisdomFeed } from '../dashboard/NeuralWisdomFeed';
import { ProductivityHeatmap } from '../dashboard/ProductivityHeatmap';
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
  onLaunchForge: () => void;
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
  onLaunchForge,
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

      <div className="w-full max-w-5xl grid grid-cols-1 gap-8 mb-12">
        <ProductivityHeatmap />
      </div>

      <div className="w-full max-w-5xl mb-12">
        <ForgePanel 
          macros={strategicMacros}
          onExecute={handleExecuteMacro}
          onSign={handleSignMacro}
          onLaunchForge={onLaunchForge}
          isForging={isForgingMacro}
        />
      </div>

      <div className="w-full max-w-5xl mb-12 flex flex-col gap-6">
         <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight">System Modules</h2>
            <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase ml-4 bg-white/5 px-3 py-1 rounded-full">Extended Toolkit</span>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'storage', icon: Shield, label: 'Disk Atlas', action: () => useSystemStore.getState().setActiveView('storage'), color: 'emerald' },
              { id: 'timeline', icon: History, label: 'Temporal Ledger', action: () => useSystemStore.getState().setActiveView('timeline'), color: 'amber' },
              { id: 'boardroom', icon: MessageSquareQuote, label: 'Boardroom Debate', action: () => useSystemStore.getState().setActiveView('boardroom'), color: 'indigo' },
              { id: 'docs', icon: Book, label: 'Documentation Manual', action: () => useSystemStore.getState().setActiveView('docs'), color: 'cyan' },
              { id: 'workforce', icon: Users, label: 'Neural Workforce', action: () => useSystemStore.getState().setShowWorkforce(true), color: 'rose' },
              { id: 'logs', icon: Activity, label: 'Temporal Logs', action: () => useSystemStore.getState().setShowLogs(true), color: 'emerald' },
              { id: 'graph', icon: BrainCircuit, label: 'Strategic Cortex', action: () => useSystemStore.getState().setShowGraph(true), color: 'purple' },
              { id: 'zenith', icon: Target, label: 'Focus Layer', action: () => {}, color: 'indigo' },
            ].map((mod) => (
               <button 
                 key={mod.id}
                 onClick={mod.action}
                 className="flex flex-col items-center justify-center gap-3 p-6 glass rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.03] group"
               >
                  <div className={`p-4 rounded-xl bg-${mod.color}-500/10 border border-${mod.color}-500/20 text-${mod.color}-400 group-hover:scale-110 transition-transform`}>
                     <mod.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">
                     {mod.label}
                  </span>
               </button>
            ))}
         </div>
      </div>

      {TemporalExplorerComponent && <TemporalExplorerComponent />}
    </>
  );
};
