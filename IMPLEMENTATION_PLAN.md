# Oasis Shell Implementation Plan (Tied To Current Codebase)

Date: 2026-04-04

This plan is designed to turn the existing UI-heavy shell into a functional, real OS-like experience by building on the current Tauri + React architecture.

---

## Phase 0: Stabilize Structure (1–2 days)

Goal: Make the codebase maintainable so we can move fast without breaking the UI.

### Tasks
1. Move the duplicated `cn` helper to a single source.
   - Use `src/lib/utils.ts` and remove the local definition in `src/App.tsx`.
2. Create a UI folder structure and extract major sections into components.
   - New folders: `src/components/layout`, `src/components/panels`, `src/components/overlays`.
3. Create a small state store for system data to avoid 40+ top-level `useState` calls.
   - New file: `src/lib/systemStore.ts` (zustand or simple context).

### Files
- `src/App.tsx`
- `src/lib/utils.ts`
- `src/components/**` (new)

---

## Phase 1: Real System Data (1–2 weeks)

Goal: Replace static UI with real metrics from Rust.

### Tasks
1. Build a dedicated System panel using real Tauri data.
   - Wire to `run_system_diagnostic`, `get_running_windows`, `get_fiscal_report`.
2. Add a top status bar that always shows CPU, RAM, network, storage.
   - Pull from `SystemStats` in `src-tauri/src/lib.rs`.
3. Add a basic process viewer (windows + PID + executable path).

### Files
- `src/App.tsx`
- `src/components/panels/SystemPanel.tsx` (new)
- `src/components/layout/TopBar.tsx` (new)
- `src-tauri/src/lib.rs` (already has `SystemStats` + `get_running_windows`)

---

## Phase 2: Command Palette + Workflow Layer (2–3 weeks)

Goal: Centralize all actions in one command surface.

### Tasks
1. Create Command Palette UI with fuzzy search.
2. Integrate it to `execute_neural_intent` and add hard-coded command mapping first.
3. Add a “dry run” mode for any destructive actions.

### Files
- `src/components/overlays/CommandPalette.tsx` (new)
- `src/App.tsx`
- `src-tauri/src/lib.rs` (use `execute_neural_intent` and add explicit permission checks)

---

## Phase 3: Files + Storage + Vault (3–6 weeks)

Goal: Make the shell feel like an OS by owning files and disks.

### Tasks
1. File explorer panel with real paths and safe operations.
2. Storage map panel using `sysinfo::System::disks()` data from Rust.
3. Harden Sentinel Vault: add key timeout and “lock on idle.”

### Files
- `src/components/panels/FileExplorer.tsx` (new)
- `src/components/panels/StoragePanel.tsx` (new)
- `src-tauri/src/lib.rs` (new Tauri commands for file ops + disk stats)

---

## Phase 4: Navigation Model (1–2 weeks)

Goal: Make navigation consistent and OS-like.

### Tasks
1. Define a persistent layout grid (Top bar + Left rail + Main canvas + Right rail).
2. Reduce overlay chaos: unify modals into a single overlay system.
3. Add Settings page with permissions.

### Files
- `src/App.tsx`
- `src/components/layout/LeftRail.tsx` (new)
- `src/components/layout/RightRail.tsx` (new)
- `src/components/panels/Settings.tsx` (new)

---

## Phase 5: Automation + Intent (ongoing)

Goal: Transform the OS into an automation engine.

### Tasks
1. Task engine UI for scheduling and workflow manifests.
2. Logbook & audit trail for all actions.
3. Semantic search tied to real file index (`oasis_crates.db`).

### Files
- `src/components/panels/AutomationPanel.tsx` (new)
- `src/components/panels/AuditLog.tsx` (new)
- `src-tauri/src/lib.rs` (add: audit log insert + query commands)

---

## Concrete Next Sprint (Recommended)

1. Split UI into components (TopBar, LeftRail, SystemPanel).
2. Wire SystemPanel to `run_system_diagnostic` + `get_running_windows`.
3. Add Command Palette overlay and hook to `execute_neural_intent`.

---

## Notes on Current Rust Back-End Capabilities

Already available in `src-tauri/src/lib.rs`:
- `run_system_diagnostic` for CPU/RAM status
- `get_running_windows` for running window list
- `get_fiscal_report` for cost tracking
- `get_sentinel_ledger`, `seal_strategic_asset`, `unseal_strategic_asset`
- `get_logs` for neural log records

These are enough to make Phase 1 real without any backend changes.

---

## If You Want, I Can Start Implementing

I can begin by creating `TopBar`, `SystemPanel`, and the `CommandPalette` overlay and wire them to the existing Tauri commands.
