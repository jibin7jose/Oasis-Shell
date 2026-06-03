use crate::models::{DbState, MemoryEntry};
use base64::{engine::general_purpose, Engine as _};
use screenshots::image::ImageFormat;
use screenshots::Screen;
use std::io::Cursor;
use rusqlite::Connection;
use rusqlite::params;

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

                            // Use LLaVA to summarize the screen
                            let client = reqwest::blocking::Client::new();
                            let body = serde_json::json!({
                                "model": "llava:latest",
                                "prompt": "Briefly describe what the user is doing on their screen right now in 1 sentence. Focus on apps, code, or context.",
                                "images": [base64_img],
                                "stream": false
                            });

                            if let Ok(res) = client
                                .post("http://localhost:11434/api/generate")
                                .json(&body)
                                .send()
                            {
                                if let Ok(json) = res.json::<serde_json::Value>() {
                                    if let Some(desc) = json["response"].as_str() {
                                        // Save to vector database (for simple history MVP, we just use sqlite)
                                        if let Ok(conn) = Connection::open("oasis_crates.db") {
                                            let _ = conn.execute(
                                                "CREATE TABLE IF NOT EXISTS photographic_memory (
                                                    id INTEGER PRIMARY KEY,
                                                    timestamp TEXT NOT NULL,
                                                    description TEXT NOT NULL
                                                )",
                                                [],
                                            );
                                            let _ = conn.execute(
                                                "INSERT INTO photographic_memory (timestamp, description) VALUES (?1, ?2)",
                                                params![timestamp, desc],
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
pub async fn query_photographic_memory(query: String) -> Result<String, String> {
    let mut context_block = String::new();
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

    if context_block.is_empty() {
        return Ok("No photographic memory context available yet.".into());
    }

    let prompt = format!("You are Oasis Sentient OS. You have photographic memory of what the user has been doing on their screen over the last few hours.\n\nMemory Log:\n{}\n\nUser Question: {}\n\nAnswer the user based strictly on the memory log provided.", context_block, query);

    let client = reqwest::Client::new();
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
            "SELECT id, timestamp, description FROM photographic_memory ORDER BY id DESC LIMIT 50",
        ) {
            if let Ok(rows) = stmt.query_map([], |row| {
                Ok(MemoryEntry {
                    id: row.get(0)?,
                    timestamp: row.get(1)?,
                    description: row.get(2)?,
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
