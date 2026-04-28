use crate::AppState;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub fn get_neural_logs_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    limit: i32,
) -> Result<Vec<serde_json::Value>, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT id, event_type, message, timestamp FROM neural_logs ORDER BY id DESC LIMIT ?1")
        .map_err(|e| e.to_string())?;
    let rows = stmt.query_map([limit], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, i64>(0)?,
            "type": row.get::<_, String>(1)?,
            "message": row.get::<_, String>(2)?,
            "timestamp": row.get::<_, String>(3)?
        }))
    }).map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for r in rows {
        entries.push(r.unwrap());
    }
    Ok(entries)
}

pub fn delete_pinned_context_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    id: i64,
) -> Result<(), String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    db.execute("DELETE FROM pinned_contexts WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn seek_chronos_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    query: String,
    limit: i32,
) -> Result<Vec<serde_json::Value>, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut results = Vec::new();

    let mut log_stmt = db.prepare(
        "SELECT id, event_type, message, timestamp FROM neural_logs \
         WHERE message LIKE ?1 OR event_type LIKE ?1 \
         ORDER BY id DESC LIMIT ?2"
    ).map_err(|e| e.to_string())?;

    let log_rows = log_stmt.query_map([format!("%{}%", query), limit.to_string()], |row| {
        Ok(serde_json::json!({
            "source": "NEURAL_LOG",
            "id": row.get::<_, i64>(0)?,
            "type": row.get::<_, String>(1)?,
            "message": row.get::<_, String>(2)?,
            "timestamp": row.get::<_, String>(3)?
        }))
    }).map_err(|e| e.to_string())?;

    for r in log_rows {
        results.push(r.unwrap());
    }

    let mut pin_stmt = db.prepare(
        "SELECT id, name, aura_color, timestamp FROM pinned_contexts \
         WHERE name LIKE ?1 \
         ORDER BY id DESC LIMIT ?2"
    ).map_err(|e| e.to_string())?;

    let pin_rows = pin_stmt.query_map([format!("%{}%", query), limit.to_string()], |row| {
        Ok(serde_json::json!({
            "source": "PINNED_CONTEXT",
            "id": row.get::<_, i64>(0)?,
            "title": row.get::<_, String>(1)?,
            "aura": row.get::<_, String>(2)?,
            "timestamp": row.get::<_, String>(3)?
        }))
    }).map_err(|e| e.to_string())?;

    for r in pin_rows {
        results.push(r.unwrap());
    }

    Ok(results)
}

#[allow(dead_code)]
fn _keep_app_state_used(_: &AppState) {}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct AuditRecord {
    pub id: String,
    pub timestamp: i64,
    pub action: String,
    pub category: String,
    pub details: String,
}

#[tauri::command]
pub async fn get_audit_logs(state: tauri::State<'_, AppState>) -> Result<Vec<AuditRecord>, String> {
    let db = state.pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db.prepare("SELECT id, timestamp, action, category, details FROM audit_logs ORDER BY timestamp DESC LIMIT 50").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([], |row| {
        Ok(AuditRecord {
            id: row.get(0)?,
            timestamp: row.get(1)?,
            action: row.get(2)?,
            category: row.get(3)?,
            details: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut logs = Vec::new();
    for r in rows {
        if let Ok(log) = r {
            logs.push(log);
        }
    }
    
    // Seed dummy data if empty for demo purposes
    if logs.is_empty() {
        let now = chrono::Utc::now().timestamp_millis();
        let dummy = vec![
            AuditRecord { id: "log1".into(), timestamp: now - 5000, action: "SENTINEL_LOCK".into(), category: "security".into(), details: "Vault locked due to idle timeout.".into() },
            AuditRecord { id: "log2".into(), timestamp: now - 120000, action: "EXEC_COMMAND".into(), category: "system".into(), details: "Purged zombie process PID 1450".into() },
            AuditRecord { id: "log3".into(), timestamp: now - 360000, action: "INTENT_PARSE".into(), category: "neural".into(), details: "Parsed intent: 'clean workspace'".into() },
        ];
        for d in &dummy {
            let _ = db.execute("INSERT INTO audit_logs (id, timestamp, action, category, details) VALUES (?1, ?2, ?3, ?4, ?5)", rusqlite::params![d.id, d.timestamp, d.action, d.category, d.details]);
        }
        logs = dummy;
    }

    Ok(logs)
}
