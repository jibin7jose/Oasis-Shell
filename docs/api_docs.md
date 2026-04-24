# Oasis Shell API Documentation

## API Style
The backend API is Tauri IPC. Frontend code calls Rust commands with `invoke` or `invokeSafe`. There are no conventional REST routes in the project.

## Frontend IPC Wrapper
- `src/lib/tauri.ts` defines `invokeSafe()` and `listenSafe()` for browser-safe and Tauri-safe access.
- `src/lib/terminalDispatcher.ts` and the shell panels route user intent into backend commands.

## Core Command Groups

### App Bootstrap and Shell Control
- `sync_project`
- `start_watcher`
- `install_oas_binary`
- `start_proactive_sentience`
- `execute_neural_command`
- `execute_neural_intent`
- `execute_neural_commission`

### Crates, Logs, and Chronos
- `save_crate`
- `get_crates`
- `delete_crate`
- `export_crate_manifest`
- `synthesize_crate_aura`
- `launch_crate`
- `log_event`
- `get_logs`
- `create_chronos_snapshot`
- `get_chronos_ledger`
- `seek_chronos`
- `seek_chronos_history`
- `manifest_chronos_voyage`
- `capture_chronos_snapshot`

### System Telemetry and OS Control
- `run_system_diagnostic`
- `get_process_list`
- `get_storage_map`
- `get_system_devices`
- `get_active_windows`
- `get_running_windows`
- `launch_context_apps`
- `read_directory`
- `launch_path`
- `delete_path`
- `rename_path`
- `kill_quarantine_process`
- `suspend_process`
- `resume_process`
- `set_process_priority`
- `get_process_priority`
- `get_battery_health_wmi`
- `set_window_layout`

### Vault and Secret Handling
- `authenticate_founder`
- `is_vault_unlocked`
- `lock_sentinel`
- `seal_strategic_asset`
- `unseal_strategic_asset`
- `get_sentinel_ledger`
- `vault_store_secret`
- `vault_get_secret`
- `vault_list_secrets`

### Golems, Macros, and AI Collective
- `register_new_golem`
- `delete_golem`
- `execute_golem_manifest`
- `release_golem_workforce`
- `get_active_golems`
- `register_golem_task`
- `update_golem_task`
- `complete_golem_task`
- `get_golem_proposals`
- `resolve_golem_proposal`
- `hatch_autonomous_golem`
- `decommission_golem`
- `manifest_architectural_blueprint`
- `get_architectural_manifests`
- `forge_macro_intent`
- `execute_macro_golem`
- `execute_visual_macro`
- `sign_macro_golem`
- `get_macro_inventory`
- `get_agent_collective`
- `invoke_golem_debate`

### Strategic Intelligence and Research
- `get_venture_metrics`
- `get_market_intelligence`
- `get_neural_wisdom`
- `get_neural_brief`
- `get_neural_graph`
- `get_neural_logs`
- `get_neural_workforce`
- `get_pending_manifests`
- `get_predictive_intents`
- `get_economic_news`
- `get_nexus_health`
- `get_nexus_pulse`
- `get_neuroforge_profile`
- `get_cross_venture_wisdom`
- `generate_venture_synthesis`
- `generate_venture_audit`
- `generate_strategic_report`
- `derive_boardroom_debate`
- `invoke_deep_oracle`
- `invoke_multimodal_oracle`
- `trigger_oracle_audit`
- `derive_predictive_simulation`
- `derive_mitigation_macro`

### Collective, Mirror, and Network Commands
- `register_remote_node`
- `get_collective_nodes`
- `broadcast_distributed_aura`
- `collective_aura_sync`
- `sync_venture_to_aegis`
- `mirror_venture_intelligence`
- `invoke_neural_mirror`
- `receive_neural_mirror`
- `get_neural_mutations`
- `analyze_system_genome`
- `verify_system_mutation`
- `apply_neural_mutation`

### Security, Audit, and Recovery
- `get_sentinel_alerts`
- `get_global_threat_level`
- `run_security_audit`
- `trigger_system_lockdown`
- `run_sandbox_audit`
- `run_adversarial_simulation`
- `sweep_venture_health`
- `recover_dead_ventures`
- `get_system_resilience_audit`
- `check_biometric_status`
- `trigger_biometric_scan`
- `is_biometric_session_valid`

### Documentation and Search
- `get_documentation_index`
- `get_documentation_chapter`
- `manifest_temporal_log`
- `index_folder`
- `index_strategic_asset`
- `semantic_search`
- `rag_query`
- `search_semantic_nodes`
- `query_strategic_memory`
- `get_all_files`

## Notes
- The exact command list is generated from `#[tauri::command]` handlers in `src-tauri/src/lib.rs` and the module files under `src-tauri/src/`.
- The UI depends on these commands for almost every major panel and modal.

