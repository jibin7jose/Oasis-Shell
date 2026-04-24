# Oasis Shell Project Overview

## What This Project Is
Oasis Shell is a Windows-focused Tauri desktop application with a React/Vite frontend and a Rust backend. The app behaves like a high-fidelity shell overlay and control center rather than a traditional web app.

## Tech Stack
- Frontend: React 19, TypeScript, Vite 7, Tailwind CSS v4, Framer Motion, Zustand, Lucide React, Three.js, react-force-graph
- Backend: Rust 2021, Tauri 2, sysinfo, rusqlite, r2d2, r2d2_sqlite, reqwest, tokio, notify, screenshots, aes-gcm
- Storage: Local SQLite database stored in the Tauri app data directory as `oasis_shell.db`
- Platform focus: Windows, with Win32 integration through the `windows` crate

## Entry Points
- Frontend entry: `src/main.tsx`
- Application root: `src/App.tsx`
- Vite config: `vite.config.mjs` and `vite.config.ts`
- Tauri backend entry: `src-tauri/src/main.rs` -> `src-tauri/src/lib.rs`
- Main scripts: `npm run dev`, `npm run frontend`, `npm run build`, `npm run build:desktop`, `npm run smoke`, `npm run smoke:web`

## Runtime Architecture
- The frontend renders the shell UI and dispatches native actions through `@tauri-apps/api/core`.
- The backend exposes functionality as Tauri IPC commands, not HTTP routes.
- Local state is split between Zustand (`src/lib/systemStore.ts`) and backend-derived telemetry.
- The app uses `listenSafe` and `invokeSafe` wrappers for Tauri-safe event and command access.

## Backend Modules
- `src-tauri/src/lib.rs`: app bootstrap, IPC registration, SQLite setup, background loops, chronos/vault/mirror/oracle style commands
- `src-tauri/src/system.rs`: OS telemetry, process and window control, file system actions, venture and security orchestration
- `src-tauri/src/vault.rs`: AES-GCM secret storage and retrieval
- `src-tauri/src/golems.rs`: golem registry, proposals, sandboxing, autonomous work orchestration
- `src-tauri/src/macros.rs`: strategic macro synthesis and execution
- `src-tauri/src/ai.rs`: debate and AI collective orchestration
- `src-tauri/src/mirror.rs`: neural mutation analysis, verification, and application

## Data Layer
- SQLite is initialized in the Tauri setup phase.
- The database path is resolved from `app_local_data_dir` so data stays local to the user profile.
- WAL mode is enabled and the pool uses `r2d2_sqlite` for concurrent access.

## UI Surfaces
- The app is a multi-panel shell with left/right rails, top bar, dashboard panels, vault and command overlays, terminal surfaces, charts, and visual effect layers.
- The main shell is intentionally immersive and heavily state-driven.

## Current Validation Posture
- Rust backend compiles with `cargo check`, but produces many warnings from the large monolithic code surface.
- Frontend build currently hits a Windows `spawn EPERM` issue in the local environment when Vite/esbuild tries to run its service path.
- The repo already includes smoke automation in `scripts/smoke-check.ps1`, `scripts/collect-smoke-diagnostics.ps1`, and `scripts/ui-smoke.cjs`.

