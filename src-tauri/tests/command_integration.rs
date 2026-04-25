use oasis_shell_lib::{
    capture_chronos_snapshot_with_pool,
    chronos_snapshot_from_row,
    create_chronos_snapshot_to_path,
    build_neural_graph_with_pool,
    get_all_files_from_pool,
    get_neural_brief_from_pool,
    index_strategic_asset_with_pool,
    persist_oracle_alert_with_pool,
    get_system_resilience_audit_with_pool,
    persist_risk_scenario_with_pool,
    get_chronos_ledger_from_path,
    load_venture_state_from_path,
    save_venture_state_to_path,
    trigger_oracle_audit_with_pool,
    receive_neural_mirror_with_pool,
    ContextCrate,
    MirrorPayload,
    get_pinned_contexts_with_pool,
    get_neural_logs_with_pool,
    delete_pinned_context_with_pool,
    pin_context_with_pool,
    seek_chronos_history_with_pool,
    seek_chronos_with_pool,
    system::normalize_process_priority,
    VentureMetrics,
    VentureSnapshot,
    MarketIntelligence,
    vault::{
        vault_get_secret_with_pool,
        vault_list_secrets_with_pool,
        vault_store_secret_with_pool,
    },
    AppState,
    OasisConfig,
};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use uuid::Uuid;

fn make_state() -> AppState {
    let db_path = std::env::temp_dir().join(format!("oasis-shell-integration-{}.db", Uuid::new_v4()));
    let manager = SqliteConnectionManager::file(&db_path);
    let pool = Pool::new(manager).expect("pool");

    {
        let db = pool.get().expect("conn");
        db.execute(
            "CREATE TABLE IF NOT EXISTS system_secrets (name TEXT PRIMARY KEY, secret_blob BLOB NOT NULL, nonce BLOB NOT NULL, salt BLOB NOT NULL, timestamp TEXT NOT NULL)",
            [],
        )
        .expect("schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS chronos_history (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT NOT NULL, data TEXT NOT NULL, integrity REAL NOT NULL)",
            [],
        )
        .expect("chronos schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS context_crates (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, aura_color TEXT, apps TEXT, timestamp TEXT, integrity INTEGER, arr REAL, burn REAL, status TEXT)",
            [],
        )
        .expect("context crates schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS pinned_contexts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, state_blob TEXT NOT NULL, aura_color TEXT NOT NULL, timestamp TEXT NOT NULL)",
            [],
        )
        .expect("pinned contexts schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS neural_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, event_type TEXT NOT NULL, message TEXT NOT NULL, timestamp TEXT NOT NULL)",
            [],
        )
        .expect("neural logs schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS strategic_memory (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, metadata TEXT NOT NULL, vector TEXT NOT NULL, timestamp TEXT NOT NULL)",
            [],
        )
        .expect("strategic memory schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS file_embeddings (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, filepath TEXT NOT NULL, content TEXT NOT NULL, vector TEXT NOT NULL)",
            [],
        )
        .expect("file embeddings schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS oracle_predictions (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, divergence_level TEXT NOT NULL, timestamp TEXT NOT NULL)",
            [],
        )
        .expect("oracle predictions schema");
        db.execute(
            "CREATE TABLE IF NOT EXISTS risk_simulations (id INTEGER PRIMARY KEY AUTOINCREMENT, scenario TEXT NOT NULL, probability REAL NOT NULL, impact_rating TEXT NOT NULL, defensive_strategy TEXT NOT NULL, associated_venture TEXT NOT NULL, timestamp TEXT NOT NULL)",
            [],
        )
        .expect("risk simulations schema");
    }

    AppState {
        pool,
        config: OasisConfig {
            ollama_url: "http://localhost:11434".into(),
            broadcast_port: 4040,
            neural_engine_endpoint: "http://localhost:11434".into(),
        },
    }
}

#[test]
fn app_state_supports_vault_round_trip() {
    let state = make_state();

    vault_store_secret_with_pool(
        &state.pool,
        "COMMAND_KEY".into(),
        "integration-secret".into(),
        "MASTER".into(),
    )
    .expect("store");

    let listed = vault_list_secrets_with_pool(&state.pool).expect("list");
    assert_eq!(listed, vec!["COMMAND_KEY".to_string()]);

    let value = vault_get_secret_with_pool(&state.pool, "COMMAND_KEY".into(), "MASTER".into()).expect("get");
    assert_eq!(value, "integration-secret");
}

#[test]
fn process_priority_aliases_normalize_like_the_command_path() {
    assert_eq!(normalize_process_priority("idle"), "Idle");
    assert_eq!(normalize_process_priority("below"), "BelowNormal");
    assert_eq!(normalize_process_priority("above_normal"), "AboveNormal");
    assert_eq!(normalize_process_priority("realtime"), "RealTime");
}

#[test]
fn chronos_snapshot_parser_preserves_core_payload_fields() {
    let snapshot = chronos_snapshot_from_row(
        "2026-04-24T22:00:00Z".into(),
        serde_json::json!({
            "nodes": [{"id": "n1"}],
            "links": [{"id": "l1"}],
            "metrics": {"arr": "1", "burn": "2", "runway": "3", "momentum": "4", "stress_color": "#fff"},
            "market": {"market_index": 1.0, "index_change": "+1%", "ai_ticker": []},
            "windows": [{"title": "Main"}]
        })
        .to_string(),
        87.5,
    );

    assert_eq!(snapshot.timestamp, "2026-04-24T22:00:00Z");
    assert_eq!(snapshot.nodes.len(), 1);
    assert_eq!(snapshot.links.len(), 1);
    assert_eq!(snapshot.windows.len(), 1);
    assert_eq!(snapshot.integrity, 87.5);
}

#[test]
fn chronos_capture_and_seek_round_trip_through_sqlite() {
    let state = make_state();

    let status = capture_chronos_snapshot_with_pool(
        &state.pool,
        vec![serde_json::json!({ "id": "n1", "label": "Node 1" })],
        vec![serde_json::json!({ "id": "l1", "source": "n1", "target": "n2" })],
        None,
        None,
        vec![serde_json::json!({ "title": "Main" })],
        91.25,
    )
    .expect("capture");
    assert_eq!(status, "Chronos State Archival Complete (Native).");

    let history = seek_chronos_history_with_pool(&state.pool).expect("seek");
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].nodes.len(), 1);
    assert_eq!(history[0].links.len(), 1);
    assert_eq!(history[0].windows.len(), 1);
    assert_eq!(history[0].integrity, 91.25);
}

#[test]
fn neural_mirror_persists_context_crates_through_sqlite() {
    let state = make_state();
    let payload = MirrorPayload {
        venture: VentureSnapshot {
            id: "venture-7".into(),
            name: "Apollo".into(),
            timestamp: "2026-04-24T22:00:00Z".into(),
            metrics: VentureMetrics {
                arr: "120k".into(),
                burn: "18k".into(),
                runway: "6m".into(),
                momentum: "strong".into(),
                stress_color: "#00ff88".into(),
            },
            market: MarketIntelligence {
                sentiment: "bullish".into(),
                index_change: "+1.5%".into(),
                sectors_active: vec!["core".into(), "growth".into()],
                market_index: 2.4,
                sector_divergence: 0.7,
            },
            dominance_index: 88.0,
        },
        crates: vec![ContextCrate {
            id: None,
            name: "Apollo Crate".into(),
            description: "Mirrored context for integration coverage".into(),
            aura_color: "#112233".into(),
            apps: "[\"shell\"]".into(),
            timestamp: "2026-04-24T22:00:00Z".into(),
            integrity: 93,
            arr: 12.5,
            burn: 4.2,
            status: "Queued".into(),
        }],
        signature: "OASIS_FOUNDER_SIG_V1".into(),
    };

    let message = receive_neural_mirror_with_pool(&state.pool, payload).expect("mirror");
    assert!(message.contains("Apollo"));

    let db = state.pool.get().expect("conn");
    let stored_status: String = db
        .query_row(
            "SELECT status FROM context_crates WHERE name = ?1",
            ["Apollo Crate"],
            |row| row.get(0),
        )
        .expect("mirror row");

    assert_eq!(stored_status, "Mirrored");
}

#[test]
fn neural_mirror_rejects_invalid_signature_without_persisting_rows() {
    let state = make_state();
    let payload = MirrorPayload {
        venture: VentureSnapshot {
            id: "venture-8".into(),
            name: "Orion".into(),
            timestamp: "2026-04-24T22:00:00Z".into(),
            metrics: VentureMetrics {
                arr: "90k".into(),
                burn: "14k".into(),
                runway: "5m".into(),
                momentum: "steady".into(),
                stress_color: "#ffaa00".into(),
            },
            market: MarketIntelligence {
                sentiment: "neutral".into(),
                index_change: "0.0%".into(),
                sectors_active: vec!["ops".into()],
                market_index: 1.2,
                sector_divergence: 0.3,
            },
            dominance_index: 64.0,
        },
        crates: vec![ContextCrate {
            id: None,
            name: "Rejected Crate".into(),
            description: "Should not be mirrored".into(),
            aura_color: "#445566".into(),
            apps: "[\"console\"]".into(),
            timestamp: "2026-04-24T22:00:00Z".into(),
            integrity: 71,
            arr: 8.0,
            burn: 3.0,
            status: "Queued".into(),
        }],
        signature: "INVALID_SIGNATURE".into(),
    };

    let err = receive_neural_mirror_with_pool(&state.pool, payload).expect_err("mirror should fail");
    assert_eq!(err, "Neural Signature Mismatch: Mirror handshake rejected.");

    let db = state.pool.get().expect("conn");
    let count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM context_crates WHERE name = ?1",
            ["Rejected Crate"],
            |row| row.get(0),
        )
        .expect("count");

    assert_eq!(count, 0);
}

#[test]
fn pinned_context_round_trip_through_sqlite() {
    let state = make_state();
    let id = pin_context_with_pool(
        &state.pool,
        "Command Palette".into(),
        r#"{"tab":"search"}"#.into(),
        "#abcdef".into(),
    )
    .expect("pin");
    assert!(id > 0);

    let entries = get_pinned_contexts_with_pool(&state.pool).expect("get");
    assert_eq!(entries.len(), 1);
    assert_eq!(entries[0].name, "Command Palette");
    assert_eq!(entries[0].state_blob, r#"{"tab":"search"}"#);
    assert_eq!(entries[0].aura_color, "#abcdef");
}

#[test]
fn strategic_memory_indexes_directly_into_sqlite() {
    let state = make_state();
    index_strategic_asset_with_pool(
        &state.pool,
        "Airtight plan".into(),
        r#"{"source":"integration"}"#.into(),
        serde_json::json!([0.2, 0.4, 0.6]).to_string(),
    )
    .expect("index");

    let db = state.pool.get().expect("conn");
    let row: (String, String, String) = db
        .query_row(
            "SELECT content, metadata, vector FROM strategic_memory WHERE content = ?1",
            ["Airtight plan"],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .expect("row");

    assert_eq!(row.0, "Airtight plan");
    assert_eq!(row.1, r#"{"source":"integration"}"#);
    assert_eq!(row.2, serde_json::json!([0.2, 0.4, 0.6]).to_string());
}

#[test]
fn oracle_alert_persists_directly_into_sqlite() {
    let state = make_state();
    let alert = oasis_shell_lib::OracleAlert {
        title: "CRITICAL RUNWAY DEPLETION".into(),
        body: "Direct helper coverage".into(),
        divergence_level: "High Risk".into(),
        economic_signal: "Market Beta Sector: RECOVERY FOCUS".into(),
    };

    let returned = persist_oracle_alert_with_pool(&state.pool, alert).expect("persist");
    assert_eq!(returned.title, "CRITICAL RUNWAY DEPLETION");

    let db = state.pool.get().expect("conn");
    let row: (String, String) = db
        .query_row(
            "SELECT title, divergence_level FROM oracle_predictions WHERE title = ?1",
            ["CRITICAL RUNWAY DEPLETION"],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("row");

    assert_eq!(row.0, "CRITICAL RUNWAY DEPLETION");
    assert_eq!(row.1, "High Risk");
}

#[test]
fn neural_log_search_and_pinned_context_search_share_the_same_store() {
    let state = make_state();
    {
        let db = state.pool.get().expect("conn");
        db.execute(
            "INSERT INTO neural_logs (event_type, message, timestamp) VALUES (?1, ?2, ?3)",
            rusqlite::params!["Network", "Apollo handshake established", "2026-04-24T22:00:00Z"],
        )
        .expect("log insert");
        db.execute(
            "INSERT INTO pinned_contexts (name, state_blob, aura_color, timestamp) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params!["Apollo Pin", "{}", "#123456", "2026-04-24T22:00:00Z"],
        )
        .expect("pin insert");
    }

    let logs = get_neural_logs_with_pool(&state.pool, 10).expect("logs");
    assert_eq!(logs.len(), 1);
    assert_eq!(logs[0]["type"], "Network");

    let results = seek_chronos_with_pool(&state.pool, "Apollo".into(), 10).expect("seek");
    let sources: Vec<String> = results
        .iter()
        .map(|row| row["source"].as_str().unwrap_or("").to_string())
        .collect();

    assert!(sources.contains(&"NEURAL_LOG".to_string()));
    assert!(sources.contains(&"PINNED_CONTEXT".to_string()));
}

#[test]
fn delete_pinned_context_removes_the_row() {
    let state = make_state();
    let id = pin_context_with_pool(
        &state.pool,
        "Temp Pin".into(),
        "{}".into(),
        "#00aaff".into(),
    )
    .expect("pin");

    delete_pinned_context_with_pool(&state.pool, id).expect("delete");
    let entries = get_pinned_contexts_with_pool(&state.pool).expect("get");
    assert!(entries.is_empty());
}

#[test]
fn risk_scenario_persists_directly_into_sqlite() {
    let state = make_state();
    let scenario = oasis_shell_lib::RiskScenario {
        id: None,
        scenario: "Supply chain collapse triggers a vendor outage".into(),
        probability: 0.74,
        impact_rating: "SEVERE".into(),
        defensive_strategy: "Diversify suppliers and pre-stage fallbacks".into(),
        associated_venture: "Atlas".into(),
        timestamp: "2026-04-24T22:00:00Z".into(),
    };

    let persisted = persist_risk_scenario_with_pool(&state.pool, scenario).expect("persist");
    assert!(persisted.id.is_some());

    let db = state.pool.get().expect("conn");
    let row: (String, f32, String) = db
        .query_row(
            "SELECT scenario, probability, impact_rating FROM risk_simulations WHERE associated_venture = ?1",
            ["Atlas"],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .expect("row");

    assert_eq!(row.0, "Supply chain collapse triggers a vendor outage");
    assert_eq!(row.1, 0.74);
    assert_eq!(row.2, "SEVERE");
}

#[test]
fn trigger_oracle_audit_persists_generated_alert() {
    let state = make_state();
    let alert = trigger_oracle_audit_with_pool(&state.pool, 1200.0, 10.0).expect("audit");
    assert_eq!(alert.title, "STRATEGIC EQUILIBRIUM");

    let db = state.pool.get().expect("conn");
    let row: (String, String) = db
        .query_row(
            "SELECT title, divergence_level FROM oracle_predictions WHERE title = ?1",
            ["STRATEGIC EQUILIBRIUM"],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .expect("row");

    assert_eq!(row.0, "STRATEGIC EQUILIBRIUM");
    assert_eq!(row.1, "Minimal");
}

#[test]
fn system_resilience_audit_scores_oracle_and_chronos_history() {
    let state = make_state();
    {
        let db = state.pool.get().expect("conn");
        db.execute(
            "INSERT INTO oracle_predictions (title, divergence_level, timestamp) VALUES (?1, ?2, ?3)",
            rusqlite::params!["High Risk Event", "High Risk", "2026-04-24T22:00:00Z"],
        )
        .expect("oracle insert");
        db.execute(
            "INSERT INTO chronos_history (timestamp, data, integrity) VALUES (?1, ?2, ?3)",
            rusqlite::params!["2026-04-24T22:30:00Z", "{}", 94.0_f32],
        )
        .expect("chronos insert");
    }

    let audit = get_system_resilience_audit_with_pool(&state.pool).expect("audit");
    assert_eq!(audit["predictions_count"], 1);
    assert_eq!(audit["mitigated_count"], 1);
    assert_eq!(audit["score"], serde_json::json!(100.0));
}

#[test]
fn venture_state_and_chronos_files_round_trip_through_temp_paths() {
    let temp_dir = std::env::temp_dir().join(format!("oasis-shell-state-{}", Uuid::new_v4()));
    std::fs::create_dir_all(&temp_dir).expect("temp dir");
    let state_path = temp_dir.join("foundry_state.json");
    let ledger_path = temp_dir.join("chronos_ledger.json");

    let metrics = VentureMetrics {
        arr: "100k".into(),
        burn: "12k".into(),
        runway: "8m".into(),
        momentum: "steady".into(),
        stress_color: "#22c55e".into(),
    };
    let market = MarketIntelligence {
        sentiment: "positive".into(),
        index_change: "+2.1%".into(),
        sectors_active: vec!["core".into(), "growth".into()],
        market_index: 2.8,
        sector_divergence: 0.5,
    };

    let persisted = save_venture_state_to_path(&metrics, &state_path).expect("save");
    assert!(persisted.contains("Persisted"));

    let loaded = load_venture_state_from_path(&state_path).expect("load");
    assert_eq!(loaded.arr, "100k");
    assert_eq!(loaded.momentum, "steady");

    let snapshot_msg = create_chronos_snapshot_to_path(metrics.clone(), market.clone(), &ledger_path).expect("snapshot");
    assert!(snapshot_msg.contains("Chronos Snapshot"));

    let ledger = get_chronos_ledger_from_path(&ledger_path).expect("ledger");
    assert_eq!(ledger.len(), 1);
    assert_eq!(ledger[0].metrics.arr, "100k");
    assert_eq!(ledger[0].market.sentiment, "positive");
}

#[test]
fn neural_graph_and_file_index_views_read_from_the_same_store() {
    let state = make_state();
    {
        let db = state.pool.get().expect("conn");
        db.execute(
            "INSERT INTO file_embeddings (filename, filepath, content, vector) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![
                "src/main.rs",
                "src/main.rs",
                "fn main() { println!(\"hi\"); }",
                serde_json::json!([0.9_f32, 0.1_f32]).to_string()
            ],
        )
        .expect("file insert");
    }

    let brief = get_neural_brief_from_pool(&state.pool, "src/main.rs".into()).expect("brief");
    assert!(brief.contains("println!"));

    let files = get_all_files_from_pool(&state.pool).expect("files");
    assert_eq!(files.as_array().map(|v| v.len()), Some(1));
    assert_eq!(files[0]["filename"], "src/main.rs");

    let graph = build_neural_graph_with_pool(&state.pool).expect("graph");
    let node_ids: Vec<String> = graph["nodes"]
        .as_array()
        .unwrap()
        .iter()
        .filter_map(|node| node["id"].as_str().map(|s| s.to_string()))
        .collect();
    assert!(node_ids.contains(&"src/main.rs".to_string()));
}
