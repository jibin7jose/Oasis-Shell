# Database Schema

The SQLite database is created during Tauri startup and stored in the app local data directory as `oasis_shell.db`.

## Tables

### `context_crates`
- `id` INTEGER PRIMARY KEY
- `name` TEXT NOT NULL
- `description` TEXT
- `aura_color` TEXT
- `apps` TEXT NOT NULL
- `timestamp` TEXT NOT NULL
- `integrity` INTEGER DEFAULT 100
- `arr` REAL DEFAULT 0.0
- `burn` REAL DEFAULT 0.0
- `status` TEXT DEFAULT 'Offline'

Purpose: stores crate/workspace records and their lifecycle state.

### `neural_logs`
- `id` INTEGER PRIMARY KEY
- `event_type` TEXT NOT NULL
- `message` TEXT NOT NULL
- `timestamp` TEXT NOT NULL

Purpose: event history for system, neural, and deployment actions.

### `file_embeddings`
- `id` INTEGER PRIMARY KEY
- `filename` TEXT NOT NULL
- `filepath` TEXT NOT NULL
- `content` TEXT NOT NULL
- `vector` TEXT NOT NULL

Purpose: local RAG/search index storage.

### `pinned_contexts`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `name` TEXT NOT NULL
- `state_blob` TEXT NOT NULL
- `aura_color` TEXT NOT NULL
- `timestamp` TEXT NOT NULL

Purpose: saves pinned UI or workflow states.

### `system_secrets`
- `name` TEXT PRIMARY KEY
- `secret_blob` BLOB NOT NULL
- `nonce` BLOB NOT NULL
- `salt` BLOB NOT NULL
- `timestamp` TEXT NOT NULL

Purpose: AES-GCM encrypted secret storage.

### `chronos_history`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `timestamp` TEXT NOT NULL
- `data` TEXT NOT NULL
- `integrity` REAL NOT NULL

Purpose: snapshot history for temporal state restore and audit.

### `strategic_memory`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `content` TEXT NOT NULL
- `metadata` TEXT NOT NULL
- `vector` TEXT NOT NULL
- `timestamp` TEXT NOT NULL

Purpose: long-lived semantic memory store.

### `golem_registry`
- `id` TEXT PRIMARY KEY
- `name` TEXT NOT NULL
- `aura` TEXT NOT NULL
- `status` TEXT NOT NULL
- `progress` REAL DEFAULT 0.0

Purpose: persisted golem/task registry.

### `risk_simulations`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `scenario` TEXT NOT NULL
- `probability` REAL NOT NULL
- `impact_rating` TEXT NOT NULL
- `defensive_strategy` TEXT NOT NULL
- `associated_venture` TEXT
- `timestamp` TEXT NOT NULL

Purpose: stores risk scenarios and mitigation guidance.

### `oracle_predictions`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `title` TEXT NOT NULL
- `divergence_level` TEXT NOT NULL
- `timestamp` TEXT NOT NULL

Purpose: records oracle/prediction outputs.

## Storage Notes
- SQLite is accessed through an `r2d2_sqlite` pool.
- WAL mode is enabled.
- Synchronous mode is set to `NORMAL` for performance.

