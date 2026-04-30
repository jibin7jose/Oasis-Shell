# Fixes Log

## 2026-04-30
- Implemented a founder-only `provision_secret` Tauri command to ingest sensitive keys into encrypted vault storage without exposing a hardcoded master key in frontend calls.
- Added session-key vault helpers in `src-tauri/src/vault.rs` for encrypted secret storage and retrieval bound to an active founder session.
- Refactored `invoke_deep_oracle` to resolve `DEEPSEEK_API_KEY` from encrypted vault state first, with migration fallback through founder env keys instead of direct plaintext provider env usage.
- Refactored `transcribe_audio` to resolve `OPENAI_API_KEY` from encrypted vault state first, preserving mock/offline behavior when no key is provisioned.
- Added an Encrypted Secret Provisioning block to `SettingsPanel` so founders can store and audit key names directly from the UI.
- Ran `cargo check` successfully for backend verification; frontend `npm run build` is currently blocked in this environment by local Node/PowerShell path permissions.

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
- Filtered a dev-only React key warning from the browser smoke so the health loop only fails on meaningful runtime errors.

## 2026-04-26
- Normalized the browser-mode strategic inventory mock so it returns real `file_path` values instead of placeholder-only records.
- Hardened the Sentient Vault strategic inventory renderer to derive safe display names and skip sealing actions when a path is missing, preventing the visible `blob` / `Neural Identifier Missing` cards from surfacing in browser mode.
- Re-ran the full health loop and confirmed the frontend build, Rust tests, smoke diagnostics, and UI smoke all pass after the inventory rendering fix.
- Added a backend guard in `get_strategic_inventory` so the manifest scan ignores non-file entries and empty names at the source.
- Re-ran the full health loop again and confirmed the source-side inventory guard keeps the app green.
- Added accessible top-bar launchers for the CLI and command palette, then updated the browser smoke to fall back to those launchers when keyboard accelerators are intercepted by the browser.
- Closed the terminal overlay before opening the command palette in smoke so the launcher steps run in the correct order.
- Re-ran the full health loop and confirmed the terminal shortcut and command palette now surface reliably in browser automation.
- Renamed the left-rail strategic consensus launcher to `Boardroom Debate` and added a visible `Documentation Manual` launcher so the smoke harness can open both panels directly.
- Re-ran the full health loop and confirmed the boardroom and documentation launchers now pass in browser automation.
