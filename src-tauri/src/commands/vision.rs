use crate::models::{DbState, MemoryEntry};
use base64::{engine::general_purpose, Engine as _};
use rusqlite::params;
use rusqlite::Connection;
use screenshots::image::ImageFormat;
use screenshots::Screen;
use std::io::Cursor;

#[tauri::command]
pub async fn capture_screenshot() -> Result<String, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;
    if let Some(screen) = screens.first() {
        let image = screen.capture().map_err(|e| e.to_string())?;
        let mut buffer = Cursor::new(Vec::new());
        // Use PNG for high fidelity visual reasoning
        image
            .write_to(&mut buffer, ImageFormat::Png)
            .map_err(|e| e.to_string())?;
        Ok(general_purpose::STANDARD.encode(buffer.get_ref()))
    } else {
        Err("No screen found".to_string())
    }
}

#[tauri::command]
pub async fn query_vision(image_base64: String, prompt: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "model": "llava:latest",
        "prompt": prompt,
        "images": [image_base64],
        "stream": false
    });

    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    if let Some(response) = json["response"].as_str() {
        Ok(response.to_string())
    } else {
        Err("Failed to parse LLaVA response".into())
    }
}

#[tauri::command]
pub fn start_photographic_memory(_state: tauri::State<'_, DbState>) -> Result<(), String> {
    std::thread::spawn(move || {
        loop {
            std::thread::sleep(std::time::Duration::from_secs(60)); // Snapshot every 60 seconds

            if let Ok(screens) = Screen::all() {
                if let Some(screen) = screens.first() {
                    if let Ok(image) = screen.capture() {
                        let mut buffer = Cursor::new(Vec::new());
                        if image.write_to(&mut buffer, ImageFormat::Png).is_ok() {
                            let base64_img = general_purpose::STANDARD.encode(buffer.get_ref());
                            let timestamp = chrono::Local::now().to_rfc3339();

                            let mut desc = String::from("[Omniscient Vision Engine Offline] Visual Context Snapshot Saved. Install Ollama + LLaVA to enable intelligent image indexing.");

                            let client = reqwest::blocking::Client::new();
                            let body = serde_json::json!({
                                "model": "llava:latest",
                                "prompt": "Briefly describe what the user is doing on their screen right now in 1 sentence. Focus on apps, code, or context.",
                                "images": [base64_img.clone()],
                                "stream": false
                            });

                            if let Ok(res) = client
                                .post("http://localhost:11434/api/generate")
                                .json(&body)
                                .timeout(std::time::Duration::from_secs(15))
                                .send()
                            {
                                if let Ok(json) = res.json::<serde_json::Value>() {
                                    if let Some(res_str) = json["response"].as_str() {
                                        desc = res_str.to_string();
                                    }
                                }
                            }

                            // Save to vector database (for simple history MVP, we just use sqlite)
                            if let Ok(conn) = Connection::open("oasis_crates.db") {
                                let _ = conn.execute(
                                    "CREATE TABLE IF NOT EXISTS photographic_memory (
                                        id INTEGER PRIMARY KEY,
                                        timestamp TEXT NOT NULL,
                                        description TEXT NOT NULL,
                                        image_base64 TEXT NOT NULL DEFAULT '',
                                        vector TEXT NOT NULL DEFAULT '[]'
                                    )",
                                    [],
                                );
                                // Safe migration: add columns if they don't exist
                                let _ = conn.execute("ALTER TABLE photographic_memory ADD COLUMN image_base64 TEXT NOT NULL DEFAULT ''", []);
                                let _ = conn.execute("ALTER TABLE photographic_memory ADD COLUMN vector TEXT NOT NULL DEFAULT '[]'", []);

                                // Vectorize the description
                                let mut vector_str = String::from("[]");
                                let embed_body = serde_json::json!({
                                    "model": "nomic-embed-text",
                                    "prompt": desc
                                });
                                if let Ok(res) = client
                                    .post("http://localhost:11434/api/embeddings")
                                    .json(&embed_body)
                                    .send()
                                {
                                    if let Ok(json) = res.json::<serde_json::Value>() {
                                        if let Some(embedding) = json["embedding"].as_array() {
                                            vector_str = serde_json::to_string(embedding)
                                                .unwrap_or_else(|_| "[]".into());
                                        }
                                    }
                                }

                                let _ = conn.execute(
                                    "INSERT INTO photographic_memory (timestamp, description, image_base64, vector) VALUES (?1, ?2, ?3, ?4)",
                                    params![timestamp, desc, base64_img, vector_str],
                                );
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
pub async fn query_photographic_memory(query: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut context_block = String::new();

    // 1. Embed query
    let embed_body = serde_json::json!({ "model": "nomic-embed-text", "prompt": &query });
    let query_vector: Vec<f32> = if let Ok(res) = client
        .post("http://localhost:11434/api/embeddings")
        .json(&embed_body)
        .send()
        .await
    {
        if let Ok(json) = res.json::<serde_json::Value>().await {
            serde_json::from_value(json["embedding"].clone()).unwrap_or_default()
        } else {
            vec![]
        }
    } else {
        vec![]
    };

    if !query_vector.is_empty() {
        struct MemMatch {
            ts: String,
            desc: String,
            score: f32,
        }
        let mut results: Vec<MemMatch> = Vec::new();

        if let Ok(conn) = Connection::open("oasis_crates.db") {
            if let Ok(mut stmt) =
                conn.prepare("SELECT timestamp, description, vector FROM photographic_memory")
            {
                if let Ok(rows) = stmt.query_map([], |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                    ))
                }) {
                    for row in rows.flatten() {
                        let (ts, desc, vec_str) = row;
                        if let Ok(file_vec) = serde_json::from_str::<Vec<f32>>(&vec_str) {
                            let score =
                                crate::commands::ai::cosine_similarity(&query_vector, &file_vec);
                            results.push(MemMatch { ts, desc, score });
                        }
                    }
                }
            }
        }
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
        for mem in results.iter().take(20) {
            context_block.push_str(&format!("[{}]: {}\n", mem.ts, mem.desc));
        }
    } else {
        // Fallback to latest 20
        if let Ok(conn) = Connection::open("oasis_crates.db") {
            if let Ok(mut stmt) = conn.prepare(
                "SELECT timestamp, description FROM photographic_memory ORDER BY id DESC LIMIT 20",
            ) {
                if let Ok(rows) = stmt.query_map([], |row| {
                    let ts: String = row.get(0)?;
                    let desc: String = row.get(1)?;
                    Ok(format!("[{}]: {}", ts, desc))
                }) {
                    for row in rows.flatten() {
                        context_block.push_str(&row);
                        context_block.push('\n');
                    }
                }
            }
        }
    }

    if context_block.is_empty() {
        return Ok("No photographic memory context available yet.".into());
    }

    let prompt = format!("You are Oasis Sentient OS. You have a semantic retrieval of the user's photographic memory over time.\n\nMemory Log:\n{}\n\nUser Question: {}\n\nAnswer the user based strictly on the memory log provided. If the memory log is empty or irrelevant, say so.", context_block, query);

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
    if let Some(response) = json["response"].as_str() {
        Ok(response.to_string())
    } else {
        Err("Failed to query photographic memory".into())
    }
}

#[tauri::command]
pub async fn get_all_photographic_memories() -> Result<Vec<MemoryEntry>, String> {
    let mut memories = Vec::new();
    if let Ok(conn) = Connection::open("oasis_crates.db") {
        if let Ok(mut stmt) = conn.prepare(
            "SELECT id, timestamp, description, image_base64 FROM photographic_memory ORDER BY id DESC LIMIT 50",
        ) {
            if let Ok(rows) = stmt.query_map([], |row| {
                Ok(MemoryEntry {
                    id: row.get(0)?,
                    timestamp: row.get(1)?,
                    description: row.get(2)?,
                    image_base64: row.get(3)?,
                })
            }) {
                for row in rows.flatten() {
                    memories.push(row);
                }
            }
        }
    }
    Ok(memories)
}
