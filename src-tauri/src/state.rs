use crate::{MarketIntelligence, VentureMetrics, VentureSnapshot};
use std::path::Path;

pub fn save_venture_state_to_path(
    metrics: &VentureMetrics,
    path: &Path,
) -> Result<String, String> {
    let data = serde_json::to_string(metrics).map_err(|e| e.to_string())?;
    std::fs::write(path, data).map_err(|e| e.to_string())?;
    Ok("Venture State Persisted to Neural Ledger.".into())
}

pub fn load_venture_state_from_path(path: &Path) -> Result<VentureMetrics, String> {
    if path.exists() {
        let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        let metrics: VentureMetrics = serde_json::from_str(&data).map_err(|e| e.to_string())?;
        Ok(metrics)
    } else {
        Ok(VentureMetrics {
            arr: "N/A".into(),
            burn: "N/A".into(),
            runway: "N/A".into(),
            momentum: "Awaiting Sync".into(),
            stress_color: "#94a3b8".into(),
        })
    }
}

pub fn create_chronos_snapshot_to_path(
    metrics: VentureMetrics,
    market: MarketIntelligence,
    path: &Path,
) -> Result<String, String> {
    let mut snapshots = if path.exists() {
        let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        serde_json::from_str::<Vec<VentureSnapshot>>(&data).unwrap_or_default()
    } else {
        Vec::new()
    };

    snapshots.push(VentureSnapshot {
        id: format!("S_{}", snapshots.len()),
        name: "Chronos Snapshot".to_string(),
        timestamp: chrono::Local::now().to_rfc3339(),
        metrics,
        market,
        dominance_index: 85.0,
    });

    let data = serde_json::to_string(&snapshots).map_err(|e| e.to_string())?;
    std::fs::write(path, data).map_err(|e| e.to_string())?;
    Ok("Chronos Snapshot Etched to Neural Ledger.".into())
}

pub fn get_chronos_ledger_from_path(path: &Path) -> Result<Vec<VentureSnapshot>, String> {
    if path.exists() {
        let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        Ok(serde_json::from_str(&data).unwrap_or_default())
    } else {
        Ok(Vec::new())
    }
}
