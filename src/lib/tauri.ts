import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const isTauri = typeof (window as any).__TAURI__ !== "undefined";

export const TAURI_DEFAULTS: Record<string, any> = {
  get_venture_metrics: { arr: "$1.24M", burn: "$42.5K/mo", runway: "29 Months", momentum: "STRONG (Browser Mode)", stress_color: "#6366f1" },
  run_system_diagnostic: { cpu_load: 34.2, mem_used: 10737418240, battery_level: 88, is_charging: true, battery_health: 98, time_remaining_min: 420 },
  get_venture_integrity: 94,
  get_fiscal_report: { total_burn: 42500, token_load: 120500, status: 'STABLE (MOCK)' },
  load_venture_state: { arr: "$1.24M", burn: "$42.5K/mo", runway: "29 Months", momentum: "STRONG (Browser Mode)", stress_color: "#6366f1" },
  get_market_intelligence: {
    market_index: 12450.8,
    index_change: "+1.2% (Resonant)",
    ai_ticker: [
      { id: "OASIS", price: 42.5, change: "+2.1%", color: "emerald" },
      { id: "CORTEX", price: 12.8, change: "-0.4%", color: "rose" },
      { id: "FOUNDRY", price: 88.2, change: "+5.7%", color: "emerald" },
      { id: "NEURAL", price: 31.4, change: "+1.1%", color: "emerald" },
    ]
  },
  get_neural_wisdom: { recommendation: "Optimization recommended for neural nodes.", insight: "Browser mode detected. Displaying high-fidelity simulations.", confidence: 85 },
  get_sentinel_ledger: { blobs: {}, security_resonance: 100 },
  get_aegis_ledger: [],
  seek_chronos: [],
  search_semantic_nodes: [],
  manifest_temporal_log: "Browser preview active.",
  get_documentation_index: ["overview", "architecture", "security", "roadmap"],
  get_documentation_chapter: "<h1>System Documentation</h1><p>Welcome to the Oasis Kernel Technical Manual.</p>",
  get_process_list: [
    { pid: 1024, name: "oasis_kernel.exe", cpu_usage: 12.4, mem_usage: 512000000, status: "stable", priority: "high" },
    { pid: 2048, name: "neural_cortex.sys", cpu_usage: 8.2, mem_usage: 1024000000, status: "active", priority: "critical" },
    { pid: 4096, name: "sentinel_pulse.exe", cpu_usage: 1.5, mem_usage: 128000000, status: "idle", priority: "normal" }
  ],
  get_running_windows: [
    { title: "Oasis Dev Tools", name: "code.exe" },
    { title: "Chrome - Oasis Shell", name: "chrome.exe" }
  ],
  save_venture_state: null,
  execute_neural_intent: { content: "Neural Intent Handled (Simulated).", tool: "NONE" },
  get_chronos_ledger: [
    { timestamp: new Date().toISOString(), event: "Kernel Initialized" },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), event: "Market Sync Complete" }
  ],
  get_neural_logs: [],
  get_neural_workforce: [],
  get_active_golems: [
    { id: 1, name: "Golem Alpha", mission: "Data Retrieval", progress: 45, aura: "indigo", status: "In Progress" },
    { id: 2, name: "Golem Beta", mission: "Neural Mapping", progress: 88, aura: "emerald", status: "Optimizing" }
  ],
  get_pinned_contexts: [],
  get_economic_news: [],
  get_pending_manifests: [],
  get_strategic_inventory: [
    { id: 1, name: "Core Neural Weights", status: "secured", type: "asset" },
    { id: 2, name: "Market Liquidity Bridge", status: "active", type: "financial" }
  ],
  get_available_ventures: [],
  get_storage_map: [
    { name: "Main Vault", mount: "C:/", total: "1TB", free: "450GB", type: "SSD" },
    { name: "Neural Archive", mount: "D:/", total: "4TB", free: "1.2TB", type: "HDD" }
  ],
  get_system_devices: [
    { name: "Neural Cortex GPU", type: "GPU", status: "Online" },
    { name: "Quantum Aura Mic", type: "Audio", status: "Ready" }
  ],
};

export const invokeSafe = async <T = any>(cmd: string, payload?: Record<string, any>): Promise<T> => {
  if (!isTauri) return (TAURI_DEFAULTS[cmd] ?? null) as T;
  return invoke(cmd, payload as any) as Promise<T>;
};

export const listenSafe = async (event: string, handler: any) => {
  if (!isTauri) return () => { };
  return listen(event, handler);
};
