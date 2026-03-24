# Oasis Shell Architecture
## Neural Bridge System

This document outlines the core communication pathways for the Context-Aware OS.

### Systems Flow Diagram

```mermaid
graph TD
    User([User Intent]) -->|Chat Bubble| React(React App/Neural Engine)
    React -->|Tauri Command| Rust(Rust Backend - Win32 Bridge)
    Rust -->|EnumWindows/FindWindow| WinAPI[Windows Native OS]
    WinAPI -->|Process Stats| Rust
    Rust -->|State Delta| React
    React -->|Z-index Layer| UI[Glassmorphic Control Center]
```

## System Components
| Layer | Technology | Role |
| :--- | :--- | :--- |
| **User Overlay** | React + Framer Motion | Dynamic UI, context-switching animations |
| **Logic Bridge** | Tauri 2.0 | IPC, cross-platform security |
| **OS Core interface** | Rust + windows-rs | Low-level Win32 integration (Windows API) |
| **Styling** | Tailwind CSS v4 | Glassmorphism, premium aesthetics |

## Data Flows
- **Window Enumeration**: Rust polls the OS every 2s to track active contexts.
- **Context Crating**: User creates a "Snapshot" of open apps; Rust stores the PIDs in SQLite.
