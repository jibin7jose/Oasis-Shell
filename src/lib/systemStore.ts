import { create } from 'zustand';
import { 
  SystemStats, WindowInfo, ProcessInfo, StorageInfo, DeviceInfo, 
  GolemTask, StrategicMacro, CollectiveNode, ContextCrate, FounderMetrics 
} from "./contracts";

export interface ChronosSnapshot {
  timestamp: string;
  nodes: any[];
  links: any[];
  metrics: FounderMetrics | null;
  market: any | null;
  windows: any[];
  integrity: number;
}

export interface SystemState {
  founderMetrics: FounderMetrics;
  systemStats: SystemStats | null;
  notification: string;
  timeline: { id: string; type: string; message: string; timestamp: string }[];
  activeDebate: any | null;
  activeSynthesis: any | null;
  showCortex: boolean;
  showDocs: boolean;
  showGraph: boolean;
  travelIndex: number;
  isTimeTraveling: boolean;
  chronosHistory: any[];
  dynamicGraph: { nodes: any[]; links: any[] };
  cortexResults: any[];
  cortexQuery: string;
  processes: ProcessInfo[];
  windows: WindowInfo[];
  storage: StorageInfo[];
  devices: DeviceInfo[];
  marketIntel: any;
  fiscalBurn: { total_burn: number; token_load: number; status: string };
  ventureIntegrity: number;
  strategicInventory: any[];
  sparklinesEnabled: boolean;
  performanceOptimized: boolean;
  systemLastSync: string;
  showCLI: boolean;
  setShowCLI: (show: boolean) => void;
  showCrates: boolean;
  setShowCrates: (show: boolean) => void;
  isSavingCrate: boolean;
  setIsSavingCrate: (is: boolean) => void;
  crates: ContextCrate[];
  setCrates: (crates: ContextCrate[]) => void;
  activeVenture: string;
  setActiveVenture: (v: string) => void;
  cliInput: string;
  setCliInput: (i: string) => void;
  cliHistory: any[];
  setCliHistory: (h: any[]) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pendingManifests: any[];
  hardwareAnchorActive: boolean;
  setHardwareAnchorActive: (active: boolean) => void;
  isBiometricScanning: boolean;
  setIsBiometricScanning: (is: boolean) => void;
  resilienceData: any | null;
  fetchResilienceAudit: () => Promise<void>;

  setPendingManifests: (m: any[]) => void;
  oracleAlert: any | null;
  setOracleAlert: (a: any | null) => void;
  economicNews: string[];
  setEconomicNews: (news: string[]) => void;
  isMirroring: boolean;
  setIsMirroring: (is: boolean) => void;
  activeMirrorNode: string | null;
  setActiveMirrorNode: (nodeId: string | null) => void;
  riskSimulations: any[];
  setRiskSimulations: (s: any[]) => void;
  activeSimulation: any | null;
  setActiveSimulation: (s: any | null) => void;
  isSimulating: boolean;
  setIsSimulating: (is: boolean) => void;

  
  
  // Collective & Workforce
  collectiveNodes: CollectiveNode[];
  setCollectiveNodes: (nodes: CollectiveNode[]) => void;
  strategicMacros: StrategicMacro[];
  setStrategicMacros: (macros: StrategicMacro[]) => void;
  activeGolems: GolemTask[];
  setActiveGolems: (golems: GolemTask[]) => void;
  activeProposals: any[];
  setActiveProposals: (proposals: any[]) => void;
  workforce: any[];
  setWorkforce: (workforce: any[]) => void;
  
  // Actions
  setMarketIntel: (market: any) => void;
  setFiscalBurn: (burn: any) => void;
  setVentureIntegrity: (integrity: number) => void;
  setStrategicInventory: (inventory: any[]) => void;
  setSparklinesEnabled: (enabled: boolean) => void;
  setPerformanceOptimized: (optimized: boolean) => void;
  setSystemLastSync: (time: string) => void;
  setFounderMetrics: (metrics: FounderMetrics) => void;
  setSystemStats: (stats: SystemStats | null) => void;
  setProcesses: (procs: ProcessInfo[]) => void;
  setWindows: (wins: WindowInfo[]) => void;
  setStorage: (storage: StorageInfo[]) => void;
  setDevices: (devices: DeviceInfo[]) => void;
  setNotification: (msg: string) => void;
  clearNotification: () => void;
  logEvent: (event: string, type: "neural" | "deploy" | "system") => void;
  setActiveDebate: (debate: any | null) => void;
  setActiveSynthesis: (synthesis: any | null) => void;
  setShowCortex: (show: boolean) => void;
  setShowDocs: (show: boolean) => void;
  setShowGraph: (show: boolean) => void;
  setTravelIndex: (index: number) => void;
  setIsTimeTraveling: (is: boolean) => void;
  setChronosHistory: (history: any[]) => void;
  setDynamicGraph: (graph: { nodes: any[]; links: any[] }) => void;
  setCortexResults: (results: any[]) => void;
  setCortexQuery: (query: string) => void;
  isVaultAuthenticated: boolean;
  setIsVaultAuthenticated: (is: boolean) => void;
  showVault: boolean;
  setShowVault: (show: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  showLibrary: boolean;
  setShowLibrary: (show: boolean) => void;
  isVisionScanning: boolean;
  setIsVisionScanning: (is: boolean) => void;
  visionPreview: string | null;
  setVisionPreview: (p: string | null) => void;
  showCollective: boolean;
  setShowCollective: (show: boolean) => void;
  showHatchery: boolean;
  setShowHatchery: (show: boolean) => void;
  showBlueprint: boolean;
  setShowBlueprint: (show: boolean) => void;
  shellMode: 'ambient' | 'command' | 'hidden';
  setShellMode: (mode: 'ambient' | 'command' | 'hidden') => void;
  focusedAppContext: any | null;
  setFocusedAppContext: (ctx: any | null) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showNexus: boolean;
  setShowNexus: (show: boolean) => void;
  showSentinel: boolean;
  setShowSentinel: (show: boolean) => void;
}


export const useSystemStore = create<SystemState>((set) => ({
  marketIntel: {
    market_index: 0,
    index_change: "Awaiting kernel sync",
    ai_ticker: []
  },
  fiscalBurn: { total_burn: 0.0, token_load: 0, status: 'NOMINAL' },
  ventureIntegrity: 100,
  strategicInventory: [],
  sparklinesEnabled: true,
  performanceOptimized: false,
  systemLastSync: "",
  founderMetrics: {
    arr: "N/A",
    burn: "N/A",
    runway: "N/A",
    momentum: "Awaiting kernel sync",
    stress_color: "#6366f1",
  },
  systemStats: null,
  notification: "",
  timeline: [
    { id: "init-1", type: "system", message: "Oasis Foundry Kernel Initialized", timestamp: new Date().toISOString() },
    { id: "init-2", type: "neural", message: "Venture Metrics Synced with Rust Kernel", timestamp: new Date().toISOString() },
  ],
  activeDebate: null,
  activeSynthesis: null,
  showCortex: false,
  showDocs: false,
  showGraph: false,
  travelIndex: -1,
  isTimeTraveling: false,
  chronosHistory: [],
  dynamicGraph: { nodes: [], links: [] },
  cortexResults: [],
  cortexQuery: "",
  showCLI: false,
  showCrates: false,
  isSavingCrate: false,
  crates: [],
  activeVenture: "Oasis Core (Alpha)",
  cliInput: "",
  cliHistory: [],
  searchQuery: "",
  pendingManifests: [],
  hardwareAnchorActive: false,
  setHardwareAnchorActive: (active: boolean) => set({ hardwareAnchorActive: active }),
  isBiometricScanning: false,
  setIsBiometricScanning: (is: boolean) => set({ isBiometricScanning: is }),
  resilienceData: null,
  fetchResilienceAudit: async () => {
    try {
      const data = await invokeSafe("get_system_resilience_audit");
      set({ resilienceData: data });
    } catch (e) {
      console.error("Resilience Audit Sync Failed", e);
    }
  },

  oracleAlert: null,
  processes: [],
  windows: [],
  storage: [],
  devices: [],
  
  collectiveNodes: [],
  strategicMacros: [],
  activeGolems: [],
  activeProposals: [],
  workforce: [],
  economicNews: [],
  isMirroring: false,
  setIsMirroring: (is: boolean) => set({ isMirroring: is }),
  activeMirrorNode: null,
  setActiveMirrorNode: (node: string | null) => set({ activeMirrorNode: node }),
  riskSimulations: [],
  setRiskSimulations: (s: any[]) => set({ riskSimulations: s }),
  activeSimulation: null,
  setActiveSimulation: (s: any | null) => set({ activeSimulation: s }),
  isSimulating: false,
  setIsSimulating: (is: boolean) => set({ isSimulating: is }),

  setIsVaultAuthenticated: (is: boolean) => set({ isVaultAuthenticated: is }),
  activeView: 'dash',
  setActiveView: (view: string) => set({ activeView: view }),
  showVault: false,
  setShowVault: (show: boolean) => set({ showVault: show }),
  showLibrary: false,
  setShowLibrary: (show: boolean) => set({ showLibrary: show }),
  isVisionScanning: false,
  setIsVisionScanning: (is: boolean) => set({ isVisionScanning: is }),
  visionPreview: null,
  setVisionPreview: (p: string | null) => set({ visionPreview: p }),
  showCollective: false,
  setShowCollective: (show: boolean) => set({ showCollective: show }),
  showHatchery: false,
  setShowHatchery: (show: boolean) => set({ showHatchery: show }),
  showBlueprint: false,
  setShowBlueprint: (show: boolean) => set({ showBlueprint: show }),
  shellMode: 'ambient',
  setShellMode: (mode) => set({ shellMode: mode }),
  focusedAppContext: null,
  setFocusedAppContext: (ctx) => set({ focusedAppContext: ctx }),

  setMarketIntel: (market: any) => set({ marketIntel: market }),
  setFiscalBurn: (burn: any) => set({ fiscalBurn: burn }),
  setVentureIntegrity: (integrity: number) => set({ ventureIntegrity: integrity }),
  setStrategicInventory: (inventory: any[]) => set({ strategicInventory: inventory }),
  setSparklinesEnabled: (enabled: boolean) => set({ sparklinesEnabled: enabled }),
  setPerformanceOptimized: (optimized: boolean) => set({ performanceOptimized: optimized }),
  setSystemLastSync: (time: string) => set({ systemLastSync: time }),
  setFounderMetrics: (metrics: FounderMetrics) => set({ founderMetrics: metrics }),
  setSystemStats: (stats: SystemStats | null) => set({ systemStats: stats }),
  setProcesses: (procs: ProcessInfo[]) => set({ processes: procs }),
  setWindows: (wins: WindowInfo[]) => set({ windows: wins }),
  setStorage: (storage: StorageInfo[]) => set({ storage: storage }),
  setDevices: (devices: DeviceInfo[]) => set({ devices: devices }),
  setNotification: (msg: string) => set({ notification: msg }),
  clearNotification: () => set({ notification: "" }),
  logEvent: (message: string, type: "neural" | "deploy" | "system") =>
    set((state: SystemState) => ({
      timeline: [
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type,
          message,
          timestamp: new Date().toISOString(),
        },
        ...state.timeline,
      ].slice(0, 50),
    })),
  setActiveDebate: (debate: any | null) => set({ activeDebate: debate }),
  setActiveSynthesis: (synthesis: any | null) => set({ activeSynthesis: synthesis }),
  setShowCortex: (show: boolean) => set({ showCortex: show }),
  setShowDocs: (show: boolean) => set({ showDocs: show }),
  setShowGraph: (show: boolean) => set({ showGraph: show }),
  setTravelIndex: (index: number) => set({ travelIndex: index }),
  setIsTimeTraveling: (is: boolean) => set({ isTimeTraveling: is }),
  setChronosHistory: (history: any[]) => set({ chronosHistory: history }),
  setDynamicGraph: (graph: { nodes: any[]; links: any[] }) => set({ dynamicGraph: graph }),
  setCortexResults: (results: any[]) => set({ cortexResults: results }),
  setCortexQuery: (query: string) => set({ cortexQuery: query }),
  setShowCLI: (show: boolean) => set({ showCLI: show }),
  setShowCrates: (show: boolean) => set({ showCrates: show }),
  setIsSavingCrate: (is: boolean) => set({ isSavingCrate: is }),
  setCrates: (crates: ContextCrate[]) => set({ crates }),
  setActiveVenture: (v: string) => set({ activeVenture: v }),
  setCliInput: (i: string) => set({ cliInput: i }),
  setCliHistory: (h: any[]) => set({ cliHistory: h }),
  setSearchQuery: (q: string) => set({ searchQuery: q }),
  setPendingManifests: (m: any[]) => set({ pendingManifests: m }),
  setOracleAlert: (a: any | null) => set({ oracleAlert: a }),
  setCollectiveNodes: (nodes: CollectiveNode[]) => set({ collectiveNodes: nodes }),
  setStrategicMacros: (macros: StrategicMacro[]) => set({ strategicMacros: macros }),
  setActiveGolems: (golems: GolemTask[]) => set({ activeGolems: golems }),
  setActiveProposals: (proposals: any[]) => set({ activeProposals: proposals }),
  setWorkforce: (workforce: any[]) => set({ workforce: workforce }),
  setEconomicNews: (news: string[]) => set({ economicNews: news }),
  showSettings: false,
  setShowSettings: (show: boolean) => set({ showSettings: show }),
  showNexus: false,
  setShowNexus: (show: boolean) => set({ showNexus: show }),
  showSentinel: false,
  setShowSentinel: (show: boolean) => set({ showSentinel: show }),
}));
