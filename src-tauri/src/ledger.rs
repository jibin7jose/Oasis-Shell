use crate::{OracleAlert, PinnedContext, RiskScenario};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub fn index_strategic_asset_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    content: String,
    metadata: String,
    vector_json: String,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M").to_string();

    conn.execute(
        "INSERT INTO strategic_memory (content, metadata, vector, timestamp) VALUES (?1, ?2, ?3, ?4)",
        [content, metadata, vector_json, timestamp],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn persist_oracle_alert_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    alert: OracleAlert,
) -> Result<OracleAlert, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let timestamp = chrono::Local::now().to_rfc3339();
    let _ = db.execute(
        "INSERT INTO oracle_predictions (title, divergence_level, timestamp) VALUES (?1, ?2, ?3)",
        rusqlite::params![alert.title, alert.divergence_level, timestamp],
    );

    Ok(alert)
}

pub fn persist_risk_scenario_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    mut sim: RiskScenario,
) -> Result<RiskScenario, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    db.execute(
        "INSERT INTO risk_simulations (scenario, probability, impact_rating, defensive_strategy, associated_venture, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![sim.scenario, sim.probability, sim.impact_rating, sim.defensive_strategy, sim.associated_venture, sim.timestamp],
    )
    .map_err(|e| e.to_string())?;

    let last_id: i32 = db.query_row("SELECT last_insert_rowid()", [], |r| r.get(0)).unwrap_or(0);
    sim.id = Some(last_id);
    Ok(sim)
}

pub fn pin_context_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    name: String,
    state_blob: String,
    aura: String,
) -> Result<i64, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let timestamp = chrono::Local::now().to_rfc3339();
    db.execute(
        "INSERT INTO pinned_contexts (name, state_blob, aura_color, timestamp) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![name, state_blob, aura, timestamp],
    )
    .map_err(|e| e.to_string())?;

    let id: i64 = db.query_row("SELECT last_insert_rowid()", [], |row| row.get(0)).unwrap_or(0);
    Ok(id)
}

pub fn get_pinned_contexts_with_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<Vec<PinnedContext>, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT id, name, state_blob, aura_color, timestamp FROM pinned_contexts ORDER BY id DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| {
        Ok(PinnedContext {
            id: row.get(0)?,
            name: row.get(1)?,
            state_blob: row.get(2)?,
            aura_color: row.get(3)?,
            timestamp: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for r in rows {
        entries.push(r.unwrap());
    }
    Ok(entries)
}
