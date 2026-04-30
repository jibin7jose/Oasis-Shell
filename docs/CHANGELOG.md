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
