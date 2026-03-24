use serde::{Serialize, Deserialize};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextW, IsWindowVisible, GetWindowThreadProcessId};
use windows::Win32::Foundation::{HWND, LPARAM, BOOL};
use rusqlite::{params, Connection};
use std::sync::Mutex;
use notify::{Watcher, RecursiveMode, Config, RecommendedWatcher, EventHandler, Event};
use std::path::Path;
use std::time::Duration;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};
use tauri::Manager;

struct DbState(Mutex<Connection>);

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
                        std::thread::sleep(Duration::from_millis(1000)); // Debounce
                        let _ = std::process::Command::new("powershell")
                            .arg("-ExecutionPolicy")
                            .arg("Bypass")
                            .arg("-File")
                            .arg("./scripts/sync.ps1")
                            .output();
                    }
                }
                Err(e) => println!("watch error: {:?}", e),
            }
        }
    });

    Ok(())
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ContextCrate {
    pub id: Option<i32>,
    pub name: String,
    pub timestamp: String,
    pub apps: String, // JSON string of applications
}
pub struct WindowInfo {
    pub title: String,
    pub pid: u32,
    pub exe_path: String,
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
                windows.push(WindowInfo {
                    title,
                    pid,
                    exe_path,
                });
            }
        }
    }
    BOOL(1)
}

#[tauri::command]
fn sync_project() -> Result<String, String> {
    let output = std::process::Command::new("powershell")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg("./scripts/sync.ps1")
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
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
            launch_crate
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
