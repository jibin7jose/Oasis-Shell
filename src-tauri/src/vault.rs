use crate::AppState;
use aes_gcm::{Aes256Gcm, Nonce, Key};
use aes_gcm::aead::{Aead, KeyInit, OsRng};
use aes_gcm::aead::rand_core::RngCore;
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;
use rusqlite::params;

pub fn vault_derive_key(password: &str, salt: &[u8]) -> [u8; 32] {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, 100_000, &mut key);
    key
}

#[tauri::command]
pub async fn vault_store_secret(
    state: tauri::State<'_, AppState>,
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

    let ciphertext = cipher.encrypt(nonce, value.as_bytes()).map_err(|e| format!("Encryption failure: {}", e))?;
    
    let conn = state.db.lock().unwrap();
    let timestamp = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT OR REPLACE INTO system_secrets (name, secret_blob, nonce, salt, timestamp) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![name, ciphertext, nonce_bytes.to_vec(), salt.to_vec(), timestamp],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn vault_get_secret(
    state: tauri::State<'_, AppState>,
    name: String,
    master_key: String,
) -> Result<String, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare("SELECT secret_blob, nonce, salt FROM system_secrets WHERE name = ?1").map_err(|e| e.to_string())?;
    
    let (ciphertext, nonce_bytes, salt): (Vec<u8>, Vec<u8>, Vec<u8>) = stmt.query_row([name], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    }).map_err(|e| format!("Secret not found or access denied: {}", e))?;

    let encryption_key_bytes = vault_derive_key(&master_key, &salt);
    let key = Key::<Aes256Gcm>::from_slice(&encryption_key_bytes);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let plaintext = cipher.decrypt(nonce, ciphertext.as_slice()).map_err(|e| format!("Decryption failure: {}", e))?;
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn vault_list_secrets(state: tauri::State<'_, AppState>) -> Result<Vec<String>, String> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare("SELECT name FROM system_secrets").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| row.get(0)).map_err(|e| e.to_string())?;
    
    let mut names = Vec::new();
    for r in rows { names.push(r.map_err(|e| e.to_string())?); }
    Ok(names)
}
