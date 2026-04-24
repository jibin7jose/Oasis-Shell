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
