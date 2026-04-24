# Fixes Log

## 2026-04-24
- Added an explicit Vite config entrypoint at `vite.config.mjs` and updated the frontend/build scripts to point to it.
- Enabled `resolve.preserveSymlinks` in the Vite config to reduce Windows realpath traversal during resolution.
- Verified `cargo check` remains green after the change.
- Build validation still hits an environment-level `spawn EPERM` inside Vite/esbuild in this shell, so the code change is a mitigation rather than a complete environment fix.
- Confirmed the frontend build succeeds outside the restricted sandbox with `npm.cmd run build`.
- Confirmed the live frontend and Playwright UI smoke now pass once the dev server is running.
- Cleaned up Rust warnings by removing unused imports and marking intentionally dormant helper functions as dead code.
- Reduced `cargo check` warnings from 25 to 0.
- Added unit tests for vault key derivation and secret round-trips, process-priority mapping, and Chronos snapshot parsing.
- Added integration tests in `src-tauri/tests/command_integration.rs` that exercise the public AppState-backed vault flow, process-priority normalization, and Chronos parsing from the outside.
- Added a SQLite-backed Chronos capture/seek round-trip helper and integration test so the temporal ledger path is covered end to end.
- Added a SQLite-backed neural mirror persistence helper and integration test so `context_crates` writes now have direct coverage through the public helper path.
- Split the chronos and neural-mirror helper code out of `src-tauri/src/lib.rs` into `src-tauri/src/chronos.rs` and `src-tauri/src/mirror.rs`, keeping the public API stable with re-exports.
- Added a negative integration test that verifies invalid neural mirror signatures are rejected without persisting any `context_crates` rows.
- Added a pinned-context SQLite helper seam and integration test so `pinned_contexts` round-trips are covered through the same public pattern as vault, chronos, and mirror flows.
- Added a strategic-memory SQLite helper seam and integration test so persistence of indexed strategic assets now has direct coverage without needing Ollama during the test run.
- Added an Oracle alert persistence helper and integration test so `oracle_predictions` inserts now have direct SQLite coverage without needing the live oracle path.
- Added a risk-simulation persistence helper and integration test so `risk_simulations` inserts are directly covered through a local SQLite seam.
- Moved the persistence helper cluster into `src-tauri/src/ledger.rs` and kept the public helper names re-exported from `src-tauri/src/lib.rs`.
- Moved the Oracle audit logic into `src-tauri/src/oracle.rs` and added coverage for the generated alert path and the resilience-audit readout path.
- Moved the search/log helper cluster into `src-tauri/src/search.rs` and added integration coverage for neural log listing, pinned-context deletion, and mixed log/context search.
- Moved the multimodal vision/oracle helper cluster into `src-tauri/src/vision.rs` and kept the public command surface stable through re-exports from `src-tauri/src/lib.rs`.
- Moved the file-backed venture-state and Chronos helpers into `src-tauri/src/state.rs` and added temp-path round-trip coverage for both files.
- Moved the biometric and collective-registry helpers into `src-tauri/src/access.rs` and added unit coverage for the biometric session window and node-id builder.
