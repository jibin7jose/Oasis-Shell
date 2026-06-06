use crate::models::DbState;
use tauri::Emitter;

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

    let conn = state.0.lock().unwrap();
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
                if score > 0.3 {
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
            let conn = state.0.lock().unwrap();
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
                        if score > 0.3 {
                            results.push(Match {
                                score,
                                filepath,
                                content,
                            });
                        }
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

#[derive(serde::Deserialize)]
pub struct CliDirective {
    pub cmd: String,
    pub args: Vec<String>,
}

#[tauri::command]
pub fn execute_cli_directive(directive: CliDirective, stress_color: Option<String>) -> Result<serde_json::Value, String> {
    let mut command_str = directive.cmd.clone();
    for arg in directive.args {
        command_str.push_str(" ");
        command_str.push_str(&arg);
    }

    let output = std::process::Command::new("powershell")
        .args(["-Command", &command_str])
        .output()
        .map_err(|e| e.to_string())?;

    let res_text = if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        if stdout.trim().is_empty() {
            "Command executed successfully (no output).".into()
        } else {
            stdout
        }
    } else {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    };

    Ok(serde_json::json!({
        "output": res_text
    }))
}
