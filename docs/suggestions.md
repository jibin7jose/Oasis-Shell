# Suggestions

## Missing Features
- Automated regression tests for the Tauri command layer.
- A stable command catalog in code or docs that is generated from the Rust sources.
- A visible health dashboard for the current build and smoke status.

## UX Improvements
- Break the giant shell experience into clearly named operational modes.
- Make the command palette easier to search and more discoverable.
- Add explicit loading and error states for long-running native operations.

## Performance
- Reduce startup work in `src-tauri/src/lib.rs` by deferring noncritical background loops.
- Limit the amount of data returned by heavy process and window scans.
- Add caching for expensive telemetry and AI-backed calls.

## Scalability
- Move more state out of `App.tsx` and into structured feature modules or Zustand slices.
- Split the Tauri command registration into smaller groups to make maintenance easier.
- Add schema migration support for future SQLite changes.

## Security Risks
- Process-control commands can be dangerous if they are exposed without enough gating.
- LLM-driven commands should always treat generated code as untrusted until reviewed.
- Secret storage should be reviewed for recovery and lockout behavior before production use.

