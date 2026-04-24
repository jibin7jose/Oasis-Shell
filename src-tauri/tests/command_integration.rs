use oasis_shell_lib::{
    capture_chronos_snapshot_with_pool,
    chronos_snapshot_from_row,
    receive_neural_mirror_with_pool,
    ContextCrate,
    MirrorPayload,
    seek_chronos_history_with_pool,
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
