use crate::AppState;
use aes_gcm::{aead::rand_core::RngCore, aead::{Aead, KeyInit, OsRng}, Aes256Gcm, Key, Nonce};
use base64::Engine as _;
use pbkdf2::pbkdf2_hmac;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::params;
use std::fs;
use sha2::Sha256;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretMetadata {
    pub name: String,
    pub updated_at: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretBackupRecord {
    pub name: String,
    pub secret_blob: Vec<u8>,
    pub nonce: Vec<u8>,
    pub salt: Vec<u8>,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretBackupBundle {
    pub exported_at: String,
    pub secrets: Vec<SecretBackupRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecretBackupEnvelope {
    pub version: u32,
    pub exported_at: String,
    pub nonce_b64: String,
    pub ciphertext_b64: String,
}

pub fn vault_derive_key(password: &str, salt: &[u8]) -> [u8; 32] {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, 100_000, &mut key);
    key
}

pub fn vault_store_secret_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    name: String,
    value: String,
    master_key: String,
) -> Result<(), String> {
    let mut salt = [0u8; 16];
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut salt);
    OsRng.fill_bytes(&mut nonce_bytes);

    let encryption_key_bytes = vault_derive_key(&master_key, &salt);
    let key = Key::<Aes256Gcm>::from_slice(&encryption_key_bytes);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, value.as_bytes())
        .map_err(|e| format!("Encryption failure: {}", e))?;

    let db = pool.get().map_err(|e| e.to_string())?;
    let timestamp = chrono::Local::now().to_rfc3339();

    db.execute(
        "INSERT OR REPLACE INTO system_secrets (name, secret_blob, nonce, salt, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![name, ciphertext, nonce_bytes.to_vec(), salt.to_vec(), timestamp],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn vault_store_secret_with_session_key_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    name: String,
    value: String,
    session_key: [u8; 32],
) -> Result<(), String> {
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);

    let key = Key::<Aes256Gcm>::from_slice(&session_key);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, value.as_bytes())
        .map_err(|e| format!("Encryption failure: {}", e))?;

    let db = pool.get().map_err(|e| e.to_string())?;
    let timestamp = chrono::Local::now().to_rfc3339();

    db.execute(
        "INSERT OR REPLACE INTO system_secrets (name, secret_blob, nonce, salt, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![name, ciphertext, nonce_bytes.to_vec(), Vec::<u8>::new(), timestamp],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn vault_get_secret_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    name: String,
    master_key: String,
) -> Result<String, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT secret_blob, nonce, salt FROM system_secrets WHERE name = ?1")
        .map_err(|e| e.to_string())?;

    let (ciphertext, nonce_bytes, salt): (Vec<u8>, Vec<u8>, Vec<u8>) = stmt
        .query_row([name], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))
        .map_err(|e| format!("Secret not found or access denied: {}", e))?;

    let encryption_key_bytes = vault_derive_key(&master_key, &salt);
    let key = Key::<Aes256Gcm>::from_slice(&encryption_key_bytes);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_slice())
        .map_err(|e| format!("Decryption failure: {}", e))?;
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

pub fn vault_get_secret_with_session_key_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    name: String,
    session_key: [u8; 32],
) -> Result<String, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT secret_blob, nonce FROM system_secrets WHERE name = ?1")
        .map_err(|e| e.to_string())?;

    let (ciphertext, nonce_bytes): (Vec<u8>, Vec<u8>) = stmt
        .query_row([name], |row| Ok((row.get(0)?, row.get(1)?)))
        .map_err(|e| format!("Secret not found or access denied: {}", e))?;

    let key = Key::<Aes256Gcm>::from_slice(&session_key);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_slice())
        .map_err(|e| format!("Decryption failure: {}", e))?;
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

pub fn vault_list_secrets_with_pool(pool: &Pool<SqliteConnectionManager>) -> Result<Vec<String>, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT name FROM system_secrets")
        .map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| row.get(0)).map_err(|e| e.to_string())?;

    let mut names = Vec::new();
    for r in rows {
        names.push(r.map_err(|e| e.to_string())?);
    }
    Ok(names)
}

pub fn vault_list_secret_metadata_with_pool(
    pool: &Pool<SqliteConnectionManager>,
) -> Result<Vec<SecretMetadata>, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT name, timestamp FROM system_secrets ORDER BY timestamp DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(SecretMetadata {
                name: row.get(0)?,
                updated_at: row.get(1)?,
                status: "active".to_string(),
            })
        })
        .map_err(|e| e.to_string())?;

    let mut secrets = Vec::new();
    for r in rows {
        secrets.push(r.map_err(|e| e.to_string())?);
    }
    Ok(secrets)
}

pub fn vault_delete_secret_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    name: String,
) -> Result<bool, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let affected = db
        .execute("DELETE FROM system_secrets WHERE name = ?1", [name])
        .map_err(|e| e.to_string())?;
    Ok(affected > 0)
}

pub fn vault_delete_all_secrets_with_pool(pool: &Pool<SqliteConnectionManager>) -> Result<usize, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    db.execute("DELETE FROM system_secrets", [])
        .map_err(|e| e.to_string())
}

pub fn vault_export_secrets_backup_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    target_path: String,
    session_key: [u8; 32],
) -> Result<String, String> {
    let db = pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db
        .prepare("SELECT name, secret_blob, nonce, salt, timestamp FROM system_secrets ORDER BY timestamp DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(SecretBackupRecord {
                name: row.get(0)?,
                secret_blob: row.get(1)?,
                nonce: row.get(2)?,
                salt: row.get(3)?,
                timestamp: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut secrets = Vec::new();
    for r in rows {
        secrets.push(r.map_err(|e| e.to_string())?);
    }

    let bundle = SecretBackupBundle {
        exported_at: chrono::Local::now().to_rfc3339(),
        secrets,
    };

    let payload = serde_json::to_vec(&bundle).map_err(|e| e.to_string())?;
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);

    let key = Key::<Aes256Gcm>::from_slice(&session_key);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, payload.as_slice())
        .map_err(|e| format!("Backup encryption failure: {}", e))?;

    let envelope = SecretBackupEnvelope {
        version: 1,
        exported_at: chrono::Local::now().to_rfc3339(),
        nonce_b64: base64::engine::general_purpose::STANDARD.encode(nonce_bytes),
        ciphertext_b64: base64::engine::general_purpose::STANDARD.encode(ciphertext),
    };
    let out = serde_json::to_string_pretty(&envelope).map_err(|e| e.to_string())?;
    fs::write(&target_path, out).map_err(|e| e.to_string())?;
    Ok(target_path)
}

pub fn vault_restore_secrets_backup_with_pool(
    pool: &Pool<SqliteConnectionManager>,
    source_path: String,
    replace_existing: bool,
    session_key: [u8; 32],
) -> Result<usize, String> {
    let payload = fs::read_to_string(&source_path).map_err(|e| e.to_string())?;
    let envelope: SecretBackupEnvelope = serde_json::from_str(&payload).map_err(|e| e.to_string())?;
    if envelope.version != 1 {
        return Err(format!("Unsupported backup version: {}", envelope.version));
    }
    let nonce_raw = base64::engine::general_purpose::STANDARD
        .decode(envelope.nonce_b64.as_bytes())
        .map_err(|e| format!("Invalid backup nonce encoding: {}", e))?;
    if nonce_raw.len() != 12 {
        return Err("Invalid backup nonce length.".to_string());
    }
    let nonce = Nonce::from_slice(&nonce_raw);
    let ciphertext = base64::engine::general_purpose::STANDARD
        .decode(envelope.ciphertext_b64.as_bytes())
        .map_err(|e| format!("Invalid backup ciphertext encoding: {}", e))?;

    let key = Key::<Aes256Gcm>::from_slice(&session_key);
    let cipher = Aes256Gcm::new(key);
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_slice())
        .map_err(|e| format!("Backup tamper/wrong-key detected: {}", e))?;
    let bundle: SecretBackupBundle = serde_json::from_slice(&plaintext).map_err(|e| e.to_string())?;

    let mut db = pool.get().map_err(|e| e.to_string())?;
    let tx = db.transaction().map_err(|e| e.to_string())?;
    if replace_existing {
        tx.execute("DELETE FROM system_secrets", []).map_err(|e| e.to_string())?;
    }

    let mut restored = 0usize;
    for secret in bundle.secrets {
        if secret.name.trim().is_empty() {
            return Err("Backup validation failed: empty secret name encountered.".to_string());
        }
        tx.execute(
            "INSERT OR REPLACE INTO system_secrets (name, secret_blob, nonce, salt, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![secret.name, secret.secret_blob, secret.nonce, secret.salt, secret.timestamp],
        )
        .map_err(|e| e.to_string())?;
        restored += 1;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(restored)
}

#[tauri::command]
pub async fn vault_store_secret(
    state: tauri::State<'_, AppState>,
    name: String,
    value: String,
    master_key: String,
) -> Result<(), String> {
    vault_store_secret_with_pool(&state.pool, name, value, master_key)
}

#[tauri::command]
pub async fn vault_get_secret(
    state: tauri::State<'_, AppState>,
    name: String,
    master_key: String,
) -> Result<String, String> {
    vault_get_secret_with_pool(&state.pool, name, master_key)
}

#[tauri::command]
pub async fn vault_list_secrets(state: tauri::State<'_, AppState>) -> Result<Vec<String>, String> {
    vault_list_secrets_with_pool(&state.pool)
}

#[tauri::command]
pub async fn vault_list_secrets_metadata(state: tauri::State<'_, AppState>) -> Result<Vec<SecretMetadata>, String> {
    vault_list_secret_metadata_with_pool(&state.pool)
}

#[tauri::command]
pub async fn vault_delete_secret(state: tauri::State<'_, AppState>, name: String) -> Result<bool, String> {
    vault_delete_secret_with_pool(&state.pool, name)
}

#[cfg(test)]
mod tests {
    use super::*;
    use r2d2::Pool;
    use r2d2_sqlite::SqliteConnectionManager;
    use uuid::Uuid;

    fn test_pool() -> Pool<SqliteConnectionManager> {
        let db_path = std::env::temp_dir().join(format!("oasis-shell-vault-{}.db", Uuid::new_v4()));
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
        pool
    }

    #[test]
    fn derive_key_is_deterministic() {
        let salt = [7u8; 16];
        let first = vault_derive_key("master-key", &salt);
        let second = vault_derive_key("master-key", &salt);
        assert_eq!(first, second);
        assert_ne!(first, vault_derive_key("different-key", &salt));
    }

    #[test]
    fn secret_round_trip_and_listing_work() {
        let pool = test_pool();

        vault_store_secret_with_pool(
            &pool,
            "DEEPSEEK_API_KEY".into(),
            "shhh-secret".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("store");

        let listed = vault_list_secrets_with_pool(&pool).expect("list");
        assert_eq!(listed, vec!["DEEPSEEK_API_KEY".to_string()]);

        let value = vault_get_secret_with_pool(
            &pool,
            "DEEPSEEK_API_KEY".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("get");
        assert_eq!(value, "shhh-secret");

        let wrong_key = vault_get_secret_with_pool(&pool, "DEEPSEEK_API_KEY".into(), "WRONG".into());
        assert!(wrong_key.is_err());
    }

    #[test]
    fn delete_secret_removes_entry() {
        let pool = test_pool();
        vault_store_secret_with_pool(
            &pool,
            "OPENAI_API_KEY".into(),
            "to-be-removed".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("store");

        let deleted = vault_delete_secret_with_pool(&pool, "OPENAI_API_KEY".into()).expect("delete");
        assert!(deleted);

        let listed = vault_list_secrets_with_pool(&pool).expect("list");
        assert!(listed.is_empty());
    }

    #[test]
    fn metadata_returns_timestamped_records() {
        let pool = test_pool();
        vault_store_secret_with_pool(
            &pool,
            "DEEPSEEK_API_KEY".into(),
            "masked".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("store");
        let metadata = vault_list_secret_metadata_with_pool(&pool).expect("metadata");
        assert_eq!(metadata.len(), 1);
        assert_eq!(metadata[0].name, "DEEPSEEK_API_KEY");
        assert_eq!(metadata[0].status, "active");
        assert!(!metadata[0].updated_at.is_empty());
    }

    #[test]
    fn backup_and_restore_round_trip() {
        let pool = test_pool();
        vault_store_secret_with_pool(
            &pool,
            "OPENAI_API_KEY".into(),
            "backup-value".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("store");

        let backup_path = std::env::temp_dir()
            .join(format!("oasis-secrets-backup-{}.json", Uuid::new_v4()))
            .to_string_lossy()
            .to_string();
        let session_key = vault_derive_key("OASIS_MASTER_KEY", b"OASIS_NEURAL_SALT_45_LEX_FOUNDRY");
        vault_export_secrets_backup_with_pool(&pool, backup_path.clone(), session_key).expect("backup");

        let removed = vault_delete_all_secrets_with_pool(&pool).expect("wipe");
        assert_eq!(removed, 1);

        let session_key = vault_derive_key("OASIS_MASTER_KEY", b"OASIS_NEURAL_SALT_45_LEX_FOUNDRY");
        let restored = vault_restore_secrets_backup_with_pool(&pool, backup_path, false, session_key).expect("restore");
        assert_eq!(restored, 1);

        let value = vault_get_secret_with_pool(
            &pool,
            "OPENAI_API_KEY".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("get");
        assert_eq!(value, "backup-value");
    }

    #[test]
    fn restore_rejects_tampered_backup() {
        let pool = test_pool();
        let session_key = vault_derive_key("OASIS_MASTER_KEY", b"OASIS_NEURAL_SALT_45_LEX_FOUNDRY");
        let backup_path = std::env::temp_dir()
            .join(format!("oasis-secrets-backup-tamper-{}.json", Uuid::new_v4()))
            .to_string_lossy()
            .to_string();
        vault_export_secrets_backup_with_pool(&pool, backup_path.clone(), session_key).expect("backup");

        let mut envelope: SecretBackupEnvelope =
            serde_json::from_str(&fs::read_to_string(&backup_path).expect("read")).expect("parse");
        envelope.ciphertext_b64.push_str("tamper");
        fs::write(&backup_path, serde_json::to_string(&envelope).expect("ser")).expect("write");

        let res = vault_restore_secrets_backup_with_pool(&pool, backup_path, false, session_key);
        assert!(res.is_err());
    }

    #[test]
    fn restore_rolls_back_on_invalid_entry_when_replacing() {
        let pool = test_pool();
        vault_store_secret_with_pool(
            &pool,
            "OPENAI_API_KEY".into(),
            "existing".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("store");
        let session_key = vault_derive_key("OASIS_MASTER_KEY", b"OASIS_NEURAL_SALT_45_LEX_FOUNDRY");
        let bad_bundle = SecretBackupBundle {
            exported_at: chrono::Local::now().to_rfc3339(),
            secrets: vec![SecretBackupRecord {
                name: "".into(),
                secret_blob: vec![1, 2, 3],
                nonce: vec![0; 12],
                salt: vec![],
                timestamp: chrono::Local::now().to_rfc3339(),
            }],
        };
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let key = Key::<Aes256Gcm>::from_slice(&session_key);
        let cipher = Aes256Gcm::new(key);
        let nonce = Nonce::from_slice(&nonce_bytes);
        let ciphertext = cipher
            .encrypt(nonce, serde_json::to_vec(&bad_bundle).expect("bundle").as_slice())
            .expect("encrypt");
        let envelope = SecretBackupEnvelope {
            version: 1,
            exported_at: chrono::Local::now().to_rfc3339(),
            nonce_b64: base64::engine::general_purpose::STANDARD.encode(nonce_bytes),
            ciphertext_b64: base64::engine::general_purpose::STANDARD.encode(ciphertext),
        };
        let bad_path = std::env::temp_dir()
            .join(format!("oasis-secrets-backup-invalid-{}.json", Uuid::new_v4()))
            .to_string_lossy()
            .to_string();
        fs::write(&bad_path, serde_json::to_string(&envelope).expect("ser")).expect("write");

        let restored = vault_restore_secrets_backup_with_pool(&pool, bad_path, true, session_key);
        assert!(restored.is_err());

        let value = vault_get_secret_with_pool(
            &pool,
            "OPENAI_API_KEY".into(),
            "OASIS_MASTER_KEY".into(),
        )
        .expect("existing still present");
        assert_eq!(value, "existing");
    }
}
