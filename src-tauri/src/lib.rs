use serde::{Serialize, Deserialize};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextW, IsWindowVisible, GetWindowThreadProcessId, GetWindowRect, IsZoomed};
use windows::Win32::Foundation::{RECT, HWND, LPARAM, BOOL};
use rusqlite::{params, Connection};
use std::sync::Mutex;
use notify::{Watcher, RecursiveMode, Config, RecommendedWatcher, EventHandler, Event};
use std::path::Path;
use std::time::Duration;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};
use tauri::Manager;

struct DbState(Mutex<Connection>);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ContextCrate {
    pub id: Option<i32>,
    pub name: String,
    pub timestamp: String,
    pub apps: String, // JSON string of applications
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
fn start_watcher() -> Result<(), String> {
    std::thread::spawn(|| {
        let (tx, rx) = std::sync::mpsc::channel();
        let mut watcher = RecommendedWatcher::new(move |res| {
            let _ = tx.send(res);
        }, Config::default()).unwrap();

        watcher.watch(Path::new("."), RecursiveMode::Recursive).unwrap();

        for res in rx {
            match res {
                Ok(event) => {
                    let mut should_sync = false;
                    for path in event.paths {
                        let path_str = path.to_string_lossy();
                        if !path_str.contains(".git") && !path_str.contains("target") && !path_str.contains("node_modules") {
                            should_sync = true;
                            break;
                        }
                    }

                    if should_sync && event.kind.is_modify() {
                        std::thread::sleep(Duration::from_millis(1500)); // Debounce
                        
                        // Try to get the latest neural log for a meaningful commit message
                        let mut display_message = "Automated System Update".to_string();
                        if let Ok(conn) = Connection::open("oasis_crates.db") {
                            if let Ok(mut stmt) = conn.prepare("SELECT message FROM neural_logs ORDER BY id DESC LIMIT 1") {
                                if let Ok(msg) = stmt.query_row([], |row| row.get::<_, String>(0)) {
                                    display_message = msg;
                                }
                            }
                        }

                        let _ = std::process::Command::new("powershell")
                            .arg("-ExecutionPolicy")
                            .arg("Bypass")
                            .arg("-File")
                            .arg("./scripts/sync.ps1")
                            .arg("-message")
                            .arg(display_message)
                            .output();
                    }
                }
                Err(e) => println!("watch error: {:?}", e),
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

    tauri::Builder::default()
        .manage(DbState(Mutex::new(conn)))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new()
            .with_shortcut("Alt+Space").expect("failed to register Alt+Space")
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
            get_latest_resume_analysis
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
