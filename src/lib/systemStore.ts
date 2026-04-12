import { create } from "zustand";
import { SystemStats, WindowInfo, ProcessInfo, StorageInfo, DeviceInfo } from "../components/panels/SystemPanel";
import { ContextCrate } from "../components/panels/CrateGallery";

export interface FounderMetrics {
  arr: string;
  burn: string;
  runway: string;
  momentum: string;
  stress_color: string;
}

export interface ChronosSnapshot {
  timestamp: string;
  nodes: any[];
  links: any[];
  metrics: FounderMetrics | null;
  market: any | null;
  integrity: number;
}

export interface SystemState {
  founderMetrics: FounderMetrics;
  systemStats: SystemStats | null;
  notification: string;
  timeline: { id: number; type: string; message: string; timestamp: string }[];
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
  setPendingManifests: (m: any[]) => void;
  oracleAlert: any | null;
  setOracleAlert: (a: any | null) => void;
  
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
    { id: 1, type: "system", message: "Oasis Foundry Kernel Initialized", timestamp: new Date().toISOString() },
    { id: 2, type: "neural", message: "Venture Metrics Synced with Rust Kernel", timestamp: new Date().toISOString() },
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
  oracleAlert: null,
  processes: [],
  windows: [],
  storage: [],
  devices: [],

  setMarketIntel: (market) => set({ marketIntel: market }),
  setFiscalBurn: (burn) => set({ fiscalBurn: burn }),
  setVentureIntegrity: (integrity) => set({ ventureIntegrity: integrity }),
  setStrategicInventory: (inventory) => set({ strategicInventory: inventory }),
  setSparklinesEnabled: (enabled) => set({ sparklinesEnabled: enabled }),
  setPerformanceOptimized: (optimized) => set({ performanceOptimized: optimized }),
  setSystemLastSync: (time) => set({ systemLastSync: time }),
  setFounderMetrics: (metrics) => set({ founderMetrics: metrics }),
  setSystemStats: (stats) => set({ systemStats: stats }),
  setProcesses: (procs) => set({ processes: procs }),
  setWindows: (wins) => set({ windows: wins }),
  setStorage: (storage) => set({ storage: storage }),
  setDevices: (devices) => set({ devices: devices }),
  setNotification: (msg) => set({ notification: msg }),
  clearNotification: () => set({ notification: "" }),
  logEvent: (message, type) =>
    set((state) => ({
      timeline: [
        {
          id: Date.now(),
          type,
          message,
          timestamp: new Date().toISOString(),
        },
        ...state.timeline,
      ].slice(0, 50),
    })),
  setActiveDebate: (debate) => set({ activeDebate: debate }),
  setActiveSynthesis: (synthesis) => set({ activeSynthesis: synthesis }),
  setShowCortex: (show) => set({ showCortex: show }),
  setShowDocs: (show) => set({ showDocs: show }),
  setShowGraph: (show) => set({ showGraph: show }),
  setTravelIndex: (index) => set({ travelIndex: index }),
  setIsTimeTraveling: (is) => set({ isTimeTraveling: is }),
  setChronosHistory: (history) => set({ chronosHistory: history }),
  setDynamicGraph: (graph) => set({ dynamicGraph: graph }),
  setCortexResults: (results) => set({ cortexResults: results }),
  setCortexQuery: (query) => set({ cortexQuery: query }),
  setShowCLI: (show) => set({ showCLI: show }),
  setShowCrates: (show) => set({ showCrates: show }),
  setIsSavingCrate: (is) => set({ isSavingCrate: is }),
  setCrates: (crates) => set({ crates }),
  setActiveVenture: (v) => set({ activeVenture: v }),
  setCliInput: (i) => set({ cliInput: i }),
  setCliHistory: (h) => set({ cliHistory: h }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setPendingManifests: (m) => set({ pendingManifests: m }),
  setOracleAlert: (a) => set({ oracleAlert: a }),
}));
