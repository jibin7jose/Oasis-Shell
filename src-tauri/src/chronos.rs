use crate::{ChronosSnapshot, MarketIntelligence, VentureMetrics};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use std::sync::Mutex;

#[allow(dead_code)]
static CHRONOS_BUFFER: Mutex<Vec<ChronosSnapshot>> = Mutex::new(Vec::new());

pub fn chronos_snapshot_from_row(timestamp: String, data_str: String, integrity: f32) -> ChronosSnapshot {
    let data: serde_json::Value = serde_json::from_str(&data_str).unwrap_or_default();
    ChronosSnapshot {
        timestamp,
        nodes: data["nodes"].as_array().cloned().unwrap_or_default(),
        links: data["links"].as_array().cloned().unwrap_or_default(),
        metrics: serde_json::from_value(data["metrics"].clone()).ok(),
        market: serde_json::from_value(data["market"].clone()).ok(),
        windows: data["windows"].as_array().cloned().unwrap_or_default(),
        integrity,
        entropy_index: 0.0,
    }
}

pub fn capture_chronos_snapshot_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    nodes: Vec<serde_json::Value>,
    links: Vec<serde_json::Value>,
    metrics: Option<VentureMetrics>,
    market: Option<MarketIntelligence>,
    windows: Vec<serde_json::Value>,
    integrity: f32,
) -> Result<String, String> {
    let timestamp = chrono::Local::now().to_rfc3339();
    let snapshot_data = serde_json::json!({
        "nodes": nodes,
        "links": links,
        "metrics": metrics,
        "market": market,
        "windows": windows,
        "integrity": integrity,
    });

    let json_str = serde_json::to_string(&snapshot_data).map_err(|e| e.to_string())?;

    let db = pool.get().map_err(|e| e.to_string())?;
    db.execute(
        "INSERT INTO chronos_history (timestamp, data, integrity) VALUES (?1, ?2, ?3)",
        rusqlite::params![timestamp, json_str, integrity],
    )
    .map_err(|e| e.to_string())?;

    let _ = db.execute(
        "DELETE FROM chronos_history WHERE id NOT IN (SELECT id FROM chronos_history ORDER BY id DESC LIMIT 100)",
        [],
    );

    Ok("Chronos State Archival Complete (Native).".into())
}

pub fn seek_chronos_history_with_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<Vec<ChronosSnapshot>, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT timestamp, data, integrity FROM chronos_history ORDER BY id DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            let timestamp: String = row.get(0)?;
            let data_str: String = row.get(1)?;
            let integrity: f32 = row.get(2)?;

            Ok(chronos_snapshot_from_row(timestamp, data_str, integrity))
        })
        .map_err(|e| e.to_string())?;

    let mut history = Vec::new();
    for r in rows {
        if let Ok(snap) = r {
            history.push(snap);
        }
    }

    Ok(history)
}
