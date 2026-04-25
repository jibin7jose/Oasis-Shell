use crate::access::COLLECTIVE_REGISTRY;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub fn build_neural_graph_with_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<serde_json::Value, String> {
    #[derive(serde::Serialize)]
    struct Node {
        id: String,
        group: String,
        val: f32,
    }
    #[derive(serde::Serialize)]
    struct Link {
        source: String,
        target: String,
        value: f32,
    }

    let mut nodes = Vec::new();
    let mut links = Vec::new();
    let mut files_data = Vec::new();

    nodes.push(Node { id: "Oasis Core".into(), group: "core".into(), val: 30.0 });
    nodes.push(Node { id: "Sentinel Vault".into(), group: "vault".into(), val: 20.0 });
    nodes.push(Node { id: "Neural Search".into(), group: "neural".into(), val: 20.0 });
    nodes.push(Node { id: "Market Pulse".into(), group: "growth".into(), val: 20.0 });

    {
        let conn = pool.get().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT filename, vector FROM file_embeddings LIMIT 40")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
            .map_err(|e| e.to_string())?;
        for row in rows.flatten() {
            if let Ok(vec) = serde_json::from_str::<Vec<f32>>(&row.1) {
                files_data.push((row.0.clone(), vec));
                let group = if row.0.ends_with(".ts") || row.0.ends_with(".tsx") {
                    "logic".into()
                } else if row.0.ends_with(".rs") {
                    "kernel".into()
                } else {
                    "file".into()
                };
                nodes.push(Node { id: row.0.clone(), group, val: 10.0 });
            }
        }
    }

    for i in 0..files_data.len() {
        let hub = if files_data[i].0.ends_with(".rs") {
            "Oasis Core"
        } else {
            "Neural Search"
        };
        links.push(Link { source: hub.into(), target: files_data[i].0.clone(), value: 0.8 });

        for j in (i + 1)..files_data.len() {
            let score = cosine_similarity(&files_data[i].1, &files_data[j].1);
            if score > 0.65 {
                links.push(Link { source: files_data[i].0.clone(), target: files_data[j].0.clone(), value: score });
            }
        }
    }

    {
        let registry = COLLECTIVE_REGISTRY.lock().unwrap();
        for peer in registry.values() {
            let group = if peer.status == "Active" { "collective_active" } else { "collective_offline" };
            nodes.push(Node { id: peer.id.clone(), group: group.into(), val: 15.0 });
            links.push(Link { source: "Oasis Core".into(), target: peer.id.clone(), value: 0.5 });
        }
    }

    Ok(serde_json::json!({ "nodes": nodes, "links": links }))
}

pub fn get_neural_brief_from_pool(
    pool: &Pool<SqliteConnectionManager>,
    filename: String,
) -> Result<String, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT content FROM file_embeddings WHERE filename = ? LIMIT 1")
        .map_err(|e| e.to_string())?;
    let content: String = stmt
        .query_row([filename], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    Ok(content)
}

pub fn get_all_files_from_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<serde_json::Value, String> {
    #[derive(serde::Serialize)]
    struct FileEntry {
        id: i32,
        filename: String,
        filepath: String,
        snippet: String,
    }

    let mut entries = Vec::new();
    {
        let conn = pool.get().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT id, filename, filepath, content FROM file_embeddings ORDER BY id DESC LIMIT 100")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, i32>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                ))
            })
            .map_err(|e| e.to_string())?;
        for row in rows.flatten() {
            let snippet = if row.3.len() > 150 {
                row.3[..150].to_string() + "..."
            } else {
                row.3
            };
            entries.push(FileEntry { id: row.0, filename: row.1, filepath: row.2, snippet });
        }
    }

    Ok(serde_json::json!(entries))
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm_a == 0.0 || norm_b == 0.0 { 0.0 } else { dot / (norm_a * norm_b) }
}

#[cfg(test)]
mod tests {
    use super::cosine_similarity;

    #[test]
    fn cosine_similarity_is_self_consistent() {
        let a = vec![1.0, 0.0, 0.0];
        assert!((cosine_similarity(&a, &a) - 1.0).abs() < f32::EPSILON);
    }
}
