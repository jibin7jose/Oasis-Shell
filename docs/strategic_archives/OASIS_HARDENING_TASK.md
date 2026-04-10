# Task: Production Hardening & Encrypted Secrets (Phase 23)

## 🛠️ Phase 23.1: Backend Configuration Engine
- [ ] [Backend] Add `dotenvy` to `Cargo.toml` and initialize in `run()` <!-- id: 0 -->
- [ ] [Backend] Implement `OasisConfig` struct with thread-safe access in `DbState` <!-- id: 1 -->
- [ ] [Backend] Refactor all `http://localhost:11434` occurrences to use `config.ollama_url` <!-- id: 2 -->
- [ ] [Backend] Centralize external API base URLs (DeepSeek, OpenAI) in `OasisConfig` <!-- id: 3 -->

## 🛡️ Phase 23.2: Secure Secret Management
- [ ] [Backend] Implement `vault::store_secret` and `vault::get_secret` using existing `Sentinel` encryption layer <!-- id: 4 -->
- [ ] [Backend] Refactor `invoke_deep_oracle` to retrieve keys from the encrypted vault rather than `std::env` <!-- id: 5 -->
- [ ] [Backend] Implement `provision_secret` command to safely ingest keys from frontend <!-- id: 6 -->

## 🎮 Phase 23.3: Security UI & Final Polish
- [ ] [Frontend] Manifest the `SecurityPanel.tsx` in the Cortex rotation <!-- id: 7 -->
- [ ] [Frontend] Implement "Secret Provisioning" forms with high-fidelity feedback <!-- id: 8 -->
- [ ] [Verify] Perform "Service Failure" tests (Ollama down) and verify graceful shell degradation <!-- id: 9 -->
- [ ] [Verify] Audit kernel logs for any residual cleartext secret exposure <!-- id: 10 -->
