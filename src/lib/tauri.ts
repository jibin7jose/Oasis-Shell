import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const isTauri = typeof (window as any).__TAURI__ !== "undefined";

export const TAURI_DEFAULTS: Record<string, any> = {
  get_venture_metrics: { arr: "N/A", burn: "N/A", runway: "N/A", momentum: "Browser-only", stress_color: "#6366f1" },
  run_system_diagnostic: { cpu_load: 0, mem_used: 0, battery_level: 0, is_charging: false, battery_health: 0, time_remaining_min: 0 },
  get_venture_integrity: 0,
  get_fiscal_report: { total_burn: 0, token_load: 0, status: 'BROWSER_ONLY' },
  load_venture_state: { arr: "N/A", burn: "N/A", runway: "N/A", momentum: "Browser-only", stress_color: "#6366f1" },
  get_market_intelligence: {
    market_index: 0,
    index_change: "Browser mode",
    ai_ticker: []
  },
  get_neural_wisdom: { recommendation: "Desktop kernel required for live AI guidance.", insight: "Launch the Tauri app to use local Ollama-backed reasoning.", confidence: 0 },
  get_sentinel_ledger: { blobs: {}, security_resonance: 0 },
  get_aegis_ledger: [],
  seek_chronos: [],
  search_semantic_nodes: [],
  manifest_temporal_log: "Desktop kernel required.",
  get_documentation_index: ["overview", "architecture", "security", "roadmap"],
  get_documentation_chapter: "<h1>System Documentation</h1><p>Welcome to the Oasis Kernel Technical Manual.</p>",
  get_process_list: [],
  get_running_windows: [],
  save_venture_state: null,
  execute_neural_intent: { content: "Neural Intent Handled.", tool: "NONE" },
  get_chronos_ledger: [],
  get_neural_logs: [],
  get_neural_workforce: [],
  get_active_golems: [],
  get_pinned_contexts: [],
  get_economic_news: [],
  get_pending_manifests: [],
  get_strategic_inventory: [],
  get_available_ventures: [],
  get_storage_map: [],
  get_system_devices: [],
};

export const invokeSafe = async <T = any>(cmd: string, payload?: Record<string, any>): Promise<T> => {
  if (!isTauri) return (TAURI_DEFAULTS[cmd] ?? null) as T;
  return invoke(cmd, payload as any) as Promise<T>;
};

export const listenSafe = async (event: string, handler: any) => {
  if (!isTauri) return () => { };
  return listen(event, handler);
};
