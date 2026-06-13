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
                                    let client = reqwest::Client::new();
                                    let req_body = serde_json::json!({
                                        "model": "nomic-embed-text",
                                        "prompt": safe_content
                                    });

                                    if let Ok(res) = client
                                        .post("http://localhost:11434/api/embeddings")
                                        .json(&req_body)
                                        .send()
                                        .await
                                    {
                                        if let Ok(json) = res.json::<serde_json::Value>().await {
                                            if let Some(embedding) = json["embedding"].as_array() {
                                                if let Ok(conn) = pool_clone.get() {
                                                    let vector_str =
                                                        serde_json::to_string(embedding).unwrap();

                                                    // Delete old embedding if modifying
                                                    let _ = conn.execute("DELETE FROM file_embeddings WHERE filepath = ?1", rusqlite::params![&path_clone]);

                                                    // Insert new
                                                    let _ = conn.execute(
                                                        "INSERT INTO file_embeddings (filename, filepath, content, vector) VALUES (?1, ?2, ?3, ?4)",
                                                        rusqlite::params![name_clone, path_clone, safe_content, vector_str],
                                                    );

                                                    let _ = app_clone.emit(
                                                        "vault-indexed",
                                                        serde_json::json!({ "file": name_clone }),
                                                    );
                                                }
                                            }
                                        }
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

    let client = reqwest::Client::new();
    let mut count = 0;

    for (name, fp, content) in files {
        if content.trim().is_empty() {
            continue;
        }

        let req_body = serde_json::json!({
            "model": "nomic-embed-text",
            "prompt": content
        });

        let res = match client
            .post("http://localhost:11434/api/embeddings")
            .json(&req_body)
            .send()
            .await
        {
            Ok(r) => r,
            Err(_) => continue, // skip if ollama fails
        };

        let json: serde_json::Value = match res.json().await {
            Ok(j) => j,
            Err(_) => continue,
        };

        if let Some(embedding) = json["embedding"].as_array() {
            let vector_str = serde_json::to_string(embedding).unwrap();
            let conn = state.0.get().unwrap();
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
pub async fn semantic_search(
    state: tauri::State<'_, DbState>,
    query: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let req_body = serde_json::json!({
        "model": "nomic-embed-text",
        "prompt": query
    });

    let res = client
        .post("http://localhost:11434/api/embeddings")
        .json(&req_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let query_vector: Vec<f32> =
        serde_json::from_value(json["embedding"].clone()).unwrap_or_default();

    if query_vector.is_empty() {
        return Err("Failed to generate embedding".into());
    }

    let conn = state.0.get().unwrap();
    let mut stmt = conn
        .prepare("SELECT filename, filepath, content, vector FROM file_embeddings")
        .unwrap();

    let rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
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
        if let Ok((filename, filepath, content, vec_str)) = row {
            if let Ok(file_vec) = serde_json::from_str::<Vec<f32>>(&vec_str) {
                let score = cosine_similarity(&query_vector, &file_vec);
                if score > 0.01 {
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

                    // threshold
                    results.push(Match {
                        filename,
                        filepath,
                        content,
                        preview,
                        size,
                        last_modified,
                        score,
                    });
                }
            }
        }
    }

    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
    results.truncate(5); // Top 5 results

    Ok(serde_json::to_value(results).unwrap())
}

#[tauri::command]
pub async fn rag_query(
    app: tauri::AppHandle,
    state: tauri::State<'_, DbState>,
    query: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    // 1. Embed query
    let embed_body = serde_json::json!({ "model": "nomic-embed-text", "prompt": &query });
    let embed_res = client
        .post("http://localhost:11434/api/embeddings")
        .json(&embed_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let embed_json: serde_json::Value = embed_res.json().await.map_err(|e| e.to_string())?;
    let query_vector: Vec<f32> =
        serde_json::from_value(embed_json["embedding"].clone()).unwrap_or_default();

    // 2. Fetch Local Context Blocks
    let mut context_block = String::new();
    if !query_vector.is_empty() {
        struct Match {
            score: f32,
            filepath: String,
            content: String,
        }
        let mut results: Vec<Match> = Vec::new();

        {
            let conn = state.0.get().unwrap();
            let mut stmt = conn
                .prepare("SELECT filepath, content, vector FROM file_embeddings")
                .unwrap();
            let rows = stmt
                .query_map([], |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                    ))
                })
                .unwrap();

            for row in rows {
                if let Ok((filepath, content, vec_str)) = row {
                    if let Ok(file_vec) = serde_json::from_str::<Vec<f32>>(&vec_str) {
                        let score = cosine_similarity(&query_vector, &file_vec);
                        results.push(Match {
                            score,
                            filepath,
                            content,
                        });
                    }
                }
            }
        }

        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        for m in results.iter().take(2) {
            context_block.push_str(&format!(
                "\n--- File context from: {} ---\n{}\n",
                m.filepath, m.content
            ));
        }
    }

    // 3. Create Augmented Knowledge Prompt
    let final_prompt = if context_block.is_empty() {
        format!("Answer the user's question. If the user asks to perform an action (like pushing to git, listing files, or checking sysinfo), suggest a specific powershell command in this EXACT format: [CMD] your_command_here [/CMD]. Otherwise, answer naturally.\n\nQuestion: {}", query)
    } else {
        format!("Answer the user's question using ONLY the provided local file context. If the user asks for a file operation, suggest a command in [CMD] command [/CMD] format.\n\nContext block:{}\n\nQuestion: {}", context_block, query)
    };

    // 4. Generate Semantic Response via Gemma3 (Streaming!)
    let chat_body =
        serde_json::json!({ "model": "gemma4:latest", "prompt": final_prompt, "stream": true });
    let mut res = client
        .post("http://localhost:11434/api/generate")
        .json(&chat_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let mut full_response = String::new();

    while let Some(chunk) = res.chunk().await.map_err(|e| e.to_string())? {
        if let Ok(text) = String::from_utf8(chunk.to_vec()) {
            for line in text.lines() {
                if line.trim().is_empty() {
                    continue;
                }
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                    if let Some(token) = json["response"].as_str() {
                        full_response.push_str(token);
                        let _ = app.emit("llm-token", token);
                    }
                }
            }
        }
    }

    Ok(full_response)
}

#[tauri::command]
pub async fn check_ai_status() -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let res = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    let models = json["models"].as_array().ok_or("Invalid Ollama response")?;
    let has_gemma = models
        .iter()
        .any(|m| m["name"].as_str().unwrap_or("").contains("gemma4:latest"));
    let has_embed = models.iter().any(|m| {
        m["name"]
            .as_str()
            .unwrap_or("")
            .contains("nomic-embed-text")
    });
    let has_vision = models
        .iter()
        .any(|m| m["name"].as_str().unwrap_or("").contains("llava"));

    Ok(serde_json::json!({
        "online": true,
        "gemma3": has_gemma,
        "nomic": has_embed,
        "llava": has_vision,
        "ready": has_gemma && has_embed && has_vision
    }))
}

#[tauri::command]
pub async fn analyze_terminal_error(error_text: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let prompt = format!(
        "You are an expert developer. The user ran a command in their terminal and got this error:\n\n{}\n\nProvide the root cause and a brief suggested terminal command to fix it. If you suggest a command to run, you MUST enclose the exact command in <command> tags, like <command>npm install</command>. Keep your explanation very short.",
        error_text
    );
    
    let body = serde_json::json!({
        "model": "gemma4:latest",
        "prompt": prompt,
        "stream": false
    });

    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let response = json["response"].as_str().unwrap_or("No response").to_string();

    Ok(response)
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
    let client = reqwest::Client::new();
    let prompt = format!("You are a Senior Engineer. Summarize this git diff into a concise, professional 1-line git commit message starting with feat: or fix:. DO NOT include quotes, markdown formatting, or any extra conversational text. Return ONLY the commit string. Diff: {}", diff.chars().take(2000).collect::<String>());

    let chat_body =
        serde_json::json!({ "model": "gemma4:latest", "prompt": prompt, "stream": false });
    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&chat_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    if let Some(response) = json["response"].as_str() {
        Ok(response.to_string())
    } else {
        Err("Failed to parse LLM response for git commit".into())
    }
}

#[tauri::command]
pub async fn execute_cli_directive(
    app: tauri::AppHandle,
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

    let session_id = format!(
        "term-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis()
    );

    let mut command = Command::new("powershell");
    command.args(["-NoProfile", "-NonInteractive", "-Command", &full_cmd])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    if let Some(dir) = cwd {
        command.current_dir(dir);
    }

    let child = command.spawn().map_err(|e| e.to_string())?;

    let app_stdout = app.clone();
    let app_stderr = app.clone();
    let sid_out = session_id.clone();
    let sid_err = session_id.clone();

    let stdout = child.stdout.ok_or("No stdout")?;
    let stderr = child.stderr.ok_or("No stderr")?;

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

    // Wait for both streams to finish in a background thread
    std::thread::spawn(move || {
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
