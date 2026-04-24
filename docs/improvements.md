# Improvements

## Code Quality
- Split the monolithic backend into smaller modules when there is room to safely untangle the IPC surface.
- Replace `any`-heavy frontend state with typed view models where the UI already has stable shapes.
- Remove unused imports and dead functions that now accumulate warnings in `src-tauri/src/lib.rs`.

## Build and Tooling
- Keep the explicit ESM Vite config so Windows shells do not depend on TypeScript config bundling.
- Add a dedicated CI job for `cargo check` plus the frontend build path that works in this repo.
- Capture build and smoke output automatically into `test-results/phase-*`.

## Reliability
- Add focused tests around the most important Tauri commands and state transitions.
- Add a lightweight frontend smoke contract for the major panels and the command palette.
- Narrow the number of always-on background loops in the Rust backend to reduce startup noise.

## Security
- Audit commands that can launch, delete, or suspend OS processes.
- Revisit secret-handling and auth gating to make sure all sensitive commands use the same guard path.
- Keep the SQLite database in the app data directory and avoid writing sensitive artifacts outside that scope.

