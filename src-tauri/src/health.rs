use crate::FiscalReport;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub fn predictive_intents_for_conditions(
    integrity: f32,
    cpu_load: f32,
    vault_locked: bool,
) -> Vec<serde_json::Value> {
    let mut intents = Vec::new();

    if integrity < 70.0 {
        intents.push(serde_json::json!({
            "label": "Neural Venture Stabilization",
            "intent": "stabilize venture integrity",
            "type": "warning"
        }));
    }

    if cpu_load > 60.0 {
        intents.push(serde_json::json!({
            "label": "Strategic Process Culling",
            "intent": "optimize high cpu processes",
            "type": "performance"
        }));
    }

    if vault_locked {
        intents.push(serde_json::json!({
            "label": "Unseal Strategic Vault",
            "intent": "open vault",
            "type": "security"
        }));
    }

    intents.push(serde_json::json!({
        "label": "Context Crate Synthesis",
        "intent": "create context crate",
        "type": "default"
    }));
    intents.push(serde_json::json!({
        "label": "Market Intelligence Sync",
        "intent": "sync market news",
        "type": "growth"
    }));

    intents.into_iter().take(3).collect()
}

pub fn venture_integrity_from_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<f32, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = match db.prepare("SELECT status FROM strategic_pulses ORDER BY id DESC LIMIT 20") {
        Ok(s) => s,
        Err(_) => return Ok(100.0),
    };
    let statuses: Vec<String> = stmt.query_map([], |row| row.get(0)).unwrap().flatten().collect();

    if statuses.is_empty() {
        return Ok(100.0);
    }

    let healthy = statuses.iter().filter(|s| s.as_str() == "emerald").count() as f32;
    Ok((healthy / statuses.len() as f32) * 100.0)
}

pub fn fiscal_report_from_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<FiscalReport, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = match db.prepare("SELECT SUM(cost), SUM(tokens) FROM compute_ledger") {
        Ok(s) => s,
        Err(_) => {
            return Ok(FiscalReport {
                total_burn: 0.0,
                token_load: 0,
                status: "NOMINAL".into(),
            })
        }
    };

    let mut rows = stmt.query([]).unwrap();
    if let Some(row) = rows.next().unwrap() {
        let burn: f32 = row.get(0).unwrap_or(0.0);
        let load: i64 = row.get(1).unwrap_or(0);
        let status = if burn > 10.0 {
            "CRITICAL"
        } else if burn > 5.0 {
            "HIGH"
        } else {
            "OPTIMAL"
        };
        Ok(FiscalReport {
            total_burn: burn,
            token_load: load,
            status: status.into(),
        })
    } else {
        Ok(FiscalReport {
            total_burn: 0.0,
            token_load: 0,
            status: "NOMINAL".into(),
        })
    }
}

pub fn logic_path_for_aura(aura: &str) -> String {
    match aura {
        "dev" => "Native Logic > Cargo Link > Build Cycle > Pulse".into(),
        "design" => "Mesh Logic > Texture Link > GLTF Build > Sync".into(),
        "gaming" => "Stream Logic > Frame Pulse > Latency Sync > Record".into(),
        "research" => "Query Logic > Semantic Link > Vector Search > Archive".into(),
        _ => "Idle Logic > Waiting for Neural Intent".into(),
    }
}

pub fn log_compute_to_pool(
    pool: &Pool<SqliteConnectionManager>,
    tokens: i64,
    cost: f32,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let ts = chrono::Local::now().to_rfc3339();
    let _ = conn.execute(
        "INSERT INTO compute_ledger (tokens, cost, timestamp) VALUES (?1, ?2, ?3)",
        rusqlite::params![tokens, cost, ts],
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{logic_path_for_aura, predictive_intents_for_conditions};

    #[test]
    fn predictive_intents_prioritize_risk_signals() {
        let intents = predictive_intents_for_conditions(60.0, 75.0, true);
        assert_eq!(intents.len(), 3);
        assert_eq!(intents[0]["type"], "warning");
        assert_eq!(intents[1]["type"], "performance");
    }

    #[test]
    fn logic_paths_map_known_auras() {
        assert_eq!(logic_path_for_aura("research"), "Query Logic > Semantic Link > Vector Search > Archive");
        assert_eq!(logic_path_for_aura("unknown"), "Idle Logic > Waiting for Neural Intent");
    }
}
