# Task: Context Crate Optimization (Phase 22)

## 🛠️ Phase 22.1: Backend Kernel Evolution
- [x] [Backend] Update `ContextCrate` struct with `description` and `aura_color` fields <!-- id: 0 -->
- [x] [Backend] Refactor `generate_crate_name` into `synthesize_crate_aura` (using Gemma3 for name/desc/color) <!-- id: 1 -->
- [x] [Backend] Update SQLite initialization to include new metadata columns <!-- id: 2 -->
- [x] [Backend] Implement `launch_crate` folder-aware logic (detecting project roots for dev apps) <!-- id: 3 -->
- [x] [Backend] Implement `export_crate_manifest` to save as portable JSON <!-- id: 4 -->

## 🎮 Phase 22.2: Frontend Integration
- [x] [Frontend] Update `App.tsx` handlers to capture `activeView` and UI state in snapshots <!-- id: 5 -->
- [x] [Frontend] Manifest the unique "Aura Glow" in `CrateGallery.tsx` cards <!-- id: 6 -->
- [x] [Frontend] Add "Export Manifest" capability to the Gallery UI <!-- id: 7 -->
- [x] [Frontend] Integrate `activeView` restoration in `handleLaunchCrate` <!-- id: 8 -->

## 🛡️ Phase 22.3: Verification & Polish
- [x] [Verify] Perform "Neural Snapshot" and verify metadata generation via Gemma3 <!-- id: 9 -->
- [x] [Verify] Test portable export/import of workspace crates <!-- id: 10 -->
