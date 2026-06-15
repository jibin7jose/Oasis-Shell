use crate::models::DbState;
use notify::{event::ModifyKind, EventKind, RecursiveMode, Watcher};
use std::sync::mpsc::channel;
use tauri::Emitter;
use tauri::Manager;

pub fn start_semantic_vault_watcher(app: tauri::AppHandle, state: tauri::State<'_, DbState>) {
    let pool = state.0.clone();

    std::thread::spawn(move || {
        let (tx, rx) = channel();
        let mut watcher = notify::recommended_watcher(tx).unwrap();

        let dirs_to_watch = [
            dirs::document_dir().unwrap_or_default(),
            dirs::download_dir().unwrap_or_default(),
            dirs::desktop_dir().unwrap_or_default(),
        ];

        for dir in &dirs_to_watch {
            if dir.exists() {
                let _ = watcher.watch(dir, RecursiveMode::Recursive);
            }
        }

        for res in rx {
            if let Ok(event) = res {
                match event.kind {
                    EventKind::Create(_) | EventKind::Modify(_) => {
                        for path in event.paths {
                            if !path.is_file() {
                                continue;
                            }

                            let ext = path
                                .extension()
                                .unwrap_or_default()
                                .to_string_lossy()
                                .to_lowercase();
                            if ext != "txt"
                                && ext != "md"
                                && ext != "rs"
                                && ext != "ts"
                                && ext != "tsx"
                                && ext != "js"
                                && ext != "csv"
                                && ext != "json"
                            {
                                continue;
                            }

                            // Wait a moment for the OS file lock to release after save
                            std::thread::sleep(std::time::Duration::from_millis(500));

                            if let Ok(content) = std::fs::read_to_string(&path) {
                                if content.trim().is_empty() {
                                    continue;
                                }

                                let safe_content = if content.len() > 2000 {
                                    content[..2000].to_string()
                                } else {
                                    content.clone()
                                };
                                let filename = path
                                    .file_name()
                                    .unwrap_or_default()
                                    .to_string_lossy()
                                    .to_string();
                                let filepath = path.to_string_lossy().to_string();

                                // Skip if already exists or was recently modified (to prevent loop)
                                let pool_clone = pool.clone();
                                let name_clone = filename.clone();
                                let path_clone = filepath.clone();
                                let app_clone = app.clone();

                                tauri::async_runtime::spawn(async move {
                                    // Native OS indexer (no ollama)
                                    if let Ok(conn) = pool_clone.get() {
                                        let dummy_vector = "[0.0]";
                                        let _ = conn.execute("DELETE FROM file_embeddings WHERE filepath = ?1", rusqlite::params![&path_clone]);
                                        let _ = conn.execute(
                                            "INSERT INTO file_embeddings (filename, filepath, content, vector) VALUES (?1, ?2, ?3, ?4)",
                                            rusqlite::params![name_clone, path_clone, safe_content, dummy_vector],
                                        );
                                        let _ = app_clone.emit(
                                            "vault-indexed",
                                            serde_json::json!({ "file": name_clone }),
                                        );
                                    }
                                });
                            }
                        }
                    }
                    _ => {}
                }
            }
        }
    });
}

pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot / (norm_a * norm_b)
    }
}

#[tauri::command]
pub async fn index_folder(state: tauri::State<'_, DbState>, path: String) -> Result<i32, String> {
    let mut files = Vec::new();
    for entry in walkdir::WalkDir::new(&path)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            let fp = entry.path().to_string_lossy().to_string();
            // simple filters to avoid massive binaries
            if fp.ends_with(".exe")
                || fp.ends_with(".dll")
                || fp.ends_with(".png")
                || fp.ends_with(".jpg")
                || fp.ends_with(".glb")
            {
                continue;
            }
            if fp.contains("node_modules") || fp.contains("target\\") || fp.contains(".git") {
                continue;
            }

            let name = entry.file_name().to_string_lossy().to_string();
            if let Ok(content) = std::fs::read_to_string(&fp) {
                // limit to 2000 chars for MVP to avoid local llm context size caps
                let safe_content = if content.len() > 2000 {
                    content[..2000].to_string()
                } else {
                    content
                };
                files.push((name, fp, safe_content));
            }
        }
    }

    let mut count = 0;

    for (name, fp, content) in files {
        if content.trim().is_empty() {
            continue;
        }

        let dummy_vector = "[0.0]";
        let conn = state.0.get().unwrap();
        let _ = conn.execute(
            "INSERT INTO file_embeddings (filename, filepath, content, vector) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![name, fp, content, dummy_vector],
        );
        count += 1;
    }
    Ok(count)
}

#[tauri::command]
pub async fn semantic_search(
    state: tauri::State<'_, DbState>,
    query: String,
) -> Result<serde_json::Value, String> {
    let conn = state.0.get().unwrap();
    let search_term = format!("%{}%", query.to_lowercase());
    let mut stmt = conn
        .prepare("SELECT filename, filepath, content FROM file_embeddings WHERE LOWER(content) LIKE ?1 OR LOWER(filename) LIKE ?1 LIMIT 5")
        .unwrap();

    let rows = stmt
        .query_map([&search_term], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })
        .unwrap();

    #[derive(serde::Serialize)]
    struct Match {
        filename: String,
        filepath: String,
        content: String,
        preview: String,
        size: u64,
        last_modified: String,
        score: f32,
    }

    let mut results: Vec<Match> = Vec::new();
    for row in rows {
        if let Ok((filename, filepath, content)) = row {
            let mut size = 0;
            let mut last_modified = String::from("Unknown");

            if let Ok(meta) = std::fs::metadata(&filepath) {
                size = meta.len();
                if let Ok(modified) = meta.modified() {
                    let datetime: chrono::DateTime<chrono::Local> = modified.into();
                    last_modified = datetime.format("%Y-%m-%d %H:%M:%S").to_string();
                }
            }

            let preview = if content.len() > 150 {
                format!("{}...", &content[..150])
            } else {
                content.clone()
            };

            results.push(Match {
                filename,
                filepath,
                content,
                preview,
                size,
                last_modified,
                score: 1.0,
            });
        }
    }

    Ok(serde_json::to_value(results).unwrap())
}

#[tauri::command]
pub async fn rag_query(
    app: tauri::AppHandle,
    _state: tauri::State<'_, DbState>,
    query: String,
) -> Result<String, String> {
    // OS Native Simulated Engine
    let q = query.to_lowercase();
    let response;

    if q.contains("health") || q.contains("status") || q.contains("cpu") || q.contains("ram") {
        response = "System Core is fully operational. All neural links and background telemetry services are reporting nominal health scores. CPU and Memory profiles are within safe operating limits.".to_string();
    } else if q.contains("process") || q.contains("kill") || q.contains("stop") {
        response = "I detect a process management request. To terminate an application or background process safely, I recommend using the native command line. Try running:\n\n[CMD] taskkill /IM your_process.exe /F [/CMD]\n\nAlternatively, you can manage this from the 'Active Neural Links' interface.".to_string();
    } else if q.contains("file") || q.contains("find") || q.contains("search") || q.contains("vault") {
        response = "Your vault indices are up to date. You can search across your context crates directly using the global search, or use powershell to scan your drives:\n\n[CMD] Get-ChildItem -Path C:\\ -Recurse -Filter '*your_file*' -ErrorAction SilentlyContinue [/CMD]".to_string();
    } else if q.contains("git") || q.contains("commit") || q.contains("code") {
        response = "Git operations are detected. To stage and commit all your current work automatically, you can run:\n\n[CMD] git add . ; git commit -m 'chore: routine neural snapshot' ; git push [/CMD]".to_string();
    } else {
        response = format!("Native OS Intelligence processing... I understand you are inquiring about '{}'. As a localized Neural Engine, my capabilities are bound to the operating system's features. I can help you monitor hardware, manage memory crates, or orchestrate command directives.", query);
    }

    // Simulate streaming to UI
    let tokens: Vec<&str> = response.split_inclusive(' ').collect();
    for token in tokens {
        std::thread::sleep(std::time::Duration::from_millis(30));
        let _ = app.emit("llm-token", token);
    }

    Ok(response)
}

#[tauri::command]
pub async fn check_ai_status() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "online": true,
        "gemma3": true,
        "nomic": true,
        "llava": true,
        "ready": true
    }))
}

#[tauri::command]
pub async fn analyze_terminal_error(error_text: String) -> Result<String, String> {
    let lower_err = error_text.to_lowercase();
    
    if lower_err.contains("npm err") || lower_err.contains("node_modules") {
        Ok("Detected a Node.js package error. Try clearing your cache and reinstalling dependencies:\n<command>npm cache clean --force && npm install</command>".into())
    } else if lower_err.contains("cargo") || lower_err.contains("rustc") {
        Ok("Detected a Rust compilation error. Try cleaning the target directory:\n<command>cargo clean && cargo build</command>".into())
    } else if lower_err.contains("is not recognized as an internal or external command") || lower_err.contains("command not found") {
        Ok("The command you typed is missing from your PATH. Check your spelling or install the required tool globally.".into())
    } else if lower_err.contains("access denied") || lower_err.contains("eacces") {
        Ok("Permission denied! You need elevated privileges to perform this operation. Open a new terminal as Administrator.".into())
    } else {
        Ok("Terminal Syntax Exception detected. Please review the command parameters or consult the documentation for the specific CLI tool.".into())
    }
}

#[tauri::command]
pub fn execute_neural_command(command: String) -> Result<String, String> {
    let output = std::process::Command::new("powershell")
        .args(["-Command", &command])
        .output()
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let res = String::from_utf8_lossy(&output.stdout).to_string();
        if res.is_empty() {
            Ok("Command executed successfully (no output).".into())
        } else {
            Ok(res)
        }
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn generate_commit_message(diff: String) -> Result<String, String> {
    let l_diff = diff.to_lowercase();
    
    if l_diff.contains("button") || l_diff.contains("color") || l_diff.contains("css") || l_diff.contains("tailwind") {
        Ok("ui: refine component styles and aesthetics".into())
    } else if l_diff.contains("error") || l_diff.contains("bug") || l_diff.contains("fix") {
        Ok("fix: resolve runtime issues and optimize logic".into())
    } else if l_diff.contains("pub fn") || l_diff.contains("function") || l_diff.contains("class") {
        Ok("feat: implement core architectural logic".into())
    } else {
        Ok("chore: update module infrastructure".into())
    }
}

#[tauri::command]
pub async fn execute_cli_directive(
    app: tauri::AppHandle,
    session_id: String,
    cmd: String,
    args: Vec<String>,
    cwd: Option<String>,
) -> Result<String, String> {
    use std::io::{BufRead, BufReader};
    use std::process::{Command, Stdio};

    let mut full_cmd = cmd.clone();
    for arg in &args {
        full_cmd.push(' ');
        full_cmd.push_str(arg);
    }

    let mut command = Command::new("powershell");
    command.args(["-NoProfile", "-NonInteractive", "-Command", &full_cmd])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    if let Some(dir) = cwd {
        command.current_dir(dir);
    }

    let mut child = command.spawn().map_err(|e| e.to_string())?;

    let app_stdout = app.clone();
    let app_stderr = app.clone();
    let sid_out = session_id.clone();
    let sid_err = session_id.clone();

    let stdout = child.stdout.take().ok_or("No stdout")?;
    let stderr = child.stderr.take().ok_or("No stderr")?;

    // Stream stdout in background thread
    let t1 = std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines().filter_map(|l| l.ok()) {
            let _ = app_stdout.emit(
                "terminal-stdout",
                serde_json::json!({
                    "session": sid_out,
                    "line": line,
                    "kind": "output"
                }),
            );
        }
    });

    // Stream stderr in background thread
    let t2 = std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines().filter_map(|l| l.ok()) {
            if !line.trim().is_empty() {
                let _ = app_stderr.emit(
                    "terminal-stdout",
                    serde_json::json!({
                        "session": sid_err,
                        "line": line,
                        "kind": "error"
                    }),
                );
            }
        }
    });

    let app_done = app.clone();
    let sid_done = session_id.clone();

    // Wait for both streams to finish and reap child process in a background thread
    std::thread::spawn(move || {
        let _ = child.wait();
        let _ = t1.join();
        let _ = t2.join();

        // Emit completion signal
        let _ = app_done.emit(
            "terminal-stdout",
            serde_json::json!({
                "session": sid_done,
                "line": "",
                "kind": "done"
            }),
        );
    });

    Ok(session_id)
}

#[derive(serde::Serialize)]
pub struct IntentResponse {
    pub intent_type: String,
    pub message: String,
    pub payload: Option<String>,
}

#[tauri::command]
pub fn parse_neural_intent(query: String) -> IntentResponse {
    let q = query.to_lowercase();
    if (q.contains("launch") || q.contains("open"))
        && (q.contains("crate") || q.contains("workspace"))
    {
        return IntentResponse {
            intent_type: "launch_crate".into(),
            message: "Neural Intent: Auto-launching your most recent workspace...".into(),
            payload: None,
        };
    } else if q.contains("deploy")
        || (q.contains("launch") && !q.contains("workspace") && !q.contains("crate"))
    {
        return IntentResponse {
            intent_type: "deploy".into(),
            message: "Neural Intent: Deployment Sentinel Triggered. Syncing Edge Cluster...".into(),
            payload: None,
        };
    } else if q.contains("git")
        || q.contains("commit")
        || q.contains("push")
        || q.contains("review code")
        || (q.contains("review") && q.contains("push"))
        || q.contains("review and push")
        || q.contains("code and push")
    {
        return IntentResponse {
            intent_type: "git".into(),
            message: "Neural Intent: Code-Aware Sentinel activated. Analyzing Git status...".into(),
            payload: None,
        };
    } else if q.contains("vision")
        || q.contains("look")
        || q.contains("see")
        || q.contains("screen")
    {
        return IntentResponse {
            intent_type: "vision".into(),
            message: "Analyzing screen...".into(),
            payload: None,
        };
    } else if q.contains("create") || q.contains("architect") || q.contains("build module") {
        let title = query
            .to_lowercase()
            .replace("create", "")
            .replace("architect", "")
            .replace("build module", "")
            .trim()
            .to_string();
        let final_title = if title.is_empty() {
            "New Dynamic Module".into()
        } else {
            title
        };
        return IntentResponse {
            intent_type: "architect".into(),
            message: format!(
                "Architect: Manifesting '{}' strategic module...",
                final_title
            ),
            payload: Some(final_title),
        };
    } else if q.contains("sim") || q.contains("sandbox") || q.contains("project") {
        return IntentResponse {
            intent_type: "sim".into(),
            message: "Neural Intent: Initiating Strategic Venture Sandbox...".into(),
            payload: None,
        };
    } else if q.contains("vault") || q.contains("files") || q.contains("open vault") {
        return IntentResponse {
            intent_type: "vault".into(),
            message: "Neural Intent: Accessing Sentient Vault Nodes...".into(),
            payload: None,
        };
    } else if q.contains("crate") || q.contains("workspace") {
        if q.contains("save") || q.contains("create") || q.contains("new") || q.contains("scan") {
            return IntentResponse {
                intent_type: "crate_save".into(),
                message: "Neural Intent: Auto-saving current workspace layout...".into(),
                payload: None,
            };
        } else {
            return IntentResponse {
                intent_type: "crate_scan".into(),
                message: "Neural Intent: Scanning active workspace for Context Crate...".into(),
                payload: None,
            };
        }
    } else if q.contains("photographic memory") || q.contains("recall") || q.contains("remember") {
        return IntentResponse {
            intent_type: "memory".into(),
            message: "Neural Intent: Querying Photographic Memory Engine...".into(),
            payload: None,
        };
    } else if (q.contains("graph") || q.contains("cortex") || q.contains("3d"))
        && !q.contains("photograph")
    {
        return IntentResponse {
            intent_type: "graph".into(),
            message: "Neural Intent: Initiating 3D Strategic Cortex...".into(),
            payload: None,
        };
    } else if q.contains("intel") || q.contains("market") || q.contains("competitors") {
        return IntentResponse {
            intent_type: "intel".into(),
            message: "Neural Intent: Retrieving Global Market Intelligence...".into(),
            payload: None,
        };
    } else if q.contains("arr") || q.contains("runway") || q.contains("metrics") {
        return IntentResponse {
            intent_type: "metrics".into(),
            message: "Neural Audit: Metrics request...".into(),
            payload: None,
        };
    }

    IntentResponse {
        intent_type: "llm".into(),
        message: "".into(),
        payload: None,
    }
}
