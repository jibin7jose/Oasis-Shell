# Oasis Shell

Oasis Shell is a Tauri + React desktop shell with a local-first AI workflow. The current setup is tuned for free local inference through `Ollama`, with desktop-only system integrations handled by the Rust/Tauri backend.

## Local Dev

Requirements:
- Node.js
- Rust toolchain
- `Ollama` running locally on `http://localhost:11434`

Install dependencies:

```powershell
npm install
```

Run the desktop app:

```powershell
npm run dev
```

Run with a clean log:

```powershell
npm run dev:clean
```

## Environment

Local env is loaded from `.env`.

Current local dev example:

```env
OLLAMA_URL=http://localhost:11434
NEURAL_ENGINE_ENDPOINT=http://localhost:11434
OASIS_FOUNDER_SECRET=oasis-local-founder
```

Template:
- [.env.example](./.env.example)

Notes:
- `.env` is ignored by git
- Sentinel Vault authentication requires `OASIS_FOUNDER_SECRET` or `OASIS_MASTER_KEY`

## Smoke Check

Run the local health check:

```powershell
npm run smoke
npm run smoke:web
```

This verifies:
- frontend dev server
- `Ollama` API availability
- live local generation through `gemma3:4b`
- founder secret presence
- running Tauri desktop process
- Tauri log presence
- browser-side UI load and runtime/asset sanity via Playwright

## Real-Data Mode

This project is configured to avoid fake browser/demo data where possible.

Current behavior:
- Local Oracle uses `Ollama` when cloud keys are not configured
- Sentinel Vault requires a real configured secret
- Terminal `status`, `audit`, and `ls --strategic` use live backend state
- Browser mode is limited; desktop Tauri mode is the real target for system features

## Recommended Manual Checks

After `npm run dev`, test these in the desktop app:

1. Boardroom
- Trigger `SUMMON LOCAL ORACLE`

2. Sentinel Vault
- Login with the configured founder secret
- Seal a real local file path
- Unseal it again

3. Terminal
- Run `status`
- Run `audit`
- Run `ls --strategic`

4. Workforce
- Open the panel and confirm it loads without runtime errors

Detailed checklist:
- [MANUAL_SMOKE_CHECKLIST.md](./MANUAL_SMOKE_CHECKLIST.md)
- [MANUAL_SMOKE_RESULTS.md](./MANUAL_SMOKE_RESULTS.md)

## Build

Frontend production build:

```powershell
npm exec vite build
```

Desktop build:

```powershell
npm run build
```
