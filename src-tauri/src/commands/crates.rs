use crate::models::{ContextCrate, DbState, WindowInfo};
use rusqlite::params;
use notify::Watcher;
use windows::Win32::Foundation::{BOOL, HWND, LPARAM};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowThreadProcessId, IsWindowVisible};

#[tauri::command]
pub fn sync_project(message: Option<String>) -> Result<(), String> {
    let mut cmd = std::process::Command::new("powershell");
    cmd.arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg("./scripts/sync.ps1");
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
pub fn start_watcher(path: String) -> Result<(), String> {
    std::thread::spawn(move || {
        let (tx, rx) = std::sync::mpsc::channel();
        let mut watcher = notify::RecommendedWatcher::new(
            move |res| {
                let _ = tx.send(res);
            },
            notify::Config::default(),
        )
        .unwrap();

        watcher
            .watch(
                std::path::Path::new(&path),
                notify::RecursiveMode::Recursive,
            )
            .unwrap();

        // Blocking local reqwest client for background thread
        let client = reqwest::blocking::Client::new();

        for res in rx {
            if let Ok(event) = res {
                if !event.kind.is_modify() && !event.kind.is_create() {
                    continue;
                }

                for path_buf in event.paths {
                    let fp = path_buf.to_string_lossy().to_string();
                    let name = path_buf
                        .file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .to_string();

                    if fp.contains(".git") || fp.contains("node_modules") || fp.contains("target") {
                        continue;
                    }
                    if fp.ends_with(".exe")
                        || fp.ends_with(".db")
                        || fp.ends_with(".dll")
                        || fp.ends_with(".png")
                    {
                        continue;
                    }

                    if let Ok(content) = std::fs::read_to_string(&fp) {
                        let safe_content = if content.len() > 2000 {
                            content[..2000].to_string()
                        } else {
                            content
                        };
                        if safe_content.trim().is_empty() {
                            continue;
                        }

                        let req_body = serde_json::json!({
                            "model": "nomic-embed-text",
                            "prompt": safe_content
                        });

                        // Fire and forget embedding to local LLM
                        if let Ok(res) = client
                            .post("http://localhost:11434/api/embeddings")
                            .json(&req_body)
                            .send()
                        {
                            if let Ok(json) = res.json::<serde_json::Value>() {
                                if let Some(embedding) = json["embedding"].as_array() {
                                    if let Ok(vector_str) = serde_json::to_string(embedding) {
                                        if let Ok(conn) =
                                            rusqlite::Connection::open("oasis_crates.db")
                                        {
                                            // Delete old version if exists, insert new
                                            let _ = conn.execute(
                                                "DELETE FROM file_embeddings WHERE filepath = ?1",
                                                rusqlite::params![fp],
                                            );
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
pub fn save_crate(
    state: tauri::State<DbState>,
    name: String,
    apps: Vec<WindowInfo>,
) -> Result<(), String> {
    let conn = state.0.get().unwrap();
    let apps_json = serde_json::to_string(&apps).map_err(|e| e.to_string())?;
    let timestamp = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT INTO context_crates (name, apps, timestamp) VALUES (?1, ?2, ?3)",
        params![name, apps_json, timestamp],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_crate(
    state: tauri::State<DbState>,
    id: i32,
    name: String,
    apps: Vec<WindowInfo>,
) -> Result<(), String> {
    let conn = state.0.get().unwrap();
    let apps_json = serde_json::to_string(&apps).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE context_crates SET name = ?1, apps = ?2 WHERE id = ?3",
        params![name, apps_json, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}


#[tauri::command]
pub fn get_crates(state: tauri::State<DbState>) -> Result<Vec<ContextCrate>, String> {
    let conn = state.0.get().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, name, apps, timestamp FROM context_crates")
        .map_err(|e| e.to_string())?;

    let crate_iter = stmt
        .query_map([], |row| {
            Ok(ContextCrate {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                apps: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut crates = Vec::new();
    for c in crate_iter {
        crates.push(c.map_err(|e| e.to_string())?);
    }

    Ok(crates)
}

#[tauri::command]
pub fn delete_crate(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.get().unwrap();
    conn.execute("DELETE FROM context_crates WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn generate_crate_name(apps: Vec<WindowInfo>) -> Result<String, String> {
    let client = reqwest::Client::new();
    let app_titles: Vec<String> = apps.iter().map(|a| a.title.clone()).collect();
    let prompt = format!("I am saving a 'Desktop Context Crate' on my AI OS. Here are the open window titles: {}.\n\nSuggest a single, punchy, 3-4 word title for this workspace context (e.g. 'Figma UI & React Dev', 'Market Research Pulse'). Return ONLY the title string.", app_titles.join(", "));

    let chat_body =
        serde_json::json!({ "model": "gemma4:latest", "prompt": prompt, "stream": false });
    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&chat_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    if let Some(suggestion) = json["response"].as_str() {
        Ok(suggestion.trim_matches('"').to_string())
    } else {
        Ok("Manual Context Layer".into())
    }
}

#[tauri::command]
pub fn launch_crate(state: tauri::State<DbState>, id: i32) -> Result<(), String> {
    let conn = state.0.get().unwrap();
    let mut stmt = conn
        .prepare("SELECT apps FROM context_crates WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    let apps_json: String = stmt
        .query_row(params![id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    let apps: Vec<WindowInfo> = serde_json::from_str(&apps_json).map_err(|e| e.to_string())?;

    let mut launched_count = 0;
    let mut failed_apps = Vec::new();

    for app in &apps {
        if app.exe_path.is_empty() {
            continue;
        }

        let exe_lower = app.exe_path.to_lowercase();
        // Ignore core OS processes that shouldn't be spawned as standalone windows
        if exe_lower.contains("applicationframehost.exe")
            || exe_lower.contains("explorer.exe")
            || exe_lower.contains("searchhost.exe")
            || exe_lower.contains("startmenuexperiencehost.exe")
            || exe_lower.contains("textinputhost.exe")
            || exe_lower.contains("shellexperiencehost.exe")
        {
            continue;
        }

        match std::process::Command::new(&app.exe_path).spawn() {
            Ok(_) => launched_count += 1,
            Err(_) => failed_apps.push(app.title.clone()),
        }
    }

    // Spawn background thread to restore window placement after they open
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(3));

        unsafe extern "system" fn position_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
            let apps = &mut *(lparam.0 as *mut Vec<WindowInfo>);
            if IsWindowVisible(hwnd).as_bool() {
                let mut pid = 0u32;
                GetWindowThreadProcessId(hwnd, Some(&mut pid));

                use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
                use windows::Win32::System::Threading::{
                    OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ,
                };

                let mut exe_path = String::new();
                if let Ok(handle) =
                    OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid)
                {
                    let mut path_buffer = [0u16; 1024];
                    let path_len = GetModuleFileNameExW(handle, None, &mut path_buffer);
                    if path_len > 0 {
                        exe_path = String::from_utf16_lossy(&path_buffer[..path_len as usize]);
                    }
                    let _ = windows::Win32::Foundation::CloseHandle(handle);
                }

                if let Some(pos) = apps.iter().position(|a| a.exe_path == exe_path) {
                    let app = apps.remove(pos);
                    use windows::Win32::UI::WindowsAndMessaging::{
                        SetWindowPos, HWND_TOP, SWP_NOACTIVATE, SWP_NOZORDER,
                    };
                    let _ = SetWindowPos(
                        hwnd,
                        HWND_TOP,
                        app.x,
                        app.y,
                        app.width,
                        app.height,
                        SWP_NOZORDER | SWP_NOACTIVATE,
                    );
                }
            }
            BOOL(1)
        }

        let mut apps_clone = apps.clone();
        unsafe {
            let _ = EnumWindows(
                Some(position_callback),
                LPARAM(&mut apps_clone as *mut Vec<WindowInfo> as isize),
            );
        }
    });

    if !failed_apps.is_empty() {
        return Err(format!(
            "Launched {} apps, but failed to launch: {}",
            launched_count,
            failed_apps.join(", ")
        ));
    }

    Ok(())
}
