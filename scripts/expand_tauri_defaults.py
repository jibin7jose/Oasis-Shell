import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Expanded TAURI_DEFAULTS for robust Browser Dev Mode stability
expanded_defaults = r"""const TAURI_DEFAULTS: Record<string, any> = {
  get_chronos_ledger: [],
  get_neural_logs: [],
  get_neural_workforce: [],
  get_active_golems: [],
  get_pinned_contexts: [],
  get_economic_news: [],
  get_pending_manifests: [],
  get_strategic_inventory: [],
  get_available_ventures: [],
  get_running_windows: [],
  get_process_list: [],
  get_storage_map: [],
  get_system_devices: [],
  get_venture_metrics: { arr: "$0M", burn: "$0K", runway: "0mo", momentum: "0%", stress_color: "#6366f1" },
  run_system_diagnostic: { cpu_load: 0, mem_used: 0, battery_level: 100, is_charging: true, battery_health: 100, time_remaining_min: 120 },
  get_venture_integrity: 100,
  get_fiscal_report: { total_burn: 0, token_load: 0, status: 'NOMINAL' },
  load_venture_state: { arr: "$0M", burn: "$0K", runway: "0mo", momentum: "0%", stress_color: "#6366f1" },
  get_market_intelligence: { market_index: 100 },
  get_neural_wisdom: { recommendation: "Oasis Dev: Kernel simulation active." },
  get_sentinel_ledger: [],
  get_aegis_ledger: [],
  seek_chronos: [],
  search_semantic_nodes: []
};"""

target_pattern = r"const TAURI_DEFAULTS: Record<string, any> = \{[\s\S]+?\};"

content = re.sub(target_pattern, expanded_defaults, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("TAURI_DEFAULTS Expansion Successful.")
