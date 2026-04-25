# Fixes Log

## 2026-04-25
- Added a guarded frontend launcher at `scripts/start-frontend-if-needed.ps1` and switched Tauri `beforeDevCommand` to `npm run frontend:guarded` so a live frontend server can be reused instead of racing a second Vite process on port 1420.
- Added a PowerShell wrapper for the browser smoke at `scripts/run-ui-smoke.ps1` so the UI smoke runs from a stable working directory.
- Updated the Playwright smoke to prefer a local system browser when available, which avoids spawning the bundled browser from the restricted user-profile path.
- Updated the smoke collector so it can clean up stale port-1420 listeners before relaunching dev and then re-check the app state.
- Re-ran the smoke loop and confirmed the frontend, Tauri process, Ollama checks, and UI browser flow all pass together.
- Re-ran the full restart-style smoke cycle after a fresh launch and confirmed the guarded frontend bootstrap and browser smoke remain green on repeat.
- Added a one-command full-health runner at `scripts/full-health.ps1` and exposed it as `npm run health:full`.
- Verified the full health loop runs build, Rust tests, smoke diagnostics, and UI smoke successfully in one pass.
- Added an automatic founder bootstrap command so the app can unlock the founder session on startup when `OASIS_FOUNDER_SECRET` or `OASIS_MASTER_KEY` is configured.
- Updated the main app to call the bootstrap path automatically, removing the need to type the founder key manually in the common configured case.
