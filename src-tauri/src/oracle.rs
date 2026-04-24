use crate::{persist_oracle_alert_with_pool, OracleAlert};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

pub fn trigger_oracle_audit_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    arr: f32,
    burn: f32,
) -> Result<OracleAlert, String> {
    let monthly_rev = arr / 12.0;
    let net_burn = (burn - monthly_rev).max(0.1);
    let runway = 24.0 / net_burn;

    let alert = if runway < 6.0 {
        OracleAlert {
            title: "CRITICAL RUNWAY DEPLETION".into(),
            body: format!(
                "Current cash burn rate predicts total bankruptcy in {:.1} months. Emergency Pivot Manifest required.",
                runway
            ),
            divergence_level: "High Risk".into(),
            economic_signal: "Market Beta Sector: RECOVERY FOCUS".into(),
        }
    } else {
        OracleAlert {
            title: "STRATEGIC EQUILIBRIUM".into(),
            body: format!(
                "Venture stability confirmed with {:.1} months of runway. Scaling directives optimal.",
                runway
            ),
            divergence_level: "Minimal".into(),
            economic_signal: "Market Beta Sector: GROWTH FOCUS".into(),
        }
    };

    persist_oracle_alert_with_pool(pool, alert)
}

pub fn get_system_resilience_audit_with_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<serde_json::Value, String> {
    let db = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = db
        .prepare("SELECT title, divergence_level, timestamp FROM oracle_predictions ORDER BY id DESC LIMIT 50")
        .map_err(|e| e.to_string())?;
    let predictions: Vec<serde_json::Value> = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "title": row.get::<_, String>(0)?,
                "level": row.get::<_, String>(1)?,
                "timestamp": row.get::<_, String>(2)?
            }))
        })
        .map_err(|e| e.to_string())?
        .flatten()
        .collect();

    let mut stmt = db
        .prepare("SELECT timestamp, integrity FROM chronos_history ORDER BY id DESC LIMIT 50")
        .map_err(|e| e.to_string())?;
    let history: Vec<serde_json::Value> = stmt
        .query_map([], |row| {
            Ok(serde_json::json!({
                "timestamp": row.get::<_, String>(0)?,
                "integrity": row.get::<_, f32>(1)?
            }))
        })
        .map_err(|e| e.to_string())?
        .flatten()
        .collect();

    let total_risks = predictions.iter().filter(|p| p["level"] != "Minimal").count();
    let mitigated = if total_risks == 0 {
        0
    } else {
        history
            .iter()
            .filter(|h| h["integrity"].as_f64().unwrap_or(0.0) > 90.0)
            .count()
            .min(total_risks)
    };

    let score = if total_risks == 0 {
        100.0
    } else {
        (mitigated as f32 / total_risks as f32) * 100.0
    };

    Ok(serde_json::json!({
        "score": score,
        "predictions_count": predictions.len(),
        "mitigated_count": mitigated,
        "history": history,
        "recent_predictions": predictions.iter().take(5).collect::<Vec<_>>()
    }))
}
