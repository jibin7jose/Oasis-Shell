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

## Notes
- The app is designed around Tauri IPC, so frontend behavior depends on the Rust backend being available.
- Some commands are Windows-specific and may return fallback values when run outside Tauri or on unsupported platforms.

