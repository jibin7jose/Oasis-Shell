# Oasis Shell Feature & UX Roadmap

Date: 2026-04-04
Scope: Oasis Shell (Tauri + React front-end) as an OS-like desktop environment and strategic command shell.

---

## Vision (Clear Positioning)
Oasis Shell is not a full kernel yet; it is a high-performance desktop layer and system orchestrator that feels like an OS. Competing with Microsoft/Linux at the kernel level requires years of driver and security engineering. The fastest path to shipping a competitive experience is:

- Build a world-class shell and system layer first (fast, beautiful, secure).
- Add a modular “kernel-core” service layer via Tauri/Rust.
- Integrate deeper into OS capabilities (Windows/Linux/macOS) through safe, explicit permissions.

---

## Current Strengths Observed in `src/App.tsx`
- Highly expressive UI and rich motion language.
- Strong narrative system (timeline, oracle, neural intent, nexus, cortex).
- Tauri backend hooks are already in place (`invoke()`-based capabilities).
- Multiple advanced surfaces: AI assistant, semantic HUD, vault, network, graphs.

This means the product already feels like an OS. The roadmap below focuses on making it *functional*, reliable, and coherent.

---

## Core Product Pillars

1) System Authority
- The shell must feel authoritative: real system data, real processes, real files.
- Build a clear permission model for every high-risk action.

2) Intent + Workflow First
- The OS should understand intent and automate flows, not just display them.
- Everything must be scriptable (CLI + “Neural intent”).

3) Calm, Performant, Consistent UX
- Strong visual identity plus a consistent layout grid.
- Clear “levels”: dashboard, workspaces, terminal, settings, security.

4) Extensible Kernel Services
- Services are modules, not monoliths: logging, file index, task engine, sync, auth.

---

## Feature Ideas (Now / Present)

### A) Real OS Integrations (High Priority)
- Live process manager (CPU/mem per process).
- File system explorer with drag-drop and safe actions.
- Storage map: actual disks/partitions with capacity + health.
- System health: battery, thermals, network throughput.
- Device registry (USB, audio, display, GPU).

### B) Shell Workflow Engine
- Command palette (global) with fuzzy search across files, apps, actions.
- Task engine: “run these 5 actions when X happens.”
- Named workflows: “Start Day”, “Deploy Release”, “Clean Workspace”.
- Runbook builder (visual scripting).

### C) Triage & Focus
- Active tasks dashboard with risk & dependency modeling.
- Priority signals: “focus mode” + “zen mode” lock.
- Notification rules (silence, escalate, auto-resolve).

### D) Security & Trust
- Sentinel Vault improvements: encryption, secure notes, passkey support.
- Policy layers: each module asks permission once.
- Audit log: who did what, when, with what permission.

### E) Core UX Fixes
- Navigation model: define primary layout structure:
  - Top bar (search, status)
  - Left rail (contexts)
  - Main canvas (workspaces)
  - Right rail (assistant & logs)
- Reduce random modals: unify overlays to 1-2 consistent surfaces.

---

## Feature Ideas (Near-Term / 3–6 months)

### A) Workspace + App Model
- “Workspaces” are top-level environments (Dev, Design, Ops, Sales).
- Apps are cards with strict contracts: input, output, permissions.
- Apps can be installed or created by user.

### B) Real Terminal + Sandbox
- Terminal emulator inside the shell with saveable sessions.
- Sandbox runner for scripts and automation.
- Safe “dry-run” mode for automation and deployment.

### C) Files + Knowledge
- File indexer (metadata, tags, semantic labels).
- “Cortex” search: fuzzy + semantic, tied to real file paths.
- Snapshots of file states with rollback.

### D) Intelligence Layer
- Intent parser that routes to real system tools.
- “Explain this system state” view.
- “Suggest next steps” based on logs/events.

---

## Feature Ideas (Future / 6–18 months)

### A) Kernel-Style Services (Rust)
- Unified event bus (one log for everything).
- Module manager for services.
- Background scheduler for tasks.
- Consistent IPC between UI and services.

### B) Real Permissions Model
- Capability-based permissions: Files, Network, Process, Devices.
- Human-readable permission view (“What can this module do?”).
- Per-module security audit and revocation.

### C) Cross-Device Sync
- Identity and key sync across machines.
- Workspace sync + encrypted storage.
- Offline-first ledger.

### D) “Oasis Store”
- App directory for modules (verified + unverified).
- Permission requirements at install.
- Update pipeline + rollback.

---

## UI / UX Ideas (Make It Feel Like a Real OS)

### 1) Spatial OS Layout
- “Rooms” instead of windows: each room is a workspace.
- Teleport between rooms (animated scene transitions).

### 2) Reality Anchors
- Status bar always shows: CPU, RAM, network, storage, battery.
- System health widget is always accessible.

### 3) Consistent “Operator” Language
- Rename in-app verbs to OS verbs: “Open”, “Mount”, “Quarantine”, “Deploy”, “Rewind”.
- Every action has a system log entry.

### 4) Minimal Command Surface
- One command palette to rule all actions.
- One assistant panel; remove duplicate input surfaces.

### 5) Visual Coherence
- Restrict color palette to 3 base families.
- Define a consistent grid and spacing scale.
- Use stable typography: 1–2 fonts only.

---

## Competitive Differentiation vs. Microsoft / Linux

1) Intent-Driven OS
- Operating system that understands intent, not just windows.
- Everything is orchestrated through actions and goals.

2) Built-In Automation
- Workflows are first-class and shareable.
- User can create automations visually without code.

3) Semantic OS Search
- Not just file search; full knowledge graph of local system.

4) Human-Centered Security
- Clear permissions, explainable actions, reversible changes.

---

## MVP Definition (What Must Work to Feel Legit)

- Real system metrics: CPU, RAM, storage, network.
- File browser with real paths and safe actions.
- Process view with basic kill/pause (with permissions).
- Terminal with session history.
- Unified command palette.
- Audit log.

---

## Suggested Architecture Next Steps

1) Define a kernel-service layer in Rust
- Services: SystemStats, Files, Process, Events, Storage.
- Each service has a single interface for the UI.

2) Map the UI to real data
- Replace static metrics with real OS data.
- Create “fake mode” for demos.

3) Stabilize state management
- Group all “vision” layers under a single workspace state.
- Avoid 30+ top-level React states by grouping.

---

## Concrete Feature Backlog (Top 20)

1. Command palette with search + action execution
2. Process list with kill and priority controls
3. File explorer with drag-drop + safe delete
4. Disk map and storage health panel
5. System health widget (battery/network/thermals)
6. Terminal with history + profiles
7. Task engine + scheduled jobs
8. Workflow builder (visual)
9. Permission prompt system
10. Audit log with filters
11. Snapshot / rollback for files
12. Cortex file indexer
13. App installation / module registry
14. Notifications with rules
15. Offline-first ledger
16. Background service manager
17. Dedicated “Settings” that is coherent
18. “Oasis Store” concept
19. Multi-user profiles
20. Remote system control (ssh-like)

---

## Alignment With Existing Code

- `invoke()` calls are already structured; you can expand the Rust API surface.
- The “Cortex” and “Oracle” UI areas can become real system modules.
- “Sentinel Vault” becomes your security crown jewel.

---

## Recommendations for the Next Commit

- Create a new `System` panel with real data from Rust.
- Build the command palette component and wire to `execute_neural_intent`.
- Simplify the nav layout (top + left + main + right).
- Add a dedicated Settings page with permission controls.

---

If you want, I can convert these into an implementation plan with exact files and tasks.







--------------------------------------------------------------------------------------------------------------------



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
