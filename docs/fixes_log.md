# Fixes Log

## 2026-04-25
- Added a guarded frontend launcher at `scripts/start-frontend-if-needed.ps1` and switched Tauri `beforeDevCommand` to `npm run frontend:guarded` so a live frontend server can be reused instead of racing a second Vite process on port 1420.
- Added a PowerShell wrapper for the browser smoke at `scripts/run-ui-smoke.ps1` so the UI smoke runs from a stable working directory.
- Updated the Playwright smoke to prefer a local system browser when available, which avoids spawning the bundled browser from the restricted user-profile path.
- Updated the smoke collector so it can clean up stale port-1420 listeners before relaunching dev and then re-check the app state.
- Re-ran the smoke loop and confirmed the frontend, Tauri process, Ollama checks, and UI browser flow all pass together.
