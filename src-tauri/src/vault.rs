use crate::AppState;
use aes_gcm::{aead::rand_core::RngCore, aead::{Aead, KeyInit, OsRng}, Aes256Gcm, Key, Nonce};
use pbkdf2::pbkdf2_hmac;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::params;
use sha2::Sha256;

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
}
