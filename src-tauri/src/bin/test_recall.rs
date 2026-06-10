use rusqlite::{params, Connection};
use serde_json::json;
use std::fs;

fn main() {
    tauri::async_runtime::block_on(async {
        println!("Starting Project Recall autonomous test...");

        let client = reqwest::Client::new();

        // 1. Prepare dummy visual memory
        let memory_desc = "The user is looking at a highly classified codebase named Project Phoenix which uses a custom Rust quantum framework. It mentions launching in December 2029 because the reactor failed.";
        println!("Embedding memory: {}", memory_desc);

        let embed_body = json!({
            "model": "nomic-embed-text",
            "prompt": memory_desc
        });

        let mut vector_str = String::from("[]");
        if let Ok(res) = client
            .post("http://localhost:11434/api/embeddings")
            .json(&embed_body)
            .send()
            .await
        {
            if let Ok(js) = res.json::<serde_json::Value>().await {
                if let Some(arr) = js["embedding"].as_array() {
                    vector_str = serde_json::to_string(arr).unwrap();
                }
            }
        }

        // 2. Insert into DB
        let conn = Connection::open("oasis_crates.db").unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS photographic_memory (
                id INTEGER PRIMARY KEY,
                timestamp TEXT NOT NULL,
                description TEXT NOT NULL,
                image_base64 TEXT NOT NULL DEFAULT '',
                vector TEXT NOT NULL DEFAULT '[]'
            )",
            [],
        )
        .unwrap();
        let _ = conn.execute(
            "ALTER TABLE photographic_memory ADD COLUMN image_base64 TEXT NOT NULL DEFAULT ''",
            [],
        );
        let _ = conn.execute(
            "ALTER TABLE photographic_memory ADD COLUMN vector TEXT NOT NULL DEFAULT '[]'",
            [],
        );

        let timestamp = chrono::Local::now().to_rfc3339();
        conn.execute(
            "INSERT INTO photographic_memory (timestamp, description, image_base64, vector) VALUES (?1, ?2, ?3, ?4)",
            params![timestamp, memory_desc, "", vector_str],
        ).unwrap();

        println!("Memory successfully injected into Semantic Vault.");

        // 3. Query the memory
        let query =
            "What is the name of the classified codebase I was looking at and when does it launch?";
        println!("Querying Oasis Recall: {}", query);

        // Emulate the RAG search
        let mut context_block = String::new();
        let query_embed_body = json!({ "model": "nomic-embed-text", "prompt": query });
        let query_vector: Vec<f32> = if let Ok(res) = client
            .post("http://localhost:11434/api/embeddings")
            .json(&query_embed_body)
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

        fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
            let dot: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
            let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
            let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
            if norm_a == 0.0 || norm_b == 0.0 {
                0.0
            } else {
                dot / (norm_a * norm_b)
            }
        }

        if !query_vector.is_empty() {
            struct MemMatch {
                ts: String,
                desc: String,
                score: f32,
            }
            let mut results: Vec<MemMatch> = Vec::new();

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
                            let score = cosine_similarity(&query_vector, &file_vec);
                            results.push(MemMatch { ts, desc, score });
                        }
                    }
                }
            }
            results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
            for mem in results.iter().take(20) {
                context_block.push_str(&format!("[{}]: {}\n", mem.ts, mem.desc));
            }
        }

        let prompt = format!("You are Oasis Sentient OS. You have a semantic retrieval of the user's photographic memory over time.\n\nMemory Log:\n{}\n\nUser Question: {}\n\nAnswer the user based strictly on the memory log provided.", context_block, query);

        let body = json!({
            "model": "gemma4:latest",
            "prompt": prompt,
            "stream": false
        });

        if let Ok(res) = client
            .post("http://localhost:11434/api/generate")
            .json(&body)
            .send()
            .await
        {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                if let Some(response) = json["response"].as_str() {
                    println!("Recall Response: {}", response);

                    // 4. Save to test results folder
                    let _ = fs::create_dir_all("../test_results");
                    let output_path = "../test_results/recall_test_result.txt";
                    let output_content = format!(
                        "=== Project Recall Autonomous Test ===\nTimestamp: {}\n\nInjected Memory: {}\n\nUser Query: {}\n\nOasis Response:\n{}",
                        timestamp, memory_desc, query, response
                    );
                    fs::write(output_path, output_content).unwrap();
                    println!("Test results saved to {}", output_path);
                }
            }
        }
    });
}
