use oasis_shell_lib::{
    chronos_snapshot_from_row,
    system::normalize_process_priority,
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
