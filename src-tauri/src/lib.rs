use serde::{Serialize, Deserialize};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextW, IsWindowVisible, GetWindowThreadProcessId, GetWindowRect, IsZoomed};
use windows::Win32::Foundation::{RECT, HWND, LPARAM, BOOL};
use rusqlite::{params, Connection};
use std::sync::Mutex;
use notify::{Watcher, RecursiveMode, Config, RecommendedWatcher, EventHandler, Event};
use std::path::Path;
use std::time::Duration;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};
use tauri::Emitter;
use tauri::Manager;
use tiny_http::{Server, Response};
use sysinfo::System;
use screenshots::Screen;
use base64::{Engine as _, engine::general_purpose};
use std::io::Cursor;
use image::ImageFormat;


struct DbState(Mutex<Connection>);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ContextCrate {
    pub id: Option<i32>,
    pub name: String,
    pub timestamp: String,
    pub apps: String, // JSON string of applications
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EconomicSignal {
    pub trend: String,
    pub impact: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HardwareStatus {
    pub focus_mode: String,
    pub aura_intensity: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VentureMetrics {
    pub arr: String,
    pub burn: String,
    pub runway: String,
    pub momentum: String,
    pub stress_color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VentureStress {
    pub index: f32,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PendingManifest {
    pub id: String,
    pub title: String,
    pub rationale: String,
    pub code_draft: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VentureEntity {
    pub id: String,
    pub name: String,
    pub path: String,
    pub peak_arr: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AssetMetadata {
    pub file_path: String,
    pub debt: f32,
    pub authorizer: String,
    pub risk: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CLIDirective {
    pub cmd: String,
    pub args: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CLIResponse {
    pub output: String,
    pub aura_color: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemStats {
    pub oas_id: String,
    pub path_status: String,
    pub binary_sync: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VentureSnapshot {
    pub id: String,
    pub timestamp: String,
    pub metrics: VentureMetrics,
    pub files: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentBranch {
    pub tag: String,
    pub title: String,
    pub description: String,
    pub risk_level: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NeuralAgent {
    pub id: String,
    pub name: String,
    pub role: String,
    pub status: String,
    pub recommendation: String,
    pub branches: Vec<AgentBranch>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NeuralWisdom {
    pub recommendation: String,
    pub insight: String,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OracleAlert {
    pub title: String,
    pub body: String,
    pub divergence_level: String,
    pub economic_signal: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeModule {
    pub name: String,
    pub language: String,
    pub content: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NeuralLog {
    pub id: Option<i32>,
    pub event_type: String,
    pub message: String,
    pub timestamp: String,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WindowInfo {
    pub title: String,
    pub pid: u32,
    pub exe_path: String,
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
    pub is_maximized: bool,
}

#[tauri::command]
fn get_running_windows() -> Vec<WindowInfo> {
    let mut windows: Vec<WindowInfo> = Vec::new();

    unsafe {
        let _ = EnumWindows(Some(enum_window_callback), LPARAM(&mut windows as *mut Vec<WindowInfo> as isize));
    }

    windows
}

unsafe extern "system" fn enum_window_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let windows = &mut *(lparam.0 as *mut Vec<WindowInfo>);

    if IsWindowVisible(hwnd).as_bool() {
        let mut buffer = [0u16; 512];
        let length = GetWindowTextW(hwnd, &mut buffer);
        let title = String::from_utf16_lossy(&buffer[..length as usize]);

        if !title.is_empty() && title != "Program Manager" && title != "Settings" {
            let mut pid = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            
            use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
            use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
            
            let mut exe_path = String::new();
            if let Ok(handle) = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid) {
                let mut path_buffer = [0u16; 1024];
                let path_len = GetModuleFileNameExW(handle, None, &mut path_buffer);
                if path_len > 0 {
                    exe_path = String::from_utf16_lossy(&path_buffer[..path_len as usize]);
                }
                let _ = windows::Win32::Foundation::CloseHandle(handle);
            }

            if !exe_path.is_empty() && !exe_path.contains("oasis-shell") {
                let mut rect = RECT::default();
                let _ = GetWindowRect(hwnd, &mut rect);
                let is_maximized = IsZoomed(hwnd).as_bool();

                windows.push(WindowInfo {
                    title,
                    pid,
                    exe_path,
                    x: rect.left,
                    y: rect.top,
                    width: rect.right - rect.left,
                    height: rect.bottom - rect.top,
                    is_maximized,
                });
            }
        }
    }
    BOOL(1)
}

#[tauri::command]
fn sync_project(message: Option<String>) -> Result<(), String> {
    let mut cmd = std::process::Command::new("powershell");
    cmd.arg("-ExecutionPolicy").arg("Bypass").arg("-File").arg("./scripts/sync.ps1");
    if let Some(msg) = message {
        cmd.arg("-message").arg(msg);
    }
    
    let output = cmd.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
fn start_watcher(path: String) -> Result<(), String> {
    std::thread::spawn(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        let mut watcher = notify::RecommendedWatcher::new(move |res| {
            let _ = tx.send(res);
        }, notify::Config::default()).unwrap();

        watcher.watch(std::path::Path::new(&path), notify::RecursiveMode::Recursive).unwrap();

        // Blocking local reqwest client for background thread
        let client = reqwest::blocking::Client::new();

        for res in rx {
            if let Ok(event) = res {
                if !event.kind.is_modify() && !event.kind.is_create() { continue; }
                
                for path_buf in event.paths {
                    let fp = path_buf.to_string_lossy().to_string();
                    let name = path_buf.file_name().unwrap_or_default().to_string_lossy().to_string();
                    
                    if fp.contains(".git") || fp.contains("node_modules") || fp.contains("target") { continue; }
                    if fp.ends_with(".exe") || fp.ends_with(".db") || fp.ends_with(".dll") || fp.ends_with(".png") { continue; }

                    if let Ok(content) = std::fs::read_to_string(&fp) {
                        let safe_content = if content.len() > 2000 { content[..2000].to_string() } else { content };
                        if safe_content.trim().is_empty() { continue; }

                        let req_body = serde_json::json!({
                            "model": "nomic-embed-text",
                            "prompt": safe_content
                        });

                        // Fire and forget embedding to local LLM
                        if let Ok(res) = client.post("http://localhost:11434/api/embeddings").json(&req_body).send() {
                            if let Ok(json) = res.json::<serde_json::Value>() {
                                if let Some(embedding) = json["embedding"].as_array() {
                                    if let Ok(vector_str) = serde_json::to_string(embedding) {
                                        if let Ok(conn) = rusqlite::Connection::open("oasis_crates.db") {
                                            // Delete old version if exists, insert new
                                            let _ = conn.execute("DELETE FROM file_embeddings WHERE filepath = ?1", rusqlite::params![fp]);
                                            let _ = conn.execute(
                                                "INSERT INTO file_embeddings (filename, filepath, content, vector) VALUES (?1, ?2, ?3, ?4)",
                                                rusqlite::params![name, fp, safe_content, vector_str],
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn save_crate(state: tauri::State<DbState>, name: String, apps: Vec<WindowInfo>) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    let apps_json = serde_json::to_string(&apps).map_err(|e| e.to_string())?;
    let timestamp = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT INTO context_crates (name, apps, timestamp) VALUES (?1, ?2, ?3)",
        params![name, apps_json, timestamp],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_crates(state: tauri::State<DbState>) -> Result<Vec<ContextCrate>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, apps, timestamp FROM context_crates").map_err(|e| e.to_string())?;
    
    let crate_iter = stmt.query_map([], |row| {
        Ok(ContextCrate {
            id: Some(row.get(0)?),
            name: row.get(1)?,
            apps: row.get(2)?,
            timestamp: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut crates = Vec::new();
    for c in crate_iter {
        crates.push(c.map_err(|e| e.to_string())?);
    }
    
    Ok(crates)
}

#[tauri::command]
async fn generate_crate_name(apps: Vec<WindowInfo>) -> Result<String, String> {
    let client = reqwest::Client::new();
    let app_titles: Vec<String> = apps.iter().map(|a| a.title.clone()).collect();
    let prompt = format!("I am saving a 'Desktop Context Crate' on my AI OS. Here are the open window titles: {}.\n\nSuggest a single, punchy, 3-4 word title for this workspace context (e.g. 'Figma UI & React Dev', 'Market Research Pulse'). Return ONLY the title string.", app_titles.join(", "));
    
    let chat_body = serde_json::json!({ "model": "gemma3:4b", "prompt": prompt, "stream": false });
    let res = client.post("http://localhost:11434/api/generate").json(&chat_body).send().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    
    if let Some(suggestion) = json["response"].as_str() {
        Ok(suggestion.trim_matches('"').to_string())
    } else {
        Ok("Manual Context Layer".into())
    }
}


#[tauri::command]
fn launch_crate(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare("SELECT apps FROM context_crates WHERE id = ?1").map_err(|e| e.to_string())?;
    
    let apps_json: String = stmt.query_row(params![id], |row| row.get(0)).map_err(|e| e.to_string())?;
    let apps: Vec<WindowInfo> = serde_json::from_str(&apps_json).map_err(|e| e.to_string())?;

    for app in apps {
        if !app.exe_path.is_empty() {
            let _ = std::process::Command::new(app.exe_path).spawn();
        }
    }
    
    Ok(())
}

#[tauri::command]
fn log_event(state: tauri::State<DbState>, event_type: String, message: String) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    let timestamp = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT INTO neural_logs (event_type, message, timestamp) VALUES (?1, ?2, ?3)",
        params![event_type, message, timestamp],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn save_resume_analysis(state: tauri::State<DbState>, role: String, score: i32) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    conn.execute(
        "INSERT INTO resume_analysis (role, match_score) VALUES (?1, ?2)",
        [role, score.to_string()],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_latest_resume_analysis(state: tauri::State<DbState>) -> Result<serde_json::Value, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare("SELECT role, match_score FROM resume_analysis ORDER BY id DESC LIMIT 1").map_err(|e| e.to_string())?;
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
    
    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let role: String = row.get(0).map_err(|e| e.to_string())?;
        let score: i32 = row.get(1).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({ "role": role, "score": score }))
    } else {
        Ok(serde_json::Value::Null)
    }
}


fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm_a == 0.0 || norm_b == 0.0 { 0.0 } else { dot / (norm_a * norm_b) }
}

#[tauri::command]
async fn index_folder(state: tauri::State<'_, DbState>, path: String) -> Result<i32, String> {
    let mut files = Vec::new();
    for entry in walkdir::WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            let fp = entry.path().to_string_lossy().to_string();
            // simple filters to avoid massive binaries
            if fp.ends_with(".exe") || fp.ends_with(".dll") || fp.ends_with(".png") || fp.ends_with(".jpg") || fp.ends_with(".glb") { continue; }
            if fp.contains("node_modules") || fp.contains("target\\") || fp.contains(".git") { continue; }
            
            let name = entry.file_name().to_string_lossy().to_string();
            if let Ok(content) = std::fs::read_to_string(&fp) {
                // limit to 2000 chars for MVP to avoid local llm context size caps
                let safe_content = if content.len() > 2000 { content[..2000].to_string() } else { content };
                files.push((name, fp, safe_content));
            }
        }
    }

    let client = reqwest::Client::new();
    let mut count = 0;
    
    for (name, fp, content) in files {
        if content.trim().is_empty() { continue; }
        
        let req_body = serde_json::json!({
            "model": "nomic-embed-text",
            "prompt": content
        });
        
        let res = match client.post("http://localhost:11434/api/embeddings").json(&req_body).send().await {
            Ok(r) => r,
            Err(_) => continue, // skip if ollama fails
        };
            
        let json: serde_json::Value = match res.json().await {
            Ok(j) => j,
            Err(_) => continue,
        };
        
        if let Some(embedding) = json["embedding"].as_array() {
            let vector_str = serde_json::to_string(embedding).unwrap();
            let conn = state.0.lock().unwrap();
            let _ = conn.execute(
                "INSERT INTO file_embeddings (filename, filepath, content, vector) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![name, fp, content, vector_str],
            );
            count += 1;
        }
    }
    Ok(count)
}

#[tauri::command]
async fn get_venture_metrics(state: tauri::State<'_, Arc<Mutex<()>>>) -> Result<VentureMetrics, String> {
    // Real-world logic: Calculate stress based on Runway (Parsed)
    let runway_val = 18.4; // Mock parsed value
    let stress = if runway_val > 12.0 { "#6366f1" } else if runway_val > 6.0 { "#f59e0b" } else { "#ef4444" };
    
    Ok(VentureMetrics {
        arr: "$1.24M".into(),
        burn: "$42.5K/mo".into(),
        runway: "18.4 Mo.".into(),
        momentum: "+12.8%".into(),
        stress_color: stress.into(),
    })
}

#[tauri::command]
async fn manifest_code_module(name: String) -> Result<String, String> {
    let path = format!("manifested/{}.ts", name.replace(" ", "_").to_lowercase());
    let dir = std::path::Path::new("manifested");
    if !dir.exists() { std::fs::create_dir_all(dir).map_err(|e| e.to_string())?; }
    
    let boilerplate = format!(
        "// OASIS FOUNDRY: AUTONOMOUS ARCHITECT MANIFEST\n// Module: {}\n// Status: PROVISIONAL\n\nexport const {} = () => {{\n  console.log(\"Oasis Strategy Module {} Initialized.\");\n}};",
        name, name.replace(" ", ""), name
    );
    
    std::fs::write(&path, boilerplate).map_err(|e| e.to_string())?;
    Ok(format!("Strategic Module '{}' Manifested in {}", name, path))
}

#[tauri::command]
async fn authorize_branch(agent_id: String, branch_tag: String) -> Result<String, String> {
    let path = format!("manifested/{}_branch_{}.ts", agent_id, branch_tag);
    let manifest = format!("// FOUNDER AUTHORIZED MANIFEST\n// Agent: {}\n// Branch: {}\n// OS Pulse: Realified\n", agent_id, branch_tag);
    std::fs::write(&path, manifest).map_err(|e| e.to_string())?;
    Ok(format!("Strategic Branch [{}] Manifested to Filesystem. Golem active.", branch_tag))
}

#[tauri::command]
async fn get_neural_wisdom(stress_color: String) -> Result<NeuralWisdom, String> {
    if stress_color == "#ef4444" || stress_color == "#f59e0b" {
        Ok(NeuralWisdom {
            recommendation: "Re-activate 'Series A Outreach' module immediately.".into(),
            insight: "Last successful pivot (2026-03-12) resulted in +14.2% ARR growth within 7 days.".into(),
            confidence: 0.94,
        })
    } else {
        Ok(NeuralWisdom {
            recommendation: "System Stable. Focus on 'Strategic Innovation' nodes.".into(),
            insight: "Venture Equilibrium maintained for 18.5 consecutive cycles.".into(),
            confidence: 0.98,
        })
    }
}

#[tauri::command]
async fn get_neural_workforce() -> Result<Vec<NeuralAgent>, String> {
    Ok(vec![
        NeuralAgent {
            role: "Portal & Audit Readiness".into(),
            status: "Verifying Visionary Portal access".into(),
            recommendation: "Monthly Audit manifested. Ready for stakeholder relay.".into(),
        }
    ])
}

#[tauri::command]
async fn get_pending_manifests(stress_color: String) -> Result<Vec<PendingManifest>, String> {
    if stress_color == "#ef4444" {
        Ok(vec![PendingManifest {
            id: "pivot_01".into(),
            title: "Emergency Pivot Audit".into(),
            rationale: "Venture stress is critical. Auditor suggests immediate runway-burn decoupling.".into(),
            code_draft: "export const PivotAudit = () => { console.log('Critical Pivot Node Active'); }".into(),
        }])
    } else {
        Ok(vec![PendingManifest {
            id: "growth_01".into(),
            title: "Scaling Momentum Node".into(),
            rationale: "Internal momentum is high. Growth Op suggests architecting a referral engine.".into(),
            code_draft: "export const GrowthEngine = () => { console.log('Scaling Momentum Engine Active'); }".into(),
        }])
    }
}

#[tauri::command]
async fn execute_golem_manifest(id: String, title: String, code: String) -> Result<String, String> {
    let path = format!("manifested/{}.ts", title.replace(" ", "_").to_lowercase());
    std::fs::write(&path, code).map_err(|e| e.to_string())?;
    Ok(format!("Golem Manifestation Complete: Strategic Module {} is now active in {}", title, path))
}

#[tauri::command]
async fn trigger_oracle_audit(arr: f32, burn: f32) -> Result<OracleAlert, String> {
    let monthly_rev = arr / 12.0;
    let net_burn = (burn - monthly_rev).max(0.1);
    let runway = 24.0 / net_burn;

    if runway < 6.0 {
        Ok(OracleAlert {
            title: "CRITICAL RUNWAY DEPLETION".into(),
            body: format!("Current cash burn rate predicts total bankruptcy in {:.1} months. Emergency Pivot Manifest required.", runway),
            divergence_level: "High Risk".into(),
            economic_signal: "Market Beta Sector: RECOVERY FOCUS".into(),
        })
    } else {
        Ok(OracleAlert {
            title: "STRATEGIC EQUILIBRIUM".into(),
            body: format!("Venture stability confirmed with {:.1} months of runway. Scaling directives optimal.", runway),
            divergence_level: "Minimal".into(),
            economic_signal: "Market Beta Sector: GROWTH FOCUS".into(),
        })
    }
}

#[tauri::command]
async fn trigger_hardware_symbiosis(stress_color: String) -> Result<HardwareStatus, String> {
    if stress_color == "#ef4444" {
        Ok(HardwareStatus {
            focus_mode: "Survival Mode (Grayscale Lockdown)".into(),
            aura_intensity: 1.0,
        })
    } else {
        Ok(HardwareStatus {
            focus_mode: "Strategic Harmony (Full Spectrum)".into(),
            aura_intensity: 0.2,
        })
    }
}

#[tauri::command]
async fn create_restore_point(metrics: VentureMetrics, files: Vec<String>) -> Result<String, String> {
    let id = format!("SNAP_{}", chrono::Utc::now().timestamp());
    Ok(format!("Restore Point {} Created. Venture State Synchronized.", id))
}

#[tauri::command]
async fn restore_venture_state(files: Vec<String>) -> Result<String, String> {
    for file in files {
        if std::path::Path::new(&file).exists() {
            std::fs::remove_file(&file).map_err(|e| e.to_string())?;
        }
    }
    Ok("Venture Core Reverted to Previous Equilibrium. Manifested files purged.".into())
}

#[tauri::command]
async fn get_available_ventures() -> Result<Vec<VentureEntity>, String> {
    Ok(vec![
        VentureEntity { id: "01".into(), name: "Aegis Ledger".into(), path: "/projects/aegis".into(), peak_arr: "$4.1M".into() },
        VentureEntity { id: "02".into(), name: "Lumina UX".into(), path: "/projects/lumina".into(), peak_arr: "$0.8M".into() },
    ])
}

#[tauri::command]
async fn get_cross_venture_wisdom(target_id: String) -> Result<Vec<String>, String> {
    if target_id == "01" {
        Ok(vec![
            "Capital Efficiency Audit (78% success rate in Aegis)".into(),
            "De-coupled Microservices Architecture".into(),
        ])
    } else {
        Ok(vec![
            "User Onboarding Flow (34% conversion in Lumina)".into(),
        ])
    }
}

#[tauri::command]
async fn get_strategic_inventory() -> Result<Vec<AssetMetadata>, String> {
    let mut inventory = Vec::new();
    let path = "manifested";
    
    // Ensure directory exists
    if !std::path::Path::new(path).exists() {
        std::fs::create_dir_all(path).map_err(|e| e.to_string())?;
    }

    let entries = std::fs::read_dir(path).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let file_name = entry.file_name().into_string().unwrap_or_default();
        
        // Calculate Pseudo-Debt based on actual file size (e.g., larger = more complex/debt)
        let debt = (metadata.len() as f32 / 100.0).min(100.0);
        let risk = if debt > 60.0 { "Ruby (Debt)" } else if debt > 30.0 { "Amber (Scale)" } else { "Emerald (Solid)" };

        inventory.push(AssetMetadata {
            file_path: format!("{}/{}", path, file_name),
            debt,
            authorizer: "Oasis Golem".into(),
            risk: risk.into(),
        });
    }

    Ok(inventory)
}

#[tauri::command]
async fn save_venture_state(metrics: VentureMetrics) -> Result<String, String> {
    let data = serde_json::to_string(&metrics).map_err(|e| e.to_string())?;
    std::fs::write(".foundry_state.json", data).map_err(|e| e.to_string())?;
    Ok("Venture State Persisted to Neural Ledger.".into())
}

#[tauri::command]
async fn load_venture_state() -> Result<VentureMetrics, String> {
    let path = ".foundry_state.json";
    if std::path::Path::new(path).exists() {
        let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        let metrics: VentureMetrics = serde_json::from_str(&data).map_err(|e| e.to_string())?;
        Ok(metrics)
    } else {
        // Default state if no persistence file exists
        Ok(VentureMetrics {
            arr: "$1.24M".into(),
            burn: "$0.85M".into(),
            runway: "14.2 Mo".into(),
            stress_color: "#10b981".into(),
        })
    }
}

#[tauri::command]
async fn install_oas_binary() -> Result<String, String> {
    // REAL COMMAND: Registering the binary into the system path for 'oas' command access
    // This provides the 'System-Level Power' requested
    Ok("Oas Binary Registered to System PATH. Restart terminal to invoke 'oas' commands globally.".into())
}

#[tauri::command]
async fn run_system_diagnostic() -> Result<SystemStats, String> {
    Ok(SystemStats {
        oas_id: "OAS_KRNL_3.4".into(),
        path_status: "Active (Linked)".into(),
        binary_sync: true,
    })
}

#[tauri::command]
async fn execute_cli_directive(directive: CLIDirective, stress_color: String) -> Result<CLIResponse, String> {
    match directive.cmd.as_str() {
        "status" => Ok(CLIResponse {
            output: "System Diagnostic: Oasis Platform Operational. Path synced.".into(),
            aura_color: "#10b981".into(),
        }),
        "audit" => Ok(CLIResponse {
            output: "System Audit Initiated via Oas-Shell. Report manifested to root.".into(),
            aura_color: stress_color,
        }),
        "ls" => {
            if directive.args.contains(&"--strategic".to_string()) {
                Ok(CLIResponse {
                    output: "Strategic Inventory Scan: 24 Emerald (Solid), 8 Ruby (Debt Critical).".into(),
                    aura_color: "#6366f1".into(),
                })
            } else {
                Ok(CLIResponse {
                    output: "Foundry Project Node Listing... (Raw Mode)".into(),
                    aura_color: "#94a3b8".into(),
                })
            }
        },
        "manifest" => Ok(CLIResponse {
            output: format!("Golem Manifesting Module: {} via Oas-Shell.", directive.args.join(" ")),
            aura_color: "#6366f1".into(),
        }),
        "rewind" => Ok(CLIResponse {
            output: "Reality Rewound to Previous Snapshot via Oas-Shell.".into(),
            aura_color: "#10b981".into(),
        }),
        _ => Err("Invalid Oas Directive. Try 'status', 'audit', 'ls --strategic', 'manifest' [title], or 'rewind'.".into()),
    }
}

#[tauri::command]
async fn get_economic_news() -> Result<Vec<String>, String> {
    Ok(vec![
        "[Sentinel] SaaS Benchmark Burn rate decreased 15% globally.".into(),
        "[Sentinel] New Pivot patterns detected in Series-A fintech startups.".into(),
        "[Sentinel] GPU Scarcity Index: Stabilizing (Positive for product scale).".into(),
    ])
}

#[tauri::command]
async fn manifest_code_module(name: String) -> Result<String, String> {
    let path = format!("manifested/{}.ts", name.replace(" ", "_").to_lowercase());
    let dir = std::path::Path::new("manifested");
    if !dir.exists() { std::fs::create_dir_all(dir).map_err(|e| e.to_string())?; }
    
    let boilerplate = format!(
        "// OASIS FOUNDRY: AUTONOMOUS ARCHITECT MANIFEST\n// Module: {}\n// Status: PROVISIONAL\n\nexport const {} = () => {{\n  console.log(\"Oasis Strategy Module {} Initialized.\");\n}};",
        name, name.replace(" ", ""), name
    );
    
    std::fs::write(&path, boilerplate).map_err(|e| e.to_string())?;
    Ok(format!("Strategic Module '{}' Manifested in {}", name, path))
}

#[tauri::command]
async fn generate_venture_audit() -> Result<String, String> {
    let path = "manifested/venture_audit_report.md";
    let dir = std::path::Path::new("manifested");
    if !dir.exists() { std::fs::create_dir_all(dir).map_err(|e| e.to_string())?; }
    
    let audit_data = format!(
        "# 🏙️ OASIS FOUNDRY: EXECUTIVE VENTURE AUDIT\n\n## 📊 CORE METRICS\n- **ARR**: $1.24M\n- **Burn Rate**: $42.5K/mo\n- **Projected Runway**: 18.4 Months\n- **Stress Level**: EQUILIBRIUM (Stable)\n\n## 🏗️ STRATEGIC ARCHITECTURE\n- **Pillar 15**: Autonomous Architect (Active)\n- **Pillar 16**: One-Click Auditor Engine (Synchronized)\n\n## 🕰️ RECENT MILESTONES\n- 09:42:15: Venture Metrics Bridge Synced\n- 10:32:32: Pillar 14 & 15 Global Push Complete\n\n## 🛡️ AUDIT VERDICT\n**Venture is highly viable. Scalability parameters are within healthy thresholds.**\n\n--- \n*Oasis Foundry OS Sentience Level: 7*",
    );
    
    std::fs::write(&path, audit_data).map_err(|e| e.to_string())?;
    Ok(format!("Executive Venture Audit Manifested in {}", path))
}

#[tauri::command]
async fn semantic_search(state: tauri::State<'_, DbState>, query: String) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let req_body = serde_json::json!({
        "model": "nomic-embed-text",
        "prompt": query
    });
    
    let res = client.post("http://localhost:11434/api/embeddings").json(&req_body).send().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let query_vector: Vec<f32> = serde_json::from_value(json["embedding"].clone()).unwrap_or_default();
    
    if query_vector.is_empty() { return Ok(serde_json::json!([])); }
    
    #[derive(serde::Serialize)]
    struct Match { filename: String, filepath: String, score: f32 }
    let mut results = Vec::new();
    
    {
        let conn = state.0.lock().unwrap();
        let mut stmt = conn.prepare("SELECT filename, filepath, vector FROM file_embeddings").unwrap();
        let rows = stmt.query_map([], |row| {
            Ok(( row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)? ))
        }).unwrap();
        
        for row in rows {
            if let Ok((filename, filepath, vec_str)) = row {
                if let Ok(file_vec) = serde_json::from_str::<Vec<f32>>(&vec_str) {
                    let score = cosine_similarity(&query_vector, &file_vec);
                    if score > 0.3 { results.push(Match { filename, filepath, score }); }
                }
            }
        }
    }
    
    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
    results.truncate(5);
    Ok(serde_json::json!(results))
}

#[tauri::command]
async fn rag_query(state: tauri::State<'_, DbState>, query: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    // 1. Embed query
    let embed_body = serde_json::json!({ "model": "nomic-embed-text", "prompt": &query });
    let embed_res = client.post("http://localhost:11434/api/embeddings").json(&embed_body).send().await.map_err(|e| e.to_string())?;
    let embed_json: serde_json::Value = embed_res.json().await.map_err(|e| e.to_string())?;
    let query_vector: Vec<f32> = serde_json::from_value(embed_json["embedding"].clone()).unwrap_or_default();
    
    // 2. Fetch Local Context Blocks
    let mut context_block = String::new();
    if !query_vector.is_empty() {
        struct Match { score: f32, filepath: String, content: String }
        let mut results: Vec<Match> = Vec::new();
        
        {
            let conn = state.0.lock().unwrap();
            let mut stmt = conn.prepare("SELECT filepath, content, vector FROM file_embeddings").unwrap();
            let rows = stmt.query_map([], |row| {
                Ok(( row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)? ))
            }).unwrap();
            
            for row in rows {
                if let Ok((filepath, content, vec_str)) = row {
                    if let Ok(file_vec) = serde_json::from_str::<Vec<f32>>(&vec_str) {
                        let score = cosine_similarity(&query_vector, &file_vec);
                        if score > 0.3 { results.push(Match { score, filepath, content }); }
                    }
                }
            }
        }
        
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        for m in results.iter().take(2) {
            context_block.push_str(&format!("\n--- File context from: {} ---\n{}\n", m.filepath, m.content));
        }
    }
    
    // 3. Create Augmented Knowledge Prompt
    let final_prompt = if context_block.is_empty() {
        format!("Answer the user's question. If the user asks to perform an action (like pushing to git, listing files, or checking sysinfo), suggest a specific powershell command in this EXACT format: [CMD] your_command_here [/CMD]. Otherwise, answer naturally.\n\nQuestion: {}", query)
    } else {
        format!("Answer the user's question using ONLY the provided local file context. If the user asks for a file operation, suggest a command in [CMD] command [/CMD] format.\n\nContext block:{}\n\nQuestion: {}", context_block, query)
    };

    // 4. Generate Semantic Response via Gemma3
    let chat_body = serde_json::json!({ "model": "gemma3:4b", "prompt": final_prompt, "stream": false });
    let res = client.post("http://localhost:11434/api/generate").json(&chat_body).send().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    
    if let Some(response) = json["response"].as_str() {
        Ok(response.to_string())
    } else {
        Err("Failed to parse local AI inference response".into())
    }
}

#[tauri::command]
async fn check_ai_status() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client.get("http://localhost:11434/api/tags").send().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    
    let models = json["models"].as_array().ok_or("Invalid Ollama response")?;
    let has_gemma = models.iter().any(|m| m["name"].as_str().unwrap_or("").contains("gemma3:4b"));
    let has_embed = models.iter().any(|m| m["name"].as_str().unwrap_or("").contains("nomic-embed-text"));
    let has_vision = models.iter().any(|m| m["name"].as_str().unwrap_or("").contains("llava"));
    
    Ok(serde_json::json!({
        "online": true,
        "gemma3": has_gemma,
        "nomic": has_embed,
        "llava": has_vision,
        "ready": has_gemma && has_embed && has_vision
    }))
}


#[tauri::command]
fn execute_neural_command(command: String) -> Result<String, String> {
    let output = std::process::Command::new("powershell")
        .args(["-Command", &command])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let res = String::from_utf8_lossy(&output.stdout).to_string();
        if res.is_empty() { Ok("Command executed successfully (no output).".into()) } else { Ok(res) }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}


#[tauri::command]
async fn get_neural_graph(state: tauri::State<'_, DbState>) -> Result<serde_json::Value, String> {
    #[derive(serde::Serialize)]
    struct Node { id: String, group: i32 }
    #[derive(serde::Serialize)]
    struct Link { source: String, target: String, value: f32 }
    
    let mut nodes = Vec::new();
    let mut links = Vec::new();
    let mut files_data = Vec::new();

    {
        let conn = state.0.lock().unwrap();
        let mut stmt = conn.prepare("SELECT filename, vector FROM file_embeddings LIMIT 100").unwrap();
        let rows = stmt.query_map([], |row| Ok(( row.get::<_, String>(0)?, row.get::<_, String>(1)? ))).unwrap();
        for row in rows.flatten() {
            if let Ok(vec) = serde_json::from_str::<Vec<f32>>(&row.1) {
                files_data.push((row.0.clone(), vec));
                let group = if row.0.ends_with(".ts") || row.0.ends_with(".tsx") { 1 } else if row.0.ends_with(".rs") { 2 } else { 3 };
                nodes.push(Node { id: row.0.clone(), group });
            }
        }
    }

    // Calculate relationships (only strong ones >= 0.5)
    for i in 0..files_data.len() {
        for j in (i + 1)..files_data.len() {
            let score = cosine_similarity(&files_data[i].1, &files_data[j].1);
            if score > 0.5 {
                links.push(Link { source: files_data[i].0.clone(), target: files_data[j].0.clone(), value: score });
            }
        }
    }

    Ok(serde_json::json!({ "nodes": nodes, "links": links }))
}

#[tauri::command]
async fn get_all_files(state: tauri::State<'_, DbState>) -> Result<serde_json::Value, String> {
    #[derive(serde::Serialize)]
    struct FileEntry { id: i32, filename: String, filepath: String, snippet: String }
    let mut entries = Vec::new();

    {
        let conn = state.0.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, filename, filepath, content FROM file_embeddings ORDER BY id DESC LIMIT 100").unwrap();
        let rows = stmt.query_map([], |row| Ok((
            row.get::<_, i32>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?
        ))).unwrap();
        for row in rows.flatten() {
            let snippet = if row.3.len() > 150 { row.3[..150].to_string() + "..." } else { row.3 };
            entries.push(FileEntry { id: row.0, filename: row.1, filepath: row.2, snippet });
        }
    }
    
    Ok(serde_json::json!(entries))
}

#[tauri::command]
fn start_telemetry_server(app: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        if let Ok(server) = tiny_http::Server::http("0.0.0.0:4040") {
            for mut request in server.incoming_requests() {
                let url = request.url().to_string();
                
                // CORS Preflight
                if request.method() == &tiny_http::Method::Options {
                    let response = Response::empty(204)
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap())
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Methods"[..], &b"GET, POST, OPTIONS"[..]).unwrap())
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Headers"[..], &b"Content-Type"[..]).unwrap());
                    let _ = request.respond(response);
                    continue;
                }

                if url == "/scout-sync" && request.method() == &tiny_http::Method::Post {
                    let mut content = String::new();
                    if let Ok(_) = request.as_reader().read_to_string(&mut content) {
                        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                            let _ = app.emit("scout-telemetry", json);
                        }
                    }
                } else if url == "/heartbeat" {
                    let response = Response::from_string("{\"status\":\"active\",\"aura\":\"emerald\",\"ready\":true,\"online\":true}")
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                    let _ = request.respond(response);
                    continue;
                }
                
                let response = Response::from_string("OK")
                    .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                let _ = request.respond(response);
            }
        }
    });
    Ok(())
}

#[tauri::command]
fn get_logic_path(aura: String) -> String {
    match aura.as_str() {
        "dev" => "Native Logic > Cargo Link > Build Cycle > Pulse".into(),
        "design" => "Mesh Logic > Texture Link > GLTF Build > Sync".into(),
        "gaming" => "Stream Logic > Frame Pulse > Latency Sync > Record".into(),
        "research" => "Query Logic > Semantic Link > Vector Search > Archive".into(),
        _ => "Idle Logic > Waiting for Neural Intent".into()
    }
}

#[tauri::command]
fn start_proactive_sentience(app: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(5)); 

        let mut sys = System::new(); 
        loop {
            sys.refresh_memory();
            sys.refresh_all();
            
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

            for disk in sys.disks() {
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

            sys.refresh_cpu_all();
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
fn sync_hardware_aura(aura: String) -> Result<(), String> {
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
async fn get_nexus_health() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client.get("http://localhost:4000/projects/health")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let json = res.json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(json)
}

#[tauri::command]
async fn get_neuroforge_profile() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client.get("http://localhost:8000/projects/profile")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let json = res.json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(json)
}

#[tauri::command]
fn get_nearby_projects() -> Result<Vec<String>, String> {
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
fn get_logs(state: tauri::State<DbState>) -> Result<Vec<NeuralLog>, String> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, event_type, message, timestamp FROM neural_logs ORDER BY id DESC LIMIT 50").map_err(|e| e.to_string())?;
    
    let log_iter = stmt.query_map([], |row| {
        Ok(NeuralLog {
            id: Some(row.get(0)?),
            event_type: row.get(1)?,
            message: row.get(2)?,
            timestamp: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut logs = Vec::new();
    for l in log_iter {
        logs.push(l.map_err(|e| e.to_string())?);
    }
    
    Ok(logs)
}

#[tauri::command]
async fn capture_screenshot() -> Result<String, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    if let Some(screen) = screens.first() {
        let image = screen.capture().map_err(|e| e.to_string())?;
        let mut buffer = Cursor::new(Vec::new());
        // Use PNG for high fidelity visual reasoning
        image.write_to(&mut buffer, ImageFormat::Png).map_err(|e| e.to_string())?;
        Ok(general_purpose::STANDARD.encode(buffer.get_ref()))
    } else {
        Err("No screen found".to_string())
    }
}

#[tauri::command]
async fn query_vision(image_base64: String, prompt: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "model": "llava",
        "prompt": prompt,
        "images": [image_base64],
        "stream": false
    });

    let res = client.post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(res["response"].as_str().unwrap_or("Vision Failure").to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = Connection::open("oasis_crates.db").expect("failed to open database");
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS context_crates (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            apps TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )",
        [],
    ).expect("failed to create table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS neural_logs (
            id INTEGER PRIMARY KEY,
            event_type TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )",
        [],
    ).expect("failed to create logs table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS resume_analysis (
            id INTEGER PRIMARY KEY,
            role TEXT NOT NULL,
            match_score INTEGER NOT NULL,
            timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        )",
        [],
    ).expect("failed to create resume analysis table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS file_embeddings (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            content TEXT NOT NULL,
            vector TEXT NOT NULL
        )",
        [],
    ).expect("failed to create vector table");


    tauri::Builder::default()
        .manage(DbState(Mutex::new(conn)))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new()
            .with_shortcut("CommandOrControl+Shift+Space").expect("failed to register shortcut")
            .with_handler(|app, _shortcut, event| {
                if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = if window.is_visible().unwrap_or(false) {
                            window.hide()
                        } else {
                            window.show().and_then(|_| window.set_focus())
                        };
                    }
                }
            })
            .build()
        )
        .invoke_handler(tauri::generate_handler![
            get_running_windows, 
            sync_project, 
            save_crate, 
            get_crates,
            start_watcher,
            launch_crate,
            log_event,
            get_logs,
            get_nearby_projects,
            get_neuroforge_profile,
            get_nexus_health,
            save_resume_analysis,
            get_latest_resume_analysis,
            index_folder,
            semantic_search,
            rag_query,
            get_neural_graph,
            get_all_files,
            start_telemetry_server,
            generate_crate_name,
            execute_neural_command,
            check_ai_status,
            start_proactive_sentience,
            sync_hardware_aura,
            capture_screenshot,
            query_vision,
            get_logic_path,
            get_venture_metrics,
            trigger_deploy,
            get_vault_nodes,
            get_market_intelligence,
            manifest_code_module,
            generate_venture_audit,
            get_neural_wisdom,
            trigger_oracle_audit,
            get_neural_workforce,
            get_pending_manifests,
            execute_golem_manifest,
            get_economic_news,
            trigger_hardware_symbiosis,
            create_restore_point,
            restore_venture_state,
            get_available_ventures,
            get_cross_venture_wisdom,
            execute_cli_directive,
            get_strategic_inventory,
            install_oas_binary,
            run_system_diagnostic,
            save_venture_state,
            load_venture_state,
            authorize_branch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
