import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const isTauri = typeof (window as any).__TAURI__ !== "undefined";

export const TAURI_DEFAULTS: Record<string, any> = {
  get_venture_metrics: { arr: "$0M", burn: "$0K", runway: "0mo", momentum: "0%", stress_color: "#6366f1" },
  run_system_diagnostic: { cpu_load: 0, mem_used: 0, battery_level: 100, is_charging: true, battery_health: 100, time_remaining_min: 120 },
  get_venture_integrity: 100,
  get_fiscal_report: { total_burn: 0, token_load: 0, status: 'NOMINAL' },
  load_venture_state: { arr: "$0M", burn: "$0K", runway: "0mo", momentum: "0%", stress_color: "#6366f1" },
  get_market_intelligence: {
    market_index: 142.8,
    index_change: "-1.2%",
    ai_ticker: [
      { id: 'NVDA', name: 'NVIDIA', price: 824.2, change: '+2.4%', color: 'emerald' },
      { id: 'DSK', name: 'DeepSeek', price: 92.1, change: '+14.2%', color: 'emerald' },
      { id: 'TSM', name: 'TSMC', price: 148.5, change: '-0.8%', color: 'rose' },
      { id: 'OPENAI', name: 'OpenAI Index', price: 1042.8, change: '+0.4%', color: 'indigo' }
    ]
  },
  get_neural_wisdom: { recommendation: "Oasis Dev: Kernel simulation active." },
  get_sentinel_ledger: [],
  get_aegis_ledger: [],
  seek_chronos: [],
  search_semantic_nodes: [],
  manifest_temporal_log: "Snapshot Saved.",
  get_documentation_index: ["overview", "architecture", "security", "roadmap"],
  get_documentation_chapter: "<h1>System Documentation</h1><p>Welcome to the Oasis Kernel Technical Manual.</p>",
  get_process_list: [
    { pid: 1420, name: "oasis-shell.exe", cpu_usage: 2.4, mem_usage: 149422080, status: "Running", user: "Founder" },
    { pid: 8842, name: "Code.exe", cpu_usage: 12.8, mem_usage: 882999296, status: "Running", user: "Founder" },
    { pid: 4421, name: "chrome.exe", cpu_usage: 8.2, mem_usage: 1300500480, status: "Running", user: "Founder" },
    { pid: 9924, name: "rust-foundry-kernel", cpu_usage: 0.1, mem_usage: 44892160, status: "Background", user: "System" }
  ],
  get_running_windows: [
    { pid: 8842, title: "Oasis Shell - Visual Studio Code", exe_path: "C:\\Program Files\\VSCode\\Code.exe", x: 0, y: 0, width: 1920, height: 1080, is_maximized: true },
    { pid: 4421, title: "Oasis Foundry Dashboard - Chrome", exe_path: "C:\\Program Files\\Google\\Chrome.exe", x: 100, y: 100, width: 1280, height: 720, is_maximized: false }
  ],
  save_venture_state: null,
  execute_neural_intent: { content: "Neural Intent Handled.", tool: "NONE" },
  get_chronos_ledger: [],
  get_neural_logs: [],
  get_neural_workforce: [],
  get_active_golems: [
    { id: "GLM-001", name: "Golem Alpha-9", mission: "Market Sync", progress: 82, aura: "emerald", status: "Active" },
    { id: "GLM-002", name: "Golem Beta-4", mission: "Vault Seal", progress: 14, aura: "rose", status: "Latency" },
    { id: "GLM-003", name: "Golem Sigma-1", mission: "Intent Parse", progress: 99, aura: "indigo", status: "Finalizing" }
  ],
  get_pinned_contexts: [],
  get_economic_news: [],
  get_pending_manifests: [],
  get_strategic_inventory: [
    { id: "AST-442", name: "Neural Logic Key v2", type: "Security", value: "$0.14M", aura: "indigo", health: 100 },
    { id: "AST-821", name: "Foundry Dash Segment", type: "Interface", value: "$0.42M", aura: "emerald", health: 98 },
    { id: "AST-994", name: "Oasis Kernel Runtime", type: "Core", value: "$1.24M", aura: "rose", health: 100 }
  ],
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
