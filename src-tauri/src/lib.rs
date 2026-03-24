use serde::{Serialize, Deserialize};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowTextW, IsWindowVisible, GetWindowThreadProcessId};
use windows::Win32::Foundation::{HWND, LPARAM, BOOL};
use rusqlite::{params, Connection};
use std::sync::Mutex;

struct DbState(Mutex<Connection>);

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

        if !title.is_empty() && title != "Program Manager" {
            let mut pid = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            
            windows.push(WindowInfo {
                title,
                pid,
            });
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
        .invoke_handler(tauri::generate_handler![
            get_running_windows, 
            sync_project, 
            save_crate, 
            get_crates
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
