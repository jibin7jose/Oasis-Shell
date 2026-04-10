# Implementation Plan - Phase 23: Production Hardening & Encrypted Secrets

This phase focused on transitioning the Oasis Shell from a development prototype to a production-ready environment by centralizing configuration and securing sensitive API credentials using the Shell's internal encryption protocols.

## User Review Required

> [!IMPORTANT]
> **Secret Migration**: Existing hardcoded environment variables (if any) will be migrated to the encrypted `sentinel_secrets.enc` manifest. The founder will need to provision their keys through the Shell UI once the vault is active.

## Proposed Changes

### [Backend] Kernel Configuration & Security
Refactor the Rust kernel to eliminate hardcoded strings and implement secure secret retrieval.

#### [MODIFY] [lib.rs](file:///d:/myproject\new\oasis-shell\src-tauri\src\lib.rs)
- Implement `OasisConfig` struct to hold `ollama_url`, `broadcast_port`, and `neural_engine_endpoint`.
- Update `DbState` to include `OasisConfig`.
- Refactor all AI synthesize/generate functions to use the centralized URL config.
- Implement `get_secret` and `rotate_secret` commands leveraging the `aes-gcm` and `pbkdf2` stack.

#### [MODIFY] [Cargo.toml](file:///d:/myproject\new\oasis-shell\src-tauri\Cargo.toml)
- Add `dotenvy` for environment variable management in development.

### [Frontend] Security Provisioning UI
Enhance the Settings/Cortex UI to allow the founder to securely input and store API keys.

#### [MODIFY] [App.tsx](file:///d:/myproject\new\oasis-shell\src\App.tsx)
- Add `handleStoreSecret` logic.
- Integrate "Neural Settings" panel into the `activeView` rotation.

#### [NEW] [SecurityPanel.tsx](file:///d:/myproject\new\oasis-shell\src\components\panels\SecurityPanel.tsx)
- A high-end, founder-only interface for managing encrypted system secrets (OpenAI, DeepSeek, etc.).

## Open Questions
- Should we force encryption for the Ollama URL, or keep it in a standard `.env` since it's typically local?
- Do you have a preferred location for the `.env` file (Root vs `src-tauri`)?

## Verification Plan

### Automated Tests
- `cargo test` (if unit tests are added for config).
- Manual verification of "Mock Mode" when no secrets are present.

### Manual Verification
- Launch Ollama on a non-standard port, update config, and verify "Context Crate" synthesis still functions.
- Input a mock DeepSeek key and verify the bearer token is correctly injected into the request header.
