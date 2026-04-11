import { create } from "zustand";
import { SystemStats, WindowInfo, ProcessInfo, StorageInfo, DeviceInfo } from "../components/panels/SystemPanel";

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

interface SystemState {
  founderMetrics: FounderMetrics;
  systemStats: SystemStats | null;
  notification: string;
  timeline: TimelineEvent[];
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
  
  // Actions
  setFounderMetrics: (metrics: FounderMetrics) => void;
  setSystemStats: (stats: SystemStats | null) => void;
  setProcesses: (procs: ProcessInfo[]) => void;
  setWindows: (wins: WindowInfo[]) => void;
  setStorage: (storage: StorageInfo[]) => void;
  setDevices: (devices: DeviceInfo[]) => void;
  setNotification: (msg: string) => void;
  clearNotification: () => void;
  logEvent: (event: string, type: TimelineEvent["type"]) => void;
  setActiveDebate: (debate: any | null) => void;
  setActiveSynthesis: (synthesis: any | null) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  founderMetrics: {
    arr: "$1.24M",
    burn: "$0.85M",
    runway: "14.2 Mo",
    momentum: "+12.8%",
    stress_color: "#10b981",
  },
  systemStats: null,
  notification: "",
  timeline: [
    { id: 1, type: "system", event: "Oasis Foundry Kernel Initialized", time: "09:42:00" },
    { id: 2, type: "neural", event: "Venture Metrics Synced with Rust Kernel", time: "09:42:15" },
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
  processes: [],
  windows: [],
  storage: [],
  devices: [],

  setFounderMetrics: (metrics) => set({ founderMetrics: metrics }),
  setSystemStats: (stats) => set({ systemStats: stats }),
  setProcesses: (procs) => set({ processes: procs }),
  setWindows: (wins) => set({ windows: wins }),
  setStorage: (storage) => set({ storage: storage }),
  setDevices: (devices) => set({ devices: devices }),
  setNotification: (msg) => set({ notification: msg }),
  clearNotification: () => set({ notification: "" }),
  logEvent: (event, type) =>
    set((state) => ({
      timeline: [
        {
          id: Date.now(),
          type,
          event,
          time: new Date().toLocaleTimeString(),
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
}));
