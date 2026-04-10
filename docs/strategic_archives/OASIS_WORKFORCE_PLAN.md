# Implementation Plan: Neural Workforce (Autonomous File Golems)

Transform the Oasis Shell's 3D Golems from static indicators into active, autonomous agents that can refactor code, generate documentation, and perform security audits on the local filesystem.

## User Review Required

> [!IMPORTANT]
> Golems will have read/write access to certain project directories to perform their tasks. While they will operate in a "Proposal-First" (Neural PR) mode, this represents a significant shift towards autonomous system modification.

> [!WARNING]
> This feature requires a local Ollama instance with a coding model (e.g., `codestral` or `gemma:7b`) to be running.

## Proposed Changes

### [Kernel] Rust Backend Logic

#### [MODIFY] [lib.rs](file:///d:/myproject/new/oasis-shell/src-tauri/src/lib.rs)
- Implement `release_golem_workforce` command to spawn background threads for specific tasks.
- Implement `execute_golem_directive` helper to handle the AI orchestration (reading files, calling Ollama, processing diffs).
- Add support for "Neural PRs" - temporary files/state representing proposed changes.
- Implement `merge_golem_proposal` and `discard_golem_proposal` commands.

### [Frontend] React Dashboard & 3D Cortex

#### [NEW] [WorkforcePanel.tsx](file:///d:/myproject/new/oasis-shell/src/components/panels/WorkforcePanel.tsx)
- A dedicated management panel to list active golems, their current progress/logs, and review their proposals.
- UI for approving (merging) or rejecting golem-suggested code changes.

#### [MODIFY] [App.tsx](file:///d:/myproject/new/oasis-shell/src/App.tsx)
- Integrated the `WorkforcePanel`.
- Enhanced the `handleNodeClick` logic to allow "Commissioning" a golem when a file node is selected.
- Update the 3D Graph layout to visualize Golem nodes dynamically navigating to their targets.

#### [MODIFY] [LeftRail.tsx](file:///d:/myproject/new/oasis-shell/src/components/layout/LeftRail.tsx)
- Add a new "Workforce Monitor" icon to quickly toggle the Workforce Panel.

## Open Questions

- **Approval Workflow**: Should Golems wait for explicit approval for *all* file writes, or can some tasks (like creating an external `.md` doc) be autonomous by default?
- **Model Selection**: Should the user be able to specify which Ollama model a specific Golem uses (e.g., "Senior Architect" vs "Junior Auditor")?

## Verification Plan

### Automated Tests
- `npm run dev`: Verify the new UI components render correctly.
- Trigger a "Documentation Golem" and verify it correctly calls Ollama and proposes a valid markdown summary.

### Manual Verification
- Commission a Golem via the 3D Cortex.
- Watch the Golem navigate to the node and start its "Neutral Labor".
- Review and "Merge" a proposed refactoring change via the Workforce Panel.
