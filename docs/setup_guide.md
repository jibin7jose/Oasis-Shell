# Setup Guide

## Prerequisites
- Windows 10 or 11
- Node.js 20+
- Rust stable toolchain
- Tauri CLI
- Optional: Ollama running locally if you want neural/oracle commands to return real model output

## Environment Variables
- `OLLAMA_URL`
- `BROADCAST_PORT`
- `NEURAL_ENGINE_ENDPOINT`
- `.env` may also include `OASIS_FOUNDER_SECRET`

## Install
1. Install Node dependencies with `npm install`.
2. Ensure the Rust toolchain is installed with `rustup`.
3. If you plan to use local LLM-backed features, start Ollama before launching the shell.

## Run
- Frontend only: `npm run frontend`
- Desktop app: `npm run dev`
- Frontend build: `npm run build`
- Tauri bundle: `npm run build:desktop`
- Preview build: `npm run preview`

## Smoke and Diagnostics
- Quick smoke: `npm run smoke`
- Smoke prep: `npm run smoke:prepare`
- Smoke diagnostics: `npm run smoke:collect`
- Web smoke: `npm run smoke:web`

### Restart-safe smoke flow
Use this when you want to verify the app after a fresh restart or after changing dev startup scripts:
1. Start the desktop app with `npm run dev` or let the smoke collector launch it for you.
2. Run `npm run smoke:collect` and confirm the report shows `Frontend OK` and `Tauri Process OK`.
3. Run `npm run smoke:web` and confirm it saves `smoke-assets/ui-smoke.png`.
4. If the frontend is already running, the guarded launcher reuses it instead of starting a second Vite server on port `1420`.

### Expected green signals
- Frontend responds on `http://localhost:1420`
- `oasis-shell` appears in the process list during smoke collection
- Browser smoke opens the main dashboard and the key panels without runtime errors
- `smoke-assets/smoke-diagnostics.txt` and `smoke-assets/ui-smoke.png` refresh successfully

## Notes
- The app is designed around Tauri IPC, so frontend behavior depends on the Rust backend being available.
- Some commands are Windows-specific and may return fallback values when run outside Tauri or on unsupported platforms.
