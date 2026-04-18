import sys

file_path = "d:/myproject/new/oasis-shell/src-tauri/src/system.rs"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_crate_struct = False
skip_manifest_logic = False

for line in lines:
    if "pub struct KnowledgeCrate {" in line:
        new_lines.append(line)
        new_lines.append("    pub name: String,\n")
        new_lines.append("    pub telemetry: SystemStats,\n")
        new_lines.append("    pub active_processes: Vec<String>,\n")
        new_lines.append("    pub oracle: Option<OraclePulse>,\n")
        new_lines.append("    pub metadata: String,\n")
        new_lines.append("    pub timestamp: String,\n")
        new_lines.append("}\n")
        skip_crate_struct = True
        continue
    
    if skip_crate_struct:
        if line.strip() == "}":
             skip_crate_struct = False
        continue

    if "let crate_data = KnowledgeCrate {" in line:
        new_lines.append("    // 3. Capture Oracle Pulse\n")
        new_lines.append("    let oracle = get_oracle_pulse().await.ok();\n\n")
        new_lines.append("    let crate_data = KnowledgeCrate {\n")
        new_lines.append("        name: name.clone(),\n")
        new_lines.append("        telemetry: stats,\n")
        new_lines.append("        active_processes: active_names,\n")
        new_lines.append("        oracle,\n")
        new_lines.append("        metadata: \"Oasis Subsidiary Context Brick\".into(),\n")
        new_lines.append("        timestamp: chrono::Local::now().to_rfc3339(),\n")
        new_lines.append("    };\n")
        skip_manifest_logic = True
        continue

    if skip_manifest_logic:
        if "};" in line:
            skip_manifest_logic = False
        continue

    if not skip_crate_struct and not skip_manifest_logic:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("System Oracle Patch Applied Successfully.")
 Arkansas Arkansas
