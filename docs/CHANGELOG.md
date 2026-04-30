# PROJECT LOG: OASIS SHELL
# Project Start & Initialization

## 2026-04-30 - Phase 23 Hardening & Encrypted Secrets
### Core Features Implemented:
1.  **Founder-Only Secret Provisioning Path:**
    -   Added backend `provision_secret` command that requires an active founder vault session.
    -   Prevented frontend dependence on passing a static master key string for secret ingestion.
2.  **Encrypted Runtime Secret Resolution:**
    -   Refactored Deep Oracle key resolution to consume encrypted vault secrets first.
    -   Refactored Whisper transcription path to resolve `OPENAI_API_KEY` from encrypted vault storage first.
3.  **Session-Key Vault Enhancements:**
    -   Added session-key vault encryption/decryption helpers for secure storage bound to founder authentication.
    -   Preserved migration fallback for older master-key-sealed secrets via founder environment variables.
4.  **Security UI Upgrade:**
    -   Added an Encrypted Secret Provisioning interface in settings for storing and auditing available encrypted secret names.

## 2026-04-30 - Phase 24 Secret Lifecycle Hardening
### Core Features Implemented:
1.  **Secret Rotation and Revocation Commands:**
    -   Added founder-authenticated `rotate_secret` and `delete_secret` Tauri commands for runtime key lifecycle control.
2.  **Vault Deletion Primitive:**
    -   Added a vault-layer `vault_delete_secret_with_pool` helper and command exposure for deterministic secret removal.
3.  **Security Audit Trail:**
    -   Added kernel security log events for provision, rotation, and deletion operations (name-only, no cleartext values).
4.  **Settings Lifecycle Controls:**
    -   Added rotate/revoke controls in Settings so founders can cycle or remove secrets directly from the in-app encrypted workflow.

## 2026-04-30 - Phase 25 Secret Policy Guardrails & Metadata
### Core Features Implemented:
1.  **Secret Name Policy Enforcement:**
    -   Added strict allowlist validation for secret names to block arbitrary key injection attempts.
2.  **Mutation Cooldown Protection:**
    -   Added per-secret cooldown checks for provision/rotate/delete flows to reduce high-frequency mutation abuse in active sessions.
3.  **Metadata Visibility Layer:**
    -   Added vault metadata listing (`name`, `updated_at`, `status`) without exposing cleartext values.
4.  **Security UI Metadata Rendering:**
    -   Upgraded Settings secret management to show last-updated timestamps and status for each stored key.
5.  **Policy and Metadata Test Coverage:**
    -   Added backend tests for allowlist validation, mutation cooldown behavior, and metadata retrieval.

## 2026-04-30 - Phase 26 Secret Recovery & Operational Safety
### Core Features Implemented:
1.  **Founder-Gated Secret Backup/Restore:**
    -   Added encrypted secret backup export and restore commands for operational recovery workflows.
2.  **Revoke-All Secret Control:**
    -   Added backend revoke-all support and frontend dual-confirmation flow to reduce destructive-action risk.
3.  **Secret Health Monitoring:**
    -   Added backend secret health status checks for required-key presence and stale rotation windows.
4.  **Security Event Visibility:**
    -   Added secret-focused security event query from kernel logs for incident review context.
5.  **Recovery Test Coverage:**
    -   Added backup/restore round-trip tests to validate recovery integrity.

## 2026-04-30 - Phase 27 Cryptographic Backup Integrity & Restore Safety
### Core Features Implemented:
1.  **Encrypted Backup Envelopes:**
    -   Migrated backup export to encrypted, versioned envelope format (`.oasisbak`) using founder-session key material.
2.  **Tamper and Wrong-Key Detection:**
    -   Restore now rejects invalid envelope versions, malformed nonce/ciphertext payloads, and decryption failures.
3.  **Transactional Restore Safety:**
    -   Restore flow now runs in a DB transaction to ensure rollback on validation or insertion failure.
4.  **Restore UX Risk Controls:**
    -   Added explicit restore confirmation phrase (`RESTORE`) and extension guardrails in Settings.
5.  **Integrity Test Coverage:**
    -   Added tests for tamper rejection and rollback preservation under invalid backup entries.

## Alpha 1.0 - The Glassmorphic Foundation
### Core Features Implemented:
1.  **Context-Aware UI Overlay:**
    -   Implemented a glassmorphic search and context dock using React + Tailwind v4.
    -   Integrated `framer-motion` for fluid context-switching animations.
2.  **Neural Intent Engine (v1.1):**
    -   Implemented **Regex Intent Parsing**: The shell now understands commands like "dev mode" or "gaming" from the main search bar.
    -   Added **Neural Aura**: The background atmosphere now shifts colors dynamically based on the active context (Blue/Purple/Red/Emerald).
3.  **OS-Bridge (Rust Backend):**
    -   Implemented the `get_running_windows` command in Rust using the `windows-rs` (Win32 API) library.
    -   Configured Tauri 2.0 as the logic layer between React and Windows Native.
4.  **Documentation Hub:**
    -   Initialized `/docs` folder at the project root for architecture, features, and logs.
    -   Added high-level Mermaid architecture diagrams.

## Feature Mapping
| Feature | Functionality | Status |
| :--- | :--- | :--- |
| **Context Dock** | Quick-switch between app-groups | Beta (UI-only) |
| **Neural Search** | Global intent parser | Alpha (Search Input) |
| **Window Scanning** | OS Window visibility | In-Progress (Rust Hook) |
| **Auto-Sync** | Automated GitHub updates | Active |
