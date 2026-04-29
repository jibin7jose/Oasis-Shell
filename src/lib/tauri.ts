import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const isTauri = typeof (window as any).__TAURI__ !== "undefined";

export const invokeSafe = async <T = any>(cmd: string, payload?: Record<string, any>): Promise<T> => {
  if (!isTauri) {
    const browserFallbacks: Record<string, unknown> = {
      load_venture_state: { arr: "N/A", burn: "N/A", runway: "N/A", momentum: "Offline", stress_color: "#6366f1" },
      get_venture_metrics: { arr: "N/A", burn: "N/A", runway: "N/A", momentum: "Offline", stress_color: "#6366f1" },
      run_system_diagnostic: { cpu_load: 0, mem_used: 0, battery_level: 0, is_charging: false, battery_health: 0, time_remaining_min: 0 },
      get_fiscal_report: { total_burn: 0, token_load: 0, status: "OFFLINE" },
      get_market_intelligence: { market_index: 0, index_change: "OFFLINE", ai_ticker: [] },
      get_oracle_pulse: { sentiment: "OFFLINE", btc_usd: 0, eth_usd: 0, tech_momentum: 0, timestamp: new Date().toISOString() },
      get_venture_integrity: 0,
      get_logic_path: "",
      get_chronos_ledger: [],
      get_pinned_contexts: [],
      get_neural_logs: [],
      get_pending_manifests: [],
      get_active_golems: [],
      get_strategic_inventory: [],
      get_economic_news: [],
      get_available_ventures: [],
    };
    if (Object.prototype.hasOwnProperty.call(browserFallbacks, cmd)) {
      return browserFallbacks[cmd] as T;
    }
    if (cmd.startsWith("get_") || cmd.startsWith("seek_")) {
      return [] as T;
    }
    return null as T;
  }
  return invoke(cmd, payload as any) as Promise<T>;
};

export const listenSafe = async (event: string, handler: any) => {
  if (!isTauri) return () => { };
  return listen(event, handler);
};
