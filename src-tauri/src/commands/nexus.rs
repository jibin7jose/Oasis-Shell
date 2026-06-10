use crate::commands::ai::cosine_similarity;
use crate::models::{DbState, NeuralLog};
use chrono::Timelike;
use rusqlite::params;
use std::process::Command;
use std::time::Duration;
use sysinfo::{Disks, System};
use tauri::Emitter;

#[tauri::command]
pub fn log_event(
    state: tauri::State<DbState>,
    event_type: String,
    message: String,
) -> Result<(), String> {
    let conn = state.0.get().unwrap();
    let timestamp = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT INTO neural_logs (event_type, message, timestamp) VALUES (?1, ?2, ?3)",
        params![event_type, message, timestamp],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn save_resume_analysis(
    state: tauri::State<DbState>,
    role: String,
    score: i32,
) -> Result<(), String> {
    let conn = state.0.get().unwrap();
    conn.execute(
        "INSERT INTO resume_analysis (role, match_score) VALUES (?1, ?2)",
        [role, score.to_string()],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_latest_resume_analysis(
    state: tauri::State<DbState>,
) -> Result<serde_json::Value, String> {
    let conn = state.0.get().unwrap();
    let mut stmt = conn
        .prepare("SELECT role, match_score FROM resume_analysis ORDER BY id DESC LIMIT 1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;

    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let role: String = row.get(0).map_err(|e| e.to_string())?;
        let score: i32 = row.get(1).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({ "role": role, "score": score }))
    } else {
        Ok(serde_json::Value::Null)
    }
}

#[tauri::command]
pub async fn get_neural_graph(
    state: tauri::State<'_, DbState>,
) -> Result<serde_json::Value, String> {
    #[derive(serde::Serialize)]
    struct Node {
        id: String,
        group: i32,
    }
    #[derive(serde::Serialize)]
    struct Link {
        source: String,
        target: String,
        value: f32,
    }

    let mut nodes = Vec::new();
    let mut links = Vec::new();
    let mut files_data = Vec::new();

    {
        let conn = state.0.get().unwrap();
        let mut stmt = conn
            .prepare("SELECT filename, vector FROM file_embeddings LIMIT 100")
            .unwrap();
        let rows = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .unwrap();
        for row in rows.flatten() {
            if let Ok(vec) = serde_json::from_str::<Vec<f32>>(&row.1) {
                files_data.push((row.0.clone(), vec));
                let group = if row.0.ends_with(".ts") || row.0.ends_with(".tsx") {
                    1
                } else if row.0.ends_with(".rs") {
                    2
                } else {
                    3
                };
                nodes.push(Node {
                    id: row.0.clone(),
                    group,
                });
            }
        }
    }

    // Calculate relationships (only strong ones >= 0.5)
    for i in 0..files_data.len() {
        for j in (i + 1)..files_data.len() {
            let score = cosine_similarity(&files_data[i].1, &files_data[j].1);
            if score > 0.5 {
                links.push(Link {
                    source: files_data[i].0.clone(),
                    target: files_data[j].0.clone(),
                    value: score,
                });
            }
        }
    }

    Ok(serde_json::json!({ "nodes": nodes, "links": links }))
}

#[tauri::command]
pub async fn get_all_files(state: tauri::State<'_, DbState>) -> Result<serde_json::Value, String> {
    #[derive(serde::Serialize)]
    struct FileEntry {
        id: i32,
        filename: String,
        filepath: String,
        snippet: String,
    }
    let mut entries = Vec::new();

    {
        let conn = state.0.get().unwrap();
        let mut stmt = conn.prepare("SELECT id, filename, filepath, content FROM file_embeddings ORDER BY id DESC LIMIT 100").unwrap();
        let rows = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, i32>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                ))
            })
            .unwrap();
        for row in rows.flatten() {
            let snippet = if row.3.len() > 150 {
                row.3[..150].to_string() + "..."
            } else {
                row.3
            };
            entries.push(FileEntry {
                id: row.0,
                filename: row.1,
                filepath: row.2,
                snippet,
            });
        }
    }

    Ok(serde_json::json!(entries))
}

#[tauri::command]
pub fn get_logic_path(aura: String) -> String {
    match aura.as_str() {
        "dev" => "Native Logic > Cargo Link > Build Cycle > Pulse".into(),
        "design" => "Mesh Logic > Texture Link > GLTF Build > Sync".into(),
        "gaming" => "Stream Logic > Frame Pulse > Latency Sync > Record".into(),
        "research" => "Query Logic > Semantic Link > Vector Search > Archive".into(),
        _ => "Idle Logic > Waiting for Neural Intent".into(),
    }
}

#[tauri::command]
pub fn get_venture_metrics() -> serde_json::Value {
    serde_json::json!({
        "arr": "$1.24M",
        "burn": "$42.5K/mo",
        "runway": "18.4 Mo.",
        "momentum": "+12.8%"
    })
}

#[tauri::command]
pub fn get_market_intelligence() -> serde_json::Value {
    serde_json::json!([
        { "symbol": "OASIS_INDEX", "price": "$1,421.40", "change": "+2.4%" },
        { "symbol": "SAP_COMP", "price": "$42.50", "change": "-1.1%" },
        { "symbol": "GLOBAL_AI", "price": "8,942.00", "change": "+0.8%" }
    ])
}

#[tauri::command]
pub fn get_vault_nodes() -> serde_json::Value {
    serde_json::json!([
        { "name": "Oasis_Whitepaper.pdf", "category": "Strategic", "size": "1.2MB" },
        { "name": "Foundry_Kernel.rs", "category": "Technical", "size": "45KB" },
        { "name": "Executive_Brand_Guide.fig", "category": "Creative", "size": "8.4MB" }
    ])
}

#[tauri::command]
pub fn trigger_deploy(env: String) -> Result<String, String> {
    Ok(format!("Deployment sentinel acknowledged for {env}."))
}

#[tauri::command]
pub fn start_proactive_sentience(app: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(5));

        let mut sys = System::new();
        let mut disks = Disks::new_with_refreshed_list();
        loop {
            sys.refresh_memory();
            sys.refresh_all();
            disks.refresh(true);

            let total_mem = sys.total_memory();
            let used_mem = sys.used_memory();

            if total_mem > 0 {
                let mem_percent = (used_mem as f32 / total_mem as f32) * 100.0;
                if mem_percent > 90.0 {
                    let _ = app.emit("proactive-pulse", serde_json::json!({
                        "suggestion": "RAM Load Critical (90%). Should I crate your inactive browsers to optimize?",
                        "action": "CRATE_SUGGESTION"
                    }));
                }
            }

            for disk in disks.list() {
                if disk.mount_point().to_string_lossy().contains("C:") {
                    let free = disk.available_space();
                    if free < 2 * 1024 * 1024 * 1024 {
                        let _ = app.emit("proactive-pulse", serde_json::json!({
                            "suggestion": "System Deadlock Alert: C-Drive < 2GB. Suggest emergency relocation of NPM/Cargo caches to D-Drive.",
                            "action": "GUARDIAN_RELOCATE"
                        }));
                    }
                }
            }

            let cpu_usage = sys.global_cpu_usage();
            if cpu_usage > 70.0 {
                let _ = app.emit("proactive-pulse", serde_json::json!({
                    "suggestion": format!("High CPU load detected ({}%). Should I optimize your active Aura for performance?", cpu_usage as i32),
                    "action": "CPU_OPTIMIZE"
                }));
            }

            let now = chrono::Local::now();
            let day = now.format("%a").to_string();
            let hour = now.hour();

            if day == "Sat" || day == "Sun" {
                if hour > 10 && hour < 22 {
                    let _ = app.emit("proactive-pulse", serde_json::json!({
                        "suggestion": "Weekend Cognitive Pattern detected. Switch to 'Research' or 'Gaming' Aura for maximum flow?",
                        "action": "AURA_SUGGESTION"
                    }));
                }
                if hour > 9 && hour < 18 {
                    let _ = app.emit("proactive-pulse", serde_json::json!({
                        "suggestion": "Workspace Intensity detected. Should I switch to 'Development' Aura to prioritize build-chains?",
                        "action": "AURA_SUGGESTION"
                    }));
                }
            }

            // NEURAL GIT SCOUT (Level 16)
            #[cfg(target_os = "windows")]
            let git_check = Command::new("powershell")
                .args(["-Command", "git status --short"])
                .output();

            if let Ok(output) = git_check {
                let status = String::from_utf8_lossy(&output.stdout);
                let changed_files = status.lines().count();
                if changed_files >= 5 {
                    let _ = app.emit("proactive-pulse", serde_json::json!({
                        "suggestion": format!("Neural Git Scout: Detected {} uncommitted modifications. Initiate a diagnostic feature branch?", changed_files),
                        "action": "GIT_BRANCH"
                    }));
                }
            }

            std::thread::sleep(Duration::from_secs(120)); // Pulsing every 2 minutes
        }
    });
    Ok(())
}

#[tauri::command]
pub fn sync_hardware_aura(aura: String) -> Result<(), String> {
    let ps_cmd = match aura.as_str() {
        "gaming" => "(New-Object -ComObject WScript.Shell).SendKeys([char]175); (New-Object -ComObject WScript.Shell).SendKeys([char]175)", 
        "dev" => "(New-Object -ComObject WScript.Shell).SendKeys([char]174); (New-Object -ComObject WScript.Shell).SendKeys([char]174)",
        _ => "echo 'Aura Parity Nominal'",
    };

    let _ = Command::new("powershell")
        .args(["-Command", ps_cmd])
        .spawn();

    Ok(())
}

#[tauri::command]
pub async fn get_nexus_health() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("http://localhost:4000/projects/health")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json = res
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(json)
}

#[tauri::command]
pub async fn get_neuroforge_profile() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("http://localhost:8000/projects/profile")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json = res
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(json)
}

#[tauri::command]
pub fn get_nearby_projects() -> Result<Vec<String>, String> {
    let mut projects = Vec::new();
    let search_paths = vec!["..", "../.."];

    for base in search_paths {
        if let Ok(entries) = std::fs::read_dir(base) {
            for entry in entries.flatten() {
                if let Ok(file_type) = entry.file_type() {
                    if file_type.is_dir() {
                        let name = entry.file_name().to_string_lossy().to_string();
                        if !name.starts_with(".") && name != "node_modules" && name != "target" {
                            projects.push(name);
                        }
                    }
                }
            }
        }
    }
    projects.sort();
    projects.dedup();
    Ok(projects)
}

#[tauri::command]
pub fn get_logs(state: tauri::State<DbState>) -> Result<Vec<NeuralLog>, String> {
    let conn = state.0.get().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, event_type, message, timestamp FROM neural_logs ORDER BY id DESC LIMIT 50",
        )
        .map_err(|e| e.to_string())?;

    let log_iter = stmt
        .query_map([], |row| {
            Ok(NeuralLog {
                id: Some(row.get(0)?),
                event_type: row.get(1)?,
                message: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut logs = Vec::new();
    for l in log_iter {
        logs.push(l.map_err(|e| e.to_string())?);
    }

    Ok(logs)
}

#[tauri::command]
pub async fn import_strategic_asset(file_path: String) -> Result<serde_json::Value, String> {
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        return Err("File does not exist".into());
    }

    let file_name = path.file_name().unwrap_or_default().to_string_lossy().to_string();
    let meta = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    
    // Create a secure vault directory in AppData or LocalAppData
    let vault_dir = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("OasisVault");
        
    std::fs::create_dir_all(&vault_dir).map_err(|e| e.to_string())?;
    
    let dest_path = vault_dir.join(&file_name);
    
    // Move the file by copying and then removing original (to handle cross-drive moves)
    std::fs::copy(&path, &dest_path).map_err(|e| e.to_string())?;
    std::fs::remove_file(&path).map_err(|e| e.to_string())?;
    
    let size_mb = meta.len() as f64 / 1_048_576.0;
    let size_str = if size_mb < 1.0 {
        format!("{}KB", (meta.len() as f64 / 1024.0).round())
    } else {
        format!("{:.1}MB", size_mb)
    };
    
    Ok(serde_json::json!({
        "name": file_name,
        "category": "Strategic",
        "size": size_str,
        "path": dest_path.to_string_lossy().to_string()
    }))
}

#[tauri::command]
pub async fn access_strategic_asset(file_path: String) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);
    if path.exists() {
        #[cfg(target_os = "windows")]
        std::process::Command::new("explorer")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
            
        #[cfg(not(target_os = "windows"))]
        std::process::Command::new("open")
            .arg(path)
            .spawn()
            .map_err(|e| e.to_string())?;
    } else {
        return Err("File not found in vault".into());
    }
    Ok(())
}

#[tauri::command]
pub async fn recover_strategic_asset(file_path: String) -> Result<String, String> {
    let path = std::path::Path::new(&file_path);
    if !path.exists() {
        return Err("File not found in vault".into());
    }
    
    // Recover to Desktop
    let desktop = dirs::desktop_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
    let file_name = path.file_name().unwrap_or_default();
    let dest_path = desktop.join(file_name);
    
    std::fs::copy(&path, &dest_path).map_err(|e| format!("Copy failed: {}", e))?;
    std::fs::remove_file(&path).map_err(|e| format!("Remove failed: {}", e))?;
    
    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn delete_strategic_asset(file_path: String) -> Result<(), String> {
    let path = std::path::Path::new(&file_path);
    if path.exists() {
        std::fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

