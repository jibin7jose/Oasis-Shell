# 🌌 Oasis Shell: Master Manifest v3.4.0

## 🔭 Architectural Philosophy
The Oasis Shell is a high-fidelity, high-concurrency operating environment designed for strategic founders. It transitions the workspace from a series of disconnected tools into a unified, thread-safe, and forensically audited command center.

---

## 🛠 Core Internal Hardening

### 1. High-Concurrency Ledger Engine (`r2d2`)
The backend has been migrated from a single-threaded `Mutex<Connection>` to a production-grade **SQLite Connection Pool** powered by `r2d2`.
- **WAL Mode**: Write-Ahead Logging is enabled by default to allow concurrent reads and writes.
- **Synchronous NORMAL**: Optimized for high-speed SSD throughput while maintaining forensic integrity.
- **Pooled Access**: All Tauri commands now utilize `state.pool.get()` for non-blocking database interactions.

### 2. Forensic Persistence Layer
All system state is now consolidated into the centralized `oasis_shell.db` ledger:
- **Chronos Snapshots**: Every world-state change is etched into the ledger for temporal navigation.
- **Sentinel Vault**: High-risk assets are sealed via AES-256-GCM, with keys derived from the Founder Signature.
- **Neural Logs**: Real-time behavioral telemetry and AI synthesis events are forensically tracked.
- **Strategic Golems**: The autonomous workforce registry is now a SQL-backed inventory, purging legacy JSON dependencies.

### 3. Structural Resilience (`SpectralBoundary`)
The frontend implements a **Isolationist Panel Strategy**.
- Each major dashboard node (Forge, Workforce, Dashboard, Nexus) is wrapped in a `SpectralBoundary`.
- Component-level entropy or JS crashes are isolated, allowing the Founder to "reconstruct" specific panels without crashing the entire Shell.

---

## 🛰 Neural Endpoints

| Endpoint | Logic | Persistence |
| :--- | :--- | :--- |
| `get_nexus_pulse` | Portfolio Integrity Aggregation | `context_crates` |
| `register_new_golem` | Autonomous Agent Enrollment | `golem_registry` |
| `execute_neural_intent` | LLM-Driven System Routing | `neural_logs` |
| `vault_seal_asset` | AES-256 Forensic Sealing | `system_secrets` |
| `get_chronos_ledger` | Temporal Buffer Navigation | `chronos_history` |

---

## 🛡 Security Protocol
- **Vault Gating**: Sensitive operations (Refactor, Purge, Vault Access) require an active `OASIS_FOUNDER_SECRET` handshake.
- **Signed Macros**: AI-synthesized PowerShell macros must be signed by the founder before execution.
- **Path Isolation**: All persistence is localized to the `app_local_data_dir`, isolated from system-wide temp folders.

---

## 🚀 Deployment Status
- **Backend Status**: Hardened (r2d2 / WAL)
- **Persistence Status**: Consolidated (SQL-Centric)
- **UI Status**: Resilient (SpectralBoundaries Active)
- **Neural Lattice**: Synchronized (Gemma3 / LLava)

**"In entropy, we forge the order of the venture."**
