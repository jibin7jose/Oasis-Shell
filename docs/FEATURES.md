# Oasis Shell Features & Architecture

This document tracks the core backend modules and their responsibilities following the monolithic decoupling of `lib.rs`.

## Backend Ecosystem (Rust / Tauri)

### 1. The Monolith Kernel (`src-tauri/src/lib.rs`)
The kernel initializes the Tauri app context, builds the system tray, establishes local SQLite instances to track neural logs (Chronos Ledger), handles dynamic configuration, handles UI process synchronization (`oasis-shell` instance limit), and exports system/UI/vault/golem/macro traits.

### 2. Vault Security (`src-tauri/src/vault.rs`)
Handles all secret management, API credential persistence, and strategic asset sealing using AES-GCM-256 and PBKDF2 cryptography. It utilizes a `Sentinel Vault` UI abstraction to prevent API leaks and requires a "Founder Signature" (via `verify_founder_signature`) for unsealing sensitive items. 
**Functions**: `vault_store_secret`, `vault_get_secret`, `vault_delete_secret`, `seal_strategic_asset`.

### 3. Artificial Sentience Workspace (`src-tauri/src/golems.rs`)
Tracks and synthesizes requests by deploying autonomous "Neural Golems." Uses lazy-loaded mutex memory for active golem registries (`GOLEM_REGISTRY`) and coordinates LLM logic to propose patches and orchestrate distributed neural intelligence across target files.
**Functions**: `register_new_golem`, `delete_golem`, `execute_golem_manifest`, `release_golem_workforce`, `get_golem_proposals`, `resolve_golem_proposal`, `register_golem_task`, `update_golem_task`, `complete_golem_task`.

### 4. Strategic Macros (`src-tauri/src/macros.rs`)
Registers, executes, and parses complex "Strategic Intents" synthesized dynamically or recorded locally. It allows bridging AI-generated tasks to raw system processes or API requests via `execute_macro` logic, serving as the bridge between human language prompts and raw execution code.
**Functions**: `register_macro`, `get_macros`, `execute_macro`, `manifest_forge_intent`.

### 5. OS & System Interfaces (`src-tauri/src/system.rs`)
Provides real-time OS metadata integration including Windows-specific interop wrappers.
- **Process Memory**: Scans `sysinfo` for processes overhead, executes actions against threads, reads application disk footprints.
- **Hardware Telemetry**: Retrieves battery cycle info via WMI (`Get-CimInstance`), checks physical components and network loads.
- **Window Management**: Uses `windows-rs` to capture active/launched applications (`WindowSnapshot`), calculates screen boundaries `EnumWindows/GetWindowRect` and provides context to build immersive UI layouts (`set_window_layout`).
**Functions**: `run_system_diagnostic`, `get_process_list`, `get_battery_health_wmi`, `launch_context_apps`, etc.

## UI Surface (Frontend Ecosystem)
- Built on **React + TypeScript + Vite**. 
- Centralized visibility via **Zustand System Store** (`useSystemStore`).
- Polished components integrating raw **Tauri system hooks**.
