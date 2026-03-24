# DART - Design Architecture & Requirements Tracker
# Oasis Shell: Project Evolution

## Core Function Log & Requirement Mapping

### 1. Window Monitoring (The "Seer" Function)
- **Feature Name**: Window Recognition Logic
- **Primary Function**: `get_running_windows` (Rust)
- **Trigger**: Every 2000ms polling from `useEffect` (App.tsx)
- **Requirement**: Native Win32 enumeration for context indexing.

### 2. Context Navigation (The "Voyager")
- **Feature Name**: Glassmorphic Context Dock
- **Primary Component**: `ContextSwitcher` (App.tsx)
- **Styling**: `bg-white/10 backdrop-blur-xl border border-white/20`
- **Current Support**: 5 Predefined Contexts (Code, Layout, Game, Web, Settings).

### 3. Neural Intent (The "Oracle")
- **Feature Name**: Assistant Bubble UI
- **Primary Component**: `AssistantBubble`
- **Interaction**: Click-to-Expand search input.
- **Requirement**: Full-text regex intent parsing for mode switching.

### 4. GitHub Box (The "Pulse")
- **Feature Name**: Oasis Sync Automator
- **Primary Script**: `scripts/sync.ps1`
- **Requirement**: Automated staging of code and `/docs` logs.
